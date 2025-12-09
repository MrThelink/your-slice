/**
 * Sidebar Manager
 * Handles sidebar navigation and active state management
 */

class SidebarManager {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.init();
    }

    detectCurrentPage() {
        const pathname = window.location.pathname;
        
        if (pathname.includes('adminPage.html') || pathname.includes('/admin/')) {
            return 'dashboard';
        } else if (pathname.includes('orders.html')) {
            return 'orders';
        } else if (pathname.includes('menu.html')) {
            return 'menu';
        } else if (pathname.includes('customer.html')) {
            return 'customers';
        }
        
        return null;
    }

    init() {
        this.updateActiveState();
        this.setupEventListeners();
    }

    updateActiveState() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            const page = link.getAttribute('data-page');
            if (page === this.currentPage) {
                link.classList.add('active');
                
                // Also mark the parent <li> as active
                link.parentElement?.classList.add('active');
            }
        });
    }

    setupEventListeners() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const page = link.getAttribute('data-page');
                
                if (page) {
                    // Optionally add active state immediately for better UX
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new SidebarManager();
});
