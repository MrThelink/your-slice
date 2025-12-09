/**
 * API Client for backend communication
 * Handles all requests to the Your Slice backend API
 */

const API_BASE_URL = 'https://mywebserver1234.norwayeast.cloudapp.azure.com/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('adminToken') || null;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('adminToken', token);
    }

    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.includeAuth !== false),
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                // Token expired or unauthorized
                this.handleUnauthorized();
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    handleUnauthorized() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin-page/admin/adminPage.html';
    }

    // ============ ORDERS ============
    async getOrders() {
        return this.request('/orders', {
            method: 'GET',
        });
    }

    async getOrderById(orderId) {
        return this.request(`/orders/${orderId}`, {
            method: 'GET',
        });
    }

    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async updateOrderStatus(orderId, status) {
        return this.request(`/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    // ============ CUSTOMERS ============
    async getCustomers() {
        return this.request('/customers', {
            method: 'GET',
        });
    }

    async getCustomerById(customerId) {
        return this.request(`/customers/${customerId}`, {
            method: 'GET',
        });
    }

    // ============ MENU ============
    async getTodayMenu() {
        return this.request('/menu/today', {
            method: 'GET',
        });
    }

    async getWeeklyMenu() {
        return this.request('/menu/weekly', {
            method: 'GET',
        });
    }

    async getMenuByDate(date) {
        return this.request(`/menu/${date}`, {
            method: 'GET',
        });
    }

    async getMenuByDateRange(startDate, endDate) {
        return this.request(`/menu/range?startDate=${startDate}&endDate=${endDate}`, {
            method: 'GET',
        });
    }

    async getAvailableMenuDates() {
        return this.request('/menu/dates', {
            method: 'GET',
        });
    }

    async getMenuStats(date) {
        return this.request(`/menu/stats/${date}`, {
            method: 'GET',
        });
    }

    async addToMenu(menuData) {
        return this.request('/menu', {
            method: 'POST',
            body: JSON.stringify(menuData),
        });
    }

    async bulkAddToMenu(menuItems) {
        return this.request('/menu/bulk', {
            method: 'POST',
            body: JSON.stringify({ items: menuItems }),
        });
    }

    async updateMenuItemPrice(menuId, price) {
        return this.request(`/menu/price/${menuId}`, {
            method: 'PUT',
            body: JSON.stringify({ price }),
        });
    }

    async removeFromMenu(menuId) {
        return this.request(`/menu/${menuId}`, {
            method: 'DELETE',
        });
    }

    async clearMenuForDate(date) {
        return this.request(`/menu/clear/${date}`, {
            method: 'DELETE',
        });
    }

    // ============ PRODUCTS ============
    async getProducts() {
        return this.request('/products', {
            method: 'GET',
            includeAuth: false,
        });
    }

    async getProductById(productId) {
        return this.request(`/products/${productId}`, {
            method: 'GET',
            includeAuth: false,
        });
    }

    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    }

    async updateProduct(productId, productData) {
        return this.request(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    }

    async deleteProduct(productId) {
        return this.request(`/products/${productId}`, {
            method: 'DELETE',
        });
    }

    // ============ DASHBOARD STATS ============
    async getDashboardStats() {
        try {
            const [orders, customers, todayMenu] = await Promise.all([
                this.getOrders().catch(() => ({ data: [] })),
                this.getCustomers().catch(() => ({ data: [] })),
                this.getTodayMenu().catch(() => ({ data: [] })),
            ]);

            // Calculate stats from the data
            const stats = {
                newOrders: orders.data?.filter(o => o.status === 'new').length || 0,
                processingOrders: orders.data?.filter(o => o.status === 'processing').length || 0,
                completedToday: orders.data?.filter(o => o.status === 'completed').length || 0,
                totalCustomers: customers.data?.length || 0,
                todayMenuItems: todayMenu.data?.length || 0,
            };

            // Calculate revenue from completed orders
            stats.todayRevenue = orders.data?.reduce((sum, order) => {
                if (order.status === 'completed') {
                    return sum + (order.total || 0);
                }
                return sum;
            }, 0) || 0;

            return stats;
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            return {
                newOrders: 0,
                processingOrders: 0,
                completedToday: 0,
                totalCustomers: 0,
                todayMenuItems: 0,
                todayRevenue: 0,
            };
        }
    }
}

// Create and export singleton instance
const apiClient = new APIClient();

// Make it available globally
window.apiClient = apiClient;

// Log initialization
console.log('API Client initialized', {
    hasToken: !!apiClient.token,
    tokenLength: apiClient.token ? apiClient.token.length : 0
});
