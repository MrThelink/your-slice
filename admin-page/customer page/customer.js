/**
 * Customers Page Script
 * Handles customer listing and management with backend integration
 */

document.addEventListener('DOMContentLoaded', async function() {
    setTimeout(async () => {
        setupUserMenu();
        setupLogout();
        await loadCustomers();
        setupRefreshButton();
    }, 100);
});

/**
 * Setup user menu toggle
 */
function setupUserMenu() {
    const userInfo = document.getElementById('userInfo');
    const userMenu = document.getElementById('userMenu');

    if (userInfo) {
        userInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });
    }

    document.addEventListener('click', () => {
        if (userMenu) {
            userMenu.classList.remove('active');
        }
    });
}

/**
 * Setup logout button
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('adminToken');
            window.location.href = '/admin-page/admin/adminPage.html';
        });
    }
}

/**
 * Load customers from backend
 */
async function loadCustomers() {
    const loadingMessage = document.getElementById('loadingMessage');
    const emptyMessage = document.getElementById('emptyMessage');
    const customersTable = document.getElementById('customersTable');
    const customersTableBody = document.querySelector('#customersTable tbody');

    try {
        if (!window.apiClient) {
            throw new Error('API Client not available');
        }

        const response = await window.apiClient.getCustomers();
        const customers = response.data || [];

        // Update statistics
        updateCustomerStats(customers);

        if (!customers || customers.length === 0) {
            if (loadingMessage) loadingMessage.style.display = 'none';
            if (emptyMessage) emptyMessage.style.display = 'block';
            if (customersTable) customersTable.style.display = 'none';
            return;
        }

        // Clear existing rows
        if (customersTableBody) {
            customersTableBody.innerHTML = '';

            // Display all customers
            customers.forEach(customer => {
                addCustomerRow(customer, customersTableBody);
            });
        }

        // Hide loading, show table
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (emptyMessage) emptyMessage.style.display = 'none';
        if (customersTable) customersTable.style.display = 'table';

    } catch (error) {
        console.error('Failed to load customers:', error);
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (emptyMessage) {
            emptyMessage.style.display = 'block';
            emptyMessage.innerHTML = `<p>Error loading customers: ${error.message}</p>`;
        }
        if (customersTable) customersTable.style.display = 'none';
    }
}

/**
 * Add customer row to table
 */
function addCustomerRow(customer, container) {
    const row = document.createElement('tr');
    const joinedDate = customer.createdAt 
        ? new Date(customer.createdAt).toLocaleDateString('fi-FI')
        : 'N/A';

    row.innerHTML = `
        <td>${customer.name || 'Unknown'}</td>
        <td>${customer.email || 'N/A'}</td>
        <td>${customer.age || '--'}</td>
        <td>${joinedDate}</td>
        <td><span class="status status-active"><i class="fas fa-check-circle"></i> Active</span></td>
    `;

    container.appendChild(row);
}

/**
 * Update customer statistics
 */
function updateCustomerStats(customers) {
    // Total customers
    document.getElementById('totalCustomers').textContent = customers.length || '0';

    // New this week (customers joined in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newThisWeek = customers.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate >= sevenDaysAgo;
    }).length;

    document.getElementById('newThisWeek').textContent = newThisWeek || '0';

    // Admin count (placeholder - would need role field)
    document.getElementById('adminCount').textContent = '1'; // Assuming at least 1 admin

    // Last updated
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('fi-FI');
}

/**
 * Setup refresh button
 */
function setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshBtn');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.classList.add('loading');
            await loadCustomers();
            refreshBtn.classList.remove('loading');
        });
    }
}
