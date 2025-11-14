#!/bin/bash
# Quick Mailer Backup Script
# This script performs automated backups of the Quick Mailer application
# including database, configuration, and SSL certificates.

set -e

# ==========================================
# CONFIGURATION
# ==========================================

# Backup directory (customize this)
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Retention period in days
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Timestamp for backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/${TIMESTAMP}"

# Container name
CONTAINER_NAME="quick-mailer-app"

# Volume name
VOLUME_NAME="quick-mailer_email-data"

# ==========================================
# FUNCTIONS
# ==========================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

check_dependencies() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
}

# ==========================================
# MAIN BACKUP PROCESS
# ==========================================

main() {
    log "Starting Quick Mailer backup"
    
    # Check dependencies
    check_dependencies
    
    # Create backup directory
    mkdir -p "${BACKUP_PATH}"
    log "Created backup directory: ${BACKUP_PATH}"
    
    # Backup database using Docker volume
    log "Backing up database..."
    if docker volume inspect "${VOLUME_NAME}" &> /dev/null; then
        docker run --rm \
            -v "${VOLUME_NAME}:/data" \
            -v "${BACKUP_PATH}":/backup \
            alpine tar czf /backup/emails-data.tar.gz -C /data . 2>&1
        
        if [ $? -eq 0 ]; then
            log "Database backup completed"
        else
            error "Database backup failed"
            exit 1
        fi
    else
        log "Warning: Volume ${VOLUME_NAME} not found, skipping database backup"
    fi
    
    # Backup configuration files
    log "Backing up configuration files..."
    
    if [ -f .env ]; then
        cp .env "${BACKUP_PATH}/.env"
        log "Backed up .env"
    else
        log "Warning: .env file not found"
    fi
    
    if [ -f docker-compose.prod.yml ]; then
        cp docker-compose.prod.yml "${BACKUP_PATH}/"
        log "Backed up docker-compose.prod.yml"
    fi
    
    if [ -f nginx.conf ]; then
        cp nginx.conf "${BACKUP_PATH}/"
        log "Backed up nginx.conf"
    fi
    
    # Backup SSL certificates
    if [ -d ssl ]; then
        log "Backing up SSL certificates..."
        cp -r ssl "${BACKUP_PATH}/"
        log "SSL certificates backed up"
    else
        log "Warning: SSL directory not found"
    fi
    
    # Create backup information file
    log "Creating backup metadata..."
    cat > "${BACKUP_PATH}/backup-info.txt" << EOF
Quick Mailer Backup Information
================================
Backup Date: $(date)
Backup Path: ${BACKUP_PATH}
Timestamp: ${TIMESTAMP}

Database Backup: $([ -f "${BACKUP_PATH}/emails-data.tar.gz" ] && echo "Yes" || echo "No")
Database Size: $([ -f "${BACKUP_PATH}/emails-data.tar.gz" ] && du -h "${BACKUP_PATH}/emails-data.tar.gz" | cut -f1 || echo "N/A")

Configuration Files:
- .env: $([ -f "${BACKUP_PATH}/.env" ] && echo "Yes" || echo "No")
- docker-compose.prod.yml: $([ -f "${BACKUP_PATH}/docker-compose.prod.yml" ] && echo "Yes" || echo "No")
- nginx.conf: $([ -f "${BACKUP_PATH}/nginx.conf" ] && echo "Yes" || echo "No")

SSL Certificates: $([ -d "${BACKUP_PATH}/ssl" ] && echo "Yes" || echo "No")

Container Status:
$(docker ps --filter name=${CONTAINER_NAME} --format "{{.Names}}: {{.Status}}" 2>&1 || echo "Container not running")

Total Backup Size: $(du -sh "${BACKUP_PATH}" | cut -f1)
EOF
    
    log "Backup metadata created"
    
    # Clean up old backups
    log "Cleaning up old backups (keeping last ${RETENTION_DAYS} days)..."
    find "${BACKUP_DIR}" -maxdepth 1 -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} \; 2>/dev/null || true
    log "Old backups cleaned up"
    
    # Display backup summary
    log "Backup completed successfully!"
    log "Backup location: ${BACKUP_PATH}"
    log "Total size: $(du -sh "${BACKUP_PATH}" | cut -f1)"
    
    # Optional: Upload to cloud storage
    # Uncomment and configure one of the following:
    
    # AWS S3
    # if command -v aws &> /dev/null; then
    #     log "Uploading to AWS S3..."
    #     aws s3 sync "${BACKUP_PATH}" "s3://your-bucket/quick-mailer-backups/${TIMESTAMP}/"
    # fi
    
    # Google Cloud Storage
    # if command -v gsutil &> /dev/null; then
    #     log "Uploading to Google Cloud Storage..."
    #     gsutil -m cp -r "${BACKUP_PATH}" "gs://your-bucket/quick-mailer-backups/${TIMESTAMP}/"
    # fi
    
    # Rclone (supports many cloud providers)
    # if command -v rclone &> /dev/null; then
    #     log "Uploading to cloud storage via rclone..."
    #     rclone sync "${BACKUP_PATH}" "remote:quick-mailer-backups/${TIMESTAMP}/"
    # fi
    
    exit 0
}

# ==========================================
# RUN BACKUP
# ==========================================

main "$@"
