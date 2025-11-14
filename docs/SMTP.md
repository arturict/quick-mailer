# 📧 SMTP Configuration Guide

Quick Mailer supports both Resend API and generic SMTP servers. This guide shows you how to configure popular email providers.

---

## Configuration Methods

### Option 1: Resend API (Default)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
FROM_ADDRESSES=noreply@yourdomain.com
```

### Option 2: SMTP Server

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
FROM_ADDRESSES=your-email@example.com
```

---

## Popular SMTP Providers

### Gmail

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_ADDRESSES=your-email@gmail.com
```

**Important:**
- Use an [App Password](https://support.google.com/accounts/answer/185833), not your Gmail password
- Enable 2-Step Verification first
- Go to Google Account → Security → App Passwords

### Outlook / Office365

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
FROM_ADDRESSES=your-email@outlook.com
```

### Yahoo Mail

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
FROM_ADDRESSES=your-email@yahoo.com
```

**Important:**
- Generate an [App Password](https://help.yahoo.com/kb/generate-manage-third-party-passwords-sln15241.html)

### SendGrid

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_ADDRESSES=verified@yourdomain.com
```

### Mailgun

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-smtp-password
FROM_ADDRESSES=noreply@yourdomain.com
```

### Amazon SES

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
FROM_ADDRESSES=verified@yourdomain.com
```

### Postal (Self-Hosted)

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=postal.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
FROM_ADDRESSES=noreply@yourdomain.com
```

### Custom SMTP Server

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=username
SMTP_PASSWORD=password
FROM_ADDRESSES=noreply@yourdomain.com
```

---

## SMTP Ports Explained

| Port | Security | Description |
|------|----------|-------------|
| 25 | None | Standard SMTP (often blocked by ISPs) |
| 587 | STARTTLS | **Recommended** - TLS encryption |
| 465 | SSL/TLS | Deprecated but still used |
| 2525 | STARTTLS | Alternative to 587 |

**Recommended:** Use port `587` with `SMTP_SECURE=true`

---

## Security Options

### SMTP_SECURE

- `true` - Use TLS/SSL encryption (recommended)
- `false` - Unencrypted connection (not recommended)

### Best Practices

1. **Always use TLS/SSL** when possible
2. **Use App Passwords** for Gmail, Yahoo, etc.
3. **Verify sender domain** with your SMTP provider
4. **Keep credentials secure** - never commit to git
5. **Use environment variables** for all sensitive data

---

## Testing Your Configuration

### 1. Test SMTP Connection

```bash
# Start backend
cd backend
bun run dev
```

Look for this log message:
```
✅ Email service verified and ready
```

If you see this instead:
```
⚠️  Email service verification failed - emails may not send
```

Check your SMTP configuration.

### 2. Send Test Email

```bash
curl -X POST http://localhost:3000/api/emails \
  -H "Content-Type: application/json" \
  -d '{
    "from": "your-email@example.com",
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email"
  }'
```

### 3. Check Logs

Watch the backend logs for success/error messages:
```bash
docker-compose logs -f
```

---

## Troubleshooting

### "SMTP verification failed"

**Causes:**
- Wrong host or port
- Invalid credentials
- Firewall blocking connection
- SSL/TLS mismatch

**Solutions:**
1. Double-check SMTP_HOST and SMTP_PORT
2. Verify SMTP_USER and SMTP_PASSWORD
3. Try different ports (587, 465, 2525)
4. Toggle SMTP_SECURE setting

### "Authentication failed"

**Causes:**
- Wrong username or password
- Need to use App Password
- 2FA not enabled

**Solutions:**
1. Use App Password for Gmail/Yahoo
2. Enable 2-Step Verification
3. Check for typos in credentials

### "Connection timeout"

**Causes:**
- Firewall blocking SMTP ports
- Wrong SMTP host
- Network issues

**Solutions:**
1. Check firewall settings
2. Try alternative ports
3. Test with `telnet smtp.host.com 587`

### "From address not verified"

**Causes:**
- Email address not verified with provider
- Using wrong sender address

**Solutions:**
1. Verify sender domain with SMTP provider
2. Use verified email in FROM_ADDRESSES
3. Check provider's sender requirements

---

## Migration Guide

### From Resend to SMTP

1. Update `.env`:
```env
# Change from:
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxx

# To:
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your@gmail.com
SMTP_PASSWORD=app-password
```

2. Restart application:
```bash
docker-compose restart
```

### From SMTP to Resend

1. Update `.env`:
```env
# Change from:
EMAIL_PROVIDER=smtp
# (remove SMTP_* variables)

# To:
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxx
```

2. Restart application:
```bash
docker-compose restart
```

---

## Advanced Configuration

### Using Environment Variables in Docker

```yaml
# docker-compose.yml
services:
  quick-mailer:
    environment:
      - EMAIL_PROVIDER=smtp
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_SECURE=true
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
```

### Multiple Sender Addresses

```env
FROM_ADDRESSES=noreply@company.com,support@company.com,info@company.com
```

All addresses must be verified with your SMTP provider.

---

## Support

- **Gmail:** [SMTP Settings](https://support.google.com/mail/answer/7126229)
- **Outlook:** [SMTP Settings](https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353)
- **SendGrid:** [SMTP API](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- **Mailgun:** [SMTP Setup](https://documentation.mailgun.com/en/latest/user_manual.html#smtp-relay)

---

**Updated:** 2025-11-14
