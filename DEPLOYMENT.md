# Fantasma Firewall - Deployment Guide

## Overview
This guide explains how to deploy your Fantasma Firewall Security Operations Center to various hosting platforms.

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (can be hosted on Neon, Supabase, or any PostgreSQL provider)
- Environment variables configured

## Quick Deployment Options

### 1. Replit Deployment (Recommended)
**Easiest option - one-click deployment:**

```bash
# Your app is already configured for Replit
# Just click the "Deploy" button in Replit
```

**Environment Variables Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NODE_ENV=production`

### 2. Vercel Deployment
**Great for frontend with serverless functions:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

**Vercel Configuration (vercel.json):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ]
}
```

### 3. Docker Deployment
**For any cloud provider supporting containers:**

```bash
# Build the Docker image
docker build -t fantasma-firewall .

# Run locally to test
docker run -p 5000:5000 \
  -e DATABASE_URL="your_database_url" \
  -e NODE_ENV="production" \
  fantasma-firewall

# Deploy to your cloud provider
```

### 4. Railway Deployment
**Simple cloud deployment:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 5. Render Deployment
**Free tier available:**

1. Connect your GitHub repository to Render
2. Choose "Web Service"
3. Configure:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Add your DATABASE_URL

### 6. DigitalOcean App Platform
**Managed hosting:**

```yaml
# app.yaml
name: fantasma-firewall
services:
- name: web
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    value: your_database_url
  - key: NODE_ENV
    value: production
```

## Build Commands

### Production Build
```bash
# Build frontend and backend
npm run build

# Start production server
npm start
```

### Manual Build Steps
```bash
# 1. Build frontend (React + Vite)
vite build

# 2. Build backend (Node.js + Express)
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# 3. Copy static assets
cp -r attached_assets dist/

# 4. Start production server
NODE_ENV=production node dist/index.js
```

## Environment Variables

### Required
```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=5000
```

### Optional
```env
SESSION_SECRET=your-secret-key-here
```

## Database Setup

### Using Neon (Recommended)
1. Create account at neon.tech
2. Create new project
3. Copy connection string
4. Run migrations: `npm run db:push`

### Using Supabase
1. Create account at supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Run migrations: `npm run db:push`

### Using Heroku Postgres
```bash
# Add Heroku Postgres addon
heroku addons:create heroku-postgresql:hobby-dev

# Get DATABASE_URL
heroku config:get DATABASE_URL
```

## Performance Optimization

### Production Configuration
- Gzip compression enabled
- Static file caching
- Database connection pooling
- LRU caching for frequently accessed data
- Automated cleanup for old security events

### Monitoring
- Health check endpoint: `/api/dashboard/status`
- Performance metrics: `/api/performance`
- Cache statistics: `/api/cache/stats`

## SSL/HTTPS
Most hosting platforms (Vercel, Railway, Render) provide automatic HTTPS.

For custom domains:
- Use a reverse proxy (nginx)
- Configure SSL certificates (Let's Encrypt)
- Ensure secure cookie settings

## Troubleshooting

### Common Issues
1. **Database Connection:** Verify DATABASE_URL format
2. **Port Binding:** Use `0.0.0.0` not `localhost`
3. **Static Files:** Ensure assets are copied to dist/
4. **Memory Issues:** Increase instance size for large datasets

### Debug Commands
```bash
# Check build output
ls -la dist/

# Test database connection
node -e "console.log(process.env.DATABASE_URL)"

# Check app startup
npm start --verbose
```

## Security Checklist
- [ ] Environment variables secured
- [ ] Database credentials protected
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Session secrets set
- [ ] Input validation enabled

## Support
For deployment issues, check:
1. Platform-specific documentation
2. Environment variable configuration
3. Database connectivity
4. Build logs and error messages

Your Fantasma Firewall is now ready for production deployment!