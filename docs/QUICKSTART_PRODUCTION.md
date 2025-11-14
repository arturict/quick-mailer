# Quick Production Deployment Guide

This is a condensed guide for quickly deploying Quick Mailer to production. For detailed instructions, see [PRODUCTION.md](./PRODUCTION.md).

## Prerequisites

- Ubuntu 20.04+ server
- Docker and Docker Compose installed
- Domain name with DNS configured
- Ports 80 and 443 open

## Quick Start (5 minutes)

### 1. Clone and Configure

```bash
# Clone repository
git clone https://github.com/arturict/quick-mailer.git
cd quick-mailer

# Copy and edit environment file
cp .env.production.example .env
nano .env  # Set your RESEND_API_KEY or SMTP credentials
```

### 2. Option A: Basic Deployment (HTTP only)

```bash
# Build and start
docker compose -f docker-compose.prod.yml up -d

# Verify
curl http://localhost:3000/health
```

Access at: `http://your-server-ip:3000`

### 3. Option B: Production with HTTPS (Recommended)

```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos

# Copy certificates
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem

# Start with nginx
docker compose -f docker-compose.prod.yml --profile with-nginx up -d

# Verify
curl https://yourdomain.com/health
```

Access at: `https://yourdomain.com`

## Environment Configuration

Minimal `.env` for production:

```env
# Email Provider
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_production_key

# Application
FROM_ADDRESSES=noreply@yourdomain.com,support@yourdomain.com
DEFAULT_SENDER_NAME=Your Company

# Production
NODE_ENV=production
```

## Essential Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart service
docker compose -f docker-compose.prod.yml restart

# Stop service
docker compose -f docker-compose.prod.yml down

# Update application
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Backup Setup

```bash
# Create backup
./scripts/backup.sh

# Schedule daily backups (cron)
crontab -e
# Add: 0 2 * * * /path/to/quick-mailer/scripts/backup.sh
```

## Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "quick-mailer-api",
  "version": "1.0.0",
  "checks": {
    "database": { "status": "healthy" },
    "emailProvider": { "status": "configured" },
    "fromAddresses": { "status": "configured", "count": 2 }
  }
}
```

## Troubleshooting

### Container won't start
```bash
docker compose -f docker-compose.prod.yml logs
```

### Email sending fails
```bash
# Check configuration
curl http://localhost:3000/health

# Check logs
docker compose -f docker-compose.prod.yml logs quick-mailer | grep -i email
```

### SSL certificate issues
```bash
# Verify certificate
openssl x509 -in ssl/cert.pem -noout -dates

# Renew certificate
sudo certbot renew
./scripts/renew-certs.sh
```

## Complete Documentation

For detailed instructions, see:

- **[Production Deployment Guide](./PRODUCTION.md)** - Complete setup instructions
- **[Environment Variables](./ENVIRONMENT.md)** - All configuration options
- **[SSL/TLS Setup](./SSL_TLS.md)** - Detailed HTTPS configuration
- **[Backup & Restore](./BACKUP_RESTORE.md)** - Data protection procedures

## Support

- **Issues:** https://github.com/arturict/quick-mailer/issues
- **Documentation:** https://github.com/arturict/quick-mailer/tree/main/docs

## Security Notes

⚠️ **Important:** Quick Mailer has no built-in authentication. Deploy behind:
- VPN for secure access
- IP whitelist in nginx
- Firewall rules

See [PRODUCTION.md](./PRODUCTION.md#security-hardening) for security best practices.
