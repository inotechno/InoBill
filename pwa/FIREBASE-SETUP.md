# InoBill Firebase Setup

Panduan sederhana untuk setup Firebase Firestore untuk fitur sharing InoBill.

## 🚀 Quick Setup

### 1. Buat Project Firebase
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Create a project"
3. Masukkan nama project: `inobill-sharing`
4. Enable Google Analytics (opsional)
5. Klik "Create project"

### 2. Setup Firestore Database
1. Di Firebase Console, klik "Firestore Database"
2. Klik "Create database"
3. Pilih "Start in test mode" (untuk development)
4. Pilih lokasi server terdekat (asia-southeast1 untuk Indonesia)
5. Klik "Done"

### 3. Get Firebase Config
1. Di Firebase Console, klik ikon gear ⚙️ → "Project settings"
2. Scroll ke bawah ke "Your apps"
3. Klik "Web app" (</>) icon
4. Masukkan nama app: `InoBill PWA`
5. Klik "Register app"
6. Copy config object yang muncul

### 4. Update Config di InoBill
✅ **Config sudah diupdate di `index.html` dengan konfigurasi Firebase Anda:**

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyCU_kr0Ah5h7ESnv4pHZA0zGj2Tdhpovwo",
    authDomain: "inobill.firebaseapp.com",
    projectId: "inobill",
    storageBucket: "inobill.firebasestorage.app",
    messagingSenderId: "632461365007",
    appId: "1:632461365007:web:05d9a9daa75a4150ff387a",
    measurementId: "G-BK4Q09S58P"
};
```

### 5. Setup Firestore Rules
1. Di Firebase Console, klik "Firestore Database" → "Rules"
2. Ganti rules dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to shared_bills collection
    match /shared_bills/{document} {
      allow read, write: if true;
    }
    
    // Deny access to all other documents
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Klik "Publish"

## 🧪 Testing

### 1. Test Firebase Connection
1. Buka InoBill di browser
2. Buka Developer Tools (F12)
3. Lihat Console, harus ada: "Firebase initialized successfully"

### 2. Test Sharing
1. Buat bill dengan peserta dan menu
2. Klik "Calculate Bill"
3. Klik "Share Bill"
4. Copy URL yang dihasilkan
5. Buka URL di tab baru
6. Data harus ter-load otomatis

### 3. Check Firebase Console
1. Buka Firebase Console → Firestore Database
2. Klik "Data" tab
3. Harus ada collection `shared_bills` dengan document baru

## 📁 Data Structure

### Collection: `shared_bills`
```javascript
{
  id: "uuid-string",           // UUID untuk sharing
  data: {                      // Data bill
    participants: ["Alice", "Bob"],
    menuItems: [...],
    additionalCosts: [...],
    orders: {...},
    discount: {...},
    timestamp: "2024-12-25T10:00:00.000Z"
  },
  created_at: 1703505600000,   // Timestamp creation
  expires_at: 1704110400000    // Timestamp expiration (7 days)
}
```

## 🔒 Security

- Data otomatis expired setelah 7 hari
- UUID unik untuk setiap share
- Tidak ada authentication required (public sharing)
- Firestore rules membatasi akses hanya ke collection `shared_bills`

## 🛠️ Troubleshooting

### Firebase not initialized
- Check console untuk error
- Pastikan config Firebase benar
- Pastikan internet connection

### Document not found
- Check Firestore rules
- Pastikan collection `shared_bills` ada
- Check console untuk error details

### CORS errors
- Firebase SDK handle CORS otomatis
- Pastikan domain sudah di-whitelist di Firebase Console

## 📝 Notes

- Firebase free tier: 50,000 reads/day, 20,000 writes/day
- Data otomatis expired setelah 7 hari
- Tidak perlu server atau PHP
- Bekerja offline dengan fallback ke localStorage
