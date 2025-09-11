#!/bin/bash

# SSL Certificate Setup Script for InoBill PWA
# Domain: inobill.inotechno.my.id

echo "🔒 Setting up SSL Certificate for InoBill PWA..."

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

# Step 1: Update system
echo -e "\n${YELLOW}🔄 Updating system packages...${NC}"
apt update

# Step 2: Install Certbot
echo -e "\n${YELLOW}📦 Installing Certbot...${NC}"
apt install certbot python3-certbot-nginx -y

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certbot installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install Certbot${NC}"
    exit 1
fi

# Step 3: Check if domain is accessible
echo -e "\n${YELLOW}🔍 Checking domain accessibility...${NC}"
echo "Please ensure your domain $DOMAIN is pointing to this server's IP address"
echo "You can check this by running: nslookup $DOMAIN"
echo ""
read -p "Press Enter when DNS is configured correctly..."

# Step 4: Get SSL certificate
echo -e "\n${YELLOW}🔒 Obtaining SSL certificate...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@inotechno.my.id

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate obtained successfully${NC}"
else
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    echo "Please check:"
    echo "1. Domain DNS is pointing to this server"
    echo "2. Nginx is running and accessible on port 80"
    echo "3. Firewall allows HTTP (80) and HTTPS (443) traffic"
    exit 1
fi

# Step 5: Test certificate
echo -e "\n${YELLOW}🧪 Testing SSL certificate...${NC}"
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL certificate files exist${NC}"
    
    # Check certificate expiry
    echo "Certificate expires on:"
    openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -dates
else
    echo -e "${RED}❌ SSL certificate files not found${NC}"
    exit 1
fi

# Step 6: Test auto-renewal
echo -e "\n${YELLOW}🔄 Testing certificate auto-renewal...${NC}"
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Auto-renewal test successful${NC}"
else
    echo -e "${YELLOW}⚠️ Auto-renewal test failed${NC}"
fi

# Step 7: Setup auto-renewal cron job
echo -e "\n${YELLOW}⏰ Setting up auto-renewal cron job...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Auto-renewal cron job added${NC}"
else
    echo -e "${YELLOW}⚠️ Failed to add cron job${NC}"
fi

# Step 8: Test HTTPS access
echo -e "\n${YELLOW}🌐 Testing HTTPS access...${NC}"
echo "Testing SSL configuration..."

# Test SSL connection
echo "SSL connection test:"
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Test HTTP to HTTPS redirect
echo -e "\n${YELLOW}🔄 Testing HTTP to HTTPS redirect...${NC}"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN)
if [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    echo -e "${GREEN}✅ HTTP to HTTPS redirect working${NC}"
else
    echo -e "${YELLOW}⚠️ HTTP to HTTPS redirect may not be working (HTTP response: $HTTP_RESPONSE)${NC}"
fi

# Test HTTPS access
echo -e "\n${YELLOW}🔒 Testing HTTPS access...${NC}"
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
if [ "$HTTPS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ HTTPS access working${NC}"
else
    echo -e "${YELLOW}⚠️ HTTPS access may have issues (HTTPS response: $HTTPS_RESPONSE)${NC}"
fi

# Step 9: Security headers check
echo -e "\n${YELLOW}🛡️ Checking security headers...${NC}"
echo "Testing security headers..."

HEADERS=$(curl -s -I https://$DOMAIN)
if echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
    echo -e "${GREEN}✅ HSTS header present${NC}"
else
    echo -e "${YELLOW}⚠️ HSTS header not found${NC}"
fi

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    echo -e "${GREEN}✅ X-Frame-Options header present${NC}"
else
    echo -e "${YELLOW}⚠️ X-Frame-Options header not found${NC}"
fi

# Step 10: Final verification
echo -e "\n${YELLOW}🔍 Final verification...${NC}"

# Check Nginx status
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
fi

# Check certificate files
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ]; then
    echo -e "${GREEN}✅ SSL certificate files exist${NC}"
else
    echo -e "${RED}❌ SSL certificate files missing${NC}"
fi

# Check Nginx configuration
if nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
fi

# Step 11: Display results
echo -e "\n${GREEN}🎉 SSL setup completed successfully!${NC}"

echo -e "\n${BLUE}📋 SSL Information:${NC}"
echo "• Domain: $DOMAIN"
echo "• Certificate: Let's Encrypt"
echo "• Auto-renewal: Enabled (daily check at 12:00)"
echo "• Certificate location: /etc/letsencrypt/live/$DOMAIN/"

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
echo "• HSTS (if configured)"

echo -e "\n${GREEN}✅ Your InoBill PWA is now secure with SSL!${NC}"
echo -e "${BLUE}🔗 Access your PWA at: https://$DOMAIN${NC}"
