/**
 * Admin Dashboard Script
 * Handles dashboard data loading and interaction
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Wait for scripts to load
    setTimeout(async () => {
        // Initialize dashboard
        setupUserMenu();
        setupLogout();
        await loadDashboardStats();
        await loadRecentOrders();
        setupFilterButtons();
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

    // Close menu when clicking outside
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
 * Load dashboard statistics from backend
 */
async function loadDashboardStats() {
    try {
        if (!window.apiClient) {
            throw new Error('API Client not available');
        }
        
        const stats = await window.apiClient.getDashboardStats();

        // Update stat cards
        document.getElementById('newOrdersCount').textContent = stats.newOrders;
        document.getElementById('processingOrdersCount').textContent = stats.processingOrders;
        document.getElementById('completedOrdersCount').textContent = stats.completedToday;
        document.getElementById('revenueDisplay').textContent = `€${stats.todayRevenue.toFixed(2)}`;

    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Show default values on error
        document.getElementById('newOrdersCount').textContent = '0';
        document.getElementById('processingOrdersCount').textContent = '0';
        document.getElementById('completedOrdersCount').textContent = '0';
        document.getElementById('revenueDisplay').textContent = '€0.00';
    }
}

/**
 * Load recent orders from backend
 */
async function loadRecentOrders() {
    const ordersLoading = document.getElementById('ordersLoading');
    const ordersEmpty = document.getElementById('ordersEmpty');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const ordersTableContent = document.getElementById('ordersTableContent');

    try {
        if (!window.apiClient) {
            throw new Error('API Client not available');
        }

        const response = await window.apiClient.getOrders();
        const orders = response.data || [];

        if (!orders || orders.length === 0) {
            if (ordersLoading) ordersLoading.style.display = 'none';
            if (ordersEmpty) ordersEmpty.style.display = 'block';
            if (ordersTableBody) ordersTableBody.style.display = 'none';
            return;
        }

        // Clear existing rows
        if (ordersTableContent) {
            ordersTableContent.innerHTML = '';

            // Limit to 10 most recent orders
            orders.slice(0, 10).forEach(order => {
                const row = document.createElement('tr');
                const statusClass = `status-${order.status.toLowerCase()}`;
                const itemsText = order.items 
                    ? order.items.map(item => `${item.product_name || 'Item'}`).join(', ')
                    : 'N/A';

                row.innerHTML = `
                    <td>${order.order_id || 'N/A'}</td>
                    <td>${order.customer_name || 'Unknown'}</td>
                    <td>${itemsText}</td>
                    <td>€${(order.total || 0).toFixed(2)}</td>
                    <td><span class="status ${statusClass}">${order.status}</span></td>
                    <td class="action-cell">
                        <select class="action-select" data-order-id="${order.order_id}">
                            <option value="">Actions</option>
                            <option value="view">View</option>
                            ${order.status !== 'completed' ? `<option value="complete">Complete</option>` : ''}
                            ${order.status !== 'cancelled' ? `<option value="cancel">Cancel</option>` : ''}
                        </select>
                    </td>
                `;

                ordersTableContent.appendChild(row);
            });
        }

        // Hide loading, show table
        if (ordersLoading) ordersLoading.style.display = 'none';
        if (ordersEmpty) ordersEmpty.style.display = 'none';
        if (ordersTableBody) ordersTableBody.style.display = 'table';

        // Setup action select handlers
        setupActionSelects();

    } catch (error) {
        console.error('Failed to load orders:', error);
        ordersLoading.style.display = 'none';
        ordersEmpty.style.display = 'block';
        ordersTableBody.style.display = 'none';
    }
}

/**
 * Setup action select change handlers
 */
function setupActionSelects() {
    const actionSelects = document.querySelectorAll('.action-select');

    actionSelects.forEach(select => {
        select.addEventListener('change', async function() {
            const action = this.value;
            const orderId = this.getAttribute('data-order-id');

            if (!action) return;

            try {
                if (!window.apiClient) {
                    throw new Error('API Client not available');
                }

                if (action === 'complete') {
                    await window.apiClient.updateOrderStatus(orderId, 'completed');
                    alert('Order marked as completed');
                } else if (action === 'cancel') {
                    await window.apiClient.updateOrderStatus(orderId, 'cancelled');
                    alert('Order cancelled');
                } else if (action === 'view') {
                    console.log('View order:', orderId);
                } else if (action === 'edit') {
                    console.log('Edit order:', orderId);
                }

                // Reload orders
                await loadRecentOrders();
                await loadRecentOrders();
            } catch (error) {
                console.error('Action failed:', error);
                alert('Failed to perform action');
            }

            // Reset select
            this.value = '';
        });
    });
}

/**
 * Setup filter buttons
 */
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            filterOrdersByStatus(filter);
        });
    });
}

/**
 * Filter orders by status
 */
function filterOrdersByStatus(status) {
    const rows = document.querySelectorAll('#ordersTableContent tr');

    rows.forEach(row => {
        const statusCell = row.querySelector('.status');
        if (!statusCell) return;

        const rowStatus = statusCell.textContent.toLowerCase();

        if (status === 'all') {
            row.style.display = '';
        } else if (rowStatus.includes(status.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * Capitalize first letter of status
 */
function capitalizeStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}