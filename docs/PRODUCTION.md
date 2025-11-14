# Production Deployment Guide

Complete guide for deploying Quick Mailer to production with best practices for security, performance, and reliability.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Production Setup](#production-setup)
- [Security Hardening](#security-hardening)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Logging](#monitoring-and-logging)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

**Minimum:**
- 1 vCPU
- 1 GB RAM
- 10 GB disk space
- Ubuntu 20.04+ or similar Linux distribution

**Recommended:**
- 2 vCPU
- 2 GB RAM
- 20 GB SSD
- Ubuntu 22.04 LTS

### Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### Domain and DNS

1. Register a domain name
2. Point DNS A record to your server IP:
   ```
   @ IN A your.server.ip.address
   www IN A your.server.ip.address
   ```
3. Wait for DNS propagation (up to 48 hours, usually faster)

## Deployment Options

### Option 1: Basic Deployment (No HTTPS)

Suitable for internal networks or behind a VPN.

```bash
# Clone repository
git clone https://github.com/arturict/quick-mailer.git
cd quick-mailer

# Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Production Deployment with Nginx (Recommended)

Includes HTTPS, reverse proxy, and production optimizations.

See [Full Production Setup](#production-setup) below.

### Option 3: Cloud Platform Deployment

Deploy to various cloud platforms:

- **AWS:** EC2 + ECS/Fargate
- **Google Cloud:** Compute Engine + Cloud Run
- **DigitalOcean:** Droplet + App Platform
- **Azure:** Container Instances
- **Railway:** Direct Docker deployment
- **Fly.io:** Docker deployment

(Platform-specific guides available in respective documentation)

## Production Setup

### Step 1: Clone and Configure

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/arturict/quick-mailer.git
cd quick-mailer

# Set ownership
sudo chown -R $USER:$USER .
```

### Step 2: Environment Configuration

```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

**Production `.env` template:**
```env
# Environment
NODE_ENV=production

# Email Provider (Resend)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_production_key_here

# OR Email Provider (SMTP)
# EMAIL_PROVIDER=smtp
# SMTP_HOST=smtp.yourdomain.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=noreply@yourdomain.com
# SMTP_PASSWORD=your_secure_password

# Application
FROM_ADDRESSES=noreply@yourdomain.com,support@yourdomain.com
DEFAULT_SENDER_NAME=Your Company
PORT=3000
HOST=0.0.0.0
DATABASE_PATH=/app/backend/data/emails.db

# Docker Compose
EXTERNAL_PORT=3000
HTTPS_PORT=443
HTTP_PORT=80
```

See [Environment Variables Documentation](./ENVIRONMENT.md) for all options.

### Step 3: SSL/TLS Certificates

**Option A: Let's Encrypt (Recommended)**

```bash
# Install Certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --non-interactive

# Copy certificates
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem
```

See [SSL/TLS Configuration Guide](./SSL_TLS.md) for detailed instructions.

### Step 4: Build and Deploy

```bash
# Build Docker image
docker compose -f docker-compose.prod.yml build

# Start services without nginx first to test
docker compose -f docker-compose.prod.yml up -d

# Verify application is running
curl http://localhost:3000/health

# If successful, enable nginx
docker compose -f docker-compose.prod.yml --profile with-nginx up -d
```

### Step 5: Verify Deployment

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Test HTTP (should redirect to HTTPS)
curl -I http://yourdomain.com

# Test HTTPS
curl -I https://yourdomain.com

# Test health endpoint
curl https://yourdomain.com/health
```

Expected health response:
```json
{
  "status": "healthy",
  "service": "quick-mailer-api",
  "version": "1.0.0",
  "timestamp": "2025-11-14T18:00:00.000Z",
  "checks": {
    "database": { "status": "healthy" },
    "emailProvider": { "status": "configured", "provider": "resend" },
    "fromAddresses": { "status": "configured", "count": 2 }
  }
}
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (if not already allowed)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny other ports
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check status
sudo ufw status
```

### 2. Access Control

**VPN Access (Recommended):**
Deploy behind a VPN for additional security since Quick Mailer has no built-in authentication.

**IP Whitelisting in Nginx:**

Edit `nginx.conf`:
```nginx
# Add to server block
location / {
    # Allow specific IPs
    allow 203.0.113.0/24;
    allow 198.51.100.10;
    deny all;
    
    proxy_pass http://quick_mailer_backend;
}
```

**Basic Authentication (Temporary Solution):**

```bash
# Install htpasswd
sudo apt install apache2-utils

# Create password file
sudo htpasswd -c /opt/quick-mailer/.htpasswd admin

# Update nginx.conf
# Add to location block:
# auth_basic "Restricted Access";
# auth_basic_user_file /etc/nginx/.htpasswd;
```

### 3. Docker Security

**Run as non-root user** (already configured in Dockerfile):
```dockerfile
USER appuser
```

**Limit container resources** (already configured in docker-compose.prod.yml):
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
```

**Keep Docker updated:**
```bash
sudo apt update
sudo apt upgrade docker-ce docker-ce-cli containerd.io
```

### 4. Environment Variables Security

```bash
# Secure .env file
chmod 600 .env
chown root:root .env

# Never commit .env to git
echo ".env" >> .gitignore
```

### 5. Regular Updates

```bash
# Update Quick Mailer
cd /opt/quick-mailer
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Update system packages
sudo apt update && sudo apt upgrade -y
```

## Performance Optimization

### 1. Resource Allocation

Adjust in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'        # Increase for high traffic
      memory: 1024M      # Increase for large databases
    reservations:
      cpus: '1.0'
      memory: 512M
```

### 2. Nginx Caching

Already configured in `nginx.conf`:
- Static asset caching (1 year)
- Gzip compression
- Connection keepalive

### 3. Database Optimization

SQLite WAL mode is enabled by default for better performance.

**Regular maintenance:**
```bash
# Optimize database
docker exec quick-mailer-app bun -e "
  const db = require('bun:sqlite').Database('/app/backend/data/emails.db');
  db.run('VACUUM');
  db.run('ANALYZE');
"
```

### 4. Monitoring Resources

```bash
# Check container resource usage
docker stats quick-mailer-app

# Check disk usage
docker system df
```

## Monitoring and Logging

### 1. Application Logs

```bash
# View live logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f quick-mailer

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100

# Logs since timestamp
docker compose -f docker-compose.prod.yml logs --since "2024-01-01T00:00:00"
```

### 2. Log Rotation

Already configured in `docker-compose.prod.yml`:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 3. Health Monitoring

**Script for health checks:**

Create `scripts/health-check.sh`:
```bash
#!/bin/bash
HEALTH_URL="http://localhost:3000/health"
RESPONSE=$(curl -s $HEALTH_URL)
STATUS=$(echo $RESPONSE | jq -r '.status')

if [ "$STATUS" != "healthy" ]; then
  echo "Health check failed: $RESPONSE"
  # Send alert (email, Slack, etc.)
  exit 1
fi

echo "Health check passed"
exit 0
```

**Schedule with cron:**
```bash
# Every 5 minutes
*/5 * * * * /opt/quick-mailer/scripts/health-check.sh >> /var/log/quick-mailer-health.log 2>&1
```

### 4. External Monitoring

Consider using:
- **Uptime Robot** - Free uptime monitoring
- **Better Uptime** - Status page and monitoring
- **Pingdom** - Performance monitoring
- **Datadog** - Comprehensive monitoring
- **Prometheus + Grafana** - Self-hosted monitoring

### 5. Nginx Access Logs

```bash
# View nginx access logs
docker compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/access.log

# View nginx error logs
docker compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/error.log
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor health endpoint
- Check application logs for errors
- Verify backup completion

**Weekly:**
- Review resource usage
- Check disk space
- Update Docker images if needed

**Monthly:**
- System updates and security patches
- SSL certificate renewal (automated with Let's Encrypt)
- Database optimization
- Review and archive old logs

### Backup Strategy

Set up automated backups following [Backup and Restore Guide](./BACKUP_RESTORE.md):

```bash
# Create backup script
./scripts/backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /opt/quick-mailer/scripts/backup.sh
```

### Updates and Upgrades

```bash
# Pull latest changes
cd /opt/quick-mailer
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Verify
curl https://yourdomain.com/health
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check container status
docker compose -f docker-compose.prod.yml ps

# Inspect container
docker inspect quick-mailer-app
```

### Database Issues

```bash
# Check database file
docker exec quick-mailer-app ls -lh /app/backend/data/

# Test database connection
docker exec quick-mailer-app bun -e "
  const db = require('bun:sqlite').Database('/app/backend/data/emails.db');
  console.log('Emails:', db.prepare('SELECT COUNT(*) FROM emails').get());
"
```

### Nginx Issues

```bash
# Test nginx configuration
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Reload nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Check nginx logs
docker compose -f docker-compose.prod.yml logs nginx
```

### Email Sending Fails

```bash
# Check health endpoint
curl https://yourdomain.com/health

# Verify email provider configuration
docker exec quick-mailer-app printenv | grep -E "(RESEND|SMTP|EMAIL_PROVIDER)"

# Check application logs
docker compose -f docker-compose.prod.yml logs quick-mailer | grep -i email
```

### SSL Certificate Issues

```bash
# Verify certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiration
openssl x509 -in ssl/cert.pem -noout -dates

# Renew Let's Encrypt certificate
sudo certbot renew
```

### High Resource Usage

```bash
# Check resource usage
docker stats

# Check disk usage
df -h
docker system df

# Clean up unused resources
docker system prune -a
```

## Production Checklist

Before going live:

- [ ] SSL/TLS certificates configured and tested
- [ ] Domain DNS properly configured
- [ ] Firewall rules in place
- [ ] Automated backups configured
- [ ] Monitoring and alerting set up
- [ ] Log rotation configured
- [ ] Resource limits appropriate
- [ ] Health check endpoint working
- [ ] Email sending tested
- [ ] Recovery procedures documented
- [ ] Access controls in place (VPN/IP whitelist)
- [ ] .env file secured
- [ ] System updates applied
- [ ] Documentation reviewed

After deployment:

- [ ] Verify all services running
- [ ] Test email sending
- [ ] Check health endpoint
- [ ] Monitor logs for errors
- [ ] Test backup/restore procedure
- [ ] Verify SSL certificate
- [ ] Test from external network
- [ ] Document any customizations

## Additional Resources

- [Environment Variables Guide](./ENVIRONMENT.md)
- [SSL/TLS Configuration](./SSL_TLS.md)
- [Backup and Restore Procedures](./BACKUP_RESTORE.md)
- [SMTP Configuration](./SMTP.md)

## Support

For issues and questions:
- GitHub Issues: https://github.com/arturict/quick-mailer/issues
- Documentation: https://github.com/arturict/quick-mailer/tree/main/docs

## License

MIT License - See [LICENSE](../LICENSE) file for details.
