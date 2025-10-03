# InoBill PWA v1.2.0

**Smart Bill Splitter - Fair & Easy**

A Progressive Web App (PWA) for fair and easy bill splitting. Perfect for restaurants, cafes, and group dining experiences.

## 🚀 Features

### Core Functionality
- **Real-time Calculations** - Instant bill splitting with live updates
- **Fair Distribution** - Smart algorithm for equitable cost sharing
- **Multiple Participants** - Support for unlimited participants
- **Menu Management** - Add and manage menu items with quantities
- **Additional Costs** - Handle parking, service charges, and other fees
- **Discount System** - Apply percentage or fixed amount discounts

### User Experience
- **Progressive Web App** - Install on any device, works offline
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Dark/Light Theme** - Toggle between themes for comfort
- **Card Collapse** - Organize interface with collapsible sections
- **Modern UI** - Clean, professional design with custom branding

### Sharing & Export
- **🔥 Firebase Cloud Sharing** - Generate short UUID-based URLs for seamless sharing
- **⚡ Instant Loading** - Share links load instantly across all devices
- **🗑️ Auto-Expiration** - Data automatically expires after 7 days for privacy
- **📱 Cross-Platform** - Works on any device with internet connection
- **Print Bills** - Generate printer-friendly receipts
- **JSON Export** - Download data for backup or import
- **Image Sharing** - Generate and share bill as image

## 🎯 Version 1.2.0 Highlights

### 🔥 Major Update - Firebase Integration
- **Cloud-Based Sharing** - No more server dependencies!
- **Short URLs** - Clean UUID-based links instead of long base64 URLs
- **Automatic Cleanup** - Data expires after 7 days automatically
- **Better Performance** - Faster loading and sharing
- **Modern Architecture** - Client-side only with cloud backend

## 🎯 Version 1.1.0 Highlights

### ✨ New Features
- **Custom Logo Integration** - Professional branding with your logo
- **Enhanced Header Design** - Modern gradient with feature highlights
- **Card Collapse Functionality** - Better space management
- **Improved Mobile Experience** - Better padding and responsive design

### 🎨 UI/UX Improvements
- **Modern Color Scheme** - Professional slate gradient theme
- **Feature Tags** - Highlight app capabilities (Real-time, PWA, Fast)
- **Better Spacing** - Consistent padding and margins
- **Enhanced Responsiveness** - Optimized for all screen sizes

### 🔧 Technical Improvements
- **Independent Card Heights** - Cards don't affect each other when collapsed
- **Better Mobile Layout** - Fixed padding and spacing issues
- **Improved Performance** - Optimized CSS and responsive design
- **Enhanced PWA Support** - Better manifest and theme integration

## 🛠️ Installation

### As PWA (Recommended)
1. Visit the app in your browser
2. Look for the install prompt or use browser menu
3. Click "Install" to add to your device
4. Access from your home screen or app drawer

### Development Setup
```bash
# Clone the repository
git clone https://github.com/inotechno/inobill-pwa.git

# Navigate to the directory
cd inobill-pwa/pwa

# Start local server
python3 -m http.server 8000

# Or use Node.js
npx serve .

# Access at http://localhost:8000
```

## 📱 Usage

### Basic Workflow
1. **Add Participants** - Enter names of people sharing the bill
2. **Add Menu Items** - Add food/drink items with prices
3. **Set Orders** - Assign menu items to participants with quantities
4. **Add Additional Costs** - Include parking, service charges, etc.
5. **Apply Discounts** - Add percentage or fixed discounts
6. **Calculate** - Get fair split results instantly
7. **Share/Print** - Export or share the results

### Advanced Features
- **Quantity Management** - Set different quantities per person
- **Multiple Discounts** - Apply various discount types
- **Real-time Updates** - See changes instantly
- **Offline Support** - Works without internet connection

## 🎨 Customization

### Logo Integration
- Replace `icons/logo.png` with your custom logo
- Update favicon references in HTML
- Adjust header colors to match your brand

### Theme Colors
- Modify CSS variables in `style.css`
- Update manifest.json theme colors
- Customize gradient backgrounds

## 📊 Technical Details

### Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **JavaScript ES6+** - Modern JavaScript features
- **PWA** - Service Worker, Web App Manifest
- **Local Storage** - Data persistence

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance
- **Lighthouse Score** - 95+ across all metrics
- **Fast Loading** - Optimized assets and caching
- **Offline First** - Works without internet
- **Responsive** - Adapts to any screen size

## 🔄 Version History

### v1.1.0 (2024-12-25)
- Custom logo integration
- Enhanced header design
- Card collapse functionality
- Improved mobile responsiveness
- Modern color scheme

### v1.0.0 (2024-01-01)
- Initial release
- Core bill splitting functionality
- PWA capabilities
- Responsive design
- Offline support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**InoTechno**
- Website: [inotechno.my.id](https://inotechno.my.id)
- Email: info@inotechno.my.id

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for fair bill splitting
- Community feedback and suggestions
- Open source libraries and tools

---

**InoBill PWA v1.1.0** - Making bill splitting fair and easy! 🍽️✨