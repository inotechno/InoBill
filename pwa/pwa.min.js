// InoBill PWA - PWA Specific Features
// Version: 1.0.0

class InoBillPWA {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.serviceWorker = null;
        
        this.init();
    }
    
    async init() {
        console.log('InoBill PWA: Initializing PWA features...');
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Set up install prompt
        this.setupInstallPrompt();
        
        // Set up update handling
        this.setupUpdateHandling();
        
        // Set up online/offline handling
        this.setupOnlineOfflineHandling();
        
        // Set up PWA-specific UI
        this.setupPWAUI();
        
        // Check if already installed
        this.checkInstallationStatus();
        
        console.log('InoBill PWA: PWA features initialized');
    }
    
    // Register Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.min.js', {
                    scope: './'
                });
                
                this.serviceWorker = registration;
                console.log('InoBill PWA: Service Worker registered successfully');
                
                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdateBanner();
                            }
                        });
                    }
                });
                
            } catch (error) {
                console.error('InoBill PWA: Service Worker registration failed', error);
            }
        }
    }
    
    // Setup install prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('InoBill PWA: Install prompt available');
            // Store the event for later use
            this.deferredPrompt = e;
            
            // Show custom banner only (no automatic native prompt)
            const bannerDismissed = localStorage.getItem('inobill-banner-dismissed');
            if (!bannerDismissed) {
                setTimeout(() => {
                    this.showInstallBanner();
                }, 3000); // Show custom banner after 3 seconds
            }
        });
        
        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('InoBill PWA: App installed successfully');
            this.isInstalled = true;
            this.hideInstallBanner();
            this.showInstallSuccessMessage();
        });
    }
    
    // Setup update handling
    setupUpdateHandling() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('InoBill PWA: Service Worker updated');
                this.hideUpdateBanner();
                this.showUpdateSuccessMessage();
            });
        }
    }
    
    // Setup online/offline handling
    setupOnlineOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineIndicator();
            this.showOnlineStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineIndicator();
            this.showOfflineStatus();
        });
        
        // Initial status
        if (this.isOnline) {
            this.hideOfflineIndicator();
        } else {
            this.showOfflineIndicator();
        }
    }
    
    // Setup PWA-specific UI
    setupPWAUI() {
        // Install button
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.installApp());
        }
        
        // Dismiss install button
        const dismissBtn = document.getElementById('pwa-dismiss-btn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.dismissInstallBanner());
        }
        
        // Update button
        const updateBtn = document.getElementById('pwa-update-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.updateApp());
        }
        
        // Dismiss update button
        const updateDismissBtn = document.getElementById('pwa-update-dismiss-btn');
        if (updateDismissBtn) {
            updateDismissBtn.addEventListener('click', () => this.hideUpdateBanner());
        }
        
        // Install link in footer
        const installLink = document.getElementById('pwa-install-link');
        if (installLink) {
            installLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.installApp();
            });
        }
    }
    
    // Check installation status
    checkInstallationStatus() {
        // Check if running as PWA
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            this.hideInstallBanner();
            console.log('InoBill PWA: Running as installed PWA');
        }
    }
    
    // Show install banner
    showInstallBanner() {
        if (this.isInstalled) return;
        
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.style.display = 'block';
            banner.classList.add('show');
            document.querySelector('.container').classList.add('with-banner');
        }
    }
    
    // Hide install banner
    hideInstallBanner() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300); // Wait for animation
            document.querySelector('.container').classList.remove('with-banner');
        }
    }
    
    // Dismiss install banner (with localStorage)
    dismissInstallBanner() {
        localStorage.setItem('inobill-banner-dismissed', 'true');
        this.hideInstallBanner();
    }
    
    // Show update banner
    showUpdateBanner() {
        const banner = document.getElementById('pwa-update-banner');
        if (banner) {
            banner.style.display = 'block';
            document.querySelector('.container').classList.add('with-banner');
        }
    }
    
    // Hide update banner
    hideUpdateBanner() {
        const banner = document.getElementById('pwa-update-banner');
        if (banner) {
            banner.style.display = 'none';
            document.querySelector('.container').classList.remove('with-banner');
        }
    }
    
    // Show offline indicator
    showOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.display = 'block';
        }
    }
    
    // Hide offline indicator
    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    // Install app (called on user gesture)
    async installApp() {
        if (!this.deferredPrompt) {
            this.showInstallError();
            return;
        }
        
        try {
            // Show the install prompt (this is called on user click, so it's allowed)
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('InoBill PWA: User accepted install prompt');
                this.showInstallSuccessMessage();
            } else {
                console.log('InoBill PWA: User dismissed install prompt');
            }
            
            // Clear the deferredPrompt so it can only be used once
            this.deferredPrompt = null;
            this.hideInstallBanner();
            
        } catch (error) {
            console.error('InoBill PWA: Install failed', error);
            this.showInstallError();
        }
    }
    
    
    // Update app
    async updateApp() {
        if (this.serviceWorker && this.serviceWorker.waiting) {
            this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }
    
    // Show install success message
    showInstallSuccessMessage() {
        this.showStatusMessage('InoBill berhasil diinstall! 🎉', 'success');
    }
    
    // Show update success message
    showUpdateSuccessMessage() {
        this.showStatusMessage('InoBill berhasil diupdate! 🔄', 'success');
    }
    
    // Show install error
    showInstallError() {
        this.showStatusMessage('Gagal menginstall InoBill. Coba lagi nanti.', 'error');
    }
    
    // Show online status
    showOnlineStatus() {
        this.showStatusMessage('Koneksi internet tersedia', 'online');
    }
    
    // Show offline status
    showOfflineStatus() {
        this.showStatusMessage('Tidak ada koneksi internet', 'offline');
    }
    
    // Show status message
    showStatusMessage(message, type = 'info') {
        // Remove existing status
        const existingStatus = document.querySelector('.pwa-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Create new status
        const status = document.createElement('div');
        status.className = `pwa-status ${type}`;
        status.textContent = message;
        
        document.body.appendChild(status);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (status.parentNode) {
                status.remove();
            }
        }, 3000);
    }
    
    // Share functionality
    async shareData(data) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'InoBill - Split Bill Calculator',
                    text: 'Lihat hasil perhitungan split bill',
                    url: window.location.href
                });
            } catch (error) {
                console.log('InoBill PWA: Share cancelled or failed', error);
            }
        } else {
            // Fallback to clipboard
            this.copyToClipboard(data);
        }
    }
    
    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showStatusMessage('Data disalin ke clipboard', 'success');
        } catch (error) {
            console.error('InoBill PWA: Copy to clipboard failed', error);
            this.showStatusMessage('Gagal menyalin data', 'error');
        }
    }
    
    // Export data
    exportData() {
        const data = {
            participants: JSON.parse(localStorage.getItem('inobill_participants') || '[]'),
            menuItems: JSON.parse(localStorage.getItem('inobill_menuItems') || '[]'),
            additionalCosts: JSON.parse(localStorage.getItem('inobill_additionalCosts') || '[]'),
            orders: JSON.parse(localStorage.getItem('inobill_orders') || '{}'),
            discount: JSON.parse(localStorage.getItem('inobill_discount') || '{}'),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `inobill-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showStatusMessage('Data berhasil diekspor', 'success');
    }
    
    // Import data
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (this.validateImportedData(data)) {
                    // Import data
                    localStorage.setItem('inobill_participants', JSON.stringify(data.participants || []));
                    localStorage.setItem('inobill_menuItems', JSON.stringify(data.menuItems || []));
                    localStorage.setItem('inobill_additionalCosts', JSON.stringify(data.additionalCosts || []));
                    localStorage.setItem('inobill_orders', JSON.stringify(data.orders || {}));
                    localStorage.setItem('inobill_discount', JSON.stringify(data.discount || {}));
                    
                    // Reload page to apply changes
                    window.location.reload();
                    
                    this.showStatusMessage('Data berhasil diimpor', 'success');
                } else {
                    this.showStatusMessage('Format data tidak valid', 'error');
                }
            } catch (error) {
                console.error('InoBill PWA: Import failed', error);
                this.showStatusMessage('Gagal mengimpor data', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    // Validate imported data
    validateImportedData(data) {
        return data && 
               Array.isArray(data.participants) &&
               Array.isArray(data.menuItems) &&
               Array.isArray(data.additionalCosts) &&
               typeof data.orders === 'object' &&
               typeof data.discount === 'object';
    }
    
    // Clear all data
    clearAllData() {
        if (confirm('Hapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
            localStorage.removeItem('inobill_participants');
            localStorage.removeItem('inobill_menuItems');
            localStorage.removeItem('inobill_additionalCosts');
            localStorage.removeItem('inobill_orders');
            localStorage.removeItem('inobill_discount');
            
            window.location.reload();
            
            this.showStatusMessage('Semua data berhasil dihapus', 'success');
        }
    }
    
    // Get app info
    getAppInfo() {
        return {
            name: 'InoBill PWA',
            version: '1.1.0',
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            hasServiceWorker: !!this.serviceWorker,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
        };
    }
    
    // Reset banner dismiss status (for testing)
    resetBannerDismiss() {
        localStorage.removeItem('inobill-banner-dismissed');
        console.log('InoBill PWA: Banner dismiss status reset');
    }
    
    // Reset all install prompt status (for testing)
    resetAllInstallStatus() {
        localStorage.removeItem('inobill-banner-dismissed');
        console.log('InoBill PWA: All install status reset');
    }
    
    // Force show install banner (for testing)
    forceShowInstallBanner() {
        if (this.deferredPrompt) {
            this.showInstallBanner();
        } else {
            console.log('InoBill PWA: No deferred prompt available');
        }
    }
    
}

// Initialize PWA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.inobillPWA = new InoBillPWA();
});

// Export for global access
window.InoBillPWA = InoBillPWA;
