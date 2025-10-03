// InoBill - Modern Clean JavaScript
// Version: 2.0.0

// Global State
let participants = [];
let menuItems = [];
let additionalCosts = [];
let orders = {};
let discount = { amount: 0, percentage: 0, type: 'menu' };
let currentTheme = localStorage.getItem('theme') || 'light';
let lastCalculationResults = null;

// Helper function to format currency
function formatCurrency(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) {
        return 'Rp 0';
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Helper function to format currency without decimals (legacy)
function formatCurrencyLegacy(amount) {
    return formatCurrency(amount);
}

// Initialize Application
async function init() {
    console.log('InoBill: Initializing...');
    
    // Try to load data from URL first
    const urlDataLoaded = await loadDataFromUrl();
    
    // If no URL data, load from localStorage
    if (!urlDataLoaded) {
        loadData();
    }
    
    setupEventListeners();
    applyTheme();
    loadCardStates();
    renderAll();
    
    console.log('InoBill: Initialized successfully');
}

// Theme Management
function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
    showToast('Theme changed', 'success');
}

// Data Management
function loadData() {
    try {
        const savedData = localStorage.getItem('inobill-data');
        if (savedData) {
            const data = JSON.parse(savedData);
            participants = data.participants || [];
            menuItems = data.menuItems || [];
            additionalCosts = data.additionalCosts || [];
            orders = data.orders || {};
            discount = data.discount || { amount: 0, percentage: 0, type: 'menu' };
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        const firstInput = modal.querySelector('input, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Clear form
        const form = modal.querySelector('form');
        if (form) form.reset();
        
        // Clear all inputs in modal
        const inputs = modal.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'number') {
                input.value = '';
            }
        });
    }
}

function closeModalManually(modalId) {
    closeModal(modalId);
}

// Toast Notifications
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function saveData() {
    try {
        const data = {
            participants,
            menuItems,
            additionalCosts,
            orders,
            discount,
            theme: currentTheme
        };
        localStorage.setItem('inobill-data', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Participant Management
function showAddParticipantModal() {
    showModal('addParticipantModal');
}

function addParticipant() {
    const nameInput = document.getElementById('participantName');
    const name = nameInput.value.trim();
    
    if (!name) {
        showToast('Please enter a name', 'error');
        nameInput.focus();
        return;
    }
    
    if (participants.includes(name)) {
        showToast('Participant already exists', 'warning');
        nameInput.focus();
        return;
    }
    
    participants.push(name);
    orders[name] = [];
    saveData();
    renderParticipants();
    nameInput.value = '';
    nameInput.focus();
    showToast(`${name} added successfully`, 'success');
}

function removeParticipant(name) {
    const index = participants.indexOf(name);
    if (index > -1) {
        participants.splice(index, 1);
        delete orders[name];
        saveData();
        renderParticipants();
        renderOrders();
        showToast(`${name} removed`, 'success');
    }
}

// Menu Management
function showAddMenuModal() {
    showModal('addMenuModal');
}

function addMenuItem() {
    const nameInput = document.getElementById('menuName');
    const priceInput = document.getElementById('menuPrice');
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    
    if (!name) {
        showToast('Please enter item name', 'error');
        nameInput.focus();
        return;
    }
    
    if (isNaN(price) || price < 0) {
        showToast('Please enter valid price', 'error');
        priceInput.focus();
        return;
    }
    
    menuItems.push({ name, price });
    saveData();
    renderMenuItems();
    nameInput.value = '';
    priceInput.value = '';
    nameInput.focus();
    showToast(`${name} added successfully`, 'success');
}

// Additional Costs Management
function showAddCostModal() {
    showModal('addCostModal');
}

function addAdditionalCost() {
    const nameInput = document.getElementById('additionalCostName');
    const amountInput = document.getElementById('additionalCostAmount');
    const typeSelect = document.getElementById('additionalCostType');
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeSelect.value;
    
    if (!name) {
        showToast('Please enter cost name', 'error');
        nameInput.focus();
        return;
    }
    
    if (isNaN(amount) || amount < 0) {
        showToast('Please enter valid amount', 'error');
        amountInput.focus();
        return;
    }
    
    additionalCosts.push({ name, amount, type });
    saveData();
    renderAdditionalCosts();
    nameInput.value = '';
    amountInput.value = '';
    nameInput.focus();
    showToast(`${name} added successfully`, 'success');
}

// Discount Management
function showDiscountModal() {
    // Load current discount values
    document.getElementById('discountAmount').value = discount.amount || '';
    document.getElementById('discountPercentage').value = discount.percentage || '';
    document.getElementById('discountType').value = discount.type || 'menu';
    
    showModal('discountModal');
}

function applyDiscount() {
    const amountInput = document.getElementById('discountAmount');
    const percentageInput = document.getElementById('discountPercentage');
    const typeSelect = document.getElementById('discountType');
    
    const amount = parseFloat(amountInput.value) || 0;
    const percentage = parseFloat(percentageInput.value) || 0;
    const type = typeSelect.value;
    
    if (amount === 0 && percentage === 0) {
        showToast('Please enter discount amount or percentage', 'error');
        amountInput.focus();
        return;
    }
    
    if (percentage > 100) {
        showToast('Discount percentage cannot exceed 100%', 'error');
        percentageInput.focus();
        return;
    }
    
    discount.amount = amount;
    discount.percentage = percentage;
    discount.type = type;
    
    saveData();
    renderDiscount();
    amountInput.value = '';
    percentageInput.value = '';
    amountInput.focus();
    showToast('Discount applied successfully', 'success');
}

function clearDiscount() {
    discount = { amount: 0, percentage: 0, type: 'menu' };
    saveData();
    renderDiscount();
    showToast('Discount cleared', 'success');
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

// Toggle discount fields (mutually exclusive - enforces single discount policy)
function toggleDiscountFields() {
    const discountAmount = document.getElementById('discountAmount');
    const discountPercentage = document.getElementById('discountPercentage');
    const infoDiv = document.getElementById('discountInfo');
    
    if (!discountAmount || !discountPercentage || !infoDiv) return;
    
    const amountValue = parseFloat(discountAmount.value) || 0;
    const percentageValue = parseFloat(discountPercentage.value) || 0;
    
    // Enforce single discount policy
    if (amountValue > 0 && percentageValue > 0) {
        // If both have values, prioritize amount and clear percentage
        discountPercentage.value = '';
        discount.percentage = 0;
        discount.amount = amountValue;
        infoDiv.textContent = 'Hanya satu jenis diskon yang diizinkan. Menggunakan diskon Rp.';
        infoDiv.style.display = 'block';
        infoDiv.style.color = '#f59e0b'; // Warning color
        
        // Show notification
        showNotification('Hanya satu jenis diskon yang diizinkan. Menggunakan diskon Rp.', 'warning');
    } else if (amountValue > 0) {
        // Only amount has value - disable percentage field
        discountPercentage.disabled = true;
        discountPercentage.style.opacity = '0.5';
        discount.percentage = 0;
        discount.amount = amountValue;
        infoDiv.textContent = 'Menggunakan diskon Rp (diskon % dinonaktifkan)';
        infoDiv.style.display = 'block';
        infoDiv.style.color = '#10b981'; // Success color
    } else if (percentageValue > 0) {
        // Only percentage has value - disable amount field
        discountAmount.disabled = true;
        discountAmount.style.opacity = '0.5';
        discount.amount = 0;
        discount.percentage = percentageValue;
        infoDiv.textContent = 'Menggunakan diskon % (diskon Rp dinonaktifkan)';
        infoDiv.style.display = 'block';
        infoDiv.style.color = '#10b981'; // Success color
    } else {
        // Neither has value - enable both fields
        discountAmount.disabled = false;
        discountPercentage.disabled = false;
        discountAmount.style.opacity = '1';
        discountPercentage.style.opacity = '1';
        discount.amount = 0;
        discount.percentage = 0;
        infoDiv.style.display = 'none';
    }
    
    // Safely get custom select value
    try {
        discount.type = getCustomSelectValue('discountType') || 'menu';
    } catch (error) {
        console.warn('InoBill PWA: Error getting discount type, using default');
        discount.type = 'menu';
    }
    
    // Save data and update UI
    saveData();
    renderDiscount();
    
    // Only trigger calculation if there's actually a discount
    if (discount.amount > 0 || discount.percentage > 0) {
    calculateSplit();
    }
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
            <button onclick="removeParticipant('${name}')" class="remove-btn">Hapus</button>
            <span>${name}</span>
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
            <button onclick="removeMenuItem(${index})" class="remove-btn">Hapus</button>
            <span class="name">${item.name}</span>
            <span class="price">${formatCurrency(item.price)}</span>
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
            <button onclick="removeAdditionalCost(${index})" class="remove-btn">Hapus</button>
            <span class="name">${cost.name}</span>
            <span class="amount">${cost.type === 'percentage' ? cost.amount + '%' : formatCurrency(cost.amount)}</span>
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
    
    // Hide calculation process - removed factorHTML for secrecy
    container.innerHTML = resultsHTML + summaryHTML;
    
    // Show action buttons
    const actionButtons = document.getElementById('actionButtons');
    if (actionButtons) {
        actionButtons.style.display = 'flex';
    }
}

// Render discount values to form
function renderDiscount() {
    const discountAmount = document.getElementById('discountAmount');
    const discountPercentage = document.getElementById('discountPercentage');
    
    if (discountAmount && discountPercentage) {
        // Set values from saved data
        discountAmount.value = discount.amount || '';
        discountPercentage.value = discount.percentage || '';
        
        // Set discount type
        try {
            resetCustomSelect('discountType', discount.type || 'menu', 
                discount.type === 'menu' ? 'Setelah Menu' : 'Dari Total Semua');
        } catch (error) {
            console.warn('InoBill PWA: Error setting discount type, using default');
        }
        
        // Update UI state
        toggleDiscountFields();
    }
}

// Render all components
function renderAll() {
    renderParticipants();
    renderMenuItems();
    renderAdditionalCosts();
    renderOrders();
    renderDiscount();
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

// Event Listeners
function setupEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
    
    // Enter key to add items
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            const modal = activeElement.closest('.modal');
            
            if (modal) {
                if (modal.id === 'addParticipantModal') {
                    addParticipant();
                } else if (modal.id === 'addMenuModal') {
                    addMenuItem();
                } else if (modal.id === 'addCostModal') {
                    addAdditionalCost();
                } else if (modal.id === 'discountModal') {
                    applyDiscount();
                }
            }
        }
    });
    
    // Auto-save on changes
    setInterval(saveData, 5000);
}

// Render Functions
function renderParticipants() {
    const container = document.getElementById('participantsList');
    
    if (participants.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">👥</span>
                <p>No participants yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = participants.map(participant => `
        <div class="participant-item fade-in">
            <span>${participant}</span>
            <button class="remove-btn" onclick="removeParticipant('${participant}')">
                <span>🗑️</span>
            </button>
        </div>
    `).join('');
}

function renderMenuItems() {
    const container = document.getElementById('menuList');
    
    if (menuItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🍽️</span>
                <p>No menu items yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = menuItems.map((item, index) => `
        <div class="menu-item fade-in">
            <span class="name">${item.name}</span>
            <span class="price">${formatCurrency(item.price)}</span>
            <button class="remove-btn" onclick="removeMenuItem(${index})">
                <span>🗑️</span>
            </button>
        </div>
    `).join('');
}

function renderAdditionalCosts() {
    const container = document.getElementById('additionalCostsList');
    
    if (additionalCosts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">💰</span>
                <p>No additional costs yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = additionalCosts.map((cost, index) => `
        <div class="additional-cost-item fade-in">
            <span class="name">${cost.name}</span>
            <span class="amount">${cost.type === 'percentage' ? cost.amount + '%' : formatCurrency(cost.amount)}</span>
            <button class="remove-btn" onclick="removeAdditionalCost(${index})">
                <span>🗑️</span>
            </button>
        </div>
    `).join('');
}

function renderDiscount() {
    const container = document.getElementById('discountList');
    
    if (!discount || (discount.amount === 0 && discount.percentage === 0)) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🎯</span>
                <p>Belum ada diskon diterapkan</p>
            </div>
        `;
        return;
    }
    
    // Enforce single discount display (should never show both)
    let discountText = '';
    let discountIcon = '';
    
    if (discount.amount > 0) {
        discountText = formatCurrency(discount.amount);
        discountIcon = '💰';
    } else if (discount.percentage > 0) {
        discountText = `${discount.percentage}%`;
        discountIcon = '📊';
    }
    
    const typeText = discount.type === 'menu' ? 'Setelah Menu' : 'Dari Total Semua';
    
    container.innerHTML = `
        <div class="discount-item fade-in">
            <span class="name">
                ${discountIcon} Diskon (${typeText})
                <small style="display: block; color: #666; font-size: 0.8em; margin-top: 2px;">
                    Hanya 1 diskon aktif
                </small>
            </span>
            <span class="amount" style="color: #10b981; font-weight: 600;">
                ${discountText}
            </span>
            <button class="remove-btn" onclick="clearDiscount()" title="Hapus diskon">
                <span>🗑️</span>
            </button>
        </div>
    `;
}

function renderOrders() {
    const container = document.getElementById('ordersList');
    
    if (participants.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📋</span>
                <p>Add participants first</p>
            </div>
        `;
        return;
    }
    
    if (menuItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📋</span>
                <p>Add menu items first</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = participants.map(participant => {
        const participantOrders = orders[participant] || [];
        const total = calculateParticipantTotal(participant);
        
        return `
            <div class="participant-orders">
                <h4>${participant} ${total > 0 ? `(${formatCurrency(total)})` : ''}</h4>
                <div class="order-items">
                    ${menuItems.map((item, index) => {
                        const existingOrder = participantOrders.find(o => o.type === 'menu' && o.index === index);
                        const quantity = existingOrder ? existingOrder.quantity || 1 : 0;
                        const isSelected = quantity > 0;
                        
                        return `
                            <div class="order-item ${isSelected ? 'selected' : ''}">
                                <div class="order-checkbox">
                                    <input type="checkbox" 
                                           ${isSelected ? 'checked' : ''}
                                           onchange="toggleOrder('${participant}', 'menu', ${index})">
                                </div>
                                <div class="order-details">
                                    <span class="name">${item.name}</span>
                                    <span class="price">${formatCurrency(item.price)}</span>
                                </div>
                                <div class="quantity-controls" style="display: ${isSelected ? 'flex' : 'none'}">
                                    <button onclick="decreaseQuantity('${participant}', ${index})" class="qty-btn">-</button>
                                    <input type="number" 
                                           value="${quantity}" 
                                           min="1" 
                                           max="99"
                                           onchange="updateQuantity('${participant}', ${index}, this.value)"
                                           class="qty-input">
                                    <button onclick="increaseQuantity('${participant}', ${index})" class="qty-btn">+</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderAll() {
    renderParticipants();
    renderMenuItems();
    renderAdditionalCosts();
    renderDiscount();
    renderOrders();
}

// Remove Functions
function removeMenuItem(index) {
    const item = menuItems[index];
    menuItems.splice(index, 1);
    
    // Remove from all orders and adjust indices
    Object.keys(orders).forEach(participant => {
        orders[participant] = orders[participant]
            .filter(order => !(order.type === 'menu' && order.index === index))
            .map(order => {
                if (order.type === 'menu' && order.index > index) {
                    return { ...order, index: order.index - 1 };
                }
                return order;
            });
    });
    
    saveData();
    renderMenuItems();
    renderOrders();
    showToast(`${item.name} removed`, 'success');
}

function removeAdditionalCost(index) {
    const cost = additionalCosts[index];
    additionalCosts.splice(index, 1);
    
    saveData();
    renderAdditionalCosts();
    renderOrders();
    showToast(`${cost.name} removed`, 'success');
}

// Order Management
function toggleOrder(participant, itemType, itemIndex) {
    if (!orders[participant]) {
        orders[participant] = [];
    }
    
    // Only handle menu items, not additional costs
    if (itemType !== 'menu') {
        return;
    }
    
    const existingIndex = orders[participant].findIndex(order => 
        order.type === itemType && order.index === itemIndex
    );
    
    if (existingIndex !== -1) {
        // Remove order
        orders[participant].splice(existingIndex, 1);
    } else {
        // Add order with quantity 1
        orders[participant].push({ type: itemType, index: itemIndex, quantity: 1 });
    }
    
    saveData();
    renderOrders();
}

function increaseQuantity(participant, itemIndex) {
    if (!orders[participant]) {
        orders[participant] = [];
    }
    
    const existingIndex = orders[participant].findIndex(order => 
        order.type === 'menu' && order.index === itemIndex
    );
    
    if (existingIndex !== -1) {
        orders[participant][existingIndex].quantity = Math.min(99, (orders[participant][existingIndex].quantity || 1) + 1);
    } else {
        orders[participant].push({ type: 'menu', index: itemIndex, quantity: 1 });
    }
    
    saveData();
    renderOrders();
}

function decreaseQuantity(participant, itemIndex) {
    if (!orders[participant]) {
        return;
    }
    
    const existingIndex = orders[participant].findIndex(order => 
        order.type === 'menu' && order.index === itemIndex
    );
    
    if (existingIndex !== -1) {
        const currentQuantity = orders[participant][existingIndex].quantity || 1;
        if (currentQuantity > 1) {
            orders[participant][existingIndex].quantity = currentQuantity - 1;
        } else {
            // Remove order if quantity becomes 0
            orders[participant].splice(existingIndex, 1);
        }
    }
    
    saveData();
    renderOrders();
}

function updateQuantity(participant, itemIndex, newQuantity) {
    if (!orders[participant]) {
        orders[participant] = [];
    }
    
    const quantity = parseInt(newQuantity) || 1;
    
    if (quantity <= 0) {
        // Remove order
        const existingIndex = orders[participant].findIndex(order => 
            order.type === 'menu' && order.index === itemIndex
        );
        if (existingIndex !== -1) {
            orders[participant].splice(existingIndex, 1);
        }
    } else {
        // Update or add order
        const existingIndex = orders[participant].findIndex(order => 
            order.type === 'menu' && order.index === itemIndex
        );
        
        if (existingIndex !== -1) {
            orders[participant][existingIndex].quantity = Math.min(99, quantity);
        } else {
            orders[participant].push({ type: 'menu', index: itemIndex, quantity: Math.min(99, quantity) });
        }
    }
    
    saveData();
    renderOrders();
}

function calculateParticipantTotal(participant) {
    const participantOrders = orders[participant] || [];
    let total = 0;
    
    // Calculate menu items total
    participantOrders.forEach(order => {
        if (order.type === 'menu') {
            const itemPrice = menuItems[order.index]?.price || 0;
            const quantity = order.quantity || 1;
            total += itemPrice * quantity;
        }
    });
    
    return total;
}

function calculateSplit() {
    if (participants.length === 0) {
        showToast('Add participants first', 'warning');
        return;
    }
    
    if (menuItems.length === 0) {
        showToast('Add menu items first', 'warning');
        return;
    }
    
    // Calculate individual costs (original menu prices)
    const individualCosts = {};
    let totalFoodCost = 0;
    
    participants.forEach(participant => {
        let cost = 0;
        const participantOrders = orders[participant] || [];
        
        participantOrders.forEach(order => {
            if (order.type === 'menu') {
                const itemPrice = menuItems[order.index]?.price || 0;
                const quantity = order.quantity || 1;
                cost += itemPrice * quantity;
                totalFoodCost += itemPrice * quantity;
            }
        });
        
        individualCosts[participant] = cost;
    });
    
    // Calculate additional costs
    let totalAdditionalCosts = 0;
    const additionalCostsBreakdown = {};
    
    additionalCosts.forEach(cost => {
        let costValue = 0;
        if (cost.type === 'percentage') {
            costValue = (totalFoodCost * cost.amount) / 100;
        } else {
            costValue = cost.amount;
        }
        additionalCostsBreakdown[cost.name] = costValue;
        totalAdditionalCosts += costValue;
    });
    
    // Calculate discount
    let totalDiscount = 0;
    let foodAfterDiscount = totalFoodCost;
    let additionalCostsAfterDiscount = totalAdditionalCosts;
    
    if (discount && (discount.amount > 0 || discount.percentage > 0)) {
        if (discount.amount > 0) {
            // Use amount (Rp)
            totalDiscount = discount.amount;
            
            if (discount.type === 'menu') {
                // Discount only from food
                foodAfterDiscount = Math.max(0, totalFoodCost - totalDiscount);
                additionalCostsAfterDiscount = totalAdditionalCosts;
            } else {
                // Discount from total bill, proportional distribution
                const totalBillBeforeDiscount = totalFoodCost + totalAdditionalCosts;
                const foodDiscountRatio = totalFoodCost / totalBillBeforeDiscount;
                const additionalCostDiscountRatio = totalAdditionalCosts / totalBillBeforeDiscount;
                
                foodAfterDiscount = Math.max(0, totalFoodCost - (totalDiscount * foodDiscountRatio));
                additionalCostsAfterDiscount = Math.max(0, totalAdditionalCosts - (totalDiscount * additionalCostDiscountRatio));
            }
        } else if (discount.percentage > 0) {
            // Use percentage (%)
            if (discount.type === 'menu') {
                totalDiscount = (totalFoodCost * discount.percentage) / 100;
                foodAfterDiscount = Math.max(0, totalFoodCost - totalDiscount);
                additionalCostsAfterDiscount = totalAdditionalCosts;
            } else {
                const totalBillBeforeDiscount = totalFoodCost + totalAdditionalCosts;
                totalDiscount = (totalBillBeforeDiscount * discount.percentage) / 100;
                const foodDiscountRatio = totalFoodCost / totalBillBeforeDiscount;
                const additionalCostDiscountRatio = totalAdditionalCosts / totalBillBeforeDiscount;
                
                foodAfterDiscount = Math.max(0, totalFoodCost - (totalDiscount * foodDiscountRatio));
                additionalCostsAfterDiscount = Math.max(0, totalAdditionalCosts - (totalDiscount * additionalCostDiscountRatio));
            }
        }
    }
    
    // Calculate factor = (total food after discount + total additional costs after discount) / total food cost
    const factor = totalFoodCost > 0 ? (foodAfterDiscount + additionalCostsAfterDiscount) / totalFoodCost : 1;
    
    // Calculate menu subtotals and quantities for breakdown
    const menuSubtotals = {};
    const menuQuantities = {};
    const menuItemDiscounts = {};
    
    menuItems.forEach(item => {
        // Count total quantity of this item
        let itemQuantity = 0;
        participants.forEach(participant => {
            const participantOrders = orders[participant] || [];
            participantOrders.forEach(order => {
                if (order.type === 'menu' && order.index === menuItems.indexOf(item)) {
                    itemQuantity += order.quantity || 1;
                }
            });
        });
        
        menuQuantities[item.name] = itemQuantity;
        menuSubtotals[item.name] = item.price * itemQuantity;
        menuItemDiscounts[item.name] = item.price * factor;
    });
    
    // Calculate final amounts using factor
    const finalAmounts = {};
    let grandTotal = 0;
    
    participants.forEach(participant => {
        const originalCost = individualCosts[participant];
        const adjustedCost = originalCost * factor;
        finalAmounts[participant] = adjustedCost;
        grandTotal += adjustedCost;
    });
    
    // Create results array for display
    const results = participants.map(participant => ({
        participant,
        amount: finalAmounts[participant],
        orders: orders[participant] || []
    }));
    
    displayResults(results, grandTotal, {
        totalFoodCost: foodAfterDiscount,
        additionalCostsBreakdown,
        totalDiscount,
        totalAdditionalCosts: additionalCostsAfterDiscount,
        grandTotal,
        factor,
        menuSubtotals,
        menuQuantities,
        menuItemDiscounts
    });
}

// Calculation and Results
// Function calculateSplit already defined above with correct calculation

function displayResults(results, totalBill, summary = null) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('results');
    
    // Create breakdown of additional costs
    const additionalCostsText = summary && summary.additionalCostsBreakdown ? 
        Object.entries(summary.additionalCostsBreakdown)
            .map(([name, value]) => `${name}: ${formatCurrency(value)}`)
            .join('<br>') : '';
    
    // Create detailed menu breakdown with factor calculation
    const menuBreakdown = summary && summary.menuSubtotals ? 
        Object.entries(summary.menuSubtotals)
            .map(([name, subtotal]) => {
                const qty = summary.menuQuantities[name] || 0;
                const originalPrice = menuItems.find(item => item.name === name)?.price || 0;
                const newPrice = summary.menuItemDiscounts[name] || 0;
                const factor = summary.factor || 1;
                return `
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                        <div>
                            <strong style="color: #2c5aa0;">${name}</strong><br>
                            <small style="color: #666;">Qty: ${qty} × ${formatCurrency(originalPrice)}</small><br>
                            <small style="color: #666;">Subtotal: ${formatCurrency(subtotal)}</small>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #666; font-size: 0.8em;">Faktor: ${factor.toFixed(4)}</div><br>
                            <div style="color: #2c5aa0; font-weight: bold;">Harga Baru: ${formatCurrency(newPrice)}</div>
                        </div>
                    </div>
                `;
            }).join('') : '';
    
    // Get discount type for display
    const discountType = discount ? discount.type : 'menu';
    const discountTypeText = discountType === 'menu' ? 'Menu' : 'Total Semua';
    
    // Create calculation breakdown based on discount type
    let calculationBreakdown = '';
    
    if (discountType === 'menu') {
        // For menu-only discount: show original food, then discount, then additional costs
        const originalFoodCost = summary.totalFoodCost + summary.totalDiscount;
        calculationBreakdown = `
            <div style="padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 8px; border-left: 4px solid #007bff;">
                <div style="font-weight: 600; color: #007bff; margin-bottom: 12px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🧮</span>
                    Rincian Perhitungan
                </div>
                <div style="font-size: 0.9em; line-height: 1.6;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Total Makanan:</span>
                        <span style="font-weight: 600;">${formatCurrency(originalFoodCost)}</span>
                    </div>
                    ${summary.totalDiscount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ff6b6b;">
                            <span>Diskon (Menu):</span>
                            <span style="font-weight: 600;">-${formatCurrency(summary.totalDiscount)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-top: 8px; border-top: 1px solid #dee2e6;">
                            <span style="font-weight: 600;">Makanan Setelah Diskon:</span>
                            <span style="font-weight: 600; color: #28a745;">${formatCurrency(summary.totalFoodCost)}</span>
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Biaya Tambahan:</span>
                        <span style="font-weight: 600;">${formatCurrency(summary.totalAdditionalCosts)}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        // For total-bill discount: show original total, then discount
        const originalFoodCost = summary.totalFoodCost + (summary.totalDiscount * (summary.totalFoodCost / (summary.totalFoodCost + summary.totalAdditionalCosts)));
        const originalAdditionalCost = summary.totalAdditionalCosts + (summary.totalDiscount * (summary.totalAdditionalCosts / (summary.totalFoodCost + summary.totalAdditionalCosts)));
        const originalTotal = originalFoodCost + originalAdditionalCost;
        
        calculationBreakdown = `
            <div style="padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 8px; border-left: 4px solid #007bff;">
                <div style="font-weight: 600; color: #007bff; margin-bottom: 12px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🧮</span>
                    Rincian Perhitungan
                </div>
                <div style="font-size: 0.9em; line-height: 1.6;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Total Makanan:</span>
                        <span style="font-weight: 600;">${formatCurrency(originalFoodCost)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Biaya Tambahan:</span>
                        <span style="font-weight: 600;">${formatCurrency(originalAdditionalCost)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-top: 8px; border-top: 1px solid #dee2e6;">
                        <span style="font-weight: 600;">Subtotal:</span>
                        <span style="font-weight: 600; color: #007bff;">${formatCurrency(originalTotal)}</span>
                    </div>
                    ${summary.totalDiscount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ff6b6b;">
                            <span>Diskon (Total Semua):</span>
                            <span style="font-weight: 600;">-${formatCurrency(summary.totalDiscount)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #dee2e6;">
                            <span style="font-weight: 600;">Total Setelah Diskon:</span>
                            <span style="font-weight: 600; color: #28a745;">${formatCurrency(summary.grandTotal)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    resultsContainer.innerHTML = `
        <div class="results-list">
            ${results.map(result => {
                // Generate list of ordered items
                const orderedItems = result.orders
                    .filter(order => order.type === 'menu')
                    .map(order => {
                        const item = menuItems[order.index];
                        const quantity = order.quantity || 1;
                        return `${item.name} (${quantity}x)`;
                    })
                    .join(', ');
                
                return `
                    <div class="participant-result fade-in" data-participant="${result.participant}">
                        <div class="participant-info">
                            <div class="participant-name">${result.participant}</div>
                            <div class="participant-items">
                                ${orderedItems || 'Tidak ada pesanan'}
                            </div>
                        </div>
                        <div class="participant-amount">
                            ${formatCurrency(result.amount)}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="total-summary">
            <h3>Total Tagihan</h3>
            <div class="total-amount">${formatCurrency(totalBill)}</div>
            <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; border: 1px solid #dee2e6;">
                ${calculationBreakdown}
                <div style="margin-top: 20px; padding: 15px; background: rgba(40, 167, 69, 0.1); border-radius: 8px; border-left: 4px solid #28a745;">
                    <div style="font-weight: 600; color: #28a745; margin-bottom: 8px; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">📊</span>
                        Ringkasan Pembagian
                    </div>
                    <div style="font-size: 0.9em; line-height: 1.6; color: #666;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>Jumlah Peserta:</span>
                            <span style="font-weight: 600;">${participants.length} orang</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>Rata-rata per orang:</span>
                            <span style="font-weight: 600;">${formatCurrency(totalBill / participants.length)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Faktor pembagi:</span>
                            <span style="font-weight: 600; color: #28a745;">${summary.factor?.toFixed(4) || '1.0000'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Store calculation results for print
    lastCalculationResults = {
        results: results,
        totalBill: totalBill,
        summary: summary,
        timestamp: new Date()
    };
    
    showToast('Bill calculated successfully', 'success');
}

// Print and Share
function printBill() {
    if (participants.length === 0) {
        showToast('Add participants first', 'warning');
        return;
    }
    
    if (!lastCalculationResults) {
        showToast('Calculate bill first', 'warning');
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
                    font-size: 12px;
                    margin-top: 8px;
                }
                .summary-section {
                    margin-top: 20px;
                    padding: 10px;
                    background: #f8fafc;
                    border-radius: 4px;
                    border: 1px solid #e5e7eb;
                }
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 11px;
                }
                .summary-item:last-child {
                    border-bottom: none;
                    font-weight: 700;
                    color: #0174BE;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
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
    
    showToast('Bill berhasil dicetak!', 'success');
}

function shareBill() {
    if (navigator.share) {
        const results = generateShareText();
        navigator.share({
            title: 'InoBill - Bill Split',
            text: results,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        const results = generateShareText();
        navigator.clipboard.writeText(results).then(() => {
            showToast('Bill details copied to clipboard', 'success');
        });
    }
}

function generateCompactBillContent() {
    const currentDate = new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Check if we have stored calculation results
    if (!lastCalculationResults) {
        return `
            <div class="header">
                <h1>🍽️ InoBill</h1>
                <p>Split Bill Calculator - Dibuat oleh InoTechno</p>
            </div>
            <div class="bill-info">
                <p><strong>Tanggal:</strong> ${currentDate}</p>
            </div>
            <div style="text-align: center; padding: 40px; color: #666;">
                <h2>Belum ada data untuk dicetak</h2>
                <p>Silakan hitung tagihan terlebih dahulu</p>
            </div>
        `;
    }
    
    // Use stored calculation results
    const { results, totalBill, summary } = lastCalculationResults;
    
    // Debug: Log the data to see what we have
    console.log('Print data:', { 
        results, 
        totalBill, 
        summary,
        participants: participants.length,
        menuItems: menuItems.length,
        additionalCosts: additionalCosts.length,
        orders: Object.keys(orders).length
    });
    
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
    
    // Add participant details
    if (results && results.length > 0) {
        results.forEach(result => {
            content += `
                <div class="participant-section">
                    <div class="participant-header">
                        👤 ${result.participant}
                    </div>
                    <div class="participant-details">
            `;
            
            // Add ordered items
            const participantOrders = result.orders || [];
            if (participantOrders.length > 0) {
                participantOrders.forEach(order => {
                    if (order.type === 'menu' && menuItems[order.index]) {
                        const menuItem = menuItems[order.index];
                        const quantity = order.quantity || 1;
                        const itemTotal = menuItem.price * quantity;
                        content += `
                            <div class="order-item">
                                <span class="order-name">${menuItem.name} (${quantity}x)</span>
                                <span class="order-price">${formatCurrency(itemTotal)}</span>
                            </div>
                        `;
                    }
                });
            } else {
                content += `
                    <div class="order-item">
                        <span class="order-name">Tidak ada pesanan</span>
                        <span class="order-price">${formatCurrency(0)}</span>
                    </div>
                `;
            }
            
            content += `
                        <div class="total-amount">
                            Total: ${formatCurrency(result.amount || 0)}
                        </div>
                    </div>
                </div>
            `;
        });
    } else {
        content += `
            <div class="participant-section">
                <div class="participant-header">
                    👤 Tidak ada peserta
                </div>
                <div class="participant-details">
                    <div class="order-item">
                        <span class="order-name">Tidak ada data</span>
                        <span class="order-price">${formatCurrency(0)}</span>
                    </div>
                    <div class="total-amount">
                        Total: ${formatCurrency(0)}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Add summary section with better validation
    const totalFoodCost = summary?.totalFoodCost || 0;
    const totalAdditionalCosts = summary?.totalAdditionalCosts || 0;
    const totalDiscount = summary?.totalDiscount || 0;
    const grandTotal = totalBill || 0;
    
    content += `
        <div class="summary-section">
            <h3 style="margin-bottom: 10px; color: #0174BE; font-size: 14px;">Ringkasan</h3>
            <div class="summary-item">
                <span>Total Menu:</span>
                <span>${formatCurrency(totalFoodCost)}</span>
            </div>
            <div class="summary-item">
                <span>Total Biaya Tambahan:</span>
                <span>${formatCurrency(totalAdditionalCosts)}</span>
            </div>
            <div class="summary-item">
                <span>Total Diskon:</span>
                <span style="color: #10b981;">-${formatCurrency(totalDiscount)}</span>
            </div>
            <div class="summary-item">
                <span><strong>Grand Total:</strong></span>
                <span><strong>${formatCurrency(grandTotal)}</strong></span>
            </div>
        </div>
        
        <div class="footer">
            <p>InoBill PWA - InoTechno</p>
        </div>
    `;
    
    return content;
}

function generatePrintContent() {
    const currentDate = new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Check if we have stored calculation results
    if (!lastCalculationResults) {
        return `
            <div class="header">
                <h1>InoBill - Bill Receipt</h1>
                <p>Split Bill Calculator</p>
                <p>Tanggal: ${currentDate}</p>
            </div>
            <div style="text-align: center; padding: 40px; color: #666;">
                <h2>Belum ada data untuk dicetak</h2>
                <p>Silakan hitung tagihan terlebih dahulu</p>
            </div>
        `;
    }
    
    // Use stored calculation results
    const { results, totalBill, summary } = lastCalculationResults;
    
    // Calculate additional costs breakdown
    let additionalCostsBreakdown = '';
    if (additionalCosts.length > 0) {
        additionalCostsBreakdown = additionalCosts.map(cost => {
            if (cost.type === 'percentage') {
                const allMenuTotal = participants.reduce((sum, p) => {
                    const participantOrders = orders[p] || [];
                    return sum + participantOrders
                        .filter(o => o.type === 'menu')
                        .reduce((menuSum, o) => menuSum + (menuItems[o.index]?.price || 0), 0);
                }, 0);
                const costAmount = (allMenuTotal * cost.amount) / 100;
                return `<div class="breakdown-item"><span>${cost.name} (${cost.amount}%)</span><span>${formatCurrency(costAmount)}</span></div>`;
            } else {
                return `<div class="breakdown-item"><span>${cost.name}</span><span>${formatCurrency(cost.amount)}</span></div>`;
            }
        }).join('');
    }
    
    return `
        <div class="header">
            <h1>InoBill - Bill Receipt</h1>
            <p>Split Bill Calculator</p>
            <p>Tanggal: ${currentDate}</p>
        </div>
        
        <div class="participants">
            ${results.map(result => {
                // Calculate original food cost for this participant
                const participantOrders = result.orders || [];
                let foodCost = 0;
                participantOrders.forEach(order => {
                    if (order.type === 'menu') {
                        const itemPrice = menuItems[order.index]?.price || 0;
                        const quantity = order.quantity || 1;
                        foodCost += itemPrice * quantity;
                    }
                });
                
                return `
                    <div class="participant">
                        <div class="participant-name">${result.participant}</div>
                        <div class="participant-details">
                            Makanan: ${formatCurrency(foodCost)}
                        </div>
                        <div class="participant-amount">${formatCurrency(result.amount)}</div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="total-summary">
            <h2>Total Tagihan</h2>
            <div class="total-amount">${formatCurrency(totalBill)}</div>
        </div>
        
        ${additionalCostsBreakdown ? `
            <div class="breakdown">
                <h3>Detail Biaya Tambahan</h3>
                ${additionalCostsBreakdown}
            </div>
        ` : ''}
        
        <div class="breakdown">
            <h3>Ringkasan Pembagian</h3>
            <div class="breakdown-item">
                <span>Jumlah Peserta:</span>
                <span>${participants.length} orang</span>
            </div>
            <div class="breakdown-item">
                <span>Rata-rata per orang:</span>
                <span>${formatCurrency(totalBill / participants.length)}</span>
            </div>
        </div>
        
        <div class="footer">
            <p>Dibuat dengan InoBill - Split Bill Calculator</p>
            <p>© ${new Date().getFullYear()} InoTechno</p>
        </div>
    `;
}

function generateShareText() {
    let text = 'InoBill - Bill Split Results\n\n';
    
    // Show additional costs if any
    if (additionalCosts.length > 0) {
        text += 'Additional Costs:\n';
        additionalCosts.forEach(cost => {
            if (cost.type === 'percentage') {
                text += `- ${cost.name}: ${cost.amount}%\n`;
            } else {
                text += `- ${cost.name}: ${formatCurrency(cost.amount)}\n`;
            }
        });
        text += '\n';
    }
    
    participants.forEach(participant => {
        const total = calculateParticipantTotal(participant);
        text += `${participant}: ${formatCurrency(total)}\n`;
    });
    
    const grandTotal = participants.reduce((sum, participant) => sum + calculateParticipantTotal(participant), 0);
    text += `\nTotal: ${formatCurrency(grandTotal)}`;
    
    return text;
}

// Import/Export
function importJsonFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    participants = data.participants || [];
                    menuItems = data.menuItems || [];
                    additionalCosts = data.additionalCosts || [];
                    orders = data.orders || {};
                    discount = data.discount || { amount: 0, percentage: 0, type: 'menu' };
                    
                    saveData();
                    renderAll();
                    showToast('Data imported successfully', 'success');
                } catch (error) {
                    showToast('Error importing file', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Reset all data
async function resetAllData() {
    const result = await Swal.fire({
        title: '🔄 Reset All Data',
        html: `
            <div style="text-align: left; margin: 20px 0;">
                <p style="margin-bottom: 15px; font-size: 16px; color: #374151;">
                    Are you sure you want to clear all data?
                </p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 0; font-weight: 600; color: #ef4444; margin-bottom: 10px;">Data that will be deleted:</p>
                    <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                        <li>All participants</li>
                        <li>All menu items</li>
                        <li>All additional costs</li>
                        <li>All orders</li>
                        <li>All discounts</li>
                    </ul>
                </div>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Reset All',
        cancelButtonText: 'Cancel',
        reverseButtons: true
    });
    
    if (result.isConfirmed) {
        // Reset all data
        participants = [];
        menuItems = [];
        additionalCosts = [];
        orders = {};
        discount = { amount: 0, percentage: 0, type: 'menu' };
        
        // Save and render
        saveData();
        renderAll();
        
        // Hide results section
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
        
        showToast('All data has been reset', 'success');
    }
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Remove legacy function
function formatCurrencyLegacy(amount) {
    return formatCurrency(amount);
}

// Global functions for HTML onclick handlers
window.showAddParticipantModal = showAddParticipantModal;
window.showAddMenuModal = showAddMenuModal;
window.showAddCostModal = showAddCostModal;
window.showDiscountModal = showDiscountModal;
window.addParticipant = addParticipant;
window.addMenuItem = addMenuItem;
window.addAdditionalCost = addAdditionalCost;
window.applyDiscount = applyDiscount;
window.removeParticipant = removeParticipant;
window.removeMenuItem = removeMenuItem;
window.removeAdditionalCost = removeAdditionalCost;
window.toggleOrder = toggleOrder;
window.calculateSplit = calculateSplit;
window.printBill = printBill;
window.shareBill = shareBill;
window.importJsonFile = importJsonFile;
window.resetAllData = resetAllData;
window.toggleTheme = toggleTheme;
window.closeModal = closeModal;

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

    // Create simple print content
    const printContent = generateSimplePrintContent();
    
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
                    font-family: Arial, sans-serif;
                    line-height: 1.3;
                    color: #333;
                    background: white;
                    padding: 15px;
                    font-size: 12px;
                    margin: 0;
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
                    margin: 3px 0 0 0;
                    font-size: 11px;
                }
                .bill-info {
                    background: #f8fafc;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 15px;
                    border-left: 3px solid #0174BE;
                    font-size: 11px;
                }
                .bill-info p {
                    margin: 2px 0;
                }
                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    font-size: 11px;
                }
                .print-table th,
                .print-table td {
                    border: 1px solid #ddd;
                    padding: 6px 8px;
                    text-align: left;
                    vertical-align: top;
                }
                .print-table th {
                    background-color: #0174BE;
                    color: white;
                    font-weight: 600;
                    text-align: center;
                    font-size: 11px;
                }
                .print-table td {
                    background-color: white;
                }
                .print-table tr:nth-child(even) td {
                    background-color: #f9f9f9;
                }
                .print-table td:first-child {
                    font-weight: 500;
                    background-color: #f0f8ff;
                    text-align: right;
                    vertical-align: middle;
                }
                .print-table td:nth-child(2) {
                    text-align: right;
                }
                .print-table td:nth-child(3),
                .print-table td:nth-child(4),
                .print-table td:nth-child(5) {
                    text-align: right;
                }
                .print-table td:last-child {
                    vertical-align: middle;
                }
                .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    font-size: 11px;
                }
                .summary-table td {
                    border: 1px solid #ddd;
                    padding: 6px 8px;
                    text-align: left;
                }
                .summary-table td:last-child {
                    text-align: right;
                    font-weight: 600;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #ddd;
                    color: #666;
                    font-size: 10px;
                }
                @media print {
                    body { margin: 0; padding: 10px; }
                    @page { 
                        margin: 0.3in; 
                        size: A4;
                    }
                    .print-table { 
                        page-break-inside: avoid; 
                        font-size: 10px;
                    }
                    .print-table th,
                    .print-table td { 
                        font-size: 9px; 
                        padding: 4px 6px; 
                    }
                    .summary-table {
                        page-break-inside: avoid;
                        font-size: 10px;
                    }
                    .summary-table td {
                        font-size: 9px;
                        padding: 4px 6px;
                    }
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
async function shareBill() {
    if (participants.length === 0) {
        showError('Error', 'Belum ada peserta yang ditambahkan');
        return;
    }

    if (!lastCalculationResults) {
        showError('Error', 'Hitung tagihan terlebih dahulu');
        return;
    }

    try {
        // Generate shareable URL
        const shareUrl = await generateShareableLink();
        
        // Create share text
        const shareText = `🍽️ InoBill - Split Bill Receipt\n\nLihat detail lengkap di: ${shareUrl}`;
        
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
                fallbackShare(shareText);
            });
        } else {
            // Fallback to copy to clipboard
            fallbackShare(shareText);
        }
    } catch (error) {
        console.error('Error in shareBill:', error);
        showError('Error', 'Gagal membagikan bill');
    }
}

// Share as Text
function shareAsText() {
    const shareText = generateShareText();
    
    if (navigator.share) {
        // Use native share API if available
        navigator.share({
            title: 'InoBill - Split Bill Receipt',
            text: shareText
        }).then(() => {
            showNotification('Bill berhasil dibagikan!', 'success');
        }).catch((error) => {
            console.log('Error sharing:', error);
            fallbackShare(shareText);
        });
    } else {
        // Fallback to copy to clipboard
        fallbackShare(shareText);
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
async function shareAsUrl() {
    try {
        const shareUrl = await generateShareableLink();
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
    } catch (error) {
        console.error('Error in shareAsUrl:', error);
        showError('Error', 'Gagal membagikan link');
    }
}

// Share as JSON File
function shareAsJson() {
    if (participants.length === 0) {
        showError('Error', 'Belum ada peserta yang ditambahkan');
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
            discount: discount
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
function fallbackShare(shareText) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
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
        textArea.value = shareText;
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

    if (!lastCalculationResults) {
        showError('Error', 'Hitung tagihan terlebih dahulu');
        return;
    }

    // Direct download as JSON
    shareAsJson();
}

// Share as Image Function
async function shareAsImage() {
    if (participants.length === 0) {
        showError('Error', 'Belum ada peserta yang ditambahkan');
        return;
    }

    if (!lastCalculationResults) {
        showError('Error', 'Hitung tagihan terlebih dahulu');
        return;
    }

    try {
        // Show loading
        showLoading('Generating Image...', 'Creating bill image for sharing');

        // Create temporary container for image generation
        const tempContainer = document.createElement('div');
        tempContainer.id = 'temp-image-container';
        tempContainer.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            width: 800px;
            background: white;
            padding: 20px;
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.4;
        `;

        // Generate the same content as print
        const printContent = generateSimplePrintContent();
        tempContainer.innerHTML = printContent;

        // Add styles for image generation
        const style = document.createElement('style');
        style.textContent = `
            #temp-image-container .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #0174BE;
            }
            #temp-image-container .header h1 {
                color: #0174BE;
                margin: 0;
                font-size: 24px;
            }
            #temp-image-container .header p {
                color: #666;
                margin: 5px 0 0 0;
                font-size: 14px;
            }
            #temp-image-container .bill-info {
                background: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #0174BE;
                font-size: 13px;
            }
            #temp-image-container .bill-info p {
                margin: 3px 0;
            }
            #temp-image-container .print-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 12px;
            }
            #temp-image-container .print-table th,
            #temp-image-container .print-table td {
                border: 1px solid #ddd;
                padding: 8px 10px;
                text-align: left;
                vertical-align: top;
            }
            #temp-image-container .print-table th {
                background-color: #0174BE;
                color: white;
                font-weight: 600;
                text-align: center;
                font-size: 12px;
            }
            #temp-image-container .print-table td {
                background-color: white;
            }
            #temp-image-container .print-table tr:nth-child(even) td {
                background-color: #f9f9f9;
            }
            #temp-image-container .print-table td:first-child {
                font-weight: 500;
                background-color: #f0f8ff;
                text-align: right;
                vertical-align: middle;
            }
            #temp-image-container .print-table td:nth-child(2),
            #temp-image-container .print-table td:nth-child(3),
            #temp-image-container .print-table td:nth-child(4),
            #temp-image-container .print-table td:nth-child(5) {
                text-align: right;
            }
            #temp-image-container .summary-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                font-size: 12px;
            }
            #temp-image-container .summary-table td {
                border: 1px solid #ddd;
                padding: 8px 10px;
                text-align: left;
            }
            #temp-image-container .summary-table td:last-child {
                text-align: right;
                font-weight: 600;
            }
            #temp-image-container .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 11px;
            }
        `;
        tempContainer.appendChild(style);
        document.body.appendChild(tempContainer);

        // Generate image using html2canvas
        const canvas = await html2canvas(tempContainer, {
            width: 800,
            height: tempContainer.scrollHeight,
            scale: 2, // Higher quality
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: true
        });

        // Clean up temporary container
        document.body.removeChild(tempContainer);

        // Convert canvas to blob
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png', 0.95);
        });

        // Create filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `inobill-receipt-${timestamp}.png`;

        // Direct download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Bill image berhasil didownload!', 'success');

    } catch (error) {
        console.error('Error generating image:', error);
        showError('Error', 'Gagal membuat gambar bill. Silakan coba lagi.');
    }
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
        
        // Hide factor calculation info for secrecy
        content += `
            <div class="order-item" style="border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 10px;">
                <span class="order-name">Subtotal Makanan:</span>
                <span class="order-price">${formatCurrency(result.originalAmount)}</span>
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
    
    // Create table for participant details (factor column hidden for secrecy)
    content += `
        <table class="bill-table">
            <thead>
                <tr>
                    <th>Peserta</th>
                    <th>Menu</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Subtotal</th>
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
                    <td>0</td>
                </tr>
            `;
        }
    });
    
    content += `
            </tbody>
        </table>
    `;
    
    // Add participant totals table
    content += `
        <table class="bill-table" style="margin: 20px 0;">
            <thead>
                <tr>
                    <th style="background-color: #0174BE; color: white; font-weight: 600;">Peserta</th>
                    <th style="background-color: #0174BE; color: white; font-weight: 600;">Total Bayar</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Add each participant's total
    billData.results.forEach(result => {
        content += `
            <tr>
                <td style="font-weight: 600; background-color: #f0f8ff;">${result.participant}</td>
                <td style="text-align: right; font-weight: 700; color: #0174BE;">${formatCurrency(result.adjustedAmount)}</td>
            </tr>
        `;
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
    if (!lastCalculationResults) {
        return 'Belum ada data untuk dibagikan';
    }
    
    const { results, totalBill, summary } = lastCalculationResults;
    const currentDate = new Date().toLocaleDateString('id-ID');
    
    if (results.length === 0) {
        return 'Belum ada data untuk dibagikan';
    }
    
    let text = `🍽️ *InoBill - Split Bill Receipt*\n`;
    text += `📅 ${currentDate}\n\n`;
    text += `👥 *Peserta (${results.length} orang):*\n`;
    
    results.forEach(result => {
        text += `• ${result.participant}: ${formatCurrency(result.amount)}\n`;
    });
    
    text += `\n💰 *Grand Total: ${formatCurrency(totalBill)}*\n\n`;
    text += `Dibuat dengan InoBill PWA oleh InoTechno`;
    
    return text;
}

// Generate UUID for file naming
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Save data to Firebase
async function saveToFirebase(data, uuid) {
    const fileData = {
        ...data,
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        created_at: Date.now()
    };
    
    try {
        // Check if Firebase is available
        if (!window.InoBillFirebase) {
            throw new Error('Firebase not initialized');
        }
        
        const { db, collection, addDoc } = window.InoBillFirebase;
        
        // Save to Firebase (nested structure)
        const docRef = await addDoc(collection(db, 'shared_bills'), {
            id: uuid,
            data: fileData,
            created_at: fileData.created_at,
            expires_at: fileData.expires_at
        });
        
        console.log('Document written with ID: ', docRef.id);
        
        // Also store in localStorage as backup
        localStorage.setItem(`inobill_shared_${uuid}`, JSON.stringify(fileData));
        
        return uuid;
    } catch (error) {
        console.log('Firebase save failed, using localStorage only:', error);
        // Fallback to localStorage
        localStorage.setItem(`inobill_shared_${uuid}`, JSON.stringify(fileData));
        return uuid;
    }
}

// Generate Shareable Link with JSON File Storage
async function generateShareableLink() {
    try {
        // Generate UUID for file naming
        const uuid = generateUUID();
        
        // Create data object for sharing
        const shareData = {
            participants: participants,
            menuItems: menuItems,
            additionalCosts: additionalCosts,
            orders: orders,
            discount: discount,
            timestamp: new Date().toISOString()
        };
        
        // Save to Firebase
        const savedUuid = await saveToFirebase(shareData, uuid);
        
        // Create shareable URL with UUID
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?id=${uuid}`;
        
        return shareUrl;
        
    } catch (error) {
        console.error('Error generating shareable link:', error);
        
        // Fallback: use compressed base64
        const shareData = {
            participants: participants,
            menuItems: menuItems,
            additionalCosts: additionalCosts,
            orders: orders,
            discount: discount,
            timestamp: new Date().toISOString()
        };
        
        // Use better compression by removing unnecessary data
        const compressedData = JSON.stringify(shareData)
            .replace(/"type":"menu"/g, '"t":"m"')
            .replace(/"quantity":/g, '"q":')
            .replace(/"index":/g, '"i":')
            .replace(/"amount":/g, '"a":')
            .replace(/"percentage":/g, '"p":')
            .replace(/"name":/g, '"n":')
            .replace(/"price":/g, '"p":');
        
        const encodedData = btoa(compressedData);
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?bill=${encodedData}`;
    }
}

// Load data from Firebase
async function loadFromFirebase(uuid) {
    try {
        // Check if Firebase is available
        if (!window.InoBillFirebase) {
            throw new Error('Firebase not initialized');
        }
        
        const { db, collection, getDocs, query, where } = window.InoBillFirebase;
        
        // Query Firebase for the document with matching UUID
        console.log('Loading from Firebase with UUID:', uuid);
        const q = query(collection(db, 'shared_bills'), where('id', '==', uuid));
        const querySnapshot = await getDocs(q);
        
        console.log('Query snapshot size:', querySnapshot.size);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            
            console.log('Found document:', data);
            console.log('Current time:', Date.now());
            console.log('Expires at:', data.expires_at);
            
            // Check if document has expired
            if (data.expires_at && Date.now() > data.expires_at) {
                console.log('Document has expired');
                throw new Error('Document has expired');
            }
            
            // Check if data has nested structure or is flat
            if (data.data) {
                console.log('Returning nested data:', data.data);
                return data.data;
            } else {
                // Remove metadata fields and return only bill data
                const { id, created_at, expires_at, ...billData } = data;
                console.log('Returning flat data:', billData);
                return billData;
            }
        } else {
            // Try localStorage fallback
            const localData = localStorage.getItem(`inobill_shared_${uuid}`);
            if (localData) {
                const data = JSON.parse(localData);
                
                // Check if file has expired
                if (data.expires_at && Date.now() > data.expires_at) {
                    localStorage.removeItem(`inobill_shared_${uuid}`);
                    throw new Error('File has expired');
                }
                
                return data;
            }
            throw new Error('Document not found');
        }
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        throw error;
    }
}

// Load Data from URL
async function loadDataFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const uuid = urlParams.get('id');
    const billData = urlParams.get('bill');
    
    // Try to load from UUID JSON file first
    if (uuid) {
        try {
            console.log('Loading data from URL with UUID:', uuid);
            const decodedData = await loadFromFirebase(uuid);
            console.log('Decoded data from Firebase:', decodedData);
            
            // Validate data structure
            console.log('Validating data structure...');
            console.log('Has participants:', !!decodedData.participants);
            console.log('Has menuItems:', !!decodedData.menuItems);
            console.log('Has orders:', !!decodedData.orders);
            
            if (decodedData.participants && decodedData.menuItems && decodedData.orders) {
                // Load the data
                participants = decodedData.participants || [];
                menuItems = decodedData.menuItems || [];
                additionalCosts = decodedData.additionalCosts || [];
                orders = decodedData.orders || {};
                discount = decodedData.discount || { amount: 0, percentage: 0, type: 'menu' };
                
                // Save to localStorage
                saveData();
                
                // Re-render everything
                renderAll();
                
                // Show notification
                showNotification('Data bill berhasil dimuat dari link!', 'success');
                
                // Clear URL parameters to avoid reloading
                const newUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                
                return true;
            } else {
                console.error('Invalid data structure in JSON file');
                console.error('Decoded data:', decodedData);
                showError('Error', 'Data dari file tidak valid');
            }
        } catch (error) {
            console.error('Error loading data from JSON file:', error);
            console.error('Error details:', error.message);
            if (error.message === 'Document has expired') {
                showError('Error', 'Data sudah expired (lebih dari 7 hari)');
            } else if (error.message === 'Document not found') {
                showError('Error', 'Data tidak ditemukan');
            } else {
                showError('Error', 'Gagal memuat data dari Firebase: ' + error.message);
            }
        }
    }
    
    // Fallback to base64 method
    if (billData) {
        try {
            // Decode data from base64
            const decodedData = JSON.parse(atob(billData));
            
            // Handle both old and new data formats
            const participantsData = decodedData.participants || decodedData.p;
            const menuItemsData = decodedData.menuItems || decodedData.m;
            const additionalCostsData = decodedData.additionalCosts || decodedData.a;
            const ordersData = decodedData.orders || decodedData.o;
            const discountData = decodedData.discount || decodedData.d;
            
            // Validate data structure
            if (participantsData && menuItemsData && ordersData) {
                // Load the data
                participants = participantsData || [];
                menuItems = menuItemsData || [];
                additionalCosts = additionalCostsData || [];
                orders = ordersData || {};
                discount = discountData || { amount: 0, percentage: 0, type: 'menu' };
                
                // Save to localStorage
                saveData();
                
                // Re-render everything
                renderAll();
                
                // Show notification
                showNotification('Data bill berhasil dimuat dari link!', 'success');
                
                // Clear URL parameters to avoid reloading
                const newUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                
                return true;
            } else {
                console.error('Invalid data structure in URL');
                showError('Error', 'Data dari link tidak valid');
            }
        } catch (error) {
            console.error('Error loading data from URL:', error);
            showError('Error', 'Gagal memuat data dari link');
        }
    }
    
    return false;
}

// Generate Simple Print Content
function generateSimplePrintContent() {
    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const currentTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Calculate factor for discounted prices
    let totalSubtotal = 0;
    let totalAdditionalCosts = 0;
    let totalDiscount = 0;
    
    // Calculate total subtotal from all participants
    participants.forEach(participant => {
        const participantOrders = orders[participant] || [];
        if (Array.isArray(participantOrders) && participantOrders.length > 0) {
            participantOrders.forEach((order) => {
                if (order && order.type === 'menu' && typeof order.index === 'number' && order.quantity > 0) {
                    const menuItem = menuItems[order.index];
                    if (menuItem) {
                        totalSubtotal += menuItem.price * order.quantity;
                    }
                }
            });
        }
    });
    
    // Calculate total additional costs
    additionalCosts.forEach(cost => {
        if (cost.type === 'fixed') {
            totalAdditionalCosts += cost.amount || 0;
        } else if (cost.type === 'percentage') {
            totalAdditionalCosts += (totalSubtotal * (cost.amount || 0)) / 100;
        }
    });
    
    // Calculate total discount
    if (discount && (discount.amount > 0 || discount.percentage > 0)) {
        if (discount.amount > 0) {
            totalDiscount = discount.amount;
        } else if (discount.percentage > 0) {
            if (discount.type === 'menu') {
                totalDiscount = totalSubtotal * discount.percentage / 100;
            } else {
                totalDiscount = (totalSubtotal + totalAdditionalCosts) * discount.percentage / 100;
            }
        }
    }
    
    // Calculate factor for discounted prices
    const factor = totalSubtotal > 0 ? (totalSubtotal + totalAdditionalCosts - totalDiscount) / totalSubtotal : 1;
    
    let content = `
        <div class="header">
            <h1>🍽️ InoBill</h1>
            <p>Smart Bill Splitter</p>
        </div>
        
        <div class="bill-info">
            <p><strong>Tanggal:</strong> ${currentDate}</p>
            <p><strong>Waktu:</strong> ${currentTime}</p>
            <p><strong>Total Peserta:</strong> ${participants.length} orang</p>
        </div>
        
        <table class="print-table">
            <thead>
                <tr>
                    <th>Peserta</th>
                    <th>Menu</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Debug: Log all data
    console.log('Print Debug - Participants:', participants);
    console.log('Print Debug - MenuItems:', menuItems);
    console.log('Print Debug - Orders:', orders);
    console.log('Print Debug - Factor:', factor);
    
    // Add participant orders in table format
    participants.forEach(participant => {
        const participantOrders = orders[participant] || [];
        let hasOrders = false;
        let participantSubtotal = 0;
        let orderItems = [];
        
        // Collect all orders for this participant
        if (Array.isArray(participantOrders) && participantOrders.length > 0) {
            participantOrders.forEach((order) => {
                if (order && order.type === 'menu' && typeof order.index === 'number' && order.quantity > 0) {
                    const menuItem = menuItems[order.index];
                    if (menuItem) {
                        const itemTotal = menuItem.price * order.quantity;
                        const discountedPrice = menuItem.price * factor;
                        const discountedTotal = discountedPrice * order.quantity;
                        participantSubtotal += discountedTotal;
                        orderItems.push({
                            name: menuItem.name,
                            quantity: order.quantity,
                            price: discountedPrice,
                            total: discountedTotal
                        });
                        hasOrders = true;
                    }
                }
            });
        }
        
        if (hasOrders && orderItems.length > 0) {
            // Add first row with participant name and subtotal
            content += `
                <tr>
                    <td rowspan="${orderItems.length}">${participant}</td>
                    <td>${orderItems[0].name}</td>
                    <td>${orderItems[0].quantity}</td>
                    <td>${formatCurrency(orderItems[0].price)}</td>
                    <td rowspan="${orderItems.length}">${formatCurrency(participantSubtotal)}</td>
                </tr>
            `;
            
            // Add remaining rows without participant name
            for (let i = 1; i < orderItems.length; i++) {
                content += `
                    <tr>
                        <td>${orderItems[i].name}</td>
                        <td>${orderItems[i].quantity}</td>
                        <td>${formatCurrency(orderItems[i].price)}</td>
                    </tr>
                `;
            }
        } else {
            // If no orders, show participant with empty row
            content += `
                <tr>
                    <td>${participant}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${formatCurrency(0)}</td>
                </tr>
            `;
        }
    });
    
    content += `
            </tbody>
        </table>
        
        <table class="summary-table">
            <tbody>
    `;
    
    // Add subtotal row (original food cost)
    content += `
        <tr>
            <td><strong>Sub Total</strong></td>
            <td>${formatCurrency(totalSubtotal)}</td>
        </tr>
    `;
    
    // Add additional costs
    if (additionalCosts.length > 0) {
        additionalCosts.forEach(cost => {
            let costValue = 0;
            if (cost.type === 'fixed') {
                costValue = cost.amount || 0;
            } else if (cost.type === 'percentage') {
                costValue = (totalSubtotal * (cost.amount || 0)) / 100;
            }
            
            content += `
                <tr>
                    <td><strong>${cost.name}</strong></td>
                    <td>${formatCurrency(costValue)}</td>
                </tr>
            `;
        });
    }
    
    // Add discount
    if (discount && (discount.amount > 0 || discount.percentage > 0)) {
        if (discount.amount > 0) {
            content += `
                <tr>
                    <td><strong>Diskon (${discount.type === 'menu' ? 'Setelah Menu' : 'Dari Total Semua'})</strong></td>
                    <td style="color: #10b981;">-${formatCurrency(totalDiscount)}</td>
                </tr>
            `;
        } else if (discount.percentage > 0) {
            content += `
                <tr>
                    <td><strong>Diskon ${discount.percentage}% (${discount.type === 'menu' ? 'Setelah Menu' : 'Dari Total Semua'})</strong></td>
                    <td style="color: #10b981;">-${formatCurrency(totalDiscount)}</td>
                </tr>
            `;
        }
    }
    
    // Calculate grand total
    const grandTotal = totalSubtotal + totalAdditionalCosts - totalDiscount;
    
    // Add grand total row
    content += `
        <tr style="border-top: 2px solid #0174BE; font-weight: bold; font-size: 14px;">
            <td><strong>TOTAL</strong></td>
            <td><strong>${formatCurrency(grandTotal)}</strong></td>
        </tr>
    `;
    
    content += `
            </tbody>
        </table>
        
        <div class="footer">
            <p>Dibuat dengan InoBill PWA oleh InoTechno</p>
            <p>inotechno.my.id</p>
        </div>
    `;
    
    return content;
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
window.closeModalManually = closeModalManually;
window.clearDiscount = clearDiscount;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.updateQuantity = updateQuantity;

// Show Discount Modal
function showDiscountModal() {
    // Reset form values first
    const discountAmount = document.getElementById('discountAmount');
    const discountPercentage = document.getElementById('discountPercentage');
    const discountType = document.getElementById('discountType');
    const discountInfo = document.getElementById('discountInfo');
    
    if (discountAmount) discountAmount.value = discount.amount || '';
    if (discountPercentage) discountPercentage.value = discount.percentage || '';
    if (discountInfo) discountInfo.style.display = 'none';
    
    // Set discount type in custom select
    try {
        resetCustomSelect('discountType', discount.type || 'menu', 
            discount.type === 'menu' ? 'Setelah Menu' : 'Dari Total Semua');
    } catch (error) {
        console.warn('InoBill PWA: Error setting discount type in modal');
    }
    
    // Show modal
    showModal('discountModal');
    
    // Focus on first input
    setTimeout(() => {
        if (discountAmount) discountAmount.focus();
    }, 100);
}

// Apply Discount - enforces single discount policy
function applyDiscount() {
    const discountAmount = document.getElementById('discountAmount');
    const discountPercentage = document.getElementById('discountPercentage');
    
    if (!discountAmount || !discountPercentage) {
        showError('Error', 'Form discount tidak ditemukan');
        return;
    }
    
    const amountValue = parseFloat(discountAmount.value) || 0;
    const percentageValue = parseFloat(discountPercentage.value) || 0;
    
    // Validation: at least one value must be provided
    if (amountValue === 0 && percentageValue === 0) {
        showError('Error Input', 'Masukkan nilai diskon (Rp atau %)');
        discountAmount.focus();
        return;
    }
    
    // Validation: negative values not allowed
    if (amountValue < 0 || percentageValue < 0) {
        showError('Error Input', 'Nilai diskon tidak boleh negatif');
        return;
    }
    
    // Validation: percentage should not exceed 100%
    if (percentageValue > 100) {
        showError('Error Input', 'Diskon persentase tidak boleh lebih dari 100%');
        discountPercentage.focus();
        return;
    }
    
    // Enforce single discount policy: prioritize amount over percentage
    if (amountValue > 0 && percentageValue > 0) {
        // Clear percentage and show warning
        discountPercentage.value = '';
        showNotification('Hanya satu jenis diskon yang diizinkan. Menggunakan diskon Rp.', 'warning');
    }
    
    // Get discount type
    let discountType = 'menu';
    try {
        discountType = getCustomSelectValue('discountType') || 'menu';
    } catch (error) {
        console.warn('InoBill PWA: Error getting discount type, using default');
    }
    
    // Apply single discount policy
    discount = {
        amount: amountValue > 0 ? amountValue : 0,
        percentage: amountValue > 0 ? 0 : percentageValue, // Only use percentage if no amount
        type: discountType
    };
    
    // Save and update
    saveData();
    renderDiscount();
    calculateSplit();
    
    // Close modal
    closeModal('discountModal');
    
    // Show success message
    const discountText = discount.amount > 0 
        ? `Rp ${formatCurrency(discount.amount)}` 
        : `${discount.percentage}%`;
    const typeText = discount.type === 'menu' ? 'setelah menu' : 'dari total semua';
    
    showNotification(`Diskon ${discountText} (${typeText}) berhasil diterapkan`, 'success');
}

// Clear Discount
function clearDiscount() {
    // Reset discount object to default
    discount = { amount: 0, percentage: 0, type: 'menu' };
    
    // Save and update
    saveData();
    renderDiscount();
    calculateSplit();
    
    // Show success message
    showNotification('Diskon berhasil dihapus', 'success');
}

// Show Modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }
}

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    }
}

// Close Modal Manually (for preventing auto-close after add)
function closeModalManually(modalId) {
    closeModal(modalId);
}

// Card Collapse Functionality
function toggleCardCollapse(cardContentId) {
    const cardContent = document.getElementById(cardContentId);
    const card = cardContent.closest('.card');
    const collapseIcon = card.querySelector('.collapse-icon');
    
    if (card.classList.contains('collapsed')) {
        // Expand card
        card.classList.remove('collapsed');
        collapseIcon.textContent = '▼';
        localStorage.setItem(`card-${cardContentId}-collapsed`, 'false');
    } else {
        // Collapse card
        card.classList.add('collapsed');
        collapseIcon.textContent = '▶';
        localStorage.setItem(`card-${cardContentId}-collapsed`, 'true');
    }
}

// Load card collapse states
function loadCardStates() {
    const cardIds = ['participantsCard', 'menuCard', 'additionalCostsCard', 'discountCard', 'ordersCard', 'resultsCard'];
    
    cardIds.forEach(cardId => {
        const isCollapsed = localStorage.getItem(`card-${cardId}-collapsed`) === 'true';
        const cardContent = document.getElementById(cardId);
        
        if (cardContent) {
            const card = cardContent.closest('.card');
            const collapseIcon = card.querySelector('.collapse-icon');
            
            if (isCollapsed) {
                card.classList.add('collapsed');
                if (collapseIcon) {
                    collapseIcon.textContent = '▶';
                }
            }
        }
    });
}

// Export new modal functions
window.showDiscountModal = showDiscountModal;
window.showModal = showModal;
window.closeModal = closeModal;
window.toggleCardCollapse = toggleCardCollapse;
