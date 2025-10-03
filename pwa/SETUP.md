# 🚀 Setup Instructions

## 📋 Prerequisites
- Python 3.x (untuk local server)
- Firebase project (untuk sharing feature)

## 🔧 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/inotechno/InoBill.git
cd InoBill/pwa
```

### 2. Setup Firebase Configuration
```bash
# Copy example config file
cp config.json.example config.json

# Edit config.json dengan config Firebase Anda
# Ganti YOUR_FIREBASE_API_KEY_HERE dengan API key yang sebenarnya
```

**Atau edit langsung `config.js` dan ganti API key di `getDefaultConfig()`**

### 3. Update Firebase Config
Edit `config.json` dan ganti:
```json
{
  "firebase": {
    "apiKey": "YOUR_FIREBASE_API_KEY_HERE"
  }
}
```
dengan API key yang sebenarnya dari Firebase Console.

### 4. Setup Firebase Firestore Rules
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project `inobill`
3. Firestore Database → Rules
4. Copy rules dari `firestore-security-rules.txt`
5. Publish rules

### 5. Run Local Server
```bash
# Python 3
python3 -m http.server 8000

# Atau Python 2
python -m SimpleHTTPServer 8000
```

### 6. Access Application
Buka browser: `http://localhost:8000`

## 🔐 Security Notes

- ✅ **API Key**: Gunakan placeholder di git, isi yang asli di `.env`
- ✅ **Firestore Rules**: Sudah dikonfigurasi dengan ketat
- ✅ **Data Expiration**: Otomatis expire setelah 7 hari
- ✅ **Size Limit**: Maksimal 100KB per document

## 📁 File Structure
```
pwa/
├── index.html              # Main application
├── script.js               # Core logic
├── style.css               # Styling
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── pwa.js                  # PWA functionality
├── config.js               # Configuration management
├── config.json.example     # Config template
├── config.json             # Your actual config (gitignored)
├── firestore-security-rules.txt # Security rules
├── SETUP.md                # Setup instructions
└── SECURITY.md             # Security guidelines
```

## 🚀 Deployment

### Production Setup
1. Update Firebase config dengan API key production
2. Setup Firestore security rules
3. Deploy ke server web
4. Test sharing functionality

### Environment Variables untuk Production
```bash
# Production .env
FIREBASE_API_KEY=your_production_api_key
FIREBASE_PROJECT_ID=inobill
# ... other config
```

## 🆘 Troubleshooting

### Firebase Connection Issues
- Check API key di `.env`
- Verify Firestore rules
- Check browser console untuk errors

### Sharing Not Working
- Verify Firebase project setup
- Check Firestore security rules
- Test dengan browser developer tools

### PWA Installation Issues
- Check manifest.json
- Verify service worker
- Test di HTTPS (required untuk PWA)
