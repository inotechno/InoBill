// Firebase Configuration for InoBill
// Your actual Firebase project configuration

const firebaseConfig = {
    apiKey: "AIzaSyCU_kr0Ah5h7ESnv4pHZA0zGj2Tdhpovwo",
    authDomain: "inobill.firebaseapp.com",
    projectId: "inobill",
    storageBucket: "inobill.firebasestorage.app",
    messagingSenderId: "632461365007",
    appId: "1:632461365007:web:05d9a9daa75a4150ff387a",
    measurementId: "G-BK4Q09S58P"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
} else {
    window.firebaseConfig = firebaseConfig;
}
