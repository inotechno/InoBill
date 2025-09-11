#!/bin/bash

# Backup Script for InoBill PWA
# Creates timestamped backups of the PWA files

echo "💾 Creating backup for InoBill PWA..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/inobill"
WEB_DIR="/var/www/inobill.inotechno.my.id"
NGINX_CONFIG="/etc/letsencrypt/live/inobill.inotechno.my.id"
BACKUP_NAME="inobill_backup_$DATE"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Backup Information:${NC}"
echo "Backup Name: $BACKUP_NAME"
echo "Web Directory: $WEB_DIR"
echo "Backup Directory: $BACKUP_DIR"
echo "Date: $(date)"

# Step 1: Create backup directory
echo -e "\n${YELLOW}📁 Creating backup directory...${NC}"
mkdir -p $BACKUP_DIR

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup directory created${NC}"
else
    echo -e "${RED}❌ Failed to create backup directory${NC}"
    exit 1
fi

# Step 2: Check if web directory exists
echo -e "\n${YELLOW}🔍 Checking web directory...${NC}"
if [ -d "$WEB_DIR" ]; then
    echo -e "${GREEN}✅ Web directory exists${NC}"
    echo "Directory size: $(du -sh $WEB_DIR | cut -f1)"
else
    echo -e "${RED}❌ Web directory not found: $WEB_DIR${NC}"
    exit 1
fi

# Step 3: Create backup of web files
echo -e "\n${YELLOW}📋 Backing up web files...${NC}"
tar -czf $BACKUP_DIR/${BACKUP_NAME}_web.tar.gz -C $WEB_DIR .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Web files backed up${NC}"
    echo "Backup size: $(du -sh $BACKUP_DIR/${BACKUP_NAME}_web.tar.gz | cut -f1)"
else
    echo -e "${RED}❌ Failed to backup web files${NC}"
    exit 1
fi

# Step 4: Backup Nginx configuration
echo -e "\n${YELLOW}⚙️ Backing up Nginx configuration...${NC}"
if [ -f "/etc/nginx/sites-available/inobill.inotechno.my.id" ]; then
    cp /etc/nginx/sites-available/inobill.inotechno.my.id $BACKUP_DIR/${BACKUP_NAME}_nginx.conf
    echo -e "${GREEN}✅ Nginx configuration backed up${NC}"
else
    echo -e "${YELLOW}⚠️ Nginx configuration not found${NC}"
fi

# Step 5: Backup SSL certificates (if they exist)
echo -e "\n${YELLOW}🔒 Backing up SSL certificates...${NC}"
if [ -d "$NGINX_CONFIG" ]; then
    tar -czf $BACKUP_DIR/${BACKUP_NAME}_ssl.tar.gz -C /etc/letsencrypt/live inobill.inotechno.my.id
    echo -e "${GREEN}✅ SSL certificates backed up${NC}"
else
    echo -e "${YELLOW}⚠️ SSL certificates not found${NC}"
fi

# Step 6: Create backup manifest
echo -e "\n${YELLOW}📄 Creating backup manifest...${NC}"
cat > $BACKUP_DIR/${BACKUP_NAME}_manifest.txt << EOF
InoBill PWA Backup Manifest
==========================
Backup Date: $(date)
Backup Name: $BACKUP_NAME
Server: $(hostname)
Domain: inobill.inotechno.my.id

Files Included:
- Web files: ${BACKUP_NAME}_web.tar.gz
- Nginx config: ${BACKUP_NAME}_nginx.conf
- SSL certificates: ${BACKUP_NAME}_ssl.tar.gz

Backup Location: $BACKUP_DIR
Web Directory: $WEB_DIR

Restore Instructions:
1. Extract web files: tar -xzf ${BACKUP_NAME}_web.tar.gz -C $WEB_DIR
2. Restore Nginx config: cp ${BACKUP_NAME}_nginx.conf /etc/nginx/sites-available/inobill.inotechno.my.id
3. Restore SSL certs: tar -xzf ${BACKUP_NAME}_ssl.tar.gz -C /etc/letsencrypt/live
4. Reload Nginx: systemctl reload nginx

Created by: InoBill PWA Backup Script
EOF

echo -e "${GREEN}✅ Backup manifest created${NC}"

# Step 7: Clean old backups (keep last 7 days)
echo -e "\n${YELLOW}🧹 Cleaning old backups...${NC}"
find $BACKUP_DIR -name "inobill_backup_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "inobill_backup_*.conf" -mtime +7 -delete
find $BACKUP_DIR -name "inobill_backup_*.txt" -mtime +7 -delete

echo -e "${GREEN}✅ Old backups cleaned (kept last 7 days)${NC}"

# Step 8: Verify backup
echo -e "\n${YELLOW}🔍 Verifying backup...${NC}"
if [ -f "$BACKUP_DIR/${BACKUP_NAME}_web.tar.gz" ]; then
    echo -e "${GREEN}✅ Web backup verified${NC}"
else
    echo -e "${RED}❌ Web backup verification failed${NC}"
fi

# Step 9: Display backup summary
echo -e "\n${GREEN}🎉 Backup completed successfully!${NC}"

echo -e "\n${BLUE}📋 Backup Summary:${NC}"
echo "• Backup Name: $BACKUP_NAME"
echo "• Backup Date: $(date)"
echo "• Backup Location: $BACKUP_DIR"
echo "• Files Created:"

if [ -f "$BACKUP_DIR/${BACKUP_NAME}_web.tar.gz" ]; then
    echo "  - Web files: $(du -sh $BACKUP_DIR/${BACKUP_NAME}_web.tar.gz | cut -f1)"
fi

if [ -f "$BACKUP_DIR/${BACKUP_NAME}_nginx.conf" ]; then
    echo "  - Nginx config: $(du -sh $BACKUP_DIR/${BACKUP_NAME}_nginx.conf | cut -f1)"
fi

if [ -f "$BACKUP_DIR/${BACKUP_NAME}_ssl.tar.gz" ]; then
    echo "  - SSL certificates: $(du -sh $BACKUP_DIR/${BACKUP_NAME}_ssl.tar.gz | cut -f1)"
fi

echo "  - Manifest: $(du -sh $BACKUP_DIR/${BACKUP_NAME}_manifest.txt | cut -f1)"

# Step 10: List all backups
echo -e "\n${BLUE}📁 All Backups:${NC}"
ls -la $BACKUP_DIR/inobill_backup_* 2>/dev/null | while read line; do
    echo "  $line"
done

echo -e "\n${BLUE}🔧 Useful Commands:${NC}"
echo "• List backups: ls -la $BACKUP_DIR"
echo "• Restore web files: tar -xzf $BACKUP_DIR/${BACKUP_NAME}_web.tar.gz -C $WEB_DIR"
echo "• Restore Nginx config: cp $BACKUP_DIR/${BACKUP_NAME}_nginx.conf /etc/nginx/sites-available/inobill.inotechno.my.id"
echo "• Restore SSL certs: tar -xzf $BACKUP_DIR/${BACKUP_NAME}_ssl.tar.gz -C /etc/letsencrypt/live"

echo -e "\n${BLUE}⏰ Automated Backup:${NC}"
echo "To setup automated daily backups, add this to crontab:"
echo "0 2 * * * /path/to/backup.sh"

echo -e "\n${GREEN}✅ Backup process completed!${NC}"
