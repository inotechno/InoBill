# 🚀 InoBill PWA - Quick Deployment Guide

## 📁 Project Structure

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

## 🚀 Quick Deployment

### Prerequisites
- VPS server with Ubuntu/CentOS
- Domain: `inobill.inotechno.my.id`
- Nginx installed
- Root/sudo access

### Step 1: Upload Files
```bash
# From InoBill/pwa/ directory
scp -r * user@your-vps-ip:/var/www/inobill.inotechno.my.id/
scp deploy.sh certbot-setup.sh user@your-vps-ip:~/
```

### Step 2: Deploy PWA
```bash
ssh user@your-vps-ip
sudo ./deploy.sh
```

### Step 3: Setup SSL (Optional)
```bash
sudo ./certbot-setup.sh
```

## 📋 Available Scripts

### `deploy.sh` - Main Deployment
- ✅ Creates web directory
- ✅ Copies PWA files
- ✅ Sets permissions
- ✅ Configures Nginx
- ✅ Reloads services
- ✅ Verifies deployment

### `certbot-setup.sh` - SSL Setup
- ✅ Installs Certbot
- ✅ Gets SSL certificate
- ✅ Configures auto-renewal
- ✅ Tests SSL connection
- ✅ Verifies HTTPS access

### `backup.sh` - Backup
- ✅ Backs up web files
- ✅ Backs up Nginx config
- ✅ Backs up SSL certificates
- ✅ Cleans old backups

### `update.sh` - Update
- ✅ Creates backup before update
- ✅ Updates PWA files
- ✅ Reloads services
- ✅ Verifies update

## 🔧 Manual Commands

### Deploy PWA
```bash
# Create directory
sudo mkdir -p /var/www/inobill.inotechno.my.id

# Copy files
sudo cp -r * /var/www/inobill.inotechno.my.id/

# Set permissions
sudo chown -R www-data:www-data /var/www/inobill.inotechno.my.id
sudo chmod -R 755 /var/www/inobill.inotechno.my.id

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/inobill.inotechno.my.id
sudo ln -s /etc/nginx/sites-available/inobill.inotechno.my.id /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Setup SSL
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d inobill.inotechno.my.id -d www.inobill.inotechno.my.id

# Test renewal
sudo certbot renew --dry-run
```

## 🌐 Testing

### Test HTTP Access
```bash
curl -I http://inobill.inotechno.my.id
```

### Test HTTPS Access
```bash
curl -I https://inobill.inotechno.my.id
```

### Test PWA Manifest
```bash
curl https://inobill.inotechno.my.id/manifest.json
```

### Test Service Worker
```bash
curl https://inobill.inotechno.my.id/sw.js
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Permission Denied
```bash
sudo chown -R www-data:www-data /var/www/inobill.inotechno.my.id
sudo chmod -R 755 /var/www/inobill.inotechno.my.id
```

#### 2. Nginx Configuration Error
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. SSL Certificate Issues
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

#### 4. PWA Not Installing
- Check manifest.json accessibility
- Verify service worker registration
- Check HTTPS requirement
- Validate PWA requirements

## 📊 Monitoring

### Check Nginx Status
```bash
sudo systemctl status nginx
```

### View Logs
```bash
sudo tail -f /var/log/nginx/inobill.inotechno.my.id.access.log
sudo tail -f /var/log/nginx/inobill.inotechno.my.id.error.log
```

### Check Certificate Status
```bash
sudo certbot certificates
```

## 🎯 Final Checklist

### Pre-Deployment
- [ ] VPS server ready
- [ ] Domain DNS configured
- [ ] PWA files in `InoBill/pwa/` directory
- [ ] Scripts uploaded

### Deployment
- [ ] Run `deploy.sh`
- [ ] Run `certbot-setup.sh` (optional)
- [ ] Test site accessibility
- [ ] Verify PWA functionality

### Post-Deployment
- [ ] PWA manifest accessible
- [ ] Service worker registered
- [ ] SSL certificate working (if enabled)
- [ ] Auto-renewal configured (if SSL enabled)

## 🔗 Access Your PWA

- **HTTP**: http://inobill.inotechno.my.id
- **HTTPS**: https://inobill.inotechno.my.id
- **PWA**: https://inobill.inotechno.my.id (should show install prompt)

## 📞 Support

If you encounter issues:
1. Check logs in `/var/log/nginx/`
2. Verify DNS configuration
3. Test SSL certificate
4. Check PWA requirements

**InoBill PWA is ready for production!** 🎉
