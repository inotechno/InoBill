/**
 * Configuration Management untuk InoBill PWA
 * File ini akan di-load secara dinamis berdasarkan environment
 */

class InoBillConfig {
    constructor() {
        this.config = null;
        this.isLoaded = false;
    }

    /**
     * Load configuration dari file atau environment
     */
    async loadConfig() {
        try {
            // Coba load dari config file terlebih dahulu
            const response = await fetch('./config.json');
            if (response.ok) {
                this.config = await response.json();
                console.log('✅ Config loaded from config.json');
            } else {
                // Fallback ke default config
                this.config = this.getDefaultConfig();
                console.log('⚠️ Using default config');
            }
            
            this.isLoaded = true;
            return this.config;
        } catch (error) {
            console.error('❌ Failed to load config:', error);
            this.config = this.getDefaultConfig();
            this.isLoaded = true;
            return this.config;
        }
    }

    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return {
            firebase: {
                apiKey: "YOUR_FIREBASE_API_KEY_HERE",
                authDomain: "inobill.firebaseapp.com",
                projectId: "inobill",
                storageBucket: "inobill.firebasestorage.app",
                messagingSenderId: "632461365007",
                appId: "1:632461365007:web:f55b9228d0c82c3fff387a",
                measurementId: "G-T6YX59TXRV"
            },
            app: {
                name: "InoBill",
                version: "1.2.0",
                debug: false
            }
        };
    }

    /**
     * Get Firebase config
     */
    getFirebaseConfig() {
        if (!this.isLoaded) {
            throw new Error('Config not loaded yet. Call loadConfig() first.');
        }
        return this.config.firebase;
    }

    /**
     * Get app config
     */
    getAppConfig() {
        if (!this.isLoaded) {
            throw new Error('Config not loaded yet. Call loadConfig() first.');
        }
        return this.config.app;
    }

    /**
     * Check if using placeholder API key
     */
    isUsingPlaceholder() {
        const firebaseConfig = this.getFirebaseConfig();
        return firebaseConfig.apiKey === "YOUR_FIREBASE_API_KEY_HERE";
    }

    /**
     * Show warning if using placeholder
     */
    showPlaceholderWarning() {
        if (this.isUsingPlaceholder()) {
            console.warn('⚠️ WARNING: Using placeholder Firebase API key!');
            console.warn('Please update config.json with your actual Firebase configuration.');
        }
    }
}

// Make it globally available
window.InoBillConfig = InoBillConfig;
