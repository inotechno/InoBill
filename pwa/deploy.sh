#!/bin/bash

# InoBill PWA Deployment Script
# Domain: inobill.inotechno.my.id

echo "🚀 Deploying InoBill PWA to VPS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DOMAIN="inobill.inotechno.my.id"
WEB_DIR="/var/www/$DOMAIN"
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Deployment Information:${NC}"
echo "Domain: $DOMAIN"
echo "Web Directory: $WEB_DIR"
echo "Nginx Config: $NGINX_CONFIG"

# Step 1: Create web directory
echo -e "\n${YELLOW}📁 Creating web directory...${NC}"
mkdir -p $WEB_DIR
chown -R www-data:www-data $WEB_DIR
chmod -R 755 $WEB_DIR

# Step 2: Copy PWA files
echo -e "\n${YELLOW}📋 Copying PWA files...${NC}"
if [ -f "index.html" ] && [ -f "manifest.json" ] && [ -f "sw.js" ]; then
    # Copy all PWA files from current directory
    cp -r . $WEB_DIR/
    echo -e "${GREEN}✅ PWA files copied from current directory${NC}"
else
    echo -e "${RED}❌ PWA files not found. Please run this script from the pwa/ directory.${NC}"
    echo "Required files: index.html, manifest.json, sw.js"
    exit 1
fi

# Step 3: Set permissions
echo -e "\n${YELLOW}🔐 Setting permissions...${NC}"
chown -R www-data:www-data $WEB_DIR
chmod -R 755 $WEB_DIR

# Step 4: Create Nginx configuration
echo -e "\n${YELLOW}⚙️ Creating Nginx configuration...${NC}"
if [ -f "nginx.conf" ]; then
    cp nginx.conf $NGINX_CONFIG
    echo -e "${GREEN}✅ Nginx configuration copied${NC}"
else
    echo -e "${YELLOW}⚠️ nginx.conf not found. Creating basic configuration...${NC}"
    cat > $NGINX_CONFIG << EOF
# InoBill PWA - Basic Nginx Configuration
# SSL will be configured automatically by Certbot

server {
    server_name $DOMAIN www.$DOMAIN;
    
    root $WEB_DIR;
    index index.html;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # PWA Specific Headers
    add_header Service-Worker-Allowed "/" always;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    location /manifest.json {
        add_header Content-Type "application/manifest+json";
        add_header Cache-Control "public, max-age=86400";
    }
    
    location /icons/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logs
    access_log /var/log/nginx/$DOMAIN.access.log;
    error_log /var/log/nginx/$DOMAIN.error.log;
}
EOF
fi

# Step 5: Enable site
echo -e "\n${YELLOW}🔗 Enabling Nginx site...${NC}"
if [ ! -L $NGINX_ENABLED ]; then
    ln -s $NGINX_CONFIG $NGINX_ENABLED
    echo -e "${GREEN}✅ Site enabled${NC}"
else
    echo -e "${YELLOW}⚠️ Site already enabled${NC}"
fi

# Step 6: Test Nginx configuration
echo -e "\n${YELLOW}🔍 Testing Nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    
    # Step 7: Reload Nginx
    echo -e "\n${YELLOW}🔄 Reloading Nginx...${NC}"
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to reload Nginx${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Nginx configuration error. Please check the config file.${NC}"
    exit 1
fi

# Step 8: SSL Certificate Setup (optional)
echo -e "\n${YELLOW}🔒 SSL Certificate Setup${NC}"
echo "To install SSL certificate with Certbot, run:"
echo -e "${BLUE}sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
echo "Certbot will automatically configure SSL and update the Nginx configuration."

# Step 9: Final verification
echo -e "\n${YELLOW}🔍 Final verification...${NC}"
echo "Checking if site is accessible..."

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
    systemctl start nginx
fi

# Check if files exist
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

# Step 10: Display results
echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo "1. Point your domain DNS to this server's IP address"
echo "2. Install SSL certificate: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "3. Test your PWA at: http://$DOMAIN (before SSL)"
echo "4. After SSL: https://$DOMAIN"
echo "5. Certbot will automatically configure SSL and update Nginx config"

echo -e "\n${BLUE}🔧 Useful Commands:${NC}"
echo "• Check Nginx status: sudo systemctl status nginx"
echo "• View logs: sudo tail -f /var/log/nginx/error.log"
echo "• Test config: sudo nginx -t"
echo "• Reload Nginx: sudo systemctl reload nginx"

echo -e "\n${BLUE}📁 File Locations:${NC}"
echo "• Web files: $WEB_DIR"
echo "• Nginx config: $NGINX_CONFIG"
echo "• Logs: /var/log/nginx/"

echo -e "\n${GREEN}✅ InoBill PWA is now deployed!${NC}"
