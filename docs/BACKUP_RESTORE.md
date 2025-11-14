# Backup and Restore Procedures

This guide covers backup and restore procedures for Quick Mailer to ensure data safety and business continuity.

## Table of Contents

- [What to Backup](#what-to-backup)
- [Backup Methods](#backup-methods)
- [Automated Backups](#automated-backups)
- [Restore Procedures](#restore-procedures)
- [Disaster Recovery](#disaster-recovery)
- [Best Practices](#best-practices)

## What to Backup

Quick Mailer has the following data that should be backed up:

### 1. Database (Critical)
- **File:** `emails.db` (SQLite database)
- **Location:** `/app/backend/data/emails.db` (in Docker) or `./backend/data/emails.db` (local)
- **Contains:** Email history, templates, and all application data
- **Priority:** **High** - This is your critical data

### 2. Configuration Files (Important)
- **Files:**
  - `.env` - Environment variables and secrets
  - `docker-compose.prod.yml` - Production configuration
  - `nginx.conf` - Reverse proxy configuration
- **Priority:** **Medium** - Required for deployment

### 3. SSL/TLS Certificates (Important)
- **Location:** `./ssl/` directory
- **Files:**
  - `cert.pem` - SSL certificate
  - `key.pem` - Private key
- **Priority:** **Medium** - Can be regenerated but causes downtime

## Backup Methods

### Method 1: Manual Backup (Quick and Simple)

#### Stop the Application
```bash
# Stop Docker containers
docker-compose -f docker-compose.prod.yml down
```

#### Backup Database
```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d_%H%M%S)

# Copy database file
docker cp quick-mailer-app:/app/backend/data/emails.db backups/$(date +%Y%m%d_%H%M%S)/emails.db

# Or if using named volume
docker run --rm -v quick-mailer_email-data:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/emails-$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

#### Backup Configuration
```bash
# Copy configuration files
cp .env backups/$(date +%Y%m%d_%H%M%S)/.env
cp docker-compose.prod.yml backups/$(date +%Y%m%d_%H%M%S)/
cp nginx.conf backups/$(date +%Y%m%d_%H%M%S)/

# Copy SSL certificates
cp -r ssl backups/$(date +%Y%m%d_%H%M%S)/
```

#### Restart Application
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Method 2: Hot Backup (No Downtime)

SQLite WAL mode allows backups while the database is in use.

#### Using SQLite Backup Command
```bash
# Backup database without stopping the application
docker exec quick-mailer-app bun -e "
  const { Database } = require('bun:sqlite');
  const db = new Database('/app/backend/data/emails.db', { readonly: true });
  const backup = new Database('/app/backend/data/emails_backup.db');
  db.backup(backup);
  backup.close();
  db.close();
"

# Copy backup file out of container
docker cp quick-mailer-app:/app/backend/data/emails_backup.db \
  backups/emails-$(date +%Y%m%d_%H%M%S).db
```

#### Using Volume Backup
```bash
# Backup the Docker volume without stopping
docker run --rm \
  -v quick-mailer_email-data:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "tar czf /backup/emails-data-$(date +%Y%m%d_%H%M%S).tar.gz -C /data ."
```

### Method 3: Database Export (SQL Dump)

Export database to SQL format for portability:

```bash
# Export database schema and data
docker exec quick-mailer-app bun -e "
  const db = require('bun:sqlite').Database('/app/backend/data/emails.db');
  const fs = require('fs');
  
  // Export schema
  const schema = db.prepare('SELECT sql FROM sqlite_master WHERE sql IS NOT NULL').all();
  let dump = schema.map(s => s.sql + ';').join('\n\n');
  
  // Export data
  const tables = ['emails', 'templates'];
  for (const table of tables) {
    const rows = db.prepare(\`SELECT * FROM \${table}\`).all();
    for (const row of rows) {
      const values = Object.values(row).map(v => 
        v === null ? 'NULL' : typeof v === 'string' ? \"'\" + v.replace(/'/g, \"''\") + \"'\" : v
      ).join(', ');
      dump += \`INSERT INTO \${table} VALUES (\${values});\n\`;
    }
  }
  
  fs.writeFileSync('/app/backend/data/backup.sql', dump);
" && \
docker cp quick-mailer-app:/app/backend/data/backup.sql \
  backups/emails-$(date +%Y%m%d_%H%M%S).sql
```

## Automated Backups

### Daily Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/path/to/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/${TIMESTAMP}"

# Create backup directory
mkdir -p "${BACKUP_PATH}"

echo "Starting backup at $(date)"

# Backup database using hot backup
docker run --rm \
  -v quick-mailer_email-data:/data \
  -v "${BACKUP_PATH}":/backup \
  alpine tar czf /backup/emails-data.tar.gz -C /data .

# Backup configuration files
cp .env "${BACKUP_PATH}/.env"
cp docker-compose.prod.yml "${BACKUP_PATH}/"
cp nginx.conf "${BACKUP_PATH}/"

# Backup SSL certificates
if [ -d ssl ]; then
  cp -r ssl "${BACKUP_PATH}/"
fi

# Create backup info file
cat > "${BACKUP_PATH}/backup-info.txt" << EOF
Backup Date: $(date)
Database Size: $(du -h "${BACKUP_PATH}/emails-data.tar.gz" | cut -f1)
Quick Mailer Version: $(docker exec quick-mailer-app bun -e "console.log('1.0.0')")
EOF

# Remove old backups (keep only last N days)
find "${BACKUP_DIR}" -maxdepth 1 -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} \;

echo "Backup completed successfully at $(date)"
echo "Backup location: ${BACKUP_PATH}"

# Optional: Upload to cloud storage (uncomment and configure)
# aws s3 sync "${BACKUP_PATH}" "s3://your-bucket/quick-mailer-backups/${TIMESTAMP}/"
# rclone copy "${BACKUP_PATH}" "remote:quick-mailer-backups/${TIMESTAMP}/"
```

Make it executable:
```bash
chmod +x scripts/backup.sh
```

### Schedule with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/quick-mailer/scripts/backup.sh >> /var/log/quick-mailer-backup.log 2>&1

# Or for more frequent backups (every 6 hours)
0 */6 * * * /path/to/quick-mailer/scripts/backup.sh >> /var/log/quick-mailer-backup.log 2>&1
```

### Schedule with Systemd

Create `/etc/systemd/system/quick-mailer-backup.service`:

```ini
[Unit]
Description=Quick Mailer Backup
After=docker.service

[Service]
Type=oneshot
User=root
ExecStart=/path/to/quick-mailer/scripts/backup.sh
StandardOutput=journal
StandardError=journal
```

Create `/etc/systemd/system/quick-mailer-backup.timer`:

```ini
[Unit]
Description=Quick Mailer Backup Timer

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl enable quick-mailer-backup.timer
sudo systemctl start quick-mailer-backup.timer

# Check timer status
sudo systemctl list-timers quick-mailer-backup.timer
```

## Restore Procedures

### Full Restore from Backup

#### Step 1: Stop the Application
```bash
docker-compose -f docker-compose.prod.yml down
```

#### Step 2: Restore Database

**From volume backup:**
```bash
# Remove old volume
docker volume rm quick-mailer_email-data

# Restore from backup
docker run --rm \
  -v quick-mailer_email-data:/data \
  -v $(pwd)/backups/20231114_020000:/backup \
  alpine sh -c "cd /data && tar xzf /backup/emails-data.tar.gz"
```

**From database file:**
```bash
# Create temporary container to access volume
docker run -d --name temp-restore -v quick-mailer_email-data:/data alpine sleep 3600

# Copy database file
docker cp backups/20231114_020000/emails.db temp-restore:/data/emails.db

# Stop and remove temporary container
docker stop temp-restore
docker rm temp-restore
```

#### Step 3: Restore Configuration
```bash
cp backups/20231114_020000/.env .env
cp backups/20231114_020000/docker-compose.prod.yml docker-compose.prod.yml
cp backups/20231114_020000/nginx.conf nginx.conf
```

#### Step 4: Restore SSL Certificates (if needed)
```bash
cp -r backups/20231114_020000/ssl ./
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
```

#### Step 5: Start Application
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Step 6: Verify Restore
```bash
# Check health
curl http://localhost:3000/health

# Check email count
docker exec quick-mailer-app bun -e "
  const db = require('bun:sqlite').Database('/app/backend/data/emails.db');
  const result = db.prepare('SELECT COUNT(*) as count FROM emails').get();
  console.log('Total emails:', result.count);
"
```

### Partial Restore (Database Only)

If only the database needs to be restored:

```bash
# Stop application
docker-compose -f docker-compose.prod.yml stop quick-mailer

# Restore database file
docker cp backups/20231114_020000/emails.db quick-mailer-app:/app/backend/data/emails.db

# Restart application
docker-compose -f docker-compose.prod.yml start quick-mailer
```

### Import from SQL Dump

```bash
# Copy SQL dump to container
docker cp backups/20231114_020000/emails.sql quick-mailer-app:/tmp/restore.sql

# Import SQL dump
docker exec quick-mailer-app bun -e "
  const db = require('bun:sqlite').Database('/app/backend/data/emails.db');
  const fs = require('fs');
  const sql = fs.readFileSync('/tmp/restore.sql', 'utf8');
  db.exec(sql);
"
```

## Disaster Recovery

### Complete System Failure

1. **Provision new server**
2. **Install Docker and Docker Compose**
3. **Clone repository or copy application files**
4. **Restore from latest backup** (follow restore procedures above)
5. **Verify SSL certificates and update DNS if needed**
6. **Start application and verify**

### Recovery Time Objective (RTO)

With proper backups and procedures:
- **Target RTO:** 15-30 minutes
- **Actual recovery:** Depends on backup size and network speed

### Recovery Point Objective (RPO)

Based on backup frequency:
- **Daily backups:** Up to 24 hours of data loss
- **6-hour backups:** Up to 6 hours of data loss
- **Hourly backups:** Up to 1 hour of data loss

Choose backup frequency based on your RPO requirements.

## Best Practices

### Backup Strategy

1. **3-2-1 Rule:**
   - **3** copies of data (production + 2 backups)
   - **2** different storage types (local disk + cloud)
   - **1** copy offsite (cloud storage)

2. **Automated Backups:**
   - Schedule regular automated backups
   - Monitor backup success/failure
   - Alert on backup failures

3. **Backup Testing:**
   - Regularly test restore procedures
   - Verify backup integrity
   - Document recovery time

4. **Retention Policy:**
   - Daily backups: Keep 7 days
   - Weekly backups: Keep 4 weeks
   - Monthly backups: Keep 12 months

### Cloud Storage Options

**AWS S3:**
```bash
# Install AWS CLI
aws configure

# Upload backup
aws s3 cp backups/20231114_020000/ s3://your-bucket/quick-mailer/20231114_020000/ --recursive
```

**Google Cloud Storage:**
```bash
# Install gcloud
gcloud init

# Upload backup
gsutil -m cp -r backups/20231114_020000/ gs://your-bucket/quick-mailer/
```

**Rclone (supports many providers):**
```bash
# Configure rclone
rclone config

# Upload backup
rclone sync backups/20231114_020000/ remote:quick-mailer-backups/20231114_020000/
```

### Security

1. **Encrypt backups** containing sensitive data
2. **Secure .env files** (contain API keys and secrets)
3. **Restrict backup access** to authorized users only
4. **Use separate credentials** for backup storage

### Monitoring

Set up monitoring to:
- Verify backups complete successfully
- Alert on backup failures
- Track backup size and duration
- Monitor available storage space

### Example Monitoring Script

```bash
#!/bin/bash
# Add to backup.sh

if [ $? -eq 0 ]; then
  echo "Backup successful" | mail -s "Quick Mailer Backup Success" admin@example.com
else
  echo "Backup failed!" | mail -s "ALERT: Quick Mailer Backup Failed" admin@example.com
fi
```

## Checklist

### Before Disaster
- [ ] Automated backups configured
- [ ] Backup retention policy defined
- [ ] Backups stored offsite (cloud)
- [ ] Restore procedure documented and tested
- [ ] Recovery time measured
- [ ] Monitoring and alerting configured
- [ ] Backup encryption enabled (for sensitive data)
- [ ] Access controls in place

### During Restore
- [ ] Latest backup identified
- [ ] Backup integrity verified
- [ ] Application stopped cleanly
- [ ] Database restored
- [ ] Configuration restored
- [ ] SSL certificates restored
- [ ] Application started
- [ ] Health check passed
- [ ] Data verified

### After Restore
- [ ] Document what went wrong
- [ ] Update recovery procedures if needed
- [ ] Verify backup schedule
- [ ] Review retention policy
- [ ] Test application functionality

## See Also

- [Production Deployment Guide](./PRODUCTION.md)
- [Environment Variables](./ENVIRONMENT.md)
- [SSL/TLS Configuration](./SSL_TLS.md)
