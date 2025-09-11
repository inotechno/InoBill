# 🚀 InoBill PWA - Deployment Guide untuk VPS + Nginx

## 📋 Prerequisites

### 1. VPS Requirements
- **OS**: Ubuntu 20.04+ atau CentOS 8+
- **RAM**: Minimum 1GB (Recommended: 2GB+)
- **Storage**: Minimum 10GB
- **CPU**: 1 Core (Recommended: 2 Cores+)

### 2. Domain Setup
- **Domain**: `inobill.inotechno.my.id`
- **DNS**: Point A record ke IP VPS
- **SSL**: Let's Encrypt certificate

## 🔧 Step 1: Server Preparation

### Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### Install Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
```

### Start & Enable Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🌐 Step 2: Domain Configuration

### Create Directory Structure
```bash
# Create web directory
sudo mkdir -p /var/www/inobill.inotechno.my.id

# Set permissions
sudo chown -R www-data:www-data /var/www/inobill.inotechno.my.id
sudo chmod -R 755 /var/www/inobill.inotechno.my.id
```

### Upload PWA Files
```bash
# Upload all PWA files to server
# You can use SCP, SFTP, or Git

# Example with SCP (from InoBill/pwa/ directory):
scp -r * user@your-vps-ip:/var/www/inobill.inotechno.my.id/

# Or with Git:
cd /var/www/inobill.inotechno.my.id
git clone https://github.com/your-username/inobill.git .
# Then copy PWA files:
cp -r InoBill/pwa/* .
```

## ⚙️ Step 3: Nginx Configuration

### Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/inobill.inotechno.my.id
```

### Nginx Configuration File
```nginx
# InoBill PWA - Nginx Configuration
# Domain: inobill.inotechno.my.id
# Note: SSL will be configured automatically by Certbot

server {
    server_name inobill.inotechno.my.id www.inobill.inotechno.my.id;
    
    # Document Root
    root /var/www/inobill.inotechno.my.id;
    index index.html;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # PWA Specific Headers
    add_header Cache-Control "public, max-age=31536000" for "*.js" "*.css" "*.png" "*.jpg" "*.jpeg" "*.gif" "*.ico" "*.svg" "*.woff" "*.woff2";
    add_header Service-Worker-Allowed "/" always;
    
    # Main Location Block
    location / {
        try_files $uri $uri/ /index.html;
        
        # PWA Cache Headers
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Service Worker
        location /sw.js {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
        
        # Manifest
        location /manifest.json {
            add_header Content-Type "application/manifest+json";
            add_header Cache-Control "public, max-age=86400";
        }
        
        # Icons
        location /icons/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/manifest+json;
    
    # Logs
    access_log /var/log/nginx/inobill.inotechno.my.id.access.log;
    error_log /var/log/nginx/inobill.inotechno.my.id.error.log;
}
```

### Enable Site
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/inobill.inotechno.my.id /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔒 Step 4: SSL Certificate (Let's Encrypt)

### Simple SSL Setup with Certbot
```bash
# Use the provided script for easy SSL setup
sudo ./certbot-setup.sh
```

### Manual SSL Setup (Alternative)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL Certificate (Certbot will automatically configure Nginx)
sudo certbot --nginx -d inobill.inotechno.my.id -d www.inobill.inotechno.my.id

# Test auto-renewal
sudo certbot renew --dry-run

# Auto-renewal is automatically configured by Certbot
```

## 🔧 Step 5: PWA Configuration Updates

### Update Manifest.json
```json
{
    "name": "InoBill - Pembagi Tagihan Adil & Mudah",
    "short_name": "InoBill",
    "description": "Aplikasi pembagi tagihan yang adil dan mudah dari InoTechno.",
    "start_url": "https://inobill.inotechno.my.id/",
    "scope": "https://inobill.inotechno.my.id/",
    "display": "standalone",
    "background_color": "#0C356A",
    "theme_color": "#0174BE",
    "orientation": "portrait-primary",
    "icons": [
        {
            "src": "https://inobill.inotechno.my.id/icons/icon-72x72.png",
            "sizes": "72x72",
            "type": "image/png"
        },
        {
            "src": "https://inobill.inotechno.my.id/icons/icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png"
        },
        {
            "src": "https://inobill.inotechno.my.id/icons/icon-128x128.png",
            "sizes": "128x128",
            "type": "image/png"
        },
        {
            "src": "https://inobill.inotechno.my.id/icons/icon-144x144.png",
            "sizes": "144x144",
            "type": "image/png"
        },
        {
            "src": "https://inobill.inotechno.my.id/icons/icon-152x152.png",
            "sizes": "152x152",
            "type": "image/png"
        },
        {
            "src": "https://inobill.inotechno.my.id/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "https://inobill.inotechno.my.id/icons/icon-384x384.png",
            "sizes": "384x384",
            "type": "image/png"
        },
        {
            "src": "https://inobill.inotechno.my.id/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

### Update Service Worker
```javascript
const CACHE_NAME = 'inobill-pwa-cache-v1.0.0';
const urlsToCache = [
    'https://inobill.inotechno.my.id/',
    'https://inobill.inotechno.my.id/index.html',
    'https://inobill.inotechno.my.id/style.css',
    'https://inobill.inotechno.my.id/script.js',
    'https://inobill.inotechno.my.id/pwa.js',
    'https://inobill.inotechno.my.id/manifest.json',
    'https://inobill.inotechno.my.id/offline.html',
    'https://inobill.inotechno.my.id/icons/icon-72x72.png',
    'https://inobill.inotechno.my.id/icons/icon-96x96.png',
    'https://inobill.inotechno.my.id/icons/icon-128x128.png',
    'https://inobill.inotechno.my.id/icons/icon-144x144.png',
    'https://inobill.inotechno.my.id/icons/icon-152x152.png',
    'https://inobill.inotechno.my.id/icons/icon-192x192.png',
    'https://inobill.inotechno.my.id/icons/icon-384x384.png',
    'https://inobill.inotechno.my.id/icons/icon-512x512.png'
];
```

## 🚀 Step 6: Deployment Scripts

### Project Structure
```
InoBill/
├── pwa/                    # PWA files directory
│   ├── index.html         # Main PWA file
│   ├── style.css          # PWA styles
│   ├── script.js          # PWA logic
│   ├── pwa.js             # PWA features
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   ├── offline.html       # Offline page
│   ├── icons/             # PWA icons
│   ├── screenshots/       # PWA screenshots
│   ├── deploy.sh          # Deployment script
│   ├── certbot-setup.sh   # SSL setup script
│   ├── backup.sh          # Backup script
│   ├── update.sh          # Update script
│   └── nginx.conf         # Nginx configuration
├── index.html             # Web version
├── style.css              # Web styles
└── README.md              # Project documentation
```

### Available Scripts
- **`deploy.sh`** - Main deployment script
- **`certbot-setup.sh`** - Simple SSL setup with Certbot
- **`backup.sh`** - Backup script
- **`update.sh`** - Update script

### Main Deployment Script
```bash
# The deploy.sh script is already provided and ready to use
# It includes:
# - Automatic directory creation
# - File copying and permission setting
# - Nginx configuration (without SSL)
# - Service reload and verification
# - SSL setup instructions
```

### Make Scripts Executable
```bash
chmod +x deploy.sh certbot-setup.sh backup.sh update.sh
```

### Deployment Instructions
```bash
# 1. Navigate to PWA directory
cd InoBill/pwa/

# 2. Upload PWA files to server
scp -r * user@your-vps-ip:/var/www/inobill.inotechno.my.id/

# 3. Upload deployment scripts
scp deploy.sh certbot-setup.sh user@your-vps-ip:~/

# 4. Connect to server and deploy
ssh user@your-vps-ip
sudo ./deploy.sh

# 5. Setup SSL (optional)
sudo ./certbot-setup.sh
```

## 🔍 Step 7: Testing & Verification

### Test PWA Features
```bash
# Check if site is accessible
curl -I https://inobill.inotechno.my.id

# Check SSL certificate
openssl s_client -connect inobill.inotechno.my.id:443 -servername inobill.inotechno.my.id

# Check PWA manifest
curl https://inobill.inotechno.my.id/manifest.json

# Check service worker
curl https://inobill.inotechno.my.id/sw.js
```

### Browser Testing
1. **Chrome DevTools**:
   - Open `https://inobill.inotechno.my.id`
   - Press F12 → Application tab
   - Check Service Worker registration
   - Check Manifest
   - Test offline functionality

2. **PWA Audit**:
   - Chrome DevTools → Lighthouse
   - Run PWA audit
   - Check all requirements

## 📊 Step 8: Monitoring & Maintenance

### Log Monitoring
```bash
# View access logs
tail -f /var/log/nginx/inobill.inotechno.my.id.access.log

# View error logs
tail -f /var/log/nginx/inobill.inotechno.my.id.error.log

# Check Nginx status
systemctl status nginx
```

### Performance Monitoring
```bash
# Install htop for monitoring
apt install htop -y

# Monitor system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

## 🔧 Step 9: Backup & Updates

### Backup Script
```bash
nano backup.sh
```

```bash
#!/bin/bash

# Backup script for InoBill PWA
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/inobill"
WEB_DIR="/var/www/inobill.inotechno.my.id"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
tar -czf $BACKUP_DIR/inobill_backup_$DATE.tar.gz $WEB_DIR

# Keep only last 7 backups
find $BACKUP_DIR -name "inobill_backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup created: inobill_backup_$DATE.tar.gz"
```

### Update Script
```bash
nano update.sh
```

```bash
#!/bin/bash

# Update script for InoBill PWA
WEB_DIR="/var/www/inobill.inotechno.my.id"

echo "🔄 Updating InoBill PWA..."

# Backup current version
./backup.sh

# Update files
cp -r pwa/* $WEB_DIR/

# Set permissions
chown -R www-data:www-data $WEB_DIR
chmod -R 755 $WEB_DIR

# Reload Nginx
systemctl reload nginx

echo "✅ Update completed successfully!"
```

## 🎯 Final Checklist

### Pre-Deployment
- [ ] VPS server ready
- [ ] Domain DNS configured
- [ ] PWA files prepared
- [ ] SSL certificate ready

### Deployment
- [ ] Nginx installed and configured
- [ ] PWA files uploaded
- [ ] SSL certificate installed
- [ ] Nginx configuration tested
- [ ] Site accessible via HTTPS

### Post-Deployment
- [ ] PWA manifest accessible
- [ ] Service worker registered
- [ ] Offline functionality working
- [ ] All icons loading
- [ ] Performance optimized

### Monitoring
- [ ] Logs configured
- [ ] Backup system in place
- [ ] Update process documented
- [ ] Performance monitoring active

## 🆘 Troubleshooting

### Common Issues

#### 1. 502 Bad Gateway
```bash
# Check Nginx status
systemctl status nginx

# Check error logs
tail -f /var/log/nginx/error.log
```

#### 2. SSL Certificate Issues
```bash
# Check certificate
certbot certificates

# Renew certificate
certbot renew --force-renewal
```

#### 3. PWA Not Installing
- Check manifest.json accessibility
- Verify service worker registration
- Check HTTPS requirement
- Validate PWA requirements

#### 4. Performance Issues
```bash
# Check system resources
htop
df -h
free -h

# Optimize Nginx
nginx -t
systemctl reload nginx
```

## 📞 Support

Jika mengalami masalah, silakan:
1. Check logs di `/var/log/nginx/`
2. Verify DNS configuration
3. Test SSL certificate
4. Check PWA requirements

**InoBill PWA siap untuk production!** 🎉
