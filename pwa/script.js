// InoBill PWA - Main JavaScript
// Version: 1.0.0

// Global variables
let participants = [];
let menuItems = [];
let additionalCosts = [];
let orders = {};
let discount = { amount: 0, percentage: 0, type: 'menu' };

// Initialize the application
function init() {
    console.log('InoBill PWA: Initializing...');
    
    // Load data from localStorage
    loadData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial render
    renderAll();
    
    // Check for updates
    checkForUpdates();
    
    console.log('InoBill PWA: Initialized successfully');
}

// Load data from localStorage
function loadData() {
    try {
        const savedParticipants = localStorage.getItem('inobill_participants');
        const savedMenuItems = localStorage.getItem('inobill_menuItems');
        const savedAdditionalCosts = localStorage.getItem('inobill_additionalCosts');
        const savedOrders = localStorage.getItem('inobill_orders');
        const savedDiscount = localStorage.getItem('inobill_discount');
        
        if (savedParticipants) participants = JSON.parse(savedParticipants);
        if (savedMenuItems) menuItems = JSON.parse(savedMenuItems);
        if (savedAdditionalCosts) additionalCosts = JSON.parse(savedAdditionalCosts);
        if (savedOrders) orders = JSON.parse(savedOrders);
        if (savedDiscount) discount = JSON.parse(savedDiscount);
        
        console.log('InoBill PWA: Data loaded from localStorage');
    } catch (error) {
        console.error('InoBill PWA: Error loading data from localStorage', error);
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('inobill_participants', JSON.stringify(participants));
        localStorage.setItem('inobill_menuItems', JSON.stringify(menuItems));
        localStorage.setItem('inobill_additionalCosts', JSON.stringify(additionalCosts));
        localStorage.setItem('inobill_orders', JSON.stringify(orders));
        localStorage.setItem('inobill_discount', JSON.stringify(discount));
        
        console.log('InoBill PWA: Data saved to localStorage');
    } catch (error) {
        console.error('InoBill PWA: Error saving data to localStorage', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Discount field toggling
    const discountAmount = document.getElementById('discountAmount');
    const discountPercentage = document.getElementById('discountPercentage');
    
    if (discountAmount && discountPercentage) {
        discountAmount.addEventListener('input', toggleDiscountFields);
        discountPercentage.addEventListener('input', toggleDiscountFields);
    }
    
    // Auto-save on changes
    document.addEventListener('input', debounce(saveData, 1000));
    document.addEventListener('change', debounce(saveData, 1000));
    
    // Online/offline status
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    // Before unload
    window.addEventListener('beforeunload', saveData);
}

// Toggle discount fields (mutually exclusive)
function toggleDiscountFields() {
    const discountAmount = document.getElementById('discountAmount');
    const discountPercentage = document.getElementById('discountPercentage');
    const infoDiv = document.getElementById('discountInfo');
    
    if (!discountAmount || !discountPercentage || !infoDiv) return;
    
    const amountValue = parseFloat(discountAmount.value) || 0;
    const percentageValue = parseFloat(discountPercentage.value) || 0;
    
    if (amountValue > 0 && percentageValue > 0) {
        // If both have values, prioritize amount and clear percentage
        discountPercentage.value = '';
        discount.percentage = 0;
        infoDiv.textContent = 'Menggunakan diskon Rp (prioritas)';
        infoDiv.style.display = 'block';
    } else if (amountValue > 0) {
        // Only amount has value
        discountPercentage.disabled = true;
        discount.percentage = 0;
        infoDiv.textContent = 'Menggunakan diskon Rp';
        infoDiv.style.display = 'block';
    } else if (percentageValue > 0) {
        // Only percentage has value
        discountAmount.disabled = true;
        discount.amount = 0;
        infoDiv.textContent = 'Menggunakan diskon %';
        infoDiv.style.display = 'block';
    } else {
        // Neither has value
        discountAmount.disabled = false;
        discountPercentage.disabled = false;
        infoDiv.style.display = 'none';
    }
    
    // Update discount object
    discount.amount = amountValue;
    discount.percentage = percentageValue;
    discount.type = document.getElementById('discountType').value;
    
    // Trigger calculation
    calculateSplit();
}

// Add participant
function addParticipant() {
    const nameInput = document.getElementById('participantName');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Masukkan nama peserta');
        return;
    }
    
    if (participants.includes(name)) {
        alert('Peserta sudah ada');
        return;
    }
    
    participants.push(name);
    orders[name] = [];
    nameInput.value = '';
    
    renderParticipants();
    renderOrders();
    calculateSplit();
    saveData();
}

// Remove participant
function removeParticipant(name) {
    if (confirm(`Hapus peserta "${name}"?`)) {
        participants = participants.filter(p => p !== name);
        delete orders[name];
        
        renderParticipants();
        renderOrders();
        calculateSplit();
        saveData();
    }
}

// Add menu item
function addMenuItem() {
    const nameInput = document.getElementById('menuName');
    const priceInput = document.getElementById('menuPrice');
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;
    
    if (!name) {
        alert('Masukkan nama menu');
        return;
    }
    
    if (price <= 0) {
        alert('Masukkan harga yang valid');
        return;
    }
    
    menuItems.push({ name, price });
    nameInput.value = '';
    priceInput.value = '';
    
    renderMenuItems();
    renderOrders();
    calculateSplit();
    saveData();
}

// Remove menu item
function removeMenuItem(index) {
    if (confirm('Hapus menu ini?')) {
        menuItems.splice(index, 1);
        
        // Remove from all orders
        Object.keys(orders).forEach(participant => {
            orders[participant] = orders[participant].filter(item => item.menuIndex !== index);
        });
        
        renderMenuItems();
        renderOrders();
        calculateSplit();
        saveData();
    }
}

// Add additional cost
function addAdditionalCost() {
    const nameInput = document.getElementById('additionalCostName');
    const amountInput = document.getElementById('additionalCostAmount');
    const typeSelect = document.getElementById('additionalCostType');
    
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;
    const type = typeSelect.value;
    
    if (!name) {
        alert('Masukkan nama biaya tambahan');
        return;
    }
    
    if (amount <= 0) {
        alert('Masukkan jumlah yang valid');
        return;
    }
    
    additionalCosts.push({ name, amount, type });
    nameInput.value = '';
    amountInput.value = '';
    
    renderAdditionalCosts();
    calculateSplit();
    saveData();
}

// Remove additional cost
function removeAdditionalCost(index) {
    if (confirm('Hapus biaya tambahan ini?')) {
        additionalCosts.splice(index, 1);
        renderAdditionalCosts();
        calculateSplit();
        saveData();
    }
}

// Toggle order item
function toggleOrder(participant, menuIndex) {
    if (!orders[participant]) {
        orders[participant] = [];
    }
    
    const existingIndex = orders[participant].findIndex(item => item.menuIndex === menuIndex);
    
    if (existingIndex >= 0) {
        orders[participant].splice(existingIndex, 1);
    } else {
        orders[participant].push({ menuIndex, quantity: 1 });
    }
    
    renderOrders();
    calculateSplit();
    saveData();
}

// Update order quantity
function updateOrderQuantity(participant, menuIndex, quantity) {
    if (!orders[participant]) {
        orders[participant] = [];
    }
    
    const existingIndex = orders[participant].findIndex(item => item.menuIndex === menuIndex);
    
    if (existingIndex >= 0) {
        if (quantity <= 0) {
            orders[participant].splice(existingIndex, 1);
        } else {
            orders[participant][existingIndex].quantity = quantity;
        }
    } else if (quantity > 0) {
        orders[participant].push({ menuIndex, quantity });
    }
    
    renderOrders();
    calculateSplit();
    saveData();
}

// Render participants
function renderParticipants() {
    const container = document.getElementById('participantsList');
    if (!container) return;
    
    if (participants.length === 0) {
        container.innerHTML = '<p class="empty-state">Belum ada peserta</p>';
        return;
    }
    
    container.innerHTML = participants.map(name => `
        <div class="participant-item">
            <span>${name}</span>
            <button onclick="removeParticipant('${name}')" class="remove-btn">Hapus</button>
        </div>
    `).join('');
}

// Render menu items
function renderMenuItems() {
    const container = document.getElementById('menuList');
    if (!container) return;
    
    if (menuItems.length === 0) {
        container.innerHTML = '<p class="empty-state">Belum ada menu</p>';
        return;
    }
    
    container.innerHTML = menuItems.map((item, index) => `
        <div class="menu-item">
            <span class="name">${item.name}</span>
            <span class="price">Rp ${item.price.toLocaleString('id-ID')}</span>
            <button onclick="removeMenuItem(${index})" class="remove-btn">Hapus</button>
        </div>
    `).join('');
}

// Render additional costs
function renderAdditionalCosts() {
    const container = document.getElementById('additionalCostsList');
    if (!container) return;
    
    if (additionalCosts.length === 0) {
        container.innerHTML = '<p class="empty-state">Belum ada biaya tambahan</p>';
        return;
    }
    
    container.innerHTML = additionalCosts.map((cost, index) => `
        <div class="additional-cost-item">
            <span class="name">${cost.name}</span>
            <span class="amount">${cost.type === 'percentage' ? cost.amount + '%' : 'Rp ' + cost.amount.toLocaleString('id-ID')}</span>
            <button onclick="removeAdditionalCost(${index})" class="remove-btn">Hapus</button>
        </div>
    `).join('');
}

// Render orders
function renderOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (participants.length === 0 || menuItems.length === 0) {
        container.innerHTML = '<p class="empty-state">Tambahkan peserta dan menu terlebih dahulu</p>';
        return;
    }
    
    container.innerHTML = participants.map(participant => `
        <div class="participant-orders">
            <h3>${participant}</h3>
            <div class="order-items">
                ${menuItems.map((item, index) => {
                    const orderItem = orders[participant]?.find(o => o.menuIndex === index);
                    const quantity = orderItem ? orderItem.quantity : 0;
                    
                    return `
                        <div class="order-item">
                            <label>
                                <input type="checkbox" 
                                       ${quantity > 0 ? 'checked' : ''} 
                                       onchange="toggleOrder('${participant}', ${index})">
                                ${item.name}
                            </label>
                            ${quantity > 0 ? `
                                <div class="quantity-controls">
                                    <button onclick="updateOrderQuantity('${participant}', ${index}, ${quantity - 1})">-</button>
                                    <span>${quantity}</span>
                                    <button onclick="updateOrderQuantity('${participant}', ${index}, ${quantity + 1})">+</button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');
}

// Calculate split bill
function calculateSplit() {
    if (participants.length === 0 || menuItems.length === 0) {
        document.getElementById('results').innerHTML = '<p class="empty-state">Tambahkan peserta dan menu terlebih dahulu</p>';
        return;
    }
    
    // Calculate total subtotal
    let totalSubtotal = 0;
    Object.keys(orders).forEach(participant => {
        orders[participant].forEach(order => {
            const menuItem = menuItems[order.menuIndex];
            if (menuItem) {
                totalSubtotal += menuItem.price * order.quantity;
            }
        });
    });
    
    if (totalSubtotal === 0) {
        document.getElementById('results').innerHTML = '<p class="empty-state">Belum ada pesanan</p>';
        return;
    }
    
    // Calculate total additional costs
    let totalAdditionalCosts = 0;
    additionalCosts.forEach(cost => {
        if (cost.type === 'fixed') {
            totalAdditionalCosts += cost.amount;
        } else if (cost.type === 'percentage') {
            totalAdditionalCosts += (totalSubtotal * cost.amount / 100);
        }
    });
    
    // Calculate total discount
    let totalDiscount = 0;
    if (discount.amount > 0) {
        totalDiscount = discount.amount;
    } else if (discount.percentage > 0) {
        if (discount.type === 'menu') {
            totalDiscount = totalSubtotal * discount.percentage / 100;
        } else {
            totalDiscount = (totalSubtotal + totalAdditionalCosts) * discount.percentage / 100;
        }
    }
    
    // Calculate factor
    const factor = (totalSubtotal + totalAdditionalCosts - totalDiscount) / totalSubtotal;
    
    // Calculate results for each participant
    const results = [];
    Object.keys(orders).forEach(participant => {
        let participantSubtotal = 0;
        orders[participant].forEach(order => {
            const menuItem = menuItems[order.menuIndex];
            if (menuItem) {
                participantSubtotal += menuItem.price * order.quantity;
            }
        });
        
        if (participantSubtotal > 0) {
            const adjustedAmount = participantSubtotal * factor;
            results.push({
                participant,
                originalAmount: participantSubtotal,
                adjustedAmount: adjustedAmount
            });
        }
    });
    
    // Display results
    displayResults(results, {
        totalSubtotal,
        totalAdditionalCosts,
        totalDiscount,
        factor,
        totalBill: totalSubtotal + totalAdditionalCosts - totalDiscount
    });
}

// Display results
function displayResults(results, summary) {
    const container = document.getElementById('results');
    if (!container) return;
    
    const resultsHTML = results.map(result => `
        <div class="participant-result">
            <h3>${result.participant}</h3>
            <div class="result-details">
                <div class="amount-breakdown">
                    <span>Makanan: Rp ${result.originalAmount.toLocaleString('id-ID')}</span>
                    <span>Total: Rp ${result.adjustedAmount.toLocaleString('id-ID')}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    const summaryHTML = `
        <div class="total-summary">
            <h3>Grand Total: Rp ${summary.totalBill.toLocaleString('id-ID')}</h3>
            <div class="summary-breakdown">
                <p>Subtotal: Rp ${summary.totalSubtotal.toLocaleString('id-ID')}</p>
                <p>Biaya Tambahan: Rp ${summary.totalAdditionalCosts.toLocaleString('id-ID')}</p>
                <p>Diskon: -Rp ${summary.totalDiscount.toLocaleString('id-ID')}</p>
            </div>
        </div>
    `;
    
    const factorHTML = `
        <div style="margin-top: 20px; font-size: 0.9em; border: 2px solid #0174BE; border-radius: 8px; padding: 15px; background: #ffffff;">
            <div style="color: #0174BE; font-weight: bold; font-size: 1.1em; margin-bottom: 15px; text-align: center;">
                🔢 Proses Perhitungan dengan Faktor Pembagi
            </div>
            <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #0174BE;">
                <div style="font-weight: bold; color: #0174BE; margin-bottom: 5px;">📐 Formula Faktor Pembagi:</div>
                <div style="font-family: monospace; background: #e9ecef; color: #212529; padding: 8px; border-radius: 3px; margin: 5px 0;">
                    (Total Subtotal + Biaya Tambahan - Diskon) ÷ Total Subtotal = <strong style="color: #dc3545;">${summary.factor.toFixed(4)}</strong>
                </div>
                <div style="font-weight: bold; color: #0174BE; margin-top: 8px;">💰 Harga Baru:</div>
                <div style="font-family: monospace; background: #e9ecef; color: #212529; padding: 8px; border-radius: 3px; margin: 5px 0;">
                    Harga Asli × Faktor Pembagi
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = resultsHTML + summaryHTML + factorHTML;
}

// Render all components
function renderAll() {
    renderParticipants();
    renderMenuItems();
    renderAdditionalCosts();
    renderOrders();
    calculateSplit();
}

// Handle online status
function handleOnlineStatus() {
    console.log('InoBill PWA: Online');
    hideOfflineIndicator();
    // Sync data if needed
    syncData();
}

// Handle offline status
function handleOfflineStatus() {
    console.log('InoBill PWA: Offline');
    showOfflineIndicator();
}

// Show offline indicator
function showOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
        indicator.style.display = 'block';
    }
}

// Hide offline indicator
function hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Sync data (placeholder for future implementation)
function syncData() {
    console.log('InoBill PWA: Syncing data...');
    // Future implementation for cloud sync
}

// Check for updates
function checkForUpdates() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.update();
        });
    }
}

// Utility function: Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility function: Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Export functions for global access
window.addParticipant = addParticipant;
window.removeParticipant = removeParticipant;
window.addMenuItem = addMenuItem;
window.removeMenuItem = removeMenuItem;
window.addAdditionalCost = addAdditionalCost;
window.removeAdditionalCost = removeAdditionalCost;
window.toggleOrder = toggleOrder;
window.updateOrderQuantity = updateOrderQuantity;
window.toggleDiscountFields = toggleDiscountFields;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('InoBill PWA: Page loaded');
    // Additional initialization if needed
});
