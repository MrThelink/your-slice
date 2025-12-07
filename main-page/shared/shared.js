// shared.js - Common JavaScript functionality across all pages
document.addEventListener("DOMContentLoaded", function () {
  // ---------- HELPERS ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const safeAddListener = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

  // Make helpers globally available
  window.$ = $;
  window.$$ = $$;
  window.safeAddListener = safeAddListener;

  // ---------- TUTORIAL PREFERENCES ----------
  const TUTORIALS_DISABLED_KEY = 'tutorialsDisabled';
  
  function areTutorialsDisabled() {
    return localStorage.getItem(TUTORIALS_DISABLED_KEY) === 'true';
  }
  
  function disableTutorials() {
    localStorage.setItem(TUTORIALS_DISABLED_KEY, 'true');
    showToast('Tutorials disabled. You can enable them again in settings.', 'info', 4000);
  }
  
  function enableTutorials() {
    localStorage.removeItem(TUTORIALS_DISABLED_KEY);
    showToast('Tutorials enabled!', 'success', 3000);
  }
  
  function showTutorialsSettings() {
    const settingsDialog = document.createElement('dialog');
    settingsDialog.className = 'tutorial-settings-dialog';
    settingsDialog.innerHTML = `
      <div class="dialog-content">
        <h3>Tutorial Settings</h3>
        <p>Control whether you see helpful tips and tutorials throughout the site.</p>
        <div class="settings-option">
          <label class="toggle-switch">
            <input type="checkbox" id="tutorialsToggle" ${!areTutorialsDisabled() ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <span class="setting-label">Show tutorials and tips</span>
        </div>
        <div class="dialog-buttons">
          <button class="btn btn-secondary" id="closeSettings">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(settingsDialog);
    settingsDialog.showModal();
    
    // Handle toggle
    const toggle = settingsDialog.querySelector('#tutorialsToggle');
    toggle.addEventListener('change', function() {
      if (this.checked) {
        enableTutorials();
      } else {
        disableTutorials();
      }
    });
    
    // Handle close
    settingsDialog.querySelector('#closeSettings').addEventListener('click', function() {
      settingsDialog.close();
      document.body.removeChild(settingsDialog);
    });
  }

  // Make tutorial functions globally available
  window.areTutorialsDisabled = areTutorialsDisabled;
  window.showTutorialsSettings = showTutorialsSettings;

  // ---------- UX ENHANCEMENTS ----------
  function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${getToastIcon(type)}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close">×</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, duration);
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', function() {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    });
  }

  function getToastIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅', 
      warning: '⚠️',
      error: '❌'
    };
    return icons[type] || icons.info;
  }

  function showTutorial(message, position = 'center', icon = '💡') {
    if (areTutorialsDisabled()) return;
    
    const tutorial = document.createElement('div');
    tutorial.className = `tutorial tutorial-${position}`;
    
    let disableCheckbox = '';
    if (position !== 'top') {
      disableCheckbox = `
        <div class="tutorial-disable-option">
          <label>
            <input type="checkbox" class="disable-tutorials-checkbox">
            Don't show tutorials again
          </label>
        </div>
      `;
    }
    
    tutorial.innerHTML = `
      <div class="tutorial-content">
        <div class="tutorial-icon">${icon}</div>
        <div class="tutorial-message">${message}</div>
        ${disableCheckbox}
        <div class="tutorial-buttons">
          <button class="tutorial-close">Got it!</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(tutorial);
    
    // Show tutorial
    setTimeout(() => tutorial.classList.add('show'), 100);
    
    // Handle close
    const closeBtn = tutorial.querySelector('.tutorial-close');
    const handleClose = () => {
      const checkbox = tutorial.querySelector('.disable-tutorials-checkbox');
      if (checkbox && checkbox.checked) {
        disableTutorials();
      }
      
      tutorial.classList.remove('show');
      setTimeout(() => {
        if (tutorial.parentNode) {
          document.body.removeChild(tutorial);
        }
      }, 300);
    };
    
    closeBtn.addEventListener('click', handleClose);
    
    // Auto close after 15 seconds
    setTimeout(handleClose, 15000);
  }

  // Make UX functions globally available
  window.showToast = showToast;
  window.showTutorial = showTutorial;

  // ---------- COMPONENT LOADING ----------
  function loadComponents() {
    // Determine the correct path to shared components based on current location
    const currentPath = window.location.pathname;
    let componentPath = '';
    
    // Check if we're in the root directory or a subdirectory
    if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/main-page/') || currentPath.endsWith('/main-page/index.html')) {
      // Root level (main-page/)
      componentPath = 'shared/components/';
    } else {
      // Subfolder level (builder/, menu/, contact/, etc.)
      componentPath = '../shared/components/';
    }
    
    // Load header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
      fetch(componentPath + 'header.html')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load header');
          }
          return response.text();
        })
        .then(data => {
          headerPlaceholder.innerHTML = data;
          // Initialize auth dialogs after header loads
          setTimeout(initAuthDialogs, 100);
          // Set active navigation state
          setTimeout(setActiveNavigation, 100);
          // Fix navigation paths
          setTimeout(fixNavigationPaths, 150);
          // Call page-specific initialization after components load
          setTimeout(initPageSpecific, 200);
        })
        .catch(error => {
          console.error('Error loading header:', error);
          headerPlaceholder.innerHTML = '<p>Error loading header</p>';
        });
    }

    // Load footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      fetch(componentPath + 'footer.html')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load footer');
          }
          return response.text();
        })
        .then(data => {
          footerPlaceholder.innerHTML = data;
        })
        .catch(error => {
          console.error('Error loading footer:', error);
          footerPlaceholder.innerHTML = '<p>Error loading footer</p>';
        });
    }
  }

  // ---------- ACTIVE NAVIGATION ----------
  function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    // Remove all active states
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active state based on current path
    if (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath.endsWith('/main-page/')) {
      const homeLink = document.querySelector('.nav-home');
      if (homeLink) homeLink.classList.add('active');
    } else if (currentPath.includes('/builder/') || currentPath.includes('build-your-slice')) {
      const builderLink = document.querySelector('.nav-builder');
      if (builderLink) builderLink.classList.add('active');
    } else if (currentPath.includes('/menu/') || currentPath.includes('menu.html')) {
      const menuLink = document.querySelector('.nav-menu');
      if (menuLink) menuLink.classList.add('active');
    } else if (currentPath.includes('/contact/') || currentPath.includes('contact.html')) {
      const contactLink = document.querySelector('.nav-contact');
      if (contactLink) contactLink.classList.add('active');
    }
  }

  // ---------- NAVIGATION PATH FIXING ----------
  function fixNavigationPaths() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a[href], .logo a[href]');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#')) {
        // If we're in a subfolder, adjust relative paths
        if (currentPath !== '/' && !currentPath.endsWith('/index.html') && !currentPath.endsWith('/main-page/')) {
          if (href === './') {
            link.href = '../';
          } else if (href.startsWith('./')) {
            link.href = href.replace('./', '../');
          }
        }
      }
    });
  }

  // ---------- PAGE-SPECIFIC INITIALIZATION ----------
  function initPageSpecific() {
    const currentPath = window.location.pathname;
    
    // Call page-specific initialization functions if they exist
    if ((currentPath.includes('/menu/') || currentPath.includes('menu.html')) && typeof window.initializeMenuPage === 'function') {
      window.initializeMenuPage();
    } else if ((currentPath.includes('/builder/') || currentPath.includes('build-your-slice')) && typeof window.initializeBuilderPage === 'function') {
      window.initializeBuilderPage();
    } else if ((currentPath.includes('/contact/') || currentPath.includes('contact.html')) && typeof window.initializeContactPage === 'function') {
      window.initializeContactPage();
    } else if ((currentPath === '/' || currentPath.includes('index.html') || currentPath.endsWith('/main-page/')) && typeof window.initializeHomePage === 'function') {
      window.initializeHomePage();
    }
  }

  // ---------- GLOBAL CART SYSTEM ----------
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let isCartOpen = false;

  function updateCart() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.querySelector('.cart-items');
    const cartSubtotal = document.querySelector('.cart-subtotal');
    const cartTotal = document.querySelector('.cart-total');
    
    if (cartCount) {
      cartCount.textContent = cart.length;
    }
    
    if (cartItems && cartSubtotal && cartTotal) {
      if (cart.length === 0) {
        cartItems.innerHTML = `
          <div class="empty-cart">
            <div>🛒</div>
            <p>Your cart is empty</p>
          </div>
        `;
        cartSubtotal.textContent = '€0.00';
        cartTotal.textContent = '€2.50';
      } else {
        cartItems.innerHTML = cart.map((item, index) => {
          // Only show modify button for custom pizzas
          const modifyButton = item.type === 'pizza' ? 
            `<button class="modify-pizza" onclick="modifyCartItem(${index})" title="Modify this custom pizza">Modify</button>` : 
            '';
          
          // Add visual indicator for custom items
          const customIndicator = item.type === 'pizza' ? 
            `<span class="custom-indicator">🍕 Custom</span>` : 
            '';
          
          return `
            <div class="cart-item" data-index="${index}">
              <div class="item-info">
                <h4>${item.name} ${customIndicator}</h4>
                <p class="item-details">${item.details || ''}</p>
                <span class="item-price">€${item.price.toFixed(2)}</span>
              </div>
              <div class="item-actions">
                ${modifyButton}
                <button class="remove-item" data-index="${index}" title="Remove from cart">×</button>
              </div>
            </div>
          `;
        }).join('');
        
        const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
        const deliveryFee = subtotal > 0 ? 2.50 : 0;
        cartSubtotal.textContent = `€${subtotal.toFixed(2)}`;
        cartTotal.textContent = `€${(subtotal + deliveryFee).toFixed(2)}`;
        
        // Add remove listeners
        cartItems.querySelectorAll('.remove-item').forEach(btn => {
          btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            removeFromCart(index);
          });
        });
      }
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function addToCart(item) {
    cart.push(item);
    updateCart();
    showToast(`${item.name} added to cart!`, 'success');
    
    // Add bounce animation to cart icon
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('bounce');
      setTimeout(() => cartIcon.classList.remove('bounce'), 600);
    }
    
    // Auto-open cart panel to show the newly added item
    const cartPanel = $('.cart-panel');
    if (cartPanel && !isCartOpen) {
      // Open the cart automatically
      toggleCart();
      
      // Close it automatically after 3 seconds if user doesn't interact
      setTimeout(() => {
        if (isCartOpen && !cartPanel.matches(':hover')) {
          toggleCart();
        }
      }, 3000);
    }
  }

  function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
      const item = cart[index];
      cart.splice(index, 1);
      updateCart();
      showToast(`${item.name} removed from cart`, 'info');
    }
  }

  function modifyCartItem(index) {
    const item = cart[index];
    
    console.log('Modify button clicked for index:', index);
    console.log('Item to modify:', item);
    
    // Validate index and item
    if (index < 0 || index >= cart.length || !item) {
      showToast('Invalid item selection!', 'error', 3000);
      return;
    }
    
    // Only allow modification of custom pizzas
    if (item.type !== 'pizza') {
      showToast('Only custom pizzas can be modified!', 'warning', 3000);
      return;
    }
    
    // Check if item has the required data for modification
    if (!item.config && !item.details) {
      showToast('This pizza cannot be modified (missing configuration data).', 'warning', 4000);
      return;
    }
    
    console.log('Modifying cart item:', item);
    
    // Store modification context with all required data
    localStorage.setItem('modifyingPizza', JSON.stringify({
      index: index,
      pizza: item
    }));
    
    // Show feedback and navigate to builder
    showToast('Opening pizza builder for modifications...', 'info', 2000);
    
    // Determine the correct path to the builder
    const currentPath = window.location.pathname;
    let builderPath = '';
    
    if (currentPath === '/' || currentPath.endsWith('/main-page/') || currentPath.endsWith('/main-page/index.html')) {
      // From root level
      builderPath = './builder/';
    } else {
      // From subfolder level
      builderPath = '../builder/';
    }
    
    console.log('Navigating to builder:', builderPath);
    
    // Close cart first
    if (isCartOpen) {
      toggleCart();
    }
    
    // Navigate to builder after a short delay
    setTimeout(() => {
      window.location.href = builderPath;
    }, 1000);
  }

  function toggleCart() {
    const cartPanel = document.querySelector('.cart-panel');
    if (!cartPanel) return;
    
    isCartOpen = !isCartOpen;
    cartPanel.classList.toggle('open', isCartOpen);
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
  }

  // Make cart functions globally available
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.toggleCart = toggleCart;
  window.updateCart = updateCart;

  // Cart event listeners
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('cart-icon') || e.target.closest('.cart-icon')) {
      toggleCart();
    }
    
    if (e.target.classList.contains('close-cart')) {
      toggleCart();
    }
    
    if (e.target.classList.contains('checkout-btn')) {
      if (cart.length === 0) {
        showToast('Your cart is empty!', 'warning');
        return;
      }
      initiateCheckout();
    }
  });

  // Make cart functions globally available
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.modifyCartItem = modifyCartItem;
  window.updateCart = updateCart;
  
  // Debug functions for testing
  window.addTestPizza = function() {
    addToCart({
      name: "Test Custom Pizza",
      price: 8.50,
      details: "Base: Original, Sauce: Tomato Sauce, Cheese: Mozzarella, Toppings: Pepperoni, Mushrooms",
      config: {
        base: { name: "Original", price: 0 },
        sauce: { name: "Tomato Sauce", price: 0 },
        cheese: { name: "Mozzarella", price: 0 },
        toppings: [
          { name: "Pepperoni", price: 1.50 },
          { name: "Mushrooms", price: 1.00 }
        ]
      },
      type: 'pizza'
    });
    console.log('Test pizza added to cart');
  };
  
  window.addTestMenuItem = function() {
    addToCart({
      name: "Margherita Special",
      price: 12.00,
      details: "Today's lunch special",
      type: 'menu-item'
    });
    console.log('Test menu item added to cart');
  };
  
  window.debugCart = function() {
    console.log('Current cart:', cart);
    console.log('Cart length:', cart.length);
    cart.forEach((item, index) => {
      console.log(`Item ${index}:`, item);
    });
  };

  // ---------- LOGIN & SIGNUP DIALOGS ----------
  function initAuthDialogs() {
    const loginBtn = document.getElementById('openLoginDialog');
    const signupBtn = document.getElementById('openSignupDialog');
    const loginDialog = document.getElementById('loginDialog');
    const signupDialog = document.getElementById('signupDialog');

    if (loginBtn && loginDialog) {
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginDialog.showModal();
      });
    }

    if (signupBtn && signupDialog) {
      signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupDialog.showModal();
      });
    }

    // Handle dialog closes
    [loginDialog, signupDialog].forEach(dialog => {
      if (dialog) {
        const closeBtn = dialog.querySelector('.close-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', function() {
            dialog.close();
          });
        }

        const cancelBtn = dialog.querySelector('.cancel-btn');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', function() {
            dialog.close();
          });
        }

        // Handle form submission
        const form = dialog.querySelector('form');
        if (form) {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formType = dialog.id === 'loginDialog' ? 'Login' : 'Sign up';
            showToast(`${formType} functionality coming soon!`, 'info');
            dialog.close();
          });
        }
      }
    });
  }

  // ---------- REVIEWS SYSTEM ----------
  function initReviewsSystem() {
    const reviewsSection = $('.reviews-section');
    if (!reviewsSection) return;

    // Load existing reviews
    loadReviews();

    // Handle review form submission
    const addReviewForm = $('#addReviewForm');
    if (addReviewForm) {
      addReviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const review = {
          id: Date.now(),
          name: formData.get('reviewerName'),
          rating: parseInt(formData.get('rating')),
          comment: formData.get('comment'),
          date: new Date().toLocaleDateString()
        };
        
        saveReview(review);
        this.reset();
        showToast('Review added successfully!', 'success');
      });
    }
  }

  function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const reviewsList = $('.reviews-list');
    
    if (!reviewsList) return;
    
    if (reviews.length === 0) {
      reviewsList.innerHTML = '<p>No reviews yet. Be the first to share your experience!</p>';
      return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
      <div class="review-item">
        <div class="review-header">
          <strong>${review.name}</strong>
          <div class="review-rating">
            ${'⭐'.repeat(review.rating)}
          </div>
          <span class="review-date">${review.date}</span>
        </div>
        <p class="review-comment">${review.comment}</p>
      </div>
    `).join('');
  }

  function saveReview(review) {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    reviews.unshift(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    loadReviews();
  }

  // ---------- ORDER MANAGEMENT SYSTEM ----------
  
  function generateOrderNumber() {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    return `ORD-${timestamp}${random}`;
  }

  function saveOrderToStorage(order) {
    try {
      // Get existing orders from localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
      
      // Add new order
      existingOrders.push(order);
      
      // Save back to localStorage
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      console.log('Order saved to localStorage:', order);
      return true;
    } catch (error) {
      console.error('Error saving order to localStorage:', error);
      return false;
    }
  }

  function createCheckoutDialog() {
    const existingDialog = document.querySelector('.checkout-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    const dialog = document.createElement('dialog');
    dialog.className = 'checkout-dialog';
    dialog.innerHTML = `
      <div class="checkout-content">
        <div class="checkout-header">
          <h2>🍕 Complete Your Order</h2>
          <button class="close-checkout">×</button>
        </div>
        
        <div class="checkout-body">
          <div class="customer-info-section">
            <h3>Customer Information</h3>
            <form id="customerForm">
              <div class="form-group">
                <label for="customerName">Full Name *</label>
                <input type="text" id="customerName" name="name" required placeholder="Enter your full name">
              </div>
              <div class="form-group">
                <label for="customerEmail">Email Address *</label>
                <input type="email" id="customerEmail" name="email" required placeholder="Enter your email">
              </div>
              <div class="form-group">
                <label for="customerPhone">Phone Number *</label>
                <input type="tel" id="customerPhone" name="phone" required placeholder="Enter your phone number">
              </div>
            </form>
          </div>
          
          <div class="order-summary-section">
            <h3>Order Summary</h3>
            <div class="checkout-items" id="checkoutItems">
              <!-- Items will be populated here -->
            </div>
            <div class="checkout-total">
              <div class="total-line">
                <span>Subtotal:</span>
                <span id="checkoutSubtotal">€0.00</span>
              </div>
              <div class="total-line">
                <span>Tax (24%):</span>
                <span id="checkoutTax">€0.00</span>
              </div>
              <div class="total-line total-final">
                <span>Total:</span>
                <span id="checkoutTotal">€0.00</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="checkout-footer">
          <button type="button" class="btn btn-secondary" id="cancelCheckout">Cancel</button>
          <button type="button" class="btn btn-primary" id="completeOrder">Complete Order</button>
        </div>
      </div>
    `;

    // Add styles for the checkout dialog
    const styles = `
      <style>
        .checkout-dialog {
          border: none;
          border-radius: 12px;
          max-width: 600px;
          width: 90vw;
          max-height: 80vh;
          overflow-y: auto;
          padding: 0;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .checkout-content {
          padding: 0;
        }

        .checkout-header {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .checkout-header h2 {
          margin: 0;
          font-size: 1.4rem;
        }

        .close-checkout {
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

        .close-checkout:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .checkout-body {
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        @media (max-width: 768px) {
          .checkout-body {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        .customer-info-section h3,
        .order-summary-section h3 {
          margin: 0 0 15px 0;
          color: var(--primary);
          font-size: 1.1rem;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .checkout-items {
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 15px;
        }

        .checkout-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .checkout-item:last-child {
          border-bottom: none;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-weight: 500;
          margin-bottom: 3px;
        }

        .item-description {
          font-size: 12px;
          color: #666;
          line-height: 1.3;
        }

        .item-price {
          font-weight: 600;
          color: var(--primary);
        }

        .checkout-total {
          border-top: 2px solid #f0f0f0;
          padding-top: 15px;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .total-final {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--primary);
          border-top: 1px solid #e0e0e0;
          padding-top: 8px;
          margin-top: 8px;
        }

        .checkout-footer {
          padding: 20px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .checkout-footer .btn {
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
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-dark, #c0392b);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      </style>
    `;

    if (!document.getElementById('checkout-styles')) {
      const styleElement = document.createElement('div');
      styleElement.id = 'checkout-styles';
      styleElement.innerHTML = styles;
      document.head.appendChild(styleElement);
    }

    document.body.appendChild(dialog);
    return dialog;
  }

  function populateCheckoutDialog(dialog) {
    const itemsContainer = dialog.querySelector('#checkoutItems');
    const subtotalEl = dialog.querySelector('#checkoutSubtotal');
    const taxEl = dialog.querySelector('#checkoutTax');
    const totalEl = dialog.querySelector('#checkoutTotal');

    // Populate items
    itemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'checkout-item';
      
      const truncatedDetails = item.details && item.details.length > 50 
        ? item.details.substring(0, 50) + '...'
        : item.details || '';

      itemEl.innerHTML = `
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-description">${truncatedDetails}</div>
        </div>
        <div class="item-price">€${item.price.toFixed(2)}</div>
      `;
      
      itemsContainer.appendChild(itemEl);
      subtotal += item.price;
    });

    // Calculate totals
    const tax = subtotal * 0.24; // 24% VAT
    const total = subtotal + tax;

    subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    taxEl.textContent = `€${tax.toFixed(2)}`;
    totalEl.textContent = `€${total.toFixed(2)}`;
  }

  function initiateCheckout() {
    if (cart.length === 0) {
      showToast('Your cart is empty!', 'warning');
      return;
    }

    const dialog = createCheckoutDialog();
    populateCheckoutDialog(dialog);
    dialog.showModal();

    // Close cart panel
    if (isCartOpen) {
      toggleCart();
    }

    // Event listeners
    dialog.querySelector('.close-checkout').addEventListener('click', () => {
      dialog.close();
      dialog.remove();
    });

    dialog.querySelector('#cancelCheckout').addEventListener('click', () => {
      dialog.close();
      dialog.remove();
    });

    dialog.querySelector('#completeOrder').addEventListener('click', () => {
      processOrder(dialog);
    });

    // Close on outside click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.close();
        dialog.remove();
      }
    });
  }

  function processOrder(dialog) {
    const form = dialog.querySelector('#customerForm');
    const formData = new FormData(form);
    const completeBtn = dialog.querySelector('#completeOrder');

    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Disable button to prevent double submission
    completeBtn.disabled = true;
    completeBtn.textContent = 'Processing...';

    // Create order object
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.24;
    const total = subtotal + tax;

    const order = {
      orderNumber: generateOrderNumber(),
      customer: {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
      },
      items: [...cart],
      pricing: {
        subtotal: subtotal,
        tax: tax,
        total: total
      },
      status: 'New',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    console.log('Processing order:', order);

    // Save order to localStorage
    if (saveOrderToStorage(order)) {
      // Clear cart
      cart = [];
      updateCart();

      // Show success message
      showOrderConfirmation(order, dialog);
    } else {
      // Re-enable button on error
      completeBtn.disabled = false;
      completeBtn.textContent = 'Complete Order';
      showToast('Error processing order. Please try again.', 'error');
    }
  }

  function showOrderConfirmation(order, dialog) {
    dialog.innerHTML = `
      <div class="order-confirmation">
        <div class="confirmation-header">
          <div class="success-icon">✅</div>
          <h2>Order Confirmed!</h2>
          <p>Your order has been successfully placed</p>
        </div>
        
        <div class="confirmation-details">
          <div class="order-info">
            <h3>Order Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Order Number:</span>
                <span class="value">${order.orderNumber}</span>
              </div>
              <div class="info-item">
                <span class="label">Customer:</span>
                <span class="value">${order.customer.name}</span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">${order.customer.email}</span>
              </div>
              <div class="info-item">
                <span class="label">Total:</span>
                <span class="value">€${order.pricing.total.toFixed(2)}</span>
              </div>
              <div class="info-item">
                <span class="label">Status:</span>
                <span class="value status-new">${order.status}</span>
              </div>
            </div>
          </div>
          
          <div class="order-items">
            <h3>Items Ordered</h3>
            ${order.items.map(item => `
              <div class="confirmation-item">
                <span class="item-name">${item.name}</span>
                <span class="item-price">€${item.price.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="confirmation-footer">
          <p class="thank-you">Thank you for your order! We'll start preparing your delicious pizza right away.</p>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 15px 0; text-align: left;">
            <strong>📋 Order Confirmation:</strong><br>
            <span style="font-size: 14px; color: #666;">
              Your order number is <strong>${order.orderNumber}</strong><br>
              We'll contact you at <strong>${order.customer.email}</strong> when your order is ready!
            </span>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" id="confirmationOk">Continue Shopping</button>
          </div>
        </div>
      </div>
    `;

    // Add confirmation styles
    const confirmationStyles = `
      <style>
        .order-confirmation {
          text-align: center;
          padding: 40px 30px;
        }

        .confirmation-header {
          margin-bottom: 30px;
        }

        .success-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .confirmation-header h2 {
          color: var(--primary);
          margin-bottom: 10px;
          font-size: 1.5rem;
        }

        .confirmation-header p {
          color: #666;
          margin: 0;
        }

        .confirmation-details {
          text-align: left;
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        @media (max-width: 600px) {
          .confirmation-details {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        .order-info h3,
        .order-items h3 {
          color: var(--primary);
          margin-bottom: 15px;
          font-size: 1.1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 5px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 500;
          color: #333;
        }

        .value {
          font-weight: 600;
          color: var(--primary);
        }

        .status-new {
          background: #28a745;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .confirmation-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .item-name {
          font-weight: 500;
        }

        .item-price {
          color: var(--primary);
          font-weight: 600;
        }

        .thank-you {
          margin-bottom: 20px;
          color: #666;
          line-height: 1.5;
        }

        .confirmation-footer .btn {
          padding: 12px 30px;
          font-weight: 500;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          background: var(--primary);
          color: white;
          transition: background 0.3s;
        }

        .confirmation-footer .btn:hover {
          background: var(--primary-dark, #c0392b);
        }
      </style>
    `;

    if (!document.getElementById('confirmation-styles')) {
      const styleElement = document.createElement('div');
      styleElement.id = 'confirmation-styles';
      styleElement.innerHTML = confirmationStyles;
      document.head.appendChild(styleElement);
    }

    dialog.querySelector('#confirmationOk').addEventListener('click', () => {
      dialog.close();
      dialog.remove();
      showToast('Your order is being prepared! 🍕', 'success', 4000);
    });

    // Also send to admin system
    triggerAdminOrderUpdate();
  }

  function triggerAdminOrderUpdate() {
    // Trigger a custom event that admin pages can listen to
    window.dispatchEvent(new CustomEvent('newOrderCreated', {
      detail: { timestamp: Date.now() }
    }));

    // Also store a flag for admin pages to check
    localStorage.setItem('hasNewOrders', 'true');
  }

  // Make order functions globally available
  window.initiateCheckout = initiateCheckout;
  window.generateOrderNumber = generateOrderNumber;
  window.saveOrderToStorage = saveOrderToStorage;

  // ---------- ADD UX STYLES ----------
  function addUXStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Toast System */
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        padding: 0;
        max-width: 350px;
        z-index: 10000;
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s ease;
        border-left: 4px solid var(--primary);
      }
      
      .toast.show {
        transform: translateX(0);
        opacity: 1;
      }
      
      .toast-warning {
        border-left-color: #ff9800;
      }
      
      .toast-success {
        border-left-color: var(--success);
      }
      
      .toast-error {
        border-left-color: #f44336;
      }
      
      .toast-content {
        display: flex;
        align-items: center;
        padding: 15px;
        gap: 12px;
      }
      
      .toast-icon {
        font-size: 1.2em;
        flex-shrink: 0;
      }
      
      .toast-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .toast-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      
      .toast-close:hover {
        opacity: 1;
      }
      
      /* Tutorial System */
      .tutorial {
        position: fixed;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: white;
        border-radius: 12px;
        padding: 20px;
        max-width: 400px;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transform: scale(0.8);
        opacity: 0;
        transition: all 0.3s ease;
      }
      
      .tutorial.show {
        transform: scale(1);
        opacity: 1;
      }
      
      .tutorial-center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
      }
      
      .tutorial-center.show {
        transform: translate(-50%, -50%) scale(1);
      }
      
      .tutorial-top {
        top: 20px;
        left: 50%;
        transform: translateX(-50%) scale(0.8);
      }
      
      .tutorial-top.show {
        transform: translateX(-50%) scale(1);
      }
      
      .tutorial-bottom {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) scale(0.8);
      }
      
      .tutorial-bottom.show {
        transform: translateX(-50%) scale(1);
      }
      
      .tutorial-bottom-right {
        bottom: 20px;
        right: 20px;
        transform: scale(0.8);
      }
      
      .tutorial-bottom-right.show {
        transform: scale(1);
      }
      
      .tutorial-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .tutorial-icon {
        font-size: 1.5em;
        text-align: center;
      }
      
      .tutorial-message {
        text-align: center;
        line-height: 1.5;
        font-size: 14px;
      }
      
      .tutorial-disable-option {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        opacity: 0.9;
      }
      
      .tutorial-disable-option label {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      
      .disable-tutorials-checkbox {
        margin: 0;
      }
      
      .tutorial-buttons {
        display: flex;
        justify-content: center;
      }
      
      .tutorial-close {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .tutorial-close:hover {
        background: rgba(255,255,255,0.3);
      }
      
      /* Tutorial Settings Dialog */
      .tutorial-settings-dialog {
        border: none;
        border-radius: 12px;
        padding: 0;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      }
      
      .tutorial-settings-dialog::backdrop {
        background: rgba(0,0,0,0.5);
      }
      
      .tutorial-settings-dialog .dialog-content {
        padding: 24px;
      }
      
      .tutorial-settings-dialog h3 {
        margin: 0 0 12px 0;
        color: var(--text-dark);
      }
      
      .tutorial-settings-dialog p {
        margin: 0 0 20px 0;
        color: var(--text-light);
        font-size: 14px;
        line-height: 1.5;
      }
      
      .settings-option {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .setting-label {
        font-weight: 500;
        color: var(--text-dark);
      }
      
      /* Toggle Switch */
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }
      
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 24px;
      }
      
      .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      
      input:checked + .slider {
        background-color: var(--primary);
      }
      
      input:checked + .slider:before {
        transform: translateX(26px);
      }
      
      .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      
      /* Cart feedback animations */
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      .cart-feedback {
        animation: slideInRight 0.3s ease;
      }
      
      .modify-pizza {
        background: var(--primary);
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-top: 5px;
      }
      
      .modify-pizza:hover {
        background: var(--secondary);
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .toast {
          right: 10px;
          left: 10px;
          max-width: none;
        }
        
        .tutorial {
          left: 10px !important;
          right: 10px !important;
          max-width: none;
        }
        
        .tutorial-center,
        .tutorial-top,
        .tutorial-bottom {
          left: 10px;
          right: 10px;
          transform: none;
        }
        
        .tutorial-center.show,
        .tutorial-top.show,
        .tutorial-bottom.show {
          transform: none;
        }
        
        .tutorial-settings-dialog {
          margin: 20px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------- INITIALIZE SHARED COMPONENTS ----------
  function initShared() {
    console.log('Initializing shared components...');
    
    // Load components first
    loadComponents();
    
    // Initialize cart system
    updateCart();
    
    // Initialize auth dialogs immediately and after a delay for header load
    initAuthDialogs();
    setTimeout(initAuthDialogs, 500);
    
    // Initialize reviews system
    initReviewsSystem();
    
    // Add UX styles
    addUXStyles();
  }

  // Start shared initialization
  initShared();
});
