# SSL/TLS Configuration Guide

This guide explains how to set up SSL/TLS certificates for Quick Mailer to enable HTTPS access.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Option 1: Let's Encrypt (Recommended)](#option-1-lets-encrypt-recommended)
- [Option 2: Self-Signed Certificates](#option-2-self-signed-certificates)
- [Option 3: Commercial Certificates](#option-3-commercial-certificates)
- [Nginx Configuration](#nginx-configuration)
- [Testing SSL/TLS](#testing-ssltls)
- [Automatic Renewal](#automatic-renewal)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Domain name pointing to your server
- Ports 80 and 443 open in your firewall
- Docker and Docker Compose installed
- Quick Mailer already running

## Option 1: Let's Encrypt (Recommended)

Let's Encrypt provides free, automated SSL certificates that are trusted by all major browsers.

### Step 1: Install Certbot

**On Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install certbot
```

**On CentOS/RHEL:**
```bash
sudo yum install certbot
```

**Using Docker:**
```bash
docker pull certbot/certbot
```

### Step 2: Obtain Certificate

**Using Standalone Mode (requires port 80 to be free):**
```bash
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

**Using Webroot Mode (if nginx is already running):**
```bash
# First, ensure nginx serves .well-known directory
sudo mkdir -p /var/www/certbot

# Obtain certificate
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

**Using Docker Certbot:**
```bash
docker run -it --rm \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

### Step 3: Copy Certificates

Certificates will be created at:
- Certificate: `/etc/letsencrypt/live/your-domain.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/your-domain.com/privkey.pem`

Create SSL directory and copy certificates:
```bash
# Create SSL directory for Quick Mailer
mkdir -p /path/to/quick-mailer/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /path/to/quick-mailer/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /path/to/quick-mailer/ssl/key.pem

# Set proper permissions
sudo chmod 644 /path/to/quick-mailer/ssl/cert.pem
sudo chmod 600 /path/to/quick-mailer/ssl/key.pem
```

### Step 4: Configure Docker Compose

Update your `.env` file:
```env
# Enable nginx profile
COMPOSE_PROFILES=with-nginx
HTTPS_PORT=443
HTTP_PORT=80
```

Start with nginx:
```bash
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d
```

## Option 2: Self-Signed Certificates

For development or internal use only. **Not recommended for production.**

### Generate Self-Signed Certificate

```bash
# Create SSL directory
mkdir -p ssl

# Generate certificate (valid for 365 days)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"

# Set permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
```

### Browser Warning

Self-signed certificates will trigger browser warnings. You'll need to manually accept the certificate.

## Option 3: Commercial Certificates

If you purchased an SSL certificate from a commercial CA (Comodo, DigiCert, etc.):

### Step 1: Obtain Certificate Files

You should have received:
- Certificate file (e.g., `your-domain.crt`)
- Private key file (e.g., `your-domain.key`)
- CA bundle/intermediate certificates (e.g., `ca-bundle.crt`)

### Step 2: Create Certificate Chain

Combine your certificate with the CA bundle:
```bash
cat your-domain.crt ca-bundle.crt > ssl/cert.pem
cp your-domain.key ssl/key.pem
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
```

## Nginx Configuration

The provided `nginx.conf` includes SSL/TLS configuration. Key settings:

```nginx
# Modern SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256...';
ssl_prefer_server_ciphers off;

# SSL session settings
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
```

### Enable HSTS (after testing)

Once you're confident SSL is working correctly, uncomment this line in `nginx.conf`:

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

**Warning:** HSTS tells browsers to only use HTTPS. Don't enable until SSL is fully working.

## Testing SSL/TLS

### 1. Test Certificate Installation

```bash
# Check certificate details
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Verify certificate chain
openssl s_client -connect your-domain.com:443 -showcerts
```

### 2. Test HTTPS Access

```bash
# Test HTTPS endpoint
curl -I https://your-domain.com

# Test health check
curl https://your-domain.com/health
```

### 3. Online SSL Testing

Use these free tools to verify your SSL configuration:

- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html

Target grade: **A** or **A+**

## Automatic Renewal

### Let's Encrypt Renewal (Required)

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

#### Using Cron

```bash
# Edit crontab
sudo crontab -e

# Add renewal job (runs daily at 3 AM)
0 3 * * * certbot renew --quiet --deploy-hook "/path/to/quick-mailer/scripts/renew-certs.sh"
```

Create renewal script at `scripts/renew-certs.sh`:

```bash
#!/bin/bash
# Copy renewed certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /path/to/quick-mailer/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /path/to/quick-mailer/ssl/key.pem

# Reload nginx
docker-compose -f /path/to/quick-mailer/docker-compose.prod.yml exec nginx nginx -s reload
```

Make it executable:
```bash
chmod +x scripts/renew-certs.sh
```

#### Using Systemd Timer

Create `/etc/systemd/system/certbot-renew.service`:

```ini
[Unit]
Description=Certbot Renewal

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet --deploy-hook /path/to/quick-mailer/scripts/renew-certs.sh
```

Create `/etc/systemd/system/certbot-renew.timer`:

```ini
[Unit]
Description=Certbot Renewal Timer

[Timer]
OnCalendar=daily
RandomizedDelaySec=1h

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer
```

### Test Renewal

```bash
# Dry run to test renewal
sudo certbot renew --dry-run
```

## Troubleshooting

### Certificate Not Found

**Error:** `nginx: [emerg] cannot load certificate`

**Solution:**
```bash
# Verify certificate files exist
ls -la ssl/
# Should show cert.pem and key.pem

# Check file permissions
# cert.pem should be 644, key.pem should be 600
```

### Browser Shows "Not Secure"

**Possible causes:**
1. Certificate expired
2. Certificate doesn't match domain
3. Missing intermediate certificates
4. Mixed content (HTTP resources on HTTPS page)

**Solution:**
```bash
# Check certificate expiration
openssl x509 -in ssl/cert.pem -noout -dates

# Verify certificate domain
openssl x509 -in ssl/cert.pem -noout -subject
```

### Let's Encrypt Rate Limits

**Error:** "too many certificates already issued"

Let's Encrypt has rate limits:
- 50 certificates per registered domain per week
- 5 duplicate certificates per week

**Solution:** Wait for the rate limit to reset or use different domain/subdomains.

### Port 443 Already in Use

**Error:** "bind() to 0.0.0.0:443 failed"

**Solution:**
```bash
# Check what's using port 443
sudo netstat -tlnp | grep :443

# Stop conflicting service
sudo systemctl stop apache2  # or nginx, or other service
```

### HTTPS Redirect Loop

**Solution:** Check nginx configuration. Ensure the HTTPS server block is correctly configured and the application is served over HTTP internally.

## Security Checklist

- [ ] Using TLS 1.2 or higher only
- [ ] Strong cipher suites configured
- [ ] OCSP stapling enabled
- [ ] Certificate chain complete
- [ ] Private key protected (chmod 600)
- [ ] HSTS enabled (after testing)
- [ ] HTTP redirects to HTTPS
- [ ] Certificate auto-renewal configured
- [ ] Tested with SSL Labs (Grade A or A+)
- [ ] Monitoring certificate expiration

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Best Practices](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)
- [Nginx SSL Documentation](https://nginx.org/en/docs/http/ngx_http_ssl_module.html)

## See Also

- [Production Deployment Guide](./PRODUCTION.md)
- [Environment Variables](./ENVIRONMENT.md)
- [Backup and Restore](./BACKUP_RESTORE.md)
