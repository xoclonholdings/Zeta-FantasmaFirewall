# Self-Hosting Fantasma Firewall on Your Own Server

## Overview
This guide will help you deploy Fantasma Firewall on your own Linux server with full control over the infrastructure.

## Server Requirements

### Minimum Specifications
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **CPU**: 2 cores (4 cores recommended)
- **RAM**: 4GB (8GB recommended for high traffic)
- **Storage**: 20GB SSD minimum
- **Network**: Public IP with ports 80, 443, and custom port access

### Recommended Specifications
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Network**: CDN integration for static assets

## Prerequisites Installation

### 1. Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. Install Node.js 18+
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### 4. Install Nginx (Reverse Proxy)
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Install PostgreSQL (Optional - if not using external DB)
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createuser --interactive
sudo -u postgres createdb fantasma_firewall
```

### 6. Install Certbot for SSL
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y
```

## Application Deployment

### 1. Clone and Setup Application
```bash
# Create application directory
sudo mkdir -p /var/www/fantasma-firewall
sudo chown $USER:$USER /var/www/fantasma-firewall
cd /var/www/fantasma-firewall

# Copy your application files here
# (Upload via scp, git clone, or file transfer)

# Install dependencies
npm ci --production

# Build application
npm run build
```

### 2. Environment Configuration
```bash
# Create production environment file
sudo nano /var/www/fantasma-firewall/.env
```

```env
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/fantasma_firewall

# Security
SESSION_SECRET=your-super-secure-random-string-here

# Optional: Performance tuning
NODE_OPTIONS="--max-old-space-size=4096"
```

### 3. PM2 Configuration
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'fantasma-firewall',
    script: 'dist/index.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    log_file: '/var/log/fantasma-firewall/combined.log',
    out_file: '/var/log/fantasma-firewall/out.log',
    error_file: '/var/log/fantasma-firewall/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart on crashes
    max_restarts: 10,
    min_uptime: '10s',
    
    // Memory monitoring
    max_memory_restart: '1G',
    
    // Health monitoring
    health_check_grace_period: 10000,
    health_check_fatal_exceptions: true
  }]
};
```

### 4. Create Log Directory
```bash
sudo mkdir -p /var/log/fantasma-firewall
sudo chown $USER:$USER /var/log/fantasma-firewall
```

### 5. Start Application with PM2
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Nginx Reverse Proxy Configuration

### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/fantasma-firewall
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Static files
    location /assets/ {
        alias /var/www/fantasma-firewall/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket support for real-time features
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # React app (catch-all)
    location / {
        try_files $uri $uri/ @fallback;
    }
    
    location @fallback {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Enable Site and Test Configuration
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/fantasma-firewall /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## SSL Certificate Setup

### 1. Get SSL Certificate (Let's Encrypt)
```bash
# Get certificate for your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 2. Setup Auto-Renewal
```bash
# Add to crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## Database Setup (If hosting PostgreSQL locally)

### 1. Configure PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE fantasma_firewall;
CREATE USER fantasma_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE fantasma_firewall TO fantasma_user;
\q
```

### 2. Configure PostgreSQL for production
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

```conf
# Performance tuning
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 100
```

### 3. Run Database Migrations
```bash
cd /var/www/fantasma-firewall
npm run db:push
```

## Firewall Configuration

### 1. Setup UFW (Ubuntu Firewall)
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow your app port (if needed for direct access)
sudo ufw allow 3000

# Check status
sudo ufw status
```

## Monitoring and Maintenance

### 1. Log Monitoring
```bash
# View PM2 logs
pm2 logs fantasma-firewall

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View application logs
tail -f /var/log/fantasma-firewall/combined.log
```

### 2. Performance Monitoring
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
df -h
free -h
```

### 3. Health Checks
```bash
# Check application health
curl http://localhost:3000/api/dashboard/status

# Check through nginx
curl https://your-domain.com/api/dashboard/status
```

### 4. Backup Strategy
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump fantasma_firewall > /backups/fantasma_firewall_$DATE.sql
find /backups -name "fantasma_firewall_*.sql" -mtime +7 -delete
```

## Performance Optimization

### 1. Enable HTTP/2
```nginx
# In nginx config
listen 443 ssl http2;
```

### 2. Setup Redis Cache (Optional)
```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis for caching
# Update your app to use Redis instead of in-memory cache
```

### 3. Database Connection Pooling
Your app already includes connection pooling with Drizzle ORM.

## Security Best Practices

### 1. Server Hardening
```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Setup fail2ban
sudo apt install fail2ban -y
```

### 2. Regular Updates
```bash
# Create update script
#!/bin/bash
cd /var/www/fantasma-firewall
git pull origin main
npm ci --production
npm run build
pm2 restart fantasma-firewall
```

### 3. Monitoring Setup
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Check if port 3000 is available
2. **Permission errors**: Ensure correct file ownership
3. **Database connection**: Verify DATABASE_URL format
4. **SSL issues**: Check certificate expiration

### Debug Commands
```bash
# Check if app is running
pm2 status

# Check nginx status
sudo systemctl status nginx

# Check logs
journalctl -u nginx
pm2 logs --lines 100
```

## Backup and Disaster Recovery

### 1. Application Backup
```bash
# Backup application files
tar -czf fantasma-firewall-backup-$(date +%Y%m%d).tar.gz /var/www/fantasma-firewall

# Backup database
pg_dump fantasma_firewall > fantasma-firewall-db-$(date +%Y%m%d).sql
```

### 2. Automated Backups
```bash
# Add to crontab
0 2 * * * /home/user/backup-script.sh
```

Your Fantasma Firewall is now ready for production self-hosting with full control over your infrastructure!