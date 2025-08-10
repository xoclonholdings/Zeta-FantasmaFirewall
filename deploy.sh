#!/bin/bash

# Fantasma Firewall Self-Hosting Deployment Script
# This script automates the deployment process on your own server

set -e  # Exit on any error

echo "🛡️  Fantasma Firewall Self-Hosting Deployment"
echo "=============================================="

# Configuration
APP_NAME="fantasma-firewall"
APP_DIR="/var/www/$APP_NAME"
DOMAIN_NAME=""
DB_NAME="fantasma_firewall"
DB_USER="fantasma_user"
NGINX_AVAILABLE="/etc/nginx/sites-available/$APP_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$APP_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons"
        print_status "Please run as a regular user with sudo privileges"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Ubuntu/Debian
    if ! command -v apt &> /dev/null; then
        print_error "This script is designed for Ubuntu/Debian systems"
        exit 1
    fi
    
    # Check sudo privileges
    if ! sudo -n true 2>/dev/null; then
        print_error "This script requires sudo privileges"
        exit 1
    fi
    
    print_status "✓ System requirements met"
}

# Get domain name from user
get_domain() {
    if [ -z "$DOMAIN_NAME" ]; then
        read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN_NAME
        if [ -z "$DOMAIN_NAME" ]; then
            print_error "Domain name is required"
            exit 1
        fi
    fi
    print_status "Using domain: $DOMAIN_NAME"
}

# Update system packages
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_status "✓ System updated"
}

# Install Node.js
install_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js already installed: $NODE_VERSION"
        return
    fi
    
    print_status "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_status "✓ Node.js installed: $NODE_VERSION"
    print_status "✓ npm installed: $NPM_VERSION"
}

# Install PM2
install_pm2() {
    if command -v pm2 &> /dev/null; then
        print_status "PM2 already installed"
        return
    fi
    
    print_status "Installing PM2..."
    sudo npm install -g pm2
    print_status "✓ PM2 installed"
}

# Install Nginx
install_nginx() {
    if systemctl is-active --quiet nginx; then
        print_status "Nginx already installed and running"
        return
    fi
    
    print_status "Installing Nginx..."
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_status "✓ Nginx installed and started"
}

# Install PostgreSQL
install_postgresql() {
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL already installed"
        return
    fi
    
    print_status "Installing PostgreSQL..."
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_status "✓ PostgreSQL installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate random password
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # Create database and user
    sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF
    
    # Save database credentials
    echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME" > /tmp/db_credentials
    print_status "✓ Database created: $DB_NAME"
    print_status "✓ Database user created: $DB_USER"
}

# Install Certbot
install_certbot() {
    if command -v certbot &> /dev/null; then
        print_status "Certbot already installed"
        return
    fi
    
    print_status "Installing Certbot..."
    sudo apt install certbot python3-certbot-nginx -y
    print_status "✓ Certbot installed"
}

# Setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    if [ -d "$APP_DIR" ]; then
        print_warning "Application directory already exists. Backing up..."
        sudo mv "$APP_DIR" "${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    fi
    
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
    print_status "✓ Application directory created: $APP_DIR"
}

# Copy application files
copy_application() {
    print_status "Copying application files..."
    
    # Copy all files except node_modules and .git
    rsync -av --exclude='node_modules' --exclude='.git' --exclude='dist' ./ "$APP_DIR/"
    
    cd "$APP_DIR"
    print_status "✓ Application files copied"
}

# Install dependencies and build
build_application() {
    print_status "Installing dependencies and building application..."
    
    cd "$APP_DIR"
    npm ci --production
    npm run build
    
    print_status "✓ Application built successfully"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment variables..."
    
    cd "$APP_DIR"
    
    # Read database credentials
    DB_CREDS=$(cat /tmp/db_credentials)
    
    # Create .env file
    cat > .env << EOF
NODE_ENV=production
PORT=3000
$DB_CREDS
SESSION_SECRET=$(openssl rand -base64 64)
NODE_OPTIONS="--max-old-space-size=4096"
EOF
    
    # Secure the .env file
    chmod 600 .env
    
    print_status "✓ Environment configured"
}

# Setup logging
setup_logging() {
    print_status "Setting up logging..."
    
    sudo mkdir -p /var/log/$APP_NAME
    sudo chown $USER:$USER /var/log/$APP_NAME
    
    print_status "✓ Logging directory created"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd "$APP_DIR"
    npm run db:push
    
    print_status "✓ Database migrations completed"
}

# Setup PM2
setup_pm2() {
    print_status "Setting up PM2..."
    
    cd "$APP_DIR"
    
    # Stop existing process if running
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Start application
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup
    pm2 startup | tail -1 | sudo bash
    
    print_status "✓ PM2 configured and application started"
}

# Setup Nginx
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    # Create nginx configuration from template
    sudo cp nginx.conf "$NGINX_AVAILABLE"
    
    # Replace domain placeholder
    sudo sed -i "s/your-domain.com/$DOMAIN_NAME/g" "$NGINX_AVAILABLE"
    
    # Enable site
    sudo ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
    
    # Remove default site if exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    sudo nginx -t
    
    # Restart nginx
    sudo systemctl restart nginx
    
    print_status "✓ Nginx configured"
}

# Setup SSL
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Get SSL certificate
    sudo certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME" --agree-tos --non-interactive --email "admin@$DOMAIN_NAME"
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_status "✓ SSL certificate configured"
}

# Setup firewall
setup_firewall() {
    print_status "Setting up firewall..."
    
    # Enable UFW
    sudo ufw --force enable
    
    # Configure rules
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    print_status "✓ Firewall configured"
}

# Final checks
final_checks() {
    print_status "Performing final checks..."
    
    # Check if application is running
    sleep 5
    if pm2 describe $APP_NAME | grep -q "online"; then
        print_status "✓ Application is running"
    else
        print_error "Application failed to start"
        pm2 logs $APP_NAME --lines 20
        exit 1
    fi
    
    # Check if nginx is serving correctly
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/dashboard/status" | grep -q "200"; then
        print_status "✓ Application responding correctly"
    else
        print_error "Application not responding correctly"
        exit 1
    fi
    
    print_status "✓ All checks passed"
}

# Cleanup
cleanup() {
    print_status "Cleaning up..."
    rm -f /tmp/db_credentials
    print_status "✓ Cleanup completed"
}

# Display completion message
completion_message() {
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "=================================="
    echo ""
    echo "Your Fantasma Firewall is now running at:"
    echo "• HTTP:  http://$DOMAIN_NAME"
    echo "• HTTPS: https://$DOMAIN_NAME"
    echo ""
    echo "Application details:"
    echo "• Directory: $APP_DIR"
    echo "• Process: $APP_NAME (managed by PM2)"
    echo "• Database: $DB_NAME"
    echo ""
    echo "Management commands:"
    echo "• View logs: pm2 logs $APP_NAME"
    echo "• Restart app: pm2 restart $APP_NAME"
    echo "• App status: pm2 status"
    echo "• Nginx status: sudo systemctl status nginx"
    echo ""
    echo "Next steps:"
    echo "1. Update DNS records to point to this server"
    echo "2. Test the application functionality"
    echo "3. Setup monitoring and backups"
    echo ""
    print_status "Deployment complete! 🚀"
}

# Main deployment function
main() {
    print_status "Starting Fantasma Firewall deployment..."
    
    check_root
    check_requirements
    get_domain
    update_system
    install_nodejs
    install_pm2
    install_nginx
    install_postgresql
    install_certbot
    setup_app_directory
    copy_application
    build_application
    setup_environment
    setup_logging
    setup_database
    run_migrations
    setup_pm2
    setup_nginx
    setup_ssl
    setup_firewall
    final_checks
    cleanup
    completion_message
}

# Run deployment
main "$@"