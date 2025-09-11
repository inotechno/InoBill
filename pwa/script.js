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
        document.getElementById('participantName').value = '';
        document.getElementById('menuName').value = '';
        document.getElementById('menuPrice').value = '';
        document.getElementById('additionalCostName').value = '';
        document.getElementById('additionalCostAmount').value = '';
        document.getElementById('discountAmount').value = '';
        document.getElementById('discountPercentage').value = '';
        document.getElementById('discountType').value = 'menu';
        
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
    const customSelect = document.getElementById(selectId) || document.querySelector(`[onclick*="${selectId}"]`).closest('.custom-select');
    const selectedOption = customSelect.querySelector('.select-option.selected');
    return selectedOption ? selectedOption.dataset.value : null;
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
    discount.type = getCustomSelectValue('discountType') || 'menu';
    
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
    const typeValue = getCustomSelectValue('additionalCostType');
    
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;
    const type = typeValue || 'fixed';
    
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
window.resetAllData = resetAllData;
window.toggleSelect = toggleSelect;
window.selectOption = selectOption;
window.getCustomSelectValue = getCustomSelectValue;

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
