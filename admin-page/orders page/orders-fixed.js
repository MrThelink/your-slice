/**
 * Orders Page Script
 * Handles orders listing and management with backend integration
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Wait a moment for scripts to fully load
    setTimeout(async () => {
        setupUserMenu();
        setupLogout();
        
        // Make sure apiClient is available
        if (!window.apiClient) {
            console.error('apiClient not loaded');
            const ordersEmpty = document.getElementById('ordersEmpty');
            if (ordersEmpty) {
                document.getElementById('ordersLoading').style.display = 'none';
                ordersEmpty.style.display = 'block';
                ordersEmpty.innerHTML = '<p>Error: API Client not loaded</p>';
            }
            return;
        }
        
        await loadOrders();
        setupFilterButtons();
        setupSearchBar();
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
 * Load all orders from backend
 */
async function loadOrders() {
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

            // Display all orders
            orders.forEach(order => {
                addOrderRow(order, ordersTableContent);
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
        if (ordersLoading) ordersLoading.style.display = 'none';
        if (ordersEmpty) {
            ordersEmpty.style.display = 'block';
            ordersEmpty.innerHTML = `<p>Error loading orders: ${error.message}</p>`;
        }
        if (ordersTableBody) ordersTableBody.style.display = 'none';
    }
}

/**
 * Add order row to table
 */
function addOrderRow(order, container) {
    const row = document.createElement('tr');
    const statusClass = `status-${order.status.toLowerCase()}`;
    const itemsText = order.items && order.items.length > 0 
        ? order.items.map(i => i.product_name || 'Unknown').join(', ')
        : 'No items';

    row.innerHTML = `
        <td>${order.order_id}</td>
        <td>${order.customer_name || 'Guest'}</td>
        <td>${itemsText}</td>
        <td>€${parseFloat(order.total).toFixed(2)}</td>
        <td><span class="status-badge ${statusClass}">${order.status}</span></td>
        <td>${new Date(order.created_at).toLocaleDateString()}</td>
        <td>
            <select class="action-select" data-order-id="${order.order_id}">
                <option value="">Actions</option>
                <option value="view">View Details</option>
                <option value="mark-ready">Mark as Ready</option>
                <option value="mark-completed">Mark as Completed</option>
                <option value="cancel">Cancel Order</option>
            </select>
        </td>
    `;

    container.appendChild(row);
}

/**
 * Setup action select handlers
 */
function setupActionSelects() {
    const selects = document.querySelectorAll('.action-select');
    
    selects.forEach(select => {
        select.addEventListener('change', async (e) => {
            const action = e.target.value;
            const orderId = e.target.getAttribute('data-order-id');
            
            if (!action) return;
            
            try {
                if (action === 'mark-ready') {
                    await window.apiClient.updateOrderStatus(orderId, 'processing');
                } else if (action === 'mark-completed') {
                    await window.apiClient.updateOrderStatus(orderId, 'completed');
                } else if (action === 'cancel') {
                    await window.apiClient.updateOrderStatus(orderId, 'cancelled');
                }
                
                // Reload orders
                await loadOrders();
            } catch (error) {
                console.error('Error updating order:', error);
            }
            
            e.target.value = '';
        });
    });
}

/**
 * Setup filter buttons
 */
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('[data-filter]');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
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
        if (status === 'all') {
            row.style.display = '';
        } else {
            const statusCell = row.querySelector('.status-badge');
            if (statusCell && statusCell.textContent.toLowerCase() === status.toLowerCase()) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

/**
 * Setup search functionality
 */
function setupSearchBar() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#ordersTableContent tr');
            
            rows.forEach(row => {
                const orderId = row.querySelector('td:first-child')?.textContent.toLowerCase() || '';
                const customer = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
                const items = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
                
                if (orderId.includes(query) || customer.includes(query) || items.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}
