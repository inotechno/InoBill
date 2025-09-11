#!/bin/bash

# Update Script for InoBill PWA
# Updates the PWA files and reloads Nginx

echo "🔄 Updating InoBill PWA..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DOMAIN="inobill.inotechno.my.id"
WEB_DIR="/var/www/$DOMAIN"
BACKUP_SCRIPT="./backup.sh"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Update Information:${NC}"
echo "Domain: $DOMAIN"
echo "Web Directory: $WEB_DIR"
echo "Update Date: $(date)"

# Step 1: Create backup before update
echo -e "\n${YELLOW}💾 Creating backup before update...${NC}"
if [ -f "$BACKUP_SCRIPT" ]; then
    bash $BACKUP_SCRIPT
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created successfully${NC}"
    else
        echo -e "${YELLOW}⚠️ Backup failed, but continuing with update${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Backup script not found, skipping backup${NC}"
fi

# Step 2: Check if web directory exists
echo -e "\n${YELLOW}🔍 Checking web directory...${NC}"
if [ -d "$WEB_DIR" ]; then
    echo -e "${GREEN}✅ Web directory exists${NC}"
    echo "Current directory size: $(du -sh $WEB_DIR | cut -f1)"
else
    echo -e "${RED}❌ Web directory not found: $WEB_DIR${NC}"
    echo "Creating web directory..."
    mkdir -p $WEB_DIR
    chown -R www-data:www-data $WEB_DIR
    chmod -R 755 $WEB_DIR
fi

# Step 3: Check for new files
echo -e "\n${YELLOW}📋 Checking for new files...${NC}"
if [ -f "index.html" ] && [ -f "manifest.json" ] && [ -f "sw.js" ]; then
    echo -e "${GREEN}✅ PWA files found in current directory${NC}"
    SOURCE_DIR="."
else
    echo -e "${RED}❌ PWA files not found. Please run this script from the pwa/ directory.${NC}"
    echo "Required files: index.html, manifest.json, sw.js"
    exit 1
fi

# Step 4: Show what will be updated
echo -e "\n${YELLOW}📄 Files to be updated:${NC}"
if [ -f "index.html" ]; then
    find . -maxdepth 1 -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.json" -o -name "*.png" -o -name "*.ico" \) | while read file; do
        echo "  - $file"
    done
    echo "  - icons/ directory"
    echo "  - screenshots/ directory"
fi

# Step 5: Update files
echo -e "\n${YELLOW}🔄 Updating PWA files...${NC}"
cp -r $SOURCE_DIR/* $WEB_DIR/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files updated successfully${NC}"
else
    echo -e "${RED}❌ Failed to update files${NC}"
    exit 1
fi

# Step 6: Set permissions
echo -e "\n${YELLOW}🔐 Setting permissions...${NC}"
chown -R www-data:www-data $WEB_DIR
chmod -R 755 $WEB_DIR

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Permissions set successfully${NC}"
else
    echo -e "${RED}❌ Failed to set permissions${NC}"
    exit 1
fi

# Step 7: Test Nginx configuration
echo -e "\n${YELLOW}🔍 Testing Nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    echo "Please check the configuration file"
    exit 1
fi

# Step 8: Reload Nginx
echo -e "\n${YELLOW}🔄 Reloading Nginx...${NC}"
systemctl reload nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Failed to reload Nginx${NC}"
    exit 1
fi

# Step 9: Verify update
echo -e "\n${YELLOW}🔍 Verifying update...${NC}"

# Check if key files exist
if [ -f "$WEB_DIR/index.html" ]; then
    echo -e "${GREEN}✅ index.html exists${NC}"
else
    echo -e "${RED}❌ index.html not found${NC}"
fi

if [ -f "$WEB_DIR/manifest.json" ]; then
    echo -e "${GREEN}✅ manifest.json exists${NC}"
else
    echo -e "${RED}❌ manifest.json not found${NC}"
fi

if [ -f "$WEB_DIR/sw.js" ]; then
    echo -e "${GREEN}✅ sw.js exists${NC}"
else
    echo -e "${RED}❌ sw.js not found${NC}"
fi

if [ -f "$WEB_DIR/style.css" ]; then
    echo -e "${GREEN}✅ style.css exists${NC}"
else
    echo -e "${RED}❌ style.css not found${NC}"
fi

if [ -f "$WEB_DIR/script.js" ]; then
    echo -e "${GREEN}✅ script.js exists${NC}"
else
    echo -e "${RED}❌ script.js not found${NC}"
fi

# Step 10: Check Nginx status
echo -e "\n${YELLOW}🔍 Checking Nginx status...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
    systemctl start nginx
fi

# Step 11: Test site accessibility
echo -e "\n${YELLOW}🌐 Testing site accessibility...${NC}"
echo "Testing HTTP access..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN 2>/dev/null)
if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    echo -e "${GREEN}✅ HTTP access working (Response: $HTTP_RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠️ HTTP access may have issues (Response: $HTTP_RESPONSE)${NC}"
fi

echo "Testing HTTPS access..."
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null)
if [ "$HTTPS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ HTTPS access working (Response: $HTTPS_RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠️ HTTPS access may have issues (Response: $HTTPS_RESPONSE)${NC}"
fi

# Step 12: Clear browser cache (if possible)
echo -e "\n${YELLOW}🧹 Cache Management:${NC}"
echo "To ensure users see the updated version:"
echo "1. Clear browser cache"
echo "2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)"
echo "3. Check service worker cache in DevTools"

# Step 13: Display update summary
echo -e "\n${GREEN}🎉 Update completed successfully!${NC}"

echo -e "\n${BLUE}📋 Update Summary:${NC}"
echo "• Update Date: $(date)"
echo "• Domain: $DOMAIN"
echo "• Web Directory: $WEB_DIR"
echo "• Files Updated: $(find $WEB_DIR -type f | wc -l) files"
echo "• Directory Size: $(du -sh $WEB_DIR | cut -f1)"

echo -e "\n${BLUE}🔧 Useful Commands:${NC}"
echo "• Check Nginx status: sudo systemctl status nginx"
echo "• View logs: sudo tail -f /var/log/nginx/error.log"
echo "• Test config: sudo nginx -t"
echo "• Reload Nginx: sudo systemctl reload nginx"

echo -e "\n${BLUE}🌐 Test Your Updated Site:${NC}"
echo "• HTTP: http://$DOMAIN"
echo "• HTTPS: https://$DOMAIN"
echo "• PWA: https://$DOMAIN (should show updated version)"

echo -e "\n${BLUE}📱 PWA Testing:${NC}"
echo "1. Open Chrome DevTools (F12)"
echo "2. Go to Application tab"
echo "3. Check Service Worker registration"
echo "4. Test offline functionality"
echo "5. Verify manifest.json"

echo -e "\n${GREEN}✅ InoBill PWA has been updated successfully!${NC}"
echo -e "${BLUE}🔗 Access your updated PWA at: https://$DOMAIN${NC}"
