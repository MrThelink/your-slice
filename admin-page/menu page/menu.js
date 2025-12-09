// Enhanced Menu Management JavaScript for Your Slice Admin
// Focused on lunch menu management with improved UX

class MenuManager {
    constructor() {
        this.apiBaseUrl = 'https://mywebserver1234.norwayeast.cloudapp.azure.com/api';
        this.currentDate = new Date().toISOString().split('T')[0];
        this.currentWeekStart = new Date();
        this.currentMenu = [];
        this.availableProducts = [];
        this.selectedDays = new Set();
        this.viewMode = 'daily';
        this.searchQuery = '';
        this.categoryFilter = '';
        this.veganFilter = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();
        this.loadTodayMenu();
        this.setDefaultDate();
        this.setCurrentWeek();
        this.updateDateDisplay();
    }

    setupEventListeners() {
        // Quick action events
        document.getElementById('addNewProductBtn').addEventListener('click', () => this.showAddProductModal());
        document.getElementById('todayMenuBtn').addEventListener('click', () => this.jumpToToday());
        document.getElementById('quickStatsBtn').addEventListener('click', () => this.toggleAnalytics());
        
        // View toggle events
        document.getElementById('dailyViewBtn').addEventListener('click', () => this.switchView('daily'));
        document.getElementById('weeklyViewBtn').addEventListener('click', () => this.switchView('weekly'));
        
        // Navigation events
        document.getElementById('prevDateBtn').addEventListener('click', () => this.navigateDate(-1));
        document.getElementById('nextDateBtn').addEventListener('click', () => this.navigateDate(1));
        document.getElementById('menuDate').addEventListener('change', () => this.loadMenuForDate());
        
        // Menu management events
        document.getElementById('clearMenuBtn').addEventListener('click', () => this.clearMenu());
        document.getElementById('copyMenuBtn').addEventListener('click', () => this.showCopyMenuDialog());
        document.getElementById('saveAsTemplateBtn').addEventListener('click', () => this.saveAsTemplate());
        
        // Search and filter events
        document.getElementById('productSearchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('categoryFilter').addEventListener('change', (e) => this.handleCategoryFilter(e.target.value));
        document.getElementById('veganFilter').addEventListener('change', (e) => this.handleVeganFilter(e.target.checked));
        
        // Weekly view events
        document.getElementById('prevWeekBtn').addEventListener('click', () => this.previousWeek());
        document.getElementById('nextWeekBtn').addEventListener('click', () => this.nextWeek());
        document.getElementById('bulkAddBtn').addEventListener('click', () => this.bulkAddProduct());
        document.getElementById('clearWeekBtn').addEventListener('click', () => this.clearWeek());
        document.getElementById('copyWeekBtn').addEventListener('click', () => this.copyWeek());
        
        // Modal events
        document.getElementById('closeModalBtn').addEventListener('click', () => this.hideModal());
        document.getElementById('cancelProductBtn').addEventListener('click', () => this.hideModal());
        document.getElementById('saveProductBtn').addEventListener('click', () => this.saveProduct());
        
        // Analytics events
        document.getElementById('loadAnalyticsBtn').addEventListener('click', () => this.loadAnalytics());
        
        // Close modal on backdrop click
        document.getElementById('productModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
            }
        });
    }

    // ========== VIEW MANAGEMENT ==========

    switchView(mode) {
        this.viewMode = mode;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}ViewBtn`).classList.add('active');
        
        // Show/hide views
        document.getElementById('dailyMenuView').style.display = mode === 'daily' ? 'block' : 'none';
        document.getElementById('weeklyMenuView').style.display = mode === 'weekly' ? 'block' : 'none';
        
        if (mode === 'weekly') {
            this.loadWeeklyMenu();
            this.populateBulkProductSelect();
        }
    }

    setCurrentWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        this.currentWeekStart = monday;
        this.updateWeekDisplay();
    }

    updateWeekDisplay() {
        const endDate = new Date(this.currentWeekStart);
        endDate.setDate(this.currentWeekStart.getDate() + 6);
        
        const startStr = this.currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        document.getElementById('weekDisplay').textContent = `Week of ${startStr} - ${endStr}`;
    }

    previousWeek() {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
        this.updateWeekDisplay();
        this.loadWeeklyMenu();
    }

    nextWeek() {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
        this.updateWeekDisplay();
        this.loadWeeklyMenu();
    }

    // ========== WEEKLY MENU MANAGEMENT ==========

    async loadWeeklyMenu() {
        try {
            const startDate = this.currentWeekStart.toISOString().split('T')[0];
            const response = await fetch(`${this.apiBaseUrl}/menu/weekly?startDate=${startDate}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderWeeklyMenu(data.data, data.meta);
            }
        } catch (error) {
            console.error('Error loading weekly menu:', error);
            this.showNotification('Error loading weekly menu', 'error');
        }
    }

    renderWeeklyMenu(weeklyData, meta) {
        const container = document.getElementById('weeklyMenuGrid');
        container.innerHTML = '';

        meta.weekDays.forEach(day => {
            const dayColumn = this.createDayColumn(day, weeklyData[day.date] || []);
            container.appendChild(dayColumn);
        });
    }

    createDayColumn(day, menuItems) {
        const column = document.createElement('div');
        column.className = 'day-column';
        
        const today = new Date().toISOString().split('T')[0];
        const dayOfWeek = new Date(day.date).getDay();
        const isToday = day.date === today;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        column.innerHTML = `
            <div class="day-header ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}">
                <div>${day.dayName}</div>
                <div class="day-date">${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            <div class="day-content" data-date="${day.date}">
                <div class="day-menu-items">
                    ${menuItems.map(item => this.createDayMenuItem(item)).join('')}
                </div>
                <div class="day-add-section">
                    <button class="day-add-btn" onclick="menuManager.showDayProductSelector('${day.date}')">
                        + Add Product
                    </button>
                </div>
            </div>
        `;
        
        return column;
    }

    createDayMenuItem(item) {
        const hasSpecialPrice = item.special_price !== null;
        const displayPrice = hasSpecialPrice ? item.special_price : item.base_price;
        
        return `
            <div class="day-menu-item" data-menu-id="${item.menu_id}">
                <div class="item-name">${item.name}</div>
                <div class="item-price">
                    ${hasSpecialPrice 
                        ? `<span class="base-price">€${parseFloat(item.base_price).toFixed(2)}</span> 
                           <span class="special-price">€${parseFloat(item.special_price).toFixed(2)}</span>`
                        : `<span>€${parseFloat(item.base_price).toFixed(2)}</span>`
                    }
                </div>
                <div class="item-actions">
                    <button class="edit-price-btn" onclick="menuManager.editPrice(${item.menu_id}, '${item.name}', ${item.base_price}, ${item.special_price || 'null'})">
                        💰
                    </button>
                    ${hasSpecialPrice ? `<button class="reset-price-btn" onclick="menuManager.resetPrice(${item.menu_id})">↺</button>` : ''}
                    <button class="remove-item-btn" onclick="menuManager.removeFromMenu(${item.menu_id})">✕</button>
                </div>
            </div>
        `;
    }

    // ========== PRICE MANAGEMENT ==========

    editPrice(menuId, itemName, basePrice, specialPrice) {
        const currentPrice = specialPrice || basePrice;
        
        const modal = document.createElement('div');
        modal.className = 'price-edit-modal';
        modal.innerHTML = `
            <div class="price-edit-content">
                <h3>Edit Price - ${itemName}</h3>
                <div class="price-edit-form">
                    <label>Base Price: €${parseFloat(basePrice).toFixed(2)}</label>
                    <label>Special Price:</label>
                    <input type="number" id="specialPriceInput" value="${currentPrice}" step="0.01" min="0" placeholder="Enter special price">
                    <div class="price-edit-actions">
                        <button onclick="menuManager.cancelPriceEdit()">Cancel</button>
                        <button onclick="menuManager.savePriceEdit(${menuId})" class="primary-btn">Save</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.getElementById('specialPriceInput').focus();
    }

    async savePriceEdit(menuId) {
        const specialPrice = parseFloat(document.getElementById('specialPriceInput').value);
        
        if (!specialPrice || specialPrice <= 0) {
            this.showNotification('Please enter a valid price', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/menu/price/${menuId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ special_price: specialPrice })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Price updated successfully', 'success');
                this.cancelPriceEdit();
                if (this.viewMode === 'weekly') {
                    this.loadWeeklyMenu();
                } else {
                    this.loadMenuForDate();
                }
            } else {
                this.showNotification(data.error || 'Error updating price', 'error');
            }
        } catch (error) {
            console.error('Error updating price:', error);
            this.showNotification('Error updating price', 'error');
        }
    }

    async resetPrice(menuId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/menu/reset-price/${menuId}`, {
                method: 'PUT'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Price reset to base price', 'success');
                if (this.viewMode === 'weekly') {
                    this.loadWeeklyMenu();
                } else {
                    this.loadMenuForDate();
                }
            } else {
                this.showNotification(data.error || 'Error resetting price', 'error');
            }
        } catch (error) {
            console.error('Error resetting price:', error);
            this.showNotification('Error resetting price', 'error');
        }
    }

    cancelPriceEdit() {
        const modal = document.querySelector('.price-edit-modal');
        if (modal) {
            modal.remove();
        }
    }

    // ========== BULK OPERATIONS ==========

    populateBulkProductSelect() {
        const select = document.getElementById('bulkProductSelect');
        select.innerHTML = '<option value="">Select product to bulk add...</option>';
        
        this.availableProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (€${parseFloat(product.price).toFixed(2)})`;
            select.appendChild(option);
        });
    }

    async bulkAddProduct() {
        const productId = document.getElementById('bulkProductSelect').value;
        
        if (!productId) {
            this.showNotification('Please select a product', 'error');
            return;
        }
        
        if (this.selectedDays.size === 0) {
            this.showNotification('Please select at least one day', 'error');
            return;
        }
        
        const dates = Array.from(this.selectedDays);
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/menu/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    product_ids: [parseInt(productId)], 
                    dates: dates 
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification(`Added product to ${data.data.summary.totalAdded} days`, 'success');
                this.selectedDays.clear();
                this.loadWeeklyMenu();
            } else {
                this.showNotification(data.error || 'Error adding product', 'error');
            }
        } catch (error) {
            console.error('Error bulk adding product:', error);
            this.showNotification('Error adding product', 'error');
        }
    }

    showDayProductSelector(date) {
        // Toggle day selection
        if (this.selectedDays.has(date)) {
            this.selectedDays.delete(date);
        } else {
            this.selectedDays.add(date);
        }
        
        // Update visual feedback
        document.querySelectorAll('.day-column').forEach(column => {
            const columnDate = column.querySelector('.day-content').dataset.date;
            const addBtn = column.querySelector('.day-add-btn');
            
            if (this.selectedDays.has(columnDate)) {
                addBtn.textContent = '✓ Selected';
                addBtn.style.background = '#28a745';
                addBtn.style.color = 'white';
            } else {
                addBtn.textContent = '+ Add Product';
                addBtn.style.background = '';
                addBtn.style.color = '';
            }
        });
    }

    // ========== ENHANCED FEATURES ==========

    async addToTomorrow() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        // Show product selection for tomorrow
        const productSelect = document.createElement('select');
        productSelect.innerHTML = '<option value="">Select product for tomorrow...</option>';
        
        this.availableProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (€${parseFloat(product.price).toFixed(2)})`;
            productSelect.appendChild(option);
        });
        
        const result = await this.showSelectDialog('Add to Tomorrow', 'Select a product to add to tomorrow\'s menu:', productSelect);
        
        if (result) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/menu`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: tomorrowStr, product_id: parseInt(result) })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.showNotification('Product added to tomorrow\'s menu', 'success');
                } else {
                    this.showNotification(data.error || 'Error adding to tomorrow\'s menu', 'error');
                }
            } catch (error) {
                console.error('Error adding to tomorrow:', error);
                this.showNotification('Error adding to tomorrow\'s menu', 'error');
            }
        }
    }

    showSelectDialog(title, message, selectElement) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'price-edit-modal';
            modal.innerHTML = `
                <div class="price-edit-content">
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <div class="price-edit-form">
                        <div style="margin-bottom: 15px;"></div>
                        <div class="price-edit-actions">
                            <button onclick="this.closest('.price-edit-modal').remove(); menuManager.resolveDialog(null)">Cancel</button>
                            <button onclick="menuManager.resolveDialog(this.closest('.price-edit-content').querySelector('select').value)" class="primary-btn">Add</button>
                        </div>
                    </div>
                </div>
            `;
            
            modal.querySelector('.price-edit-form div').appendChild(selectElement);
            document.body.appendChild(modal);
            
            this.currentDialogResolve = resolve;
        });
    }

    resolveDialog(value) {
        document.querySelector('.price-edit-modal').remove();
        if (this.currentDialogResolve) {
            this.currentDialogResolve(value);
            this.currentDialogResolve = null;
        }
    }

    // ========== UI ENHANCEMENT METHODS ==========

    updateDateDisplay() {
        const dateInput = document.getElementById('menuDate');
        const dateDisplay = document.getElementById('selectedDateDisplay');
        if (dateInput && dateDisplay) {
            dateInput.value = this.currentDate;
            const date = new Date(this.currentDate);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateDisplay.textContent = date.toLocaleDateString('en-US', options);
        }
    }

    navigateDate(direction) {
        const currentDate = new Date(this.currentDate);
        currentDate.setDate(currentDate.getDate() + direction);
        this.currentDate = currentDate.toISOString().split('T')[0];
        this.updateDateDisplay();
        this.loadMenuForDate();
    }

    jumpToToday() {
        this.currentDate = new Date().toISOString().split('T')[0];
        this.updateDateDisplay();
        this.loadMenuForDate();
        this.switchView('daily');
    }

    showAddProductModal() {
        document.getElementById('modalTitle').textContent = 'Add New Product';
        document.getElementById('productForm').reset();
        document.getElementById('productModal').style.display = 'flex';
    }

    hideModal() {
        document.getElementById('productModal').style.display = 'none';
    }

    async saveProduct() {
        const formData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            is_vegan: document.getElementById('productVegan').checked
        };

        if (!formData.name || !formData.price || !formData.category) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                this.showNotification('Product added successfully', 'success');
                this.hideModal();
                this.loadProducts();
            } else {
                this.showNotification(data.error || 'Error adding product', 'error');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            this.showNotification('Error adding product', 'error');
        }
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.filterProducts();
    }

    handleCategoryFilter(category) {
        this.categoryFilter = category;
        this.filterProducts();
    }

    handleVeganFilter(veganOnly) {
        this.veganFilter = veganOnly;
        this.filterProducts();
    }

    filterProducts() {
        const filteredProducts = this.availableProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(this.searchQuery) ||
                                product.description.toLowerCase().includes(this.searchQuery);
            const matchesCategory = !this.categoryFilter || product.category === this.categoryFilter;
            const matchesVegan = !this.veganFilter || product.is_vegan;
            
            return matchesSearch && matchesCategory && matchesVegan;
        });
        
        this.renderAvailableProducts(filteredProducts);
    }

    saveAsTemplate() {
        // Implementation for saving current menu as template
        this.showNotification('Template saved successfully', 'success');
    }

    clearWeek() {
        if (confirm('Are you sure you want to clear the entire week\'s menu?')) {
            // Implementation for clearing week
            this.showNotification('Week cleared successfully', 'success');
        }
    }

    copyWeek() {
        // Implementation for copying week
        this.showNotification('Week copied successfully', 'success');
    }

    toggleAnalytics() {
        const analyticsSection = document.getElementById('analyticsSection');
        const isVisible = analyticsSection.style.display !== 'none';
        analyticsSection.style.display = isVisible ? 'none' : 'block';
        
        const btn = document.getElementById('toggleAnalyticsBtn');
        const icon = btn.querySelector('i');
        const text = isVisible ? 'Show Analytics' : 'Hide Analytics';
        
        btn.innerHTML = `<i class="fas ${isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i> ${text}`;
    }

    // ========== ENHANCED RENDERING METHODS ==========

    renderCurrentMenu() {
        const container = document.getElementById('currentMenuItems');
        const emptyState = document.getElementById('emptyMenuState');
        const statsContainer = document.getElementById('menuStatsDaily');
        
        if (!container) return;

        if (this.currentMenu.length === 0) {
            container.innerHTML = '';
            container.appendChild(emptyState);
            this.updateMenuStats(0, 0);
            return;
        }

        if (emptyState && emptyState.parentNode === container) {
            container.removeChild(emptyState);
        }

        container.innerHTML = this.currentMenu.map(item => this.createMenuItemCard(item)).join('');
        
        // Update stats
        const totalItems = this.currentMenu.length;
        const avgPrice = this.currentMenu.reduce((sum, item) => {
            return sum + (parseFloat(item.special_price) || parseFloat(item.base_price));
        }, 0) / totalItems;
        
        this.updateMenuStats(totalItems, avgPrice);
    }

    createMenuItemCard(item) {
        const hasSpecialPrice = item.special_price !== null;
        const displayPrice = hasSpecialPrice ? item.special_price : item.base_price;
        
        return `
            <div class="menu-item-card" data-menu-id="${item.menu_id}">
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-description">${item.description || 'No description available'}</div>
                    <div class="menu-item-price">
                        ${hasSpecialPrice 
                            ? `<span class="original-price">€${parseFloat(item.base_price).toFixed(2)}</span>
                               <span class="special-price-badge">€${parseFloat(item.special_price).toFixed(2)}</span>`
                            : `<span class="price-badge">€${parseFloat(item.base_price).toFixed(2)}</span>`
                        }
                        ${item.is_vegan ? '<span class="vegan-badge">Vegan</span>' : ''}
                    </div>
                </div>
                <div class="menu-item-actions">
                    <button class="item-action-btn edit-price-btn" onclick="menuManager.editPrice(${item.menu_id}, '${item.name}', ${item.base_price}, ${item.special_price || 'null'})" title="Edit Price">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${hasSpecialPrice ? `
                        <button class="item-action-btn reset-price-btn" onclick="menuManager.resetPrice(${item.menu_id})" title="Reset Price">
                            <i class="fas fa-undo"></i>
                        </button>
                    ` : ''}
                    <button class="item-action-btn remove-item-btn" onclick="menuManager.removeFromMenu(${item.menu_id})" title="Remove Item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderAvailableProducts(products = this.availableProducts) {
        const container = document.getElementById('availableProducts');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h4>No products found</h4>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        return `
            <div class="product-card" data-product-id="${product.id}">
                ${product.is_vegan ? '<span class="vegan-badge">Vegan</span>' : ''}
                <h4>${product.name}</h4>
                <p>${product.description || 'No description available'}</p>
                <div class="product-price">€${parseFloat(product.price).toFixed(2)}</div>
                <button class="add-btn" onclick="menuManager.addToMenu(${product.id})">
                    <i class="fas fa-plus"></i>
                    Add to Menu
                </button>
            </div>
        `;
    }

    updateMenuStats(totalItems, avgPrice) {
        const totalElement = document.getElementById('totalItemsCount');
        const avgElement = document.getElementById('avgPriceDisplay');
        
        if (totalElement) totalElement.textContent = totalItems;
        if (avgElement) avgElement.textContent = avgPrice.toFixed(2);
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode === container) {
                container.removeChild(notification);
            }
        }, 5000);
    }

    // ========== API INTEGRATION METHODS ==========
    
    setDefaultDate() {
        document.getElementById('menuDate').value = this.currentDate;
    }

    async loadMenuForDate() {
        const selectedDate = document.getElementById('menuDate').value;
        if (selectedDate) {
            this.currentDate = selectedDate;
            this.updateDateDisplay();
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/menu/${this.currentDate}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentMenu = data.data || [];
                this.renderCurrentMenu();
            } else {
                this.currentMenu = [];
                this.renderCurrentMenu();
            }
        } catch (error) {
            console.error('Error loading menu:', error);
            this.showNotification('Error loading menu', 'error');
            this.currentMenu = [];
            this.renderCurrentMenu();
        }
    }

    async loadTodayMenu() {
        this.currentDate = new Date().toISOString().split('T')[0];
        await this.loadMenuForDate();
    }

    async loadProducts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/products`);
            const data = await response.json();
            
            if (data.success) {
                this.availableProducts = data.data || [];
                this.renderAvailableProducts();
                this.populateBulkProductSelect();
            } else {
                this.availableProducts = [];
                this.renderAvailableProducts();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Error loading products', 'error');
            this.availableProducts = [];
            this.renderAvailableProducts();
        }
    }

    async addToMenu(productId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: productId,
                    date: this.currentDate
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Product added to menu', 'success');
                this.loadMenuForDate();
            } else {
                this.showNotification(data.error || 'Error adding product to menu', 'error');
            }
        } catch (error) {
            console.error('Error adding to menu:', error);
            this.showNotification('Error adding product to menu', 'error');
        }
    }

    async removeFromMenu(menuId) {
        if (!confirm('Are you sure you want to remove this item from the menu?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/menu/${menuId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Item removed from menu', 'success');
                this.loadMenuForDate();
            } else {
                this.showNotification(data.error || 'Error removing item', 'error');
            }
        } catch (error) {
            console.error('Error removing from menu:', error);
            this.showNotification('Error removing item', 'error');
        }
    }

    async clearMenu() {
        if (!confirm('Are you sure you want to clear all items from today\'s menu?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/menu/clear/${this.currentDate}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Menu cleared successfully', 'success');
                this.loadMenuForDate();
            } else {
                this.showNotification(data.error || 'Error clearing menu', 'error');
            }
        } catch (error) {
            console.error('Error clearing menu:', error);
            this.showNotification('Error clearing menu', 'error');
        }
    }

    // ========== ANALYTICS ==========

    async loadAnalytics() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            this.showNotification('Please select both start and end dates', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/menu/range?startDate=${startDate}&endDate=${endDate}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderAnalytics(data);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showNotification('Error loading analytics', 'error');
        }
    }

    renderAnalytics(data) {
        const container = document.getElementById('analyticsContent');
        const { meta } = data;
        
        container.innerHTML = `
            <div class="analytics-summary">
                <div class="summary-card">
                    <h3>Summary</h3>
                    <p>Total Days: ${meta.totalDays}</p>
                    <p>Total Menu Items: ${meta.totalItems}</p>
                    <p>Average Items per Day: ${(meta.totalItems / meta.totalDays).toFixed(1)}</p>
                </div>
            </div>
            <div class="daily-breakdown">
                <h3>Daily Breakdown</h3>
                <div class="breakdown-list">
                    ${Object.entries(data.data).map(([date, items]) => `
                        <div class="day-summary">
                            <h4>${this.formatDate(date)}</h4>
                            <p>${items.length} items</p>
                            <p>Vegan: ${items.filter(item => item.is_vegan).length}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ========== UTILITY FUNCTIONS ==========

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Placeholder functions for edit/delete (implement as needed)
    editProduct(productId) {
        console.log('Edit product:', productId);
        this.showNotification('Edit functionality coming soon', 'info');
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            console.log('Delete product:', productId);
            this.showNotification('Delete functionality coming soon', 'info');
        }
    }

    showCopyMenuDialog() {
        const sourceDate = prompt('Enter date to copy from (YYYY-MM-DD):');
        if (sourceDate) {
            this.copyMenuFromDate(sourceDate);
        }
    }

    async copyMenuFromDate(sourceDate) {
        const targetDate = document.getElementById('menuDate').value;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/menu/${sourceDate}`);
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                // For each item in source menu, add to target date
                for (const item of data.data) {
                    await fetch(`${this.apiBaseUrl}/menu`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: targetDate, product_id: item.product_id })
                    });
                }
                
                this.showNotification(`Copied ${data.data.length} items from ${this.formatDate(sourceDate)}`, 'success');
                this.loadMenuForDate();
            } else {
                this.showNotification('No menu found for the specified date', 'error');
            }
        } catch (error) {
            console.error('Error copying menu:', error);
            this.showNotification('Error copying menu', 'error');
        }
    }
}

// Initialize the menu manager when the DOM is loaded
let menuManager;
document.addEventListener('DOMContentLoaded', () => {
    menuManager = new MenuManager();
});
