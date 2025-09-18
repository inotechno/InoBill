// InoBill PWA - Main JavaScript
// Version: 1.0.0

// Global variables
let participants = [];
let menuItems = [];
let additionalCosts = [];
let orders = {};
let discount = { amount: 0, percentage: 0, type: 'menu' };

// Helper function to format currency without decimals
function formatCurrency(amount) {
    return Math.round(amount).toLocaleString('id-ID');
}

// Initialize the application
function init() {
    console.log('InoBill PWA: Initializing...');
    
    // Try to load data from URL first
    const urlDataLoaded = loadDataFromUrl();
    
    // If no URL data, load from localStorage
    if (!urlDataLoaded) {
        loadData();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Setup floating button
    setupFloatingButton();
    
    // Setup modern selects
    setupModernSelects();
    
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

// Reset all data
async function resetAllData() {
    const result = await Swal.fire({
        title: '🔄 Reset Semua Data',
        html: `
            <div style="text-align: left; margin: 20px 0;">
                <p style="margin-bottom: 15px; font-size: 16px; color: #374151;">
                    Apakah Anda yakin ingin mengosongkan semua data?
                </p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 0; font-weight: 600; color: #ef4444; margin-bottom: 10px;">Data yang akan dihapus:</p>
                    <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                        <li>Semua peserta</li>
                        <li>Semua menu</li>
                        <li>Semua biaya tambahan</li>
                        <li>Semua pesanan</li>
                        <li>Semua diskon</li>
                    </ul>
                </div>
                <p style="margin: 0; font-size: 14px; color: #ef4444; font-weight: 600;">
                    ⚠️ Tindakan ini tidak dapat dibatalkan!
                </p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset Semua',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
            popup: 'swal2-popup-custom',
            title: 'swal2-title-custom',
            htmlContainer: 'swal2-html-container-custom'
        }
    });

    if (result.isConfirmed) {
        // Show loading
        Swal.fire({
            title: 'Sedang mereset...',
            text: 'Menghapus semua data...',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Reset all global variables
        participants = [];
        menuItems = [];
        additionalCosts = [];
        orders = {};
        discount = { amount: 0, percentage: 0, type: 'menu' };
        
        // Clear all input fields
        const participantName = document.getElementById('participantName');
        const menuName = document.getElementById('menuName');
        const menuPrice = document.getElementById('menuPrice');
        const additionalCostName = document.getElementById('additionalCostName');
        const additionalCostAmount = document.getElementById('additionalCostAmount');
        const discountAmount = document.getElementById('discountAmount');
        const discountPercentage = document.getElementById('discountPercentage');
        
        if (participantName) participantName.value = '';
        if (menuName) menuName.value = '';
        if (menuPrice) menuPrice.value = '';
        if (additionalCostName) additionalCostName.value = '';
        if (additionalCostAmount) additionalCostAmount.value = '';
        if (discountAmount) discountAmount.value = '';
        if (discountPercentage) discountPercentage.value = '';
        
        // Reset custom select elements
        resetCustomSelect('discountType', 'menu', 'Setelah Menu');
        resetCustomSelect('additionalCostType', 'fixed', 'Tetap (Rp)');
        
        // Clear localStorage
        try {
            localStorage.removeItem('inobill_participants');
            localStorage.removeItem('inobill_menuItems');
            localStorage.removeItem('inobill_additionalCosts');
            localStorage.removeItem('inobill_orders');
            localStorage.removeItem('inobill_discount');
            console.log('InoBill PWA: All data cleared from localStorage');
        } catch (error) {
            console.error('InoBill PWA: Error clearing localStorage', error);
        }
        
        // Re-render everything
        renderAll();
        
        // Show success message
        await Swal.fire({
            title: '✅ Berhasil!',
            text: 'Semua data telah direset dengan sukses!',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        });
        
        console.log('InoBill PWA: All data reset successfully');
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

// Setup floating button
function setupFloatingButton() {
    const floatingBtn = document.getElementById('floating-reset-btn');
    
    if (floatingBtn) {
        // Add click animation
        floatingBtn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        // Add hover effects
        floatingBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        floatingBtn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
        
        // Show/hide based on scroll position
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                floatingBtn.style.transform = 'translateY(100px)';
                floatingBtn.style.opacity = '0.7';
            } else {
                // Scrolling up
                floatingBtn.style.transform = '';
                floatingBtn.style.opacity = '1';
            }
            
            lastScrollTop = scrollTop;
        });
        
        console.log('InoBill PWA: Floating button setup complete');
    }
}

// Setup modern select elements
function setupModernSelects() {
    // Setup custom selects
    setupCustomSelects();
    
    // Setup regular selects (if any)
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        // Add change event listener
        select.addEventListener('change', function() {
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    console.log('InoBill PWA: Modern selects setup complete');
}

// Setup custom select elements
function setupCustomSelects() {
    const customSelects = document.querySelectorAll('.custom-select');
    
    customSelects.forEach(customSelect => {
        const trigger = customSelect.querySelector('.select-trigger');
        const options = customSelect.querySelector('.select-options');
        
        // Add hover effects
        trigger.addEventListener('mouseenter', function() {
            customSelect.classList.add('select-hovered');
        });
        
        trigger.addEventListener('mouseleave', function() {
            customSelect.classList.remove('select-hovered');
        });
        
        // Add focus effects
        trigger.addEventListener('focus', function() {
            customSelect.classList.add('select-focused');
        });
        
        trigger.addEventListener('blur', function() {
            customSelect.classList.remove('select-focused');
        });
        
        // Add keyboard support
        trigger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSelect(customSelect.id || 'customSelect');
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-select')) {
            closeAllSelects();
        }
    });
    
    console.log('InoBill PWA: Custom selects setup complete');
}

// Toggle select dropdown
function toggleSelect(selectId) {
    const customSelect = document.getElementById(selectId) || document.querySelector(`[onclick*="${selectId}"]`).closest('.custom-select');
    const trigger = customSelect.querySelector('.select-trigger');
    const options = customSelect.querySelector('.select-options');
    
    // Close other dropdowns
    closeAllSelects();
    
    // Toggle current dropdown
    if (options.classList.contains('show')) {
        options.classList.remove('show');
        trigger.classList.remove('active');
    } else {
        options.classList.add('show');
        trigger.classList.add('active');
    }
}

// Select option
function selectOption(selectId, value, text) {
    const customSelect = document.getElementById(selectId) || document.querySelector(`[onclick*="${selectId}"]`).closest('.custom-select');
    const trigger = customSelect.querySelector('.select-trigger');
    const options = customSelect.querySelector('.select-options');
    const valueSpan = customSelect.querySelector('.select-value');
    const optionElements = customSelect.querySelectorAll('.select-option');
    
    // Update value display
    valueSpan.textContent = text;
    
    // Update selected option
    optionElements.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.value === value) {
            option.classList.add('selected');
        }
    });
    
    // Close dropdown
    options.classList.remove('show');
    trigger.classList.remove('active');
    
    // Add visual feedback
    trigger.style.transform = 'scale(0.98)';
    setTimeout(() => {
        trigger.style.transform = '';
    }, 150);
    
    // Show notification for important changes
    if (selectId === 'discountType') {
        const message = value === 'menu' ? 
            'Diskon akan diterapkan setelah menu' : 
            'Diskon akan diterapkan dari total semua';
        showNotification(message, 'info');
    }
    
    if (selectId === 'additionalCostType') {
        const message = value === 'fixed' ? 
            'Biaya tambahan akan dihitung sebagai jumlah tetap' : 
            'Biaya tambahan akan dihitung sebagai persentase';
        showNotification(message, 'info');
    }
    
    // Trigger change event for compatibility
    const changeEvent = new Event('change', { bubbles: true });
    customSelect.dispatchEvent(changeEvent);
}

// Close all select dropdowns
function closeAllSelects() {
    const customSelects = document.querySelectorAll('.custom-select');
    customSelects.forEach(customSelect => {
        const trigger = customSelect.querySelector('.select-trigger');
        const options = customSelect.querySelector('.select-options');
        
        options.classList.remove('show');
        trigger.classList.remove('active');
    });
}

// Get custom select value
function getCustomSelectValue(selectId) {
    try {
        const customSelect = document.getElementById(selectId) || document.querySelector(`[onclick*="${selectId}"]`)?.closest('.custom-select');
        
        if (!customSelect) {
            console.warn(`InoBill PWA: Custom select with id "${selectId}" not found`);
            return null;
        }
        
        const selectedOption = customSelect.querySelector('.select-option.selected');
        return selectedOption ? selectedOption.dataset.value : null;
    } catch (error) {
        console.error('InoBill PWA: Error getting custom select value:', error);
        return null;
    }
}

// Reset custom select to default value
function resetCustomSelect(selectId, defaultValue, defaultText) {
    try {
        const customSelect = document.getElementById(selectId) || document.querySelector(`[onclick*="${selectId}"]`)?.closest('.custom-select');
        
        if (!customSelect) {
            console.warn(`InoBill PWA: Custom select with id "${selectId}" not found for reset`);
            return;
        }
        
        const valueSpan = customSelect.querySelector('.select-value');
        const optionElements = customSelect.querySelectorAll('.select-option');
        
        // Update value display
        if (valueSpan) {
            valueSpan.textContent = defaultText;
        }
        
        // Update selected option
        optionElements.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.value === defaultValue) {
                option.classList.add('selected');
            }
        });
        
        console.log(`InoBill PWA: Custom select "${selectId}" reset to "${defaultValue}"`);
    } catch (error) {
        console.error('InoBill PWA: Error resetting custom select:', error);
    }
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
        infoDiv.textContent = 'Menggunakan diskon (prioritas)';
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
    
    // Safely get custom select value
    try {
        discount.type = getCustomSelectValue('discountType') || 'menu';
    } catch (error) {
        console.warn('InoBill PWA: Error getting discount type, using default');
        discount.type = 'menu';
    }
    
    // Trigger calculation
    calculateSplit();
}

// Add participant
function addParticipant() {
    const nameInput = document.getElementById('participantName');
    const name = nameInput.value.trim();
    
    if (!name) {
        showError('Error Input', 'Masukkan nama peserta');
        nameInput.focus();
        return;
    }
    
    if (participants.includes(name)) {
        showError('Error Input', 'Peserta sudah ada');
        nameInput.focus();
        return;
    }
    
    participants.push(name);
    orders[name] = [];
    nameInput.value = '';
    
    renderParticipants();
    renderOrders();
    calculateSplit();
    saveData();
    
    showNotification(`${name} berhasil ditambahkan sebagai peserta`, 'success');
}

// Remove participant
async function removeParticipant(name) {
    const confirmed = await showConfirmation(
        'Hapus Peserta',
        `Apakah Anda yakin ingin menghapus "${name}"?`,
        'Ya, Hapus',
        'Batal'
    );
    
    if (confirmed) {
        participants = participants.filter(p => p !== name);
        delete orders[name];
        
        renderParticipants();
        renderOrders();
        calculateSplit();
        saveData();
        
        showNotification(`${name} telah dihapus`, 'success');
    }
}

// Add menu item
function addMenuItem() {
    const nameInput = document.getElementById('menuName');
    const priceInput = document.getElementById('menuPrice');
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;
    
    if (!name) {
        showError('Error Input', 'Masukkan nama menu');
        nameInput.focus();
        return;
    }
    
    if (price <= 0) {
        showError('Error Input', 'Masukkan harga yang valid');
        priceInput.focus();
        return;
    }
    
    menuItems.push({ name, price });
    nameInput.value = '';
    priceInput.value = '';
    
    renderMenuItems();
    renderOrders();
    calculateSplit();
    saveData();
    
    showNotification(`Menu "${name}" berhasil ditambahkan`, 'success');
}

// Remove menu item
async function removeMenuItem(index) {
    const menuName = menuItems[index]?.name || 'menu ini';
    const confirmed = await showConfirmation(
        'Hapus Menu',
        `Apakah Anda yakin ingin menghapus "${menuName}"?`,
        'Ya, Hapus',
        'Batal'
    );
    
    if (confirmed) {
        menuItems.splice(index, 1);
        
        // Remove from all orders
        Object.keys(orders).forEach(participant => {
            orders[participant] = orders[participant].filter(item => item.menuIndex !== index);
        });
        
        renderMenuItems();
        renderOrders();
        calculateSplit();
        saveData();
        
        showNotification(`Menu "${menuName}" telah dihapus`, 'success');
    }
}

// Add additional cost
function addAdditionalCost() {
    const nameInput = document.getElementById('additionalCostName');
    const amountInput = document.getElementById('additionalCostAmount');
    
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;
    
    // Safely get custom select value
    let type = 'fixed';
    try {
        type = getCustomSelectValue('additionalCostType') || 'fixed';
    } catch (error) {
        console.warn('InoBill PWA: Error getting additional cost type, using default');
        type = 'fixed';
    }
    
    if (!name) {
        showError('Error Input', 'Masukkan nama biaya tambahan');
        nameInput.focus();
        return;
    }
    
    if (amount <= 0) {
        showError('Error Input', 'Masukkan jumlah yang valid');
        amountInput.focus();
        return;
    }
    
    additionalCosts.push({ name, amount, type });
    nameInput.value = '';
    amountInput.value = '';
    
    renderAdditionalCosts();
    calculateSplit();
    saveData();
    
    showNotification(`Biaya tambahan "${name}" berhasil ditambahkan`, 'success');
}

// Remove additional cost
async function removeAdditionalCost(index) {
    const costName = additionalCosts[index]?.name || 'biaya tambahan ini';
    const confirmed = await showConfirmation(
        'Hapus Biaya Tambahan',
        `Apakah Anda yakin ingin menghapus "${costName}"?`,
        'Ya, Hapus',
        'Batal'
    );
    
    if (confirmed) {
        additionalCosts.splice(index, 1);
        renderAdditionalCosts();
        calculateSplit();
        saveData();
        
        showNotification(`Biaya tambahan "${costName}" telah dihapus`, 'success');
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
            <span class="price">${formatCurrency(item.price)}</span>
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
            <span class="amount">${cost.type === 'percentage' ? cost.amount + '%' : formatCurrency(cost.amount)}</span>
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
                                ${item.name} - ${formatCurrency(item.price)}
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
        // Hide action buttons
        const actionButtons = document.getElementById('actionButtons');
        if (actionButtons) {
            actionButtons.style.display = 'none';
        }
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
        // Hide action buttons
        const actionButtons = document.getElementById('actionButtons');
        if (actionButtons) {
            actionButtons.style.display = 'none';
        }
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
                    <span>Makanan: ${formatCurrency(result.originalAmount)}</span>
                    <span>Total: ${formatCurrency(result.adjustedAmount)}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    const summaryHTML = `
        <div class="total-summary">
            <h3>Grand Total: ${formatCurrency(summary.totalBill)}</h3>
            <div class="summary-breakdown">
                <p>Subtotal: ${formatCurrency(summary.totalSubtotal)}</p>
                <p>Biaya Tambahan: ${formatCurrency(summary.totalAdditionalCosts)}</p>
                <p>Diskon: -${formatCurrency(summary.totalDiscount)}</p>
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
    
    // Show action buttons
    const actionButtons = document.getElementById('actionButtons');
    if (actionButtons) {
        actionButtons.style.display = 'flex';
    }
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
window.resetAllData = resetAllData;
window.toggleSelect = toggleSelect;
window.selectOption = selectOption;
window.getCustomSelectValue = getCustomSelectValue;
window.resetCustomSelect = resetCustomSelect;

// Show notification using SweetAlert2 Toast
function showNotification(message, type = 'info') {
    const toastConfig = {
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    };

    switch (type) {
        case 'success':
            Swal.fire({
                ...toastConfig,
                icon: 'success',
                title: 'Berhasil!',
                text: message
            });
            break;
        case 'error':
            Swal.fire({
                ...toastConfig,
                icon: 'error',
                title: 'Error!',
                text: message
            });
            break;
        case 'warning':
            Swal.fire({
                ...toastConfig,
                icon: 'warning',
                title: 'Peringatan!',
                text: message
            });
            break;
        case 'info':
        default:
            Swal.fire({
                ...toastConfig,
                icon: 'info',
                title: 'Info',
                text: message
            });
            break;
    }
}

// Show confirmation dialog using SweetAlert2
async function showConfirmation(title, text, confirmText = 'Ya', cancelText = 'Batal') {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: '#0174BE',
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
        focusCancel: true
    });
    
    return result.isConfirmed;
}

// Show success message using SweetAlert2
async function showSuccess(title, text, timer = 2000) {
    await Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        timer: timer,
        timerProgressBar: true,
        showConfirmButton: false
    });
}

// Show error message using SweetAlert2
async function showError(title, text) {
    await Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
    });
}

// Show loading using SweetAlert2
function showLoading(title = 'Memproses...', text = 'Mohon tunggu sebentar') {
    Swal.fire({
        title: title,
        text: text,
        icon: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

// Hide loading
function hideLoading() {
    Swal.close();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('InoBill PWA: Page loaded');
    // Additional initialization if needed
});

// Print Bill Function
function printBill() {
    if (participants.length === 0) {
        showError('Error', 'Belum ada peserta yang ditambahkan');
        return;
    }

    // Create compact print content
    const printContent = generateCompactBillContent();
    
    // Create new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>InoBill - Split Bill Receipt</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.3;
                    color: #333;
                    background: white;
                    padding: 10px;
                    font-size: 12px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #0174BE;
                }
                .header h1 {
                    color: #0174BE;
                    margin: 0;
                    font-size: 20px;
                }
                .header p {
                    color: #666;
                    margin: 2px 0 0 0;
                    font-size: 11px;
                }
                .bill-info {
                    background: #f8fafc;
                    padding: 8px;
                    border-radius: 4px;
                    margin-bottom: 10px;
                    border-left: 3px solid #0174BE;
                    font-size: 11px;
                }
                .bill-info p {
                    margin: 2px 0;
                }
                .participant-section {
                    margin-bottom: 15px;
                    page-break-inside: avoid;
                }
                .participant-header {
                    background: #0174BE;
                    color: white;
                    padding: 6px 10px;
                    border-radius: 4px 4px 0 0;
                    font-weight: 600;
                    font-size: 12px;
                }
                .participant-details {
                    border: 1px solid #e5e7eb;
                    border-top: none;
                    border-radius: 0 0 4px 4px;
                    padding: 8px;
                }
                .order-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 11px;
                }
                .order-item:last-child {
                    border-bottom: none;
                }
                .order-name {
                    font-weight: 500;
                }
                .order-price {
                    color: #0174BE;
                    font-weight: 600;
                }
                .total-amount {
                    background: #FFC436;
                    color: #0C356A;
                    padding: 6px 10px;
                    border-radius: 4px;
                    text-align: center;
                    font-weight: 700;
                    font-size: 14px;
                    margin-top: 8px;
                }
                .summary-section {
                    background: #f9fafb;
                    padding: 10px;
                    border-radius: 4px;
                    margin-top: 10px;
                    font-size: 11px;
                }
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    border-bottom: 1px solid #e5e7eb;
                }
                .summary-item:last-child {
                    border-bottom: none;
                    font-weight: 700;
                    font-size: 12px;
                    color: #0174BE;
                }
                .footer {
                    text-align: center;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #e5e7eb;
                    color: #666;
                    font-size: 10px;
                }
                .bill-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    font-size: 10px;
                }
                .bill-table th,
                .bill-table td {
                    border: 1px solid #ddd;
                    padding: 4px 6px;
                    text-align: left;
                    vertical-align: top;
                }
                .bill-table th {
                    background-color: #0174BE;
                    color: white;
                    font-weight: 600;
                    text-align: center;
                }
                .bill-table td {
                    background-color: white;
                }
                .bill-table tr:nth-child(even) td {
                    background-color: #f9f9f9;
                }
                .bill-table td:first-child {
                    font-weight: 500;
                    background-color: #f0f8ff;
                }
                .bill-table td:nth-child(5),
                .bill-table td:nth-child(7) {
                    text-align: right;
                    font-weight: 500;
                }
                .bill-table td:nth-child(3),
                .bill-table td:nth-child(6) {
                    text-align: center;
                }
                @media print {
                    body { margin: 0; padding: 8px; }
                    .no-print { display: none; }
                    @page { margin: 0.5in; }
                    .bill-table { page-break-inside: avoid; }
                    .bill-table th,
                    .bill-table td { font-size: 9px; padding: 2px 4px; }
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
    
    showNotification('Bill berhasil dicetak!', 'success');
}

// Share Bill Function
function shareBill() {
    if (participants.length === 0) {
        showError('Error', 'Belum ada peserta yang ditambahkan');
        return;
    }

    // Direct share as URL
    shareAsUrl();
}

// Share as Text
function shareAsText() {
    const shareText = generateShareText();
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        // Use native share API if available
        navigator.share({
            title: 'InoBill - Split Bill Receipt',
            text: shareText,
            url: shareUrl
        }).then(() => {
            showNotification('Bill berhasil dibagikan!', 'success');
        }).catch((error) => {
            console.log('Error sharing:', error);
            fallbackShare(shareText, shareUrl);
        });
    } else {
        // Fallback to copy to clipboard
        fallbackShare(shareText, shareUrl);
    }
}

// Share as Link
function shareAsLink() {
    // Show options for link sharing
    Swal.fire({
        title: '🔗 Bagikan sebagai Link',
        html: `
            <div style="text-align: left; margin: 20px 0;">
                <p style="margin-bottom: 15px; font-size: 16px; color: #374151;">
                    Pilih cara membagikan link:
                </p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button id="share-url-btn" class="share-option-btn" style="
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        text-align: left;
                    ">
                        🌐 Bagikan sebagai URL
                    </button>
                    <button id="share-json-btn" class="share-option-btn" style="
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        text-align: left;
                    ">
                        📄 Bagikan sebagai JSON File
                    </button>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Batal',
        customClass: {
            popup: 'swal2-popup-custom'
        }
    });
    
    // Handle button clicks after modal is shown
    setTimeout(() => {
        const urlBtn = document.getElementById('share-url-btn');
        const jsonBtn = document.getElementById('share-json-btn');
        
        if (urlBtn) {
            urlBtn.addEventListener('click', () => {
                Swal.close();
                shareAsUrl();
            });
        }
        
        if (jsonBtn) {
            jsonBtn.addEventListener('click', () => {
                Swal.close();
                shareAsJson();
            });
        }
    }, 100);
}

// Share as URL (existing method)
function shareAsUrl() {
    const shareUrl = generateShareableLink();
    const shareText = `🍽️ InoBill - Split Bill Receipt\n\nLihat detail lengkap di: ${shareUrl}`;
    
    if (navigator.share) {
        // Use native share API if available
        navigator.share({
            title: 'InoBill - Split Bill Receipt',
            text: shareText,
            url: shareUrl
        }).then(() => {
            showNotification('Link bill berhasil dibagikan!', 'success');
        }).catch((error) => {
            console.log('Error sharing:', error);
            fallbackShare(shareText, shareUrl);
        });
    } else {
        // Fallback to copy to clipboard
        fallbackShare(shareText, shareUrl);
    }
}

// Share as JSON File
function shareAsJson() {
    const billData = calculateBillData();
    
    if (billData.results.length === 0) {
        showError('Error', 'Belum ada data untuk dibagikan');
        return;
    }
    
    // Create comprehensive data object
    const shareData = {
        app: "InoBill PWA",
        version: "1.0.0",
        created: new Date().toISOString(),
        createdBy: "InoTechno",
        data: {
            participants: participants,
            menuItems: menuItems,
            additionalCosts: additionalCosts,
            orders: orders,
            discount: discount,
            results: billData.results,
            summary: billData.summary
        }
    };
    
    // Create JSON file
    const jsonContent = JSON.stringify(shareData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `inobill-receipt-${timestamp}.json`;
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message with instructions
    Swal.fire({
        title: '✅ JSON File Berhasil Dibuat!',
        html: `
            <div style="text-align: left; margin: 20px 0;">
                <p style="margin-bottom: 15px; font-size: 16px; color: #374151;">
                    File JSON telah didownload dengan nama: <strong>${filename}</strong>
                </p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 0; font-weight: 600; color: #0174BE; margin-bottom: 10px;">📋 Cara menggunakan file JSON:</p>
                    <ol style="margin: 0; padding-left: 20px; color: #6b7280;">
                        <li>Bagikan file JSON ke orang lain</li>
                        <li>Buka InoBill PWA</li>
                        <li>Klik tombol "Import JSON" di bagian atas</li>
                        <li>Pilih file JSON yang dibagikan</li>
                        <li>Data akan otomatis dimuat</li>
                    </ol>
                </div>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    💡 File JSON berisi semua data bill yang bisa dibuka di InoBill PWA
                </p>
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'Mengerti',
        confirmButtonColor: '#0174BE'
    });
    
    showNotification('File JSON berhasil dibuat dan didownload!', 'success');
}

// Fallback Share Function
function fallbackShare(shareText, shareUrl) {
    const fullText = `${shareText}\n\nLihat detail lengkap di: ${shareUrl}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(fullText).then(() => {
            Swal.fire({
                title: 'Berhasil!',
                text: 'Bill telah disalin ke clipboard. Anda bisa paste di aplikasi lain.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        }).catch(() => {
            showError('Error', 'Gagal menyalin ke clipboard');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            Swal.fire({
                title: 'Berhasil!',
                text: 'Bill telah disalin ke clipboard. Anda bisa paste di aplikasi lain.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } catch (err) {
            showError('Error', 'Gagal menyalin ke clipboard');
        }
        document.body.removeChild(textArea);
    }
}

// Download Bill Function
function downloadBill() {
    if (participants.length === 0) {
        showError('Error', 'Belum ada peserta yang ditambahkan');
        return;
    }

    // Direct download as JSON
    shareAsJson();
}

// Generate Bill Content for Print/Share
function generateBillContent() {
    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Calculate the same data as displayed in UI
    const billData = calculateBillData();
    
    let content = `
        <div class="header">
            <h1>🍽️ InoBill</h1>
            <p>Split Bill Calculator - Dibuat oleh InoTechno</p>
        </div>
        
        <div class="bill-info">
            <p><strong>Tanggal:</strong> ${currentDate}</p>
            <p><strong>Total Peserta:</strong> ${participants.length} orang</p>
            <p><strong>Total Menu:</strong> ${menuItems.length} item</p>
        </div>
    `;
    
    // Add participant details using the same calculation as UI
    billData.results.forEach(result => {
        content += `
            <div class="participant-section">
                <div class="participant-header">
                    👤 ${result.participant}
                </div>
                <div class="participant-details">
        `;
        
        // Add ordered items
        const participantOrders = orders[result.participant] || [];
        if (Array.isArray(participantOrders)) {
            participantOrders.forEach(order => {
                const menuItem = menuItems[order.menuIndex];
                if (menuItem && order.quantity > 0) {
                    const itemTotal = menuItem.price * order.quantity;
                    content += `
                        <div class="order-item">
                            <span class="order-name">${menuItem.name} (${order.quantity}x)</span>
                            <span class="order-price">${formatCurrency(itemTotal)}</span>
                        </div>
                    `;
                }
            });
        }
        
        // Add factor calculation info
        content += `
            <div class="order-item" style="border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 10px;">
                <span class="order-name">Subtotal Makanan:</span>
                <span class="order-price">${formatCurrency(result.originalAmount)}</span>
            </div>
            <div class="order-item">
                <span class="order-name">Faktor Pembagi (${billData.summary.factor.toFixed(4)}):</span>
                <span class="order-price">× ${billData.summary.factor.toFixed(4)}</span>
            </div>
        `;
        
        content += `
                    <div class="total-amount">
                        Total: ${formatCurrency(result.adjustedAmount)}
                    </div>
                </div>
            </div>
        `;
    });
    
    // Add summary using the same data as UI
    content += `
        <div class="summary-section">
            <h3 style="margin-top: 0; color: #0174BE;">📊 Ringkasan Total</h3>
            <div class="summary-item">
                <span>Total Menu:</span>
                <span>${formatCurrency(billData.summary.totalSubtotal)}</span>
            </div>
            <div class="summary-item">
                <span>Total Biaya Tambahan:</span>
                <span>${formatCurrency(billData.summary.totalAdditionalCosts)}</span>
            </div>
            <div class="summary-item">
                <span>Total Diskon:</span>
                <span style="color: #10b981;">-${formatCurrency(billData.summary.totalDiscount)}</span>
            </div>
            <div class="summary-item">
                <span><strong>Grand Total:</strong></span>
                <span><strong>${formatCurrency(billData.summary.totalBill)}</strong></span>
            </div>
        </div>
        
        <div class="footer">
            <p>Dibuat dengan ❤️ oleh <strong>InoTechno</strong></p>
            <p>InoBill PWA - Pembagi Tagihan Adil & Mudah</p>
            <p>Website: <a href="https://inotechno.my.id" target="_blank">inotechno.my.id</a></p>
        </div>
    `;
    
    return content;
}

// Generate Compact Bill Content for Print
function generateCompactBillContent() {
    const currentDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Calculate the same data as displayed in UI
    const billData = calculateBillData();
    
    let content = `
        <div class="header">
            <h1>🍽️ InoBill</h1>
            <p>Split Bill Calculator - InoTechno</p>
        </div>
        
        <div class="bill-info">
            <p><strong>Tanggal:</strong> ${currentDate} | <strong>Peserta:</strong> ${participants.length} | <strong>Menu:</strong> ${menuItems.length}</p>
        </div>
    `;
    
    // Create table for participant details
    content += `
        <table class="bill-table">
            <thead>
                <tr>
                    <th>Peserta</th>
                    <th>Menu</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Subtotal</th>
                    <th>Faktor</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Add participant details in table format
    billData.results.forEach(result => {
        const participantOrders = orders[result.participant] || [];
        let hasOrders = false;
        
        if (Array.isArray(participantOrders)) {
            participantOrders.forEach((order, index) => {
                const menuItem = menuItems[order.menuIndex];
                if (menuItem && order.quantity > 0) {
                    const itemTotal = menuItem.price * order.quantity;
                    const adjustedTotal = itemTotal * billData.summary.factor;
                    
                    content += `
                        <tr>
                            <td>${index === 0 ? result.participant : ''}</td>
                            <td>${menuItem.name}</td>
                            <td>${order.quantity}</td>
                            <td>${formatCurrency(menuItem.price)}</td>
                            <td>${formatCurrency(itemTotal)}</td>
                            <td>${index === 0 ? billData.summary.factor.toFixed(4) : ''}</td>
                            <td>${formatCurrency(adjustedTotal)}</td>
                        </tr>
                    `;
                    hasOrders = true;
                }
            });
        }
        
        // If no orders, show participant with zero total
        if (!hasOrders) {
            content += `
                <tr>
                    <td>${result.participant}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>0</td>
                    <td>${billData.summary.factor.toFixed(4)}</td>
                    <td>0</td>
                </tr>
            `;
        }
    });
    
    content += `
            </tbody>
        </table>
    `;
    
    // Add compact summary section
    content += `
        <div class="summary-section">
            <h3 style="margin-bottom: 10px; color: #0174BE; font-size: 14px;">Ringkasan</h3>
            <div class="summary-item">
                <span>Total Menu:</span>
                <span>${formatCurrency(billData.summary.totalSubtotal)}</span>
            </div>
            <div class="summary-item">
                <span>Total Biaya Tambahan:</span>
                <span>${formatCurrency(billData.summary.totalAdditionalCosts)}</span>
            </div>
            <div class="summary-item">
                <span>Total Diskon:</span>
                <span style="color: #10b981;">-${formatCurrency(billData.summary.totalDiscount)}</span>
            </div>
            <div class="summary-item">
                <span><strong>Grand Total:</strong></span>
                <span><strong>${formatCurrency(billData.summary.totalBill)}</strong></span>
            </div>
        </div>
        
        <div class="footer">
            <p>InoBill PWA - InoTechno</p>
        </div>
    `;
    
    return content;
}

// Calculate Bill Data (same logic as calculateSplit)
function calculateBillData() {
    if (participants.length === 0 || menuItems.length === 0) {
        return { results: [], summary: {} };
    }
    
    // Calculate total subtotal
    let totalSubtotal = 0;
    Object.keys(orders).forEach(participant => {
        const participantOrders = orders[participant] || [];
        if (Array.isArray(participantOrders)) {
            participantOrders.forEach(order => {
                const menuItem = menuItems[order.menuIndex];
                if (menuItem) {
                    totalSubtotal += menuItem.price * order.quantity;
                }
            });
        }
    });
    
    if (totalSubtotal === 0) {
        return { results: [], summary: {} };
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
        const participantOrders = orders[participant] || [];
        if (Array.isArray(participantOrders)) {
            participantOrders.forEach(order => {
                const menuItem = menuItems[order.menuIndex];
                if (menuItem) {
                    participantSubtotal += menuItem.price * order.quantity;
                }
            });
        }
        
        if (participantSubtotal > 0) {
            const adjustedAmount = participantSubtotal * factor;
            results.push({
                participant,
                originalAmount: participantSubtotal,
                adjustedAmount: adjustedAmount
            });
        }
    });
    
    return {
        results,
        summary: {
            totalSubtotal,
            totalAdditionalCosts,
            totalDiscount,
            factor,
            totalBill: totalSubtotal + totalAdditionalCosts - totalDiscount
        }
    };
}

// Generate Share Text
function generateShareText() {
    const currentDate = new Date().toLocaleDateString('id-ID');
    const billData = calculateBillData();
    
    if (billData.results.length === 0) {
        return 'Belum ada data untuk dibagikan';
    }
    
    let text = `🍽️ *InoBill - Split Bill Receipt*\n`;
    text += `📅 ${currentDate}\n\n`;
    text += `👥 *Peserta (${billData.results.length} orang):*\n`;
    
    billData.results.forEach(result => {
        text += `• ${result.participant}: ${formatCurrency(result.adjustedAmount)}\n`;
    });
    
    text += `\n💰 *Grand Total: ${formatCurrency(billData.summary.totalBill)}*\n\n`;
    text += `Dibuat dengan InoBill PWA oleh InoTechno`;
    
    return text;
}

// Generate Shareable Link
function generateShareableLink() {
    const billData = calculateBillData();
    
    if (billData.results.length === 0) {
        return window.location.href;
    }
    
    // Create data object for sharing
    const shareData = {
        participants: participants,
        menuItems: menuItems,
        additionalCosts: additionalCosts,
        orders: orders,
        discount: discount,
        results: billData.results,
        summary: billData.summary,
        timestamp: new Date().toISOString()
    };
    
    // Encode data to base64
    const encodedData = btoa(JSON.stringify(shareData));
    
    // Create shareable URL
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?bill=${encodedData}`;
    
    return shareUrl;
}

// Load Data from URL
function loadDataFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const billData = urlParams.get('bill');
    
    if (billData) {
        try {
            // Decode data from base64
            const decodedData = JSON.parse(atob(billData));
            
            // Validate data structure
            if (decodedData.participants && decodedData.menuItems && decodedData.orders) {
                // Load the data
                participants = decodedData.participants || [];
                menuItems = decodedData.menuItems || [];
                additionalCosts = decodedData.additionalCosts || [];
                orders = decodedData.orders || {};
                discount = decodedData.discount || { amount: 0, percentage: 0, type: 'menu' };
                
                // Re-render everything
                renderAll();
                
                // Show notification
                showNotification('Data bill berhasil dimuat dari link!', 'success');
                
                // Clear URL parameters to avoid reloading
                const newUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                
                return true;
            }
        } catch (error) {
            console.error('Error loading data from URL:', error);
            showError('Error', 'Gagal memuat data dari link');
        }
    }
    
    return false;
}

// Import JSON File
function importJsonFile() {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    // Add to document
    document.body.appendChild(input);
    
    // Handle file selection
    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (!file) {
            document.body.removeChild(input);
            return;
        }
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            showError('Error', 'File harus berformat JSON');
            document.body.removeChild(input);
            return;
        }
        
        // Read file
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                // Validate JSON structure
                if (!jsonData.app || jsonData.app !== 'InoBill PWA') {
                    showError('Error', 'File JSON tidak valid untuk InoBill PWA');
                    document.body.removeChild(input);
                    return;
                }
                
                if (!jsonData.data) {
                    showError('Error', 'File JSON tidak berisi data yang valid');
                    document.body.removeChild(input);
                    return;
                }
                
                // Show confirmation dialog
                Swal.fire({
                    title: '📁 Import Data JSON',
                    html: `
                        <div style="text-align: left; margin: 20px 0;">
                            <p style="margin-bottom: 15px; font-size: 16px; color: #374151;">
                                Apakah Anda yakin ingin mengimpor data dari file JSON?
                            </p>
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <p style="margin: 0; font-weight: 600; color: #0174BE; margin-bottom: 10px;">📋 Data yang akan diimpor:</p>
                                <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                                    <li>Peserta: ${jsonData.data.participants?.length || 0} orang</li>
                                    <li>Menu: ${jsonData.data.menuItems?.length || 0} item</li>
                                    <li>Biaya Tambahan: ${jsonData.data.additionalCosts?.length || 0} item</li>
                                    <li>Dibuat: ${new Date(jsonData.created).toLocaleDateString('id-ID')}</li>
                                </ul>
                            </div>
                            <p style="margin: 0; font-size: 14px; color: #ef4444; font-weight: 600;">
                                ⚠️ Data saat ini akan diganti dengan data dari file JSON!
                            </p>
                        </div>
                    `,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Import Data',
                    cancelButtonText: 'Batal',
                    confirmButtonColor: '#0174BE',
                    cancelButtonColor: '#6b7280',
                    reverseButtons: true,
                    focusCancel: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Import the data
                        importJsonData(jsonData.data);
                    }
                });
                
            } catch (error) {
                console.error('Error parsing JSON:', error);
                showError('Error', 'File JSON tidak valid atau rusak');
            }
            
            // Clean up
            document.body.removeChild(input);
        };
        
        reader.onerror = function() {
            showError('Error', 'Gagal membaca file');
            document.body.removeChild(input);
        };
        
        reader.readAsText(file);
    });
    
    // Trigger file selection
    input.click();
}

// Import JSON Data
function importJsonData(data) {
    try {
        // Show loading
        Swal.fire({
            title: 'Sedang mengimpor...',
            text: 'Memuat data dari file JSON...',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Simulate processing time
        setTimeout(() => {
            // Import data
            participants = data.participants || [];
            menuItems = data.menuItems || [];
            additionalCosts = data.additionalCosts || [];
            orders = data.orders || {};
            discount = data.discount || { amount: 0, percentage: 0, type: 'menu' };
            
            // Save to localStorage
            saveData();
            
            // Re-render everything
            renderAll();
            
            // Show success message
            Swal.fire({
                title: '✅ Berhasil!',
                text: 'Data JSON berhasil diimpor dan dimuat!',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            
            showNotification('Data JSON berhasil diimpor!', 'success');
            
        }, 1000);
        
    } catch (error) {
        console.error('Error importing data:', error);
        showError('Error', 'Gagal mengimpor data dari file JSON');
    }
}

// Export new functions
window.printBill = printBill;
window.shareBill = shareBill;
window.downloadBill = downloadBill;
window.shareAsText = shareAsText;
window.shareAsLink = shareAsLink;
window.shareAsUrl = shareAsUrl;
window.shareAsJson = shareAsJson;
window.importJsonFile = importJsonFile;
