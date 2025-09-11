#!/bin/bash

# Simple SSL Certificate Setup with Certbot for InoBill PWA
# Domain: inobill.inotechno.my.id

echo "🔒 Setting up SSL Certificate with Certbot for InoBill PWA..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DOMAIN="inobill.inotechno.my.id"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}📋 SSL Setup Information:${NC}"
echo "Domain: $DOMAIN"
echo "Provider: Let's Encrypt (Certbot)"
echo "Method: Automatic Nginx configuration"

# Step 1: Check if Certbot is installed
echo -e "\n${YELLOW}🔍 Checking Certbot installation...${NC}"
if command -v certbot &> /dev/null; then
    echo -e "${GREEN}✅ Certbot is already installed${NC}"
    certbot --version
else
    echo -e "${YELLOW}📦 Installing Certbot...${NC}"
    apt update
    apt install certbot python3-certbot-nginx -y
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Certbot installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install Certbot${NC}"
        exit 1
    fi
fi

# Step 2: Check if Nginx is running
echo -e "\n${YELLOW}🔍 Checking Nginx status...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running. Please start Nginx first.${NC}"
    echo "Run: sudo systemctl start nginx"
    exit 1
fi

# Step 3: Check if site configuration exists
echo -e "\n${YELLOW}🔍 Checking Nginx site configuration...${NC}"
if [ -f "/etc/nginx/sites-available/$DOMAIN" ]; then
    echo -e "${GREEN}✅ Nginx site configuration exists${NC}"
else
    echo -e "${RED}❌ Nginx site configuration not found${NC}"
    echo "Please run the deployment script first: sudo ./deploy.sh"
    exit 1
fi

# Step 4: Check if site is enabled
echo -e "\n${YELLOW}🔍 Checking if site is enabled...${NC}"
if [ -L "/etc/nginx/sites-enabled/$DOMAIN" ]; then
    echo -e "${GREEN}✅ Site is enabled${NC}"
else
    echo -e "${YELLOW}⚠️ Site is not enabled. Enabling now...${NC}"
    ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    echo -e "${GREEN}✅ Site enabled and Nginx reloaded${NC}"
fi

# Step 5: Check domain accessibility
echo -e "\n${YELLOW}🔍 Checking domain accessibility...${NC}"
echo "Please ensure your domain $DOMAIN is pointing to this server's IP address"
echo "You can check this by running: nslookup $DOMAIN"
echo ""
read -p "Press Enter when DNS is configured correctly..."

# Test domain resolution
if nslookup $DOMAIN &> /dev/null; then
    echo -e "${GREEN}✅ Domain resolves correctly${NC}"
else
    echo -e "${YELLOW}⚠️ Domain resolution may have issues${NC}"
fi

# Step 6: Get SSL certificate with Certbot
echo -e "\n${YELLOW}🔒 Obtaining SSL certificate with Certbot...${NC}"
echo "Certbot will automatically configure SSL and update your Nginx configuration"
echo ""

certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@inotechno.my.id

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate obtained and configured successfully${NC}"
else
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    echo "Please check:"
    echo "1. Domain DNS is pointing to this server"
    echo "2. Nginx is running and accessible on port 80"
    echo "3. Firewall allows HTTP (80) and HTTPS (443) traffic"
    echo "4. No other application is using port 80"
    exit 1
fi

# Step 7: Verify SSL configuration
echo -e "\n${YELLOW}🧪 Verifying SSL configuration...${NC}"

# Check if certificate files exist
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL certificate files exist${NC}"
    
    # Check certificate expiry
    echo "Certificate expires on:"
    openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -dates
else
    echo -e "${RED}❌ SSL certificate files not found${NC}"
    exit 1
fi

# Check Nginx configuration
if nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    nginx -t
    exit 1
fi

# Step 8: Test auto-renewal
echo -e "\n${YELLOW}🔄 Testing certificate auto-renewal...${NC}"
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Auto-renewal test successful${NC}"
else
    echo -e "${YELLOW}⚠️ Auto-renewal test failed${NC}"
fi

# Step 9: Setup auto-renewal cron job
echo -e "\n${YELLOW}⏰ Setting up auto-renewal cron job...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Auto-renewal cron job added${NC}"
else
    echo -e "${YELLOW}⚠️ Failed to add cron job${NC}"
fi

# Step 10: Test HTTPS access
echo -e "\n${YELLOW}🌐 Testing HTTPS access...${NC}"

# Test HTTP to HTTPS redirect
echo "Testing HTTP to HTTPS redirect..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN 2>/dev/null)
if [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    echo -e "${GREEN}✅ HTTP to HTTPS redirect working (Response: $HTTP_RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠️ HTTP to HTTPS redirect may not be working (HTTP response: $HTTP_RESPONSE)${NC}"
fi

# Test HTTPS access
echo "Testing HTTPS access..."
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null)
if [ "$HTTPS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ HTTPS access working (Response: $HTTPS_RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠️ HTTPS access may have issues (HTTPS response: $HTTPS_RESPONSE)${NC}"
fi

# Test SSL connection
echo "Testing SSL connection..."
if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -dates; then
    echo -e "${GREEN}✅ SSL connection successful${NC}"
else
    echo -e "${YELLOW}⚠️ SSL connection test failed${NC}"
fi

# Step 11: Final verification
echo -e "\n${YELLOW}🔍 Final verification...${NC}"

# Check Nginx status
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
fi

# Check certificate status
echo "Certificate status:"
certbot certificates

# Step 12: Display results
echo -e "\n${GREEN}🎉 SSL setup completed successfully!${NC}"

echo -e "\n${BLUE}📋 SSL Information:${NC}"
echo "• Domain: $DOMAIN"
echo "• Certificate: Let's Encrypt"
echo "• Auto-renewal: Enabled (daily check at 12:00)"
echo "• Certificate location: /etc/letsencrypt/live/$DOMAIN/"
echo "• Nginx configuration: Automatically updated by Certbot"

echo -e "\n${BLUE}🔧 Useful Commands:${NC}"
echo "• Check certificate status: sudo certbot certificates"
echo "• Renew certificate: sudo certbot renew"
echo "• Test renewal: sudo certbot renew --dry-run"
echo "• Check certificate expiry: openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -dates"

echo -e "\n${BLUE}🌐 Test Your Site:${NC}"
echo "• HTTP: http://$DOMAIN (should redirect to HTTPS)"
echo "• HTTPS: https://$DOMAIN"
echo "• PWA: https://$DOMAIN (should show install prompt)"

echo -e "\n${BLUE}🛡️ Security Features Enabled:${NC}"
echo "• SSL/TLS encryption"
echo "• HTTP to HTTPS redirect"
echo "• Security headers"
echo "• Auto-renewal"
echo "• HSTS (if configured by Certbot)"

echo -e "\n${GREEN}✅ Your InoBill PWA is now secure with SSL!${NC}"
echo -e "${BLUE}🔗 Access your PWA at: https://$DOMAIN${NC}"
