// Admin Orders Management System
function initOrdersAdmin() {
    loadOrdersFromStorage();
    initScrollActionSelector();
    initSearch();
    initFilters();
    
    // Listen for new orders
    window.addEventListener('newOrderCreated', handleNewOrderNotification);
    
    // Check for new orders on page load
    checkForNewOrders();
    
    // Auto-refresh orders every 30 seconds
    setInterval(loadOrdersFromStorage, 30000);
}

function loadOrdersFromStorage() {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        console.log('Loading orders from localStorage:', orders);
        
        if (orders.length === 0) {
            showEmptyOrdersState();
            return;
        }
        
        displayOrders(orders);
        updateOrderCounts(orders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showErrorState();
    }
}

function displayOrders(orders) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    // Clear existing rows except headers
    tbody.innerHTML = '';
    
    // Sort orders by timestamp (newest first)
    const sortedOrders = orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedOrders.forEach(order => {
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
    
    // Update the orders count
    const ordersCount = document.querySelector('.table-header h2');
    if (ordersCount) {
        ordersCount.textContent = `Orders (${orders.length})`;
    }
}

function createOrderRow(order) {
    const row = document.createElement('tr');
    row.setAttribute('data-order-id', order.orderNumber);
    row.setAttribute('data-status', order.status.toLowerCase());
    
    // Format items for display
    const itemsDisplay = order.items.length > 2 
        ? `${order.items.slice(0, 2).map(item => item.name).join(', ')} + ${order.items.length - 2} more`
        : order.items.map(item => item.name).join(', ');
    
    // Determine status class
    const statusClass = getStatusClass(order.status);
    
    row.innerHTML = `
        <td>${order.orderNumber}</td>
        <td>${order.customer.name}</td>
        <td title="${order.items.map(item => `${item.name} - €${item.price.toFixed(2)}`).join('\\n')}">${itemsDisplay}</td>
        <td>€${order.pricing.total.toFixed(2)}</td>
        <td><span class="status ${statusClass}">${order.status}</span></td>
        <td data-label="Actions" class="action-cell">
            <select class="action-select">
                <option value="">Select action</option>
                <option value="process">⏱ Process</option>
                <option value="complete">✅ Complete</option>
                <option value="cancel">❌ Cancel</option>
            </select>
        </td>
    `;
    
    // Add click handler for view details
    row.addEventListener('dblclick', () => showOrderDetails(order));
    
    return row;
}

function getStatusClass(status) {
    const statusMap = {
        'New': 'status-new',
        'Processing': 'status-processing',
        'Completed': 'status-completed',
        'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-new';
}

function showOrderDetails(order) {
    const existingDialog = document.querySelector('.order-details-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    const dialog = document.createElement('dialog');
    dialog.className = 'order-details-dialog';
    dialog.innerHTML = `
        <div class="order-details-content">
            <div class="order-details-header">
                <h2>Order Details - ${order.orderNumber}</h2>
                <button class="close-details">×</button>
            </div>
            
            <div class="order-details-body">
                <div class="customer-section">
                    <h3>Customer Information</h3>
                    <div class="customer-info">
                        <div class="info-item">
                            <span class="label">Name:</span>
                            <span class="value">${order.customer.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Email:</span>
                            <span class="value">${order.customer.email}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Phone:</span>
                            <span class="value">${order.customer.phone}</span>
                        </div>
                    </div>
                </div>
                
                <div class="order-info-section">
                    <h3>Order Information</h3>
                    <div class="order-meta">
                        <div class="info-item">
                            <span class="label">Order Number:</span>
                            <span class="value">${order.orderNumber}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Status:</span>
                            <span class="value">
                                <span class="status ${getStatusClass(order.status)}">${order.status}</span>
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="label">Order Date:</span>
                            <span class="value">${order.createdAt}</span>
                        </div>
                    </div>
                </div>
                
                <div class="items-section">
                    <h3>Order Items</h3>
                    <div class="items-list">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <div class="item-main">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-price">€${item.price.toFixed(2)}</div>
                                </div>
                                ${item.details ? `<div class="item-details">${item.details}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="pricing-section">
                    <h3>Pricing Breakdown</h3>
                    <div class="pricing-details">
                        <div class="pricing-item">
                            <span>Subtotal:</span>
                            <span>€${order.pricing.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="pricing-item">
                            <span>Tax (24%):</span>
                            <span>€${order.pricing.tax.toFixed(2)}</span>
                        </div>
                        <div class="pricing-item pricing-total">
                            <span>Total:</span>
                            <span>€${order.pricing.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="order-details-footer">
                <button class="btn btn-secondary" id="closeDetails">Close</button>
                <button class="btn btn-primary" id="updateStatus">Update Status</button>
            </div>
        </div>
    `;

    // Add styles for order details dialog
    if (!document.getElementById('order-details-styles')) {
        const style = document.createElement('style');
        style.id = 'order-details-styles';
        style.textContent = `
            .order-details-dialog {
                border: none;
                border-radius: 12px;
                max-width: 800px;
                width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                padding: 0;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }

            .order-details-content {
                padding: 0;
            }

            .order-details-header {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .order-details-header h2 {
                margin: 0;
                font-size: 1.4rem;
            }

            .close-details {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .close-details:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .order-details-body {
                padding: 20px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 25px;
            }

            @media (max-width: 768px) {
                .order-details-body {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
            }

            .customer-section,
            .order-info-section,
            .items-section,
            .pricing-section {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
            }

            .items-section,
            .pricing-section {
                grid-column: 1 / -1;
            }

            .order-details-body h3 {
                margin: 0 0 15px 0;
                color: #e74c3c;
                font-size: 1.1rem;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 5px 0;
            }

            .label {
                font-weight: 500;
                color: #333;
            }

            .value {
                font-weight: 600;
                color: #e74c3c;
            }

            .order-item {
                background: white;
                padding: 10px;
                border-radius: 6px;
                margin-bottom: 10px;
                border-left: 3px solid #e74c3c;
            }

            .item-main {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .item-name {
                font-weight: 600;
                color: #333;
            }

            .item-price {
                font-weight: 600;
                color: #e74c3c;
            }

            .item-details {
                margin-top: 5px;
                font-size: 12px;
                color: #666;
                line-height: 1.3;
            }

            .pricing-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 5px 0;
            }

            .pricing-total {
                border-top: 2px solid #e74c3c;
                margin-top: 8px;
                padding-top: 8px;
                font-weight: 600;
                font-size: 1.1rem;
                color: #e74c3c;
            }

            .order-details-footer {
                padding: 20px;
                background: #f8f9fa;
                border-top: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                gap: 15px;
            }

            .order-details-footer .btn {
                flex: 1;
                padding: 12px;
                font-weight: 500;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
            }

            .btn-secondary:hover {
                background: #5a6268;
            }

            .btn-primary {
                background: #e74c3c;
                color: white;
            }

            .btn-primary:hover {
                background: #c0392b;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(dialog);
    dialog.showModal();

    // Event listeners
    dialog.querySelector('.close-details').addEventListener('click', () => {
        dialog.close();
        dialog.remove();
    });

    dialog.querySelector('#closeDetails').addEventListener('click', () => {
        dialog.close();
        dialog.remove();
    });

    dialog.querySelector('#updateStatus').addEventListener('click', () => {
        showStatusUpdateDialog(order, dialog);
    });

    // Close on outside click
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.close();
            dialog.remove();
        }
    });
}

function updateOrderCounts(orders) {
    const newCount = orders.filter(o => o.status === 'New').length;
    const processingCount = orders.filter(o => o.status === 'Processing').length;
    const completedCount = orders.filter(o => o.status === 'Completed').length;
    
    // Update filter button badges
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        let count = 0;
        
        if (text.includes('all')) count = orders.length;
        else if (text.includes('new')) count = newCount;
        else if (text.includes('processing')) count = processingCount;
        else if (text.includes('completed')) count = completedCount;
        
        // Add count badge
        btn.innerHTML = btn.textContent.split('(')[0].trim() + (count > 0 ? ` (${count})` : '');
    });
}

function showEmptyOrdersState() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr class="empty-state">
            <td colspan="6" style="text-align: center; padding: 40px;">
                <div style="color: #666; font-size: 18px; margin-bottom: 10px;">📋</div>
                <div style="color: #666; font-weight: 500;">No orders yet</div>
                <div style="color: #999; font-size: 14px; margin-top: 5px;">Orders from your website will appear here</div>
            </td>
        </tr>
    `;
}

function showErrorState() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr class="error-state">
            <td colspan="6" style="text-align: center; padding: 40px;">
                <div style="color: #e74c3c; font-size: 18px; margin-bottom: 10px;">⚠️</div>
                <div style="color: #e74c3c; font-weight: 500;">Error loading orders</div>
                <div style="color: #999; font-size: 14px; margin-top: 5px;">Please try refreshing the page</div>
            </td>
        </tr>
    `;
}

function handleNewOrderNotification() {
    // Show notification
    showAdminNotification('New order received! 🍕', 'success');
    
    // Reload orders
    setTimeout(loadOrdersFromStorage, 1000);
    
    // Clear the new orders flag
    localStorage.removeItem('hasNewOrders');
}

function checkForNewOrders() {
    if (localStorage.getItem('hasNewOrders') === 'true') {
        handleNewOrderNotification();
    }
}

function showAdminNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInNotification 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutNotification 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutNotification 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    });
}

function showStatusUpdateDialog(order, parentDialog) {
    const statusDialog = document.createElement('dialog');
    statusDialog.className = 'status-update-dialog';
    statusDialog.innerHTML = `
        <div class="status-update-content">
            <h3>Update Order Status</h3>
            <p>Change status for order ${order.orderNumber}</p>
            
            <div class="status-options">
                <label class="status-option">
                    <input type="radio" name="status" value="New" ${order.status === 'New' ? 'checked' : ''}>
                    <span class="status-label">🆕 New</span>
                </label>
                <label class="status-option">
                    <input type="radio" name="status" value="Processing" ${order.status === 'Processing' ? 'checked' : ''}>
                    <span class="status-label">⏱️ Processing</span>
                </label>
                <label class="status-option">
                    <input type="radio" name="status" value="Completed" ${order.status === 'Completed' ? 'checked' : ''}>
                    <span class="status-label">✅ Completed</span>
                </label>
                <label class="status-option">
                    <input type="radio" name="status" value="Cancelled" ${order.status === 'Cancelled' ? 'checked' : ''}>
                    <span class="status-label">❌ Cancelled</span>
                </label>
            </div>
            
            <div class="status-dialog-footer">
                <button class="btn btn-secondary" id="cancelStatusUpdate">Cancel</button>
                <button class="btn btn-primary" id="confirmStatusUpdate">Update Status</button>
            </div>
        </div>
    `;

    // Add styles for status dialog
    if (!document.getElementById('status-update-styles')) {
        const style = document.createElement('style');
        style.id = 'status-update-styles';
        style.textContent = `
            .status-update-dialog {
                border: none;
                border-radius: 8px;
                max-width: 400px;
                width: 90vw;
                padding: 0;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .status-update-content {
                padding: 20px;
            }

            .status-update-content h3 {
                margin: 0 0 10px 0;
                color: #e74c3c;
            }

            .status-update-content p {
                margin: 0 0 20px 0;
                color: #666;
            }

            .status-options {
                margin-bottom: 20px;
            }

            .status-option {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
                transition: background 0.3s;
            }

            .status-option:hover {
                background: #f8f9fa;
            }

            .status-option input[type="radio"] {
                margin-right: 10px;
            }

            .status-label {
                font-weight: 500;
            }

            .status-dialog-footer {
                display: flex;
                justify-content: space-between;
                gap: 10px;
            }

            .status-dialog-footer .btn {
                flex: 1;
                padding: 10px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-weight: 500;
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
            }

            .btn-primary {
                background: #e74c3c;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(statusDialog);
    statusDialog.showModal();

    statusDialog.querySelector('#cancelStatusUpdate').addEventListener('click', () => {
        statusDialog.close();
        statusDialog.remove();
    });

    statusDialog.querySelector('#confirmStatusUpdate').addEventListener('click', () => {
        const selectedStatus = statusDialog.querySelector('input[name="status"]:checked').value;
        updateOrderStatus(order.orderNumber, selectedStatus);
        statusDialog.close();
        statusDialog.remove();
        parentDialog.close();
        parentDialog.remove();
    });
}

function updateOrderStatus(orderNumber, newStatus) {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Reload orders display
            loadOrdersFromStorage();
            
            // Trigger order status update event for customer-side indicators
            window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
                detail: { 
                    orderNumber: orderNumber, 
                    newStatus: newStatus,
                    timestamp: Date.now()
                }
            }));
            
            showAdminNotification(`Order ${orderNumber} status updated to ${newStatus}`, 'success');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showAdminNotification('Error updating order status', 'error');
    }
}

function initScrollActionSelector() {
    const actionSelector = document.querySelector('.action-selector');
    const actionOptions = document.querySelectorAll('.action-option');
    const actionCells = document.querySelectorAll('.action-cell');
    let selectedAction = null;
    let activeRow = null;

    // Add click event listeners to action cells
    actionCells.forEach(cell => {
        cell.addEventListener('click', function(e) {
            e.stopPropagation();

            // Remove active class from all rows
            document.querySelectorAll('tbody tr').forEach(r => r.classList.remove('active'));

            // Mark this row as active
            const row = this.closest('tr');
            row.classList.add('active');
            activeRow = row;

            // Position action selector near the active row
            positionActionSelector(row);

            // Show action selector
            actionSelector.style.display = 'flex';
        });
    });

    // Handle action option clicks
    actionOptions.forEach(option => {
        option.addEventListener('click', function() {
            actionOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedAction = this.getAttribute('data-action');

            if (activeRow) {
                updateRowAction(activeRow, selectedAction);

                // Hide selector after a short delay
                setTimeout(() => {
                    actionSelector.style.display = 'none';
                    activeRow.classList.remove('active');
                    activeRow = null;
                }, 1000);
            }
        });
    });

    // Position action selector relative to row
    function positionActionSelector(row) {
        const rowRect = row.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const topPosition = rowRect.top + scrollY + rowRect.height / 2 - actionSelector.offsetHeight / 2;

        actionSelector.style.top = `${topPosition}px`;

        if (window.innerWidth > 768) {
            actionSelector.style.right = '20px';
            actionSelector.style.left = 'auto';
            actionSelector.style.transform = 'none';
        } else {
            actionSelector.style.left = '50%';
            actionSelector.style.right = 'auto';
            actionSelector.style.transform = 'translateX(-50%)';
        }
    }

    // Update row text and status
    function updateRowAction(row, action) {
        const actionCell = row.querySelector('.action-cell');
        const orderNumber = row.getAttribute('data-order-id');
        let actionText = '';
        let newStatus = '';

        switch(action) {
            case 'process': {
                actionText = 'Processing order...';
                newStatus = 'Processing';
                break;
            }
            case 'complete': {
                actionText = 'Order completed!';
                newStatus = 'Completed';
                break;
            }
            case 'cancel': {
                actionText = 'Order cancelled';
                newStatus = 'Cancelled';
                break;
            }
        }

        if (actionText) {
            actionCell.innerHTML = `<span class="action-applied">${actionText}</span>`;
        }

        if (newStatus && orderNumber) {
            updateOrderStatus(orderNumber, newStatus);
            
            setTimeout(() => {
                actionCell.innerHTML = `
                    <select class="action-select">
                        <option value="">Select action</option>
                        <option value="process">⏱ Process</option>
                        <option value="complete">✅ Complete</option>
                        <option value="cancel">❌ Cancel</option>
                    </select>
                `;
            }, 2000);
        }
    }

    // Close selector when clicking outside
    document.addEventListener('click', function(e) {
        if (actionSelector && !actionSelector.contains(e.target) && !e.target.closest('.action-cell')) {
            actionSelector.style.display = 'none';
            if (activeRow) {
                activeRow.classList.remove('active');
                activeRow = null;
            }
        }
    });
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchOrder');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            
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

// Filter functionality
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.textContent.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const statusCell = row.querySelector('.status');
                const status = statusCell ? statusCell.textContent.toLowerCase() : '';
                
                if (filter.includes('all') || status.includes(filter.split('(')[0].trim())) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
}

// Run after DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    initOrdersAdmin();
});
