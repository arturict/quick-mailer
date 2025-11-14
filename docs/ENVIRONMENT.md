# Environment Variables Documentation

This document describes all environment variables used by Quick Mailer for configuration.

## Table of Contents

- [Email Provider Configuration](#email-provider-configuration)
- [Server Configuration](#server-configuration)
- [Database Configuration](#database-configuration)
- [Production Settings](#production-settings)
- [Docker Configuration](#docker-configuration)

## Email Provider Configuration

### Email Provider Selection

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_PROVIDER` | No | `resend` | Email provider to use. Options: `resend`, `smtp` |

### Resend API Configuration

Used when `EMAIL_PROVIDER=resend` (default).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Yes* | - | Your Resend API key. Get it from [resend.com](https://resend.com) |

*Required when using Resend provider.

**Example:**
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_123456789abcdefghijklmnop
```

### SMTP Configuration

Used when `EMAIL_PROVIDER=smtp`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | Yes* | - | SMTP server hostname (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | Yes* | - | SMTP port (usually `587` for TLS, `465` for SSL) |
| `SMTP_SECURE` | No | `false` | Use SSL/TLS. Set to `true` for port 465, `false` for 587 |
| `SMTP_USER` | Yes* | - | SMTP username (usually your email address) |
| `SMTP_PASSWORD` | Yes* | - | SMTP password or app-specific password |

*Required when using SMTP provider.

**Example (Gmail):**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Example (Outlook):**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

See [SMTP.md](./SMTP.md) for provider-specific configurations.

## Server Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FROM_ADDRESSES` | Yes | - | Comma-separated list of allowed sender email addresses |
| `DEFAULT_SENDER_NAME` | No | `Quick Mailer` | Default sender name for emails |
| `PORT` | No | `3000` | Server port number |
| `HOST` | No | `0.0.0.0` | Server host address (use `0.0.0.0` for Docker) |
| `NODE_ENV` | No | `development` | Environment mode: `development`, `production` |

**Example:**
```env
FROM_ADDRESSES=noreply@example.com,support@example.com,info@example.com
DEFAULT_SENDER_NAME=My Company
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

## Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_PATH` | No | `./data/emails.db` | Path to SQLite database file |

**Example (Local Development):**
```env
DATABASE_PATH=./data/emails.db
```

**Example (Docker Production):**
```env
DATABASE_PATH=/app/backend/data/emails.db
```

## Production Settings

For production deployments, use these recommended settings:

```env
# Environment
NODE_ENV=production

# Server
PORT=3000
HOST=0.0.0.0

# Email Provider (choose one)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_production_api_key

# OR for SMTP:
# EMAIL_PROVIDER=smtp
# SMTP_HOST=smtp.yourdomain.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=noreply@yourdomain.com
# SMTP_PASSWORD=secure_password_here

# Application
FROM_ADDRESSES=noreply@yourdomain.com,support@yourdomain.com
DEFAULT_SENDER_NAME=Your Company Name

# Database
DATABASE_PATH=/app/backend/data/emails.db
```

## Docker Configuration

### Docker Compose Variables

Additional variables for `docker-compose.prod.yml`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXTERNAL_PORT` | No | `3000` | External port to expose the application |
| `HTTPS_PORT` | No | `443` | HTTPS port for nginx (when using nginx profile) |
| `HTTP_PORT` | No | `80` | HTTP port for nginx (when using nginx profile) |

**Example `.env` for Docker Compose:**
```env
# Application Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
FROM_ADDRESSES=noreply@example.com,support@example.com
DEFAULT_SENDER_NAME=Quick Mailer
NODE_ENV=production

# Docker Ports
EXTERNAL_PORT=3000
HTTPS_PORT=443
HTTP_PORT=80
```

### Build Arguments

When building Docker images, you can pass build arguments:

```bash
docker build \
  --build-arg VITE_API_URL=/api \
  --build-arg VITE_FROM_ADDRESSES="noreply@example.com,support@example.com" \
  -t quick-mailer:latest .
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Use strong passwords** - Especially for SMTP authentication
3. **Restrict API keys** - Use API keys with minimal required permissions
4. **Use app-specific passwords** - For Gmail and other providers
5. **Rotate credentials regularly** - Update API keys and passwords periodically
6. **Use secrets management** - In production, consider using Docker secrets or environment-specific secret managers

## Validation

The application validates configuration on startup and reports:
- ✅ Email provider correctly configured
- ✅ From addresses set
- ❌ Missing required configuration

Check the `/health` endpoint for configuration status:

```bash
curl http://localhost:3000/health
```

Example healthy response:
```json
{
  "status": "healthy",
  "service": "quick-mailer-api",
  "version": "1.0.0",
  "timestamp": "2025-11-14T18:00:00.000Z",
  "checks": {
    "database": {
      "status": "healthy"
    },
    "emailProvider": {
      "status": "configured",
      "provider": "resend",
      "configured": true
    },
    "fromAddresses": {
      "status": "configured",
      "count": 3
    }
  }
}
```

## Troubleshooting

### Email Provider Not Configured

**Error:** `emailProvider.status: "not_configured"`

**Solution:**
- For Resend: Ensure `RESEND_API_KEY` is set
- For SMTP: Ensure `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASSWORD` are set

### Database Issues

**Error:** `database.status: "unhealthy"`

**Solution:**
- Check `DATABASE_PATH` is writable
- Ensure the directory exists and has proper permissions
- In Docker, verify volume is mounted correctly

### Missing From Addresses

**Error:** `fromAddresses.count: 0`

**Solution:**
- Set `FROM_ADDRESSES` environment variable
- Use comma-separated values for multiple addresses
- Ensure no trailing commas

## See Also

- [Production Deployment Guide](./PRODUCTION.md)
- [SMTP Provider Configuration](./SMTP.md)
- [Backup and Restore](./BACKUP_RESTORE.md)
- [SSL/TLS Setup](./SSL_TLS.md)
