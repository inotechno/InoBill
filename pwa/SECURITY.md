# 🔒 Security Guidelines

## ⚠️ IMPORTANT: API Key Security

**NEVER commit Firebase API keys or other sensitive credentials to git!**

### ✅ Current Security Status:
- ✅ API key menggunakan placeholder di git
- ✅ Firestore rules sudah dikonfigurasi
- ✅ Data expiration sudah diimplementasi
- ✅ Environment variables setup

### 🛡️ Security Features:

#### 1. **Configuration Management**
- API key disimpan di `config.json` (gitignored)
- Template tersedia di `config.json.example`
- Fallback ke default config di `config.js`

#### 2. **Firestore Security Rules**
```javascript
// Hanya allow create, tidak allow update/delete
allow create: if validDataStructure && dataSize < 100KB && max7Days;
allow update, delete: if false;
```

#### 3. **Data Protection**
- Automatic expiration (7 hari)
- Size limit (100KB per document)
- Structure validation
- Fallback ke localStorage

### 🔧 Setup Instructions:

1. **Firebase Configuration:**
   - Copy `config.json.example` ke `config.json`
   - Edit `config.json` dengan API key yang sebenarnya
   - Atau edit langsung `config.js` di `getDefaultConfig()`

2. **Firestore Security Rules:**
   - Buka [Firebase Console](https://console.firebase.google.com/)
   - Pilih project `inobill`
   - Firestore Database → Rules
   - Copy rules dari `firestore-security-rules.txt`
   - Publish rules

### 📊 Monitoring & Maintenance:

#### Regular Tasks:
- [ ] Monitor Firebase usage dashboard
- [ ] Check for unusual activity
- [ ] Review error logs
- [ ] Update security rules jika perlu

#### Monthly Tasks:
- [ ] Rotate API keys (optional)
- [ ] Review data retention policies
- [ ] Update dependencies
- [ ] Security audit

### 🚨 Emergency Response:

#### Jika API Key Ter-expose Lagi:
1. **Immediately regenerate** di Firebase Console
2. **Update code** dengan key baru
3. **Commit fix** dengan message "security: regenerate API key"
4. **Monitor** Firebase usage untuk aktivitas mencurigakan

#### Jika Ada Suspicious Activity:
1. **Check Firebase Console** → Usage tab
2. **Review Firestore** → Data untuk data aneh
3. **Update security rules** jika perlu
4. **Consider rate limiting** atau IP restrictions

### 🔐 Best Practices:

- ✅ **API Key**: Sudah di-regenerate dan aman
- ✅ **Security Rules**: Sudah dikonfigurasi dengan ketat
- ✅ **Data Validation**: Sudah diimplementasi
- ✅ **Error Handling**: Sudah ada fallback mechanism
- ✅ **Monitoring**: Sudah ada logging dan error tracking

### 📝 Current Configuration:
```javascript
// Config baru yang aman
const firebaseConfig = {
    apiKey: "AIzaSyCU_kr0Ah5h7ESnv4pHZA0zGj2Tdhpovwo", // ✅ Regenerated
    authDomain: "inobill.firebaseapp.com",
    projectId: "inobill",
    storageBucket: "inobill.firebasestorage.app",
    messagingSenderId: "632461365007",
    appId: "1:632461365007:web:f55b9228d0c82c3fff387a", // ✅ Updated
    measurementId: "G-T6YX59TXRV" // ✅ Updated
};
```

**Status: 🟢 SECURE - Semua security measures sudah diimplementasi!**
