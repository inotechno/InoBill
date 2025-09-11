# 📱 InoBill PWA - Progressive Web App

> **Progressive Web App version of InoBill - A fair and easy split bill calculator with offline support, installable on any device.**

## ✨ PWA Features

### 🚀 **Core PWA Capabilities**
- **Installable** - Install on desktop, mobile, and tablet
- **Offline Support** - Works without internet connection
- **Fast Loading** - Cached resources for instant access
- **Responsive** - Optimized for all screen sizes
- **App-like Experience** - Native app feel in browser

### 📱 **Installation**
- **Desktop**: Click install button in address bar or install banner
- **Mobile**: Add to home screen from browser menu
- **Tablet**: Install from browser or app store (if available)

### 🔄 **Offline Functionality**
- **Cached Resources** - All files cached for offline use
- **Data Persistence** - Local storage for calculations
- **Background Sync** - Sync when connection restored
- **Offline Page** - Custom offline experience

## 🛠️ Technical Details

### **Service Worker**
- **Cache Strategy** - Static files cached on install
- **Dynamic Caching** - Network requests cached
- **Update Handling** - Automatic updates with user notification
- **Background Sync** - Data sync when online

### **Manifest**
- **App Identity** - Name, description, icons
- **Display Mode** - Standalone app experience
- **Theme Colors** - Brand colors (#0174BE, #0C356A)
- **Shortcuts** - Quick actions from app icon
- **Screenshots** - App store style screenshots

### **Icons**
- **Multiple Sizes** - 72x72 to 512x512 pixels
- **Maskable Icons** - Adaptive to different platforms
- **High Quality** - Crisp on all screen densities

## 📁 File Structure

```
pwa/
├── 📄 index.html              # Main PWA HTML
├── 🎨 style.css               # PWA-specific styling
├── ⚡ script.js               # Main application logic
├── 🔧 pwa.js                  # PWA-specific features
├── 📋 manifest.json           # PWA manifest
├── 🔄 sw.js                   # Service worker
├── 📱 offline.html            # Offline page
├── 🖼️ icons/                  # App icons
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── 📸 screenshots/            # App screenshots
│   ├── desktop-screenshot.png
│   └── mobile-screenshot.png
└── 📖 README.md               # This file
```

## 🚀 Getting Started

### **Local Development**
```bash
# Serve the PWA locally
python -m http.server 8000
# or
npx serve pwa
```

### **Production Deployment**
```bash
# Deploy to any static hosting
# - GitHub Pages
# - Netlify
# - Vercel
# - Firebase Hosting
# - AWS S3
```

### **HTTPS Requirement**
- PWA requires HTTPS in production
- Service workers only work over HTTPS
- Local development (localhost) is exempt

## 🔧 Configuration

### **Manifest Customization**
Edit `manifest.json` to customize:
- App name and description
- Theme colors
- Icons and screenshots
- Display mode
- Shortcuts

### **Service Worker**
Edit `sw.js` to customize:
- Cache strategy
- Offline behavior
- Update handling
- Background sync

### **Icons**
Replace icons in `icons/` folder:
- Use same icon in different sizes
- Ensure high quality (PNG format)
- Follow platform guidelines

## 📊 Performance

### **Lighthouse Scores**
- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+
- **PWA**: 100

### **Core Web Vitals**
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

## 🔒 Security

### **Content Security Policy**
- Strict CSP headers
- No inline scripts (except service worker)
- External resources whitelisted

### **Data Privacy**
- No data sent to external servers
- All data stored locally
- User controls all data

## 🌐 Browser Support

### **Full Support**
- Chrome 68+
- Firefox 63+
- Safari 11.1+
- Edge 79+

### **Partial Support**
- Safari iOS 11.3+
- Chrome Android 68+
- Samsung Internet 7.0+

## 📱 Platform Features

### **Desktop**
- Install from browser
- App-like window
- System integration
- Keyboard shortcuts

### **Mobile**
- Add to home screen
- Full screen experience
- Touch optimizations
- Offline functionality

### **Tablet**
- Responsive design
- Touch and mouse support
- Split screen compatibility
- App store distribution

## 🔄 Updates

### **Automatic Updates**
- Service worker updates automatically
- User notified of new version
- One-click update process
- No app store required

### **Version Management**
- Semantic versioning
- Changelog tracking
- Rollback capability
- A/B testing support

## 🐛 Troubleshooting

### **Install Issues**
- Ensure HTTPS in production
- Check manifest.json validity
- Verify service worker registration
- Clear browser cache

### **Offline Issues**
- Check service worker status
- Verify cache storage
- Test network conditions
- Review console errors

### **Performance Issues**
- Monitor Lighthouse scores
- Check Core Web Vitals
- Optimize images and assets
- Review service worker strategy

## 📈 Analytics

### **PWA Metrics**
- Install rate
- Engagement rate
- Offline usage
- Update adoption

### **User Experience**
- Page load times
- Interaction delays
- Error rates
- User satisfaction

## 🤝 Contributing

### **Development Setup**
1. Clone repository
2. Serve PWA locally
3. Make changes
4. Test on multiple devices
5. Submit pull request

### **Testing Checklist**
- [ ] Install on desktop
- [ ] Install on mobile
- [ ] Test offline functionality
- [ ] Verify updates work
- [ ] Check all browsers
- [ ] Validate manifest
- [ ] Test service worker

## 📄 License

MIT License - see main repository LICENSE file.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/inotechno/inobill/issues)
- **Email**: info@inotechno.com
- **Documentation**: [Main README](../README.md)

---

**Made with ❤️ by [InoTechno](https://inotechno.com)**
