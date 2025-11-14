#!/bin/bash
# SSL Certificate Renewal Script
# This script copies renewed Let's Encrypt certificates and reloads nginx

set -e

# ==========================================
# CONFIGURATION
# ==========================================

# Domain name
DOMAIN="${DOMAIN:-yourdomain.com}"

# Certificate paths
CERT_SOURCE="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
KEY_SOURCE="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"

# Destination paths (customize as needed)
CERT_DEST="${CERT_DEST:-./ssl/cert.pem}"
KEY_DEST="${KEY_DEST:-./ssl/key.pem}"

# Docker compose file
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

# ==========================================
# FUNCTIONS
# ==========================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# ==========================================
# MAIN PROCESS
# ==========================================

main() {
    log "Starting SSL certificate renewal process"
    
    # Check if source certificates exist
    if [ ! -f "${CERT_SOURCE}" ]; then
        error "Certificate not found at ${CERT_SOURCE}"
        exit 1
    fi
    
    if [ ! -f "${KEY_SOURCE}" ]; then
        error "Private key not found at ${KEY_SOURCE}"
        exit 1
    fi
    
    # Create ssl directory if it doesn't exist
    mkdir -p "$(dirname "${CERT_DEST}")"
    
    # Copy certificates
    log "Copying renewed certificates..."
    cp "${CERT_SOURCE}" "${CERT_DEST}"
    cp "${KEY_SOURCE}" "${KEY_DEST}"
    
    # Set proper permissions
    chmod 644 "${CERT_DEST}"
    chmod 600 "${KEY_DEST}"
    
    log "Certificates copied successfully"
    
    # Reload nginx if running in Docker
    if command -v docker &> /dev/null; then
        log "Checking if nginx container is running..."
        
        if docker ps --filter "name=quick-mailer-nginx" --format "{{.Names}}" | grep -q "quick-mailer-nginx"; then
            log "Reloading nginx..."
            docker compose -f "${COMPOSE_FILE}" exec nginx nginx -s reload
            log "Nginx reloaded successfully"
        else
            log "Nginx container not running, skipping reload"
        fi
    fi
    
    log "Certificate renewal completed successfully"
    exit 0
}

# ==========================================
# RUN SCRIPT
# ==========================================

main "$@"
