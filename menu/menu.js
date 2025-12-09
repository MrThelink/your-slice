// menu.js - Menu page specific functionality
document.addEventListener("DOMContentLoaded", function () {
  
  // ---------- UTILITY FUNCTIONS ----------
  
  function showNotification(message, type = 'info') {
    // Simple notification function
    const notification = document.createElement('div');
    notification.className = `menu-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✅' : '📢'}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    // Add styles
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
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutNotification 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }
  
  // Add animation styles
  if (!document.getElementById('menu-notifications-styles')) {
    const style = document.createElement('style');
    style.id = 'menu-notifications-styles';
    style.textContent = `
      @keyframes slideInNotification {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutNotification {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .notification-icon {
        font-size: 18px;
      }
      .notification-message {
        font-weight: 500;
      }
    `;
    document.head.appendChild(style);
  }

  // ---------- MENU API FUNCTIONS ----------
  
  async function fetchMenuForDate(date = null) {
    const endpoint = date ? `https://mywebserver1234.norwayeast.cloudapp.azure.com/api/menu/${date}` : 'https://mywebserver1234.norwayeast.cloudapp.azure.com/api/menu/today';
    console.log('Fetching menu for:', date || 'today');
    
    try {
      const response = await fetch(endpoint);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Menu data received:', data);
      
      // Ensure we have the correct data structure
      if (data.success && data.data) {
        // Process each item to ensure price fields are properly handled
        data.data = data.data.map(item => ({
          ...item,
          price: parseFloat(item.price || item.base_price || 0),
          base_price: parseFloat(item.base_price || item.price || 0),
          special_price: item.special_price ? parseFloat(item.special_price) : null,
          has_special: item.special_price !== null && item.special_price !== item.base_price
        }));
        console.log('Processed menu data:', data.data);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching menu:', error);
      throw error;
    }
  }

  async function fetchTodaysMenu() {
    return await fetchMenuForDate();
  }

  function getCurrentDay() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    return days[today];
  }

  function formatDate(daysOffset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  }
  
  // ---------- MENU DISPLAY FUNCTIONS ----------
  
  function displayMenuForDay(menuItems, day) {
    const dayMenu = document.getElementById(`${day}-menu`);
    const menuOptions = dayMenu?.querySelector('.menu-options');
    
    if (!menuOptions) {
      console.warn(`Menu options container not found for ${day}`);
      return;
    }
    
    if (menuItems.length === 0) {
      showEmptyMenuForDay(day);
      return;
    }

    // Categorize menu items
    const veganItems = menuItems.filter(item => item.is_vegan);
    const meatItems = menuItems.filter(item => !item.is_vegan);

    const menuHTML = `
      <div class="menu-categories">
        ${veganItems.length > 0 ? `
          <div class="menu-category vegan-category">
            <div class="category-header">
              <div class="category-icon">🌱</div>
              <h4>Vegan Options</h4>
            </div>
            <div class="category-items">
              ${veganItems.map(item => createMenuItemHTML(item)).join('')}
            </div>
          </div>
        ` : ''}
        
        ${meatItems.length > 0 ? `
          <div class="menu-category meat-category">
            <div class="category-header">
              <div class="category-icon">🍖</div>
              <h4>Meat Options</h4>
            </div>
            <div class="category-items">
              ${meatItems.map(item => createMenuItemHTML(item)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    menuOptions.innerHTML = menuHTML;
    
    // Add event listeners for add to cart buttons
    const addToCartButtons = menuOptions.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product-id');
        const menuItem = e.target.closest('.menu-item');
        const itemName = menuItem.querySelector('.menu-item-name').textContent;
        const itemDescription = menuItem.querySelector('.menu-item-description').textContent;
        
        // Get the display price (special price if available, otherwise base price)
        const specialPriceElement = menuItem.querySelector('.special-price');
        const regularPriceElement = menuItem.querySelector('.menu-item-price');
        
        let itemPrice;
        if (specialPriceElement) {
          itemPrice = parseFloat(specialPriceElement.textContent.replace('€', ''));
        } else if (regularPriceElement) {
          itemPrice = parseFloat(regularPriceElement.textContent.replace('€', ''));
        } else {
          console.error('Could not find price element');
          return;
        }
        
        const cartItem = {
          id: productId,
          name: itemName,
          price: itemPrice,
          details: itemDescription,
          type: 'menu-item'
        };
        
        console.log('Adding to cart:', cartItem);
        
        // Try to use global addToCart function if available
        if (typeof window.addToCart === 'function') {
          window.addToCart(cartItem);
        } else if (typeof addToCart === 'function') {
          addToCart(cartItem);
        } else {
          // Fallback: show notification
          showNotification(`${itemName} added to cart! (€${itemPrice.toFixed(2)})`, 'success');
        }
      });
    });
  }

  function createMenuItemHTML(item) {
    const dietaryIcon = item.is_vegan ? 'V' : 'M';
    const dietaryClass = item.is_vegan ? 'vegan' : 'meat';
    const dietaryLabel = item.is_vegan ? 'Vegan' : 'Contains Meat';
    
    // Handle special pricing
    const hasSpecialPrice = item.special_price !== null && item.special_price !== item.base_price;
    const displayPrice = parseFloat(item.price || item.base_price);
    const basePrice = parseFloat(item.base_price || item.price);
    
    return `
      <div class="menu-item ${dietaryClass}">
        <div class="menu-item-visual">
          ${item.image_url ? 
            `<img src="${item.image_url}" alt="${item.name}" class="menu-item-img">` : 
            '<div class="menu-item-placeholder">🍕</div>'
          }
          <div class="dietary-badge ${dietaryClass}">
            <span class="dietary-icon">${dietaryIcon}</span>
          </div>
          ${hasSpecialPrice ? '<div class="special-price-indicator">SPECIAL</div>' : ''}
        </div>
        <div class="menu-item-info">
          <h5 class="menu-item-name">${item.name}</h5>
          <p class="menu-item-description">${item.description || 'Delicious daily special prepared fresh'}</p>
          <div class="menu-item-footer">
            <div class="menu-item-price-section">
              ${hasSpecialPrice ? `
                <div class="original-price">€${basePrice.toFixed(2)}</div>
                <div class="special-price">€${displayPrice.toFixed(2)}</div>
              ` : `
                <div class="menu-item-price">€${displayPrice.toFixed(2)}</div>
              `}
            </div>
            <button class="add-to-cart-btn" data-product-id="${item.product_id}">
              <span class="cart-icon">🛒</span>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function displayTodaysMenu(menuItems) {
    // Legacy function - redirect to new system
    const today = getCurrentDay();
    displayMenuForDay(menuItems, today);
  }
  
  function showEmptyMenuForDay(day) {
    const dayMenu = document.getElementById(`${day}-menu`);
    const menuOptions = dayMenu?.querySelector('.menu-options');
    
    if (menuOptions) {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      menuOptions.innerHTML = `
        <div class="coming-soon-message">
          <div class="coming-soon-icon">🍽️</div>
          <h4>No ${dayName} Specials</h4>
          <p>Check back later for fresh daily offerings!</p>
        </div>
      `;
    }
  }
  
  function showMenuErrorForDay(day) {
    const dayMenu = document.getElementById(`${day}-menu`);
    const menuOptions = dayMenu?.querySelector('.menu-options');
    
    if (menuOptions) {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      menuOptions.innerHTML = `
        <div class="menu-error-message">
          <div class="error-icon">⚠️</div>
          <h3>Unable to load ${dayName} menu</h3>
          <p>We're having trouble connecting to our menu system. Please try again later.</p>
          <button class="retry-btn" onclick="loadMenuForDay('${day}')">Try Again</button>
        </div>
      `;
    }
  }

  // ---------- DAY SELECTOR MENU FUNCTIONALITY ----------
  
  async function loadMenuForDay(day) {
    console.log(`Loading menu for ${day}`);
    
    // Show loading state
    const dayMenu = document.getElementById(`${day}-menu`);
    const menuOptions = dayMenu?.querySelector('.menu-options');
    
    if (menuOptions) {
      menuOptions.innerHTML = `
        <div class="loading-placeholder">
          <div class="loading-icon">🍕</div>
          <p>Preparing ${day}'s fresh menu...</p>
        </div>
      `;
    }
    
    try {
      // Calculate date for the selected day
      const today = new Date();
      const currentDay = getCurrentDay();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const selectedDayIndex = days.indexOf(day);
      const currentDayIndex = days.indexOf(currentDay);
      
      // Calculate days difference (handle week wrap-around)
      let daysOffset = selectedDayIndex - currentDayIndex;
      if (daysOffset < 0) {
        daysOffset += 7; // Next week
      }
      
      const targetDate = formatDate(daysOffset);
      const menuData = await fetchMenuForDate(daysOffset === 0 ? null : targetDate);
      
      if (menuData.success && menuData.data && menuData.data.length > 0) {
        displayMenuForDay(menuData.data, day);
      } else {
        showEmptyMenuForDay(day);
      }
    } catch (error) {
      console.error(`Error loading menu for ${day}:`, error);
      showMenuErrorForDay(day);
    }
  }

  // Make loadMenuForDay globally accessible for retry buttons
  window.loadMenuForDay = loadMenuForDay;
  
  function initDaySelector() {
    const dayButtons = document.querySelectorAll('.day-btn');
    const dailyMenus = document.querySelectorAll('.daily-menu');
    
    // Set up today indicator
    const today = getCurrentDay();
    dayButtons.forEach(btn => {
      const day = btn.getAttribute('data-day');
      const todayIndicator = btn.querySelector('.today-highlight');
      
      if (day === today) {
        btn.classList.add('active');
        if (todayIndicator) {
          todayIndicator.style.display = 'inline';
        }
      } else {
        btn.classList.remove('active');
        if (todayIndicator) {
          todayIndicator.style.display = 'none';
        }
      }
    });
    
    // Show today's menu by default
    dailyMenus.forEach(menu => {
      menu.classList.remove('active');
    });
    const todayMenu = document.getElementById(`${today}-menu`);
    if (todayMenu) {
      todayMenu.classList.add('active');
    }
    
    // Add click handlers for day buttons
    dayButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedDay = btn.getAttribute('data-day');
        
        // Update active button
        dayButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active menu
        dailyMenus.forEach(menu => menu.classList.remove('active'));
        const selectedMenu = document.getElementById(`${selectedDay}-menu`);
        if (selectedMenu) {
          selectedMenu.classList.add('active');
        }
        
        // Load menu for selected day
        loadMenuForDay(selectedDay);
      });
    });
    
    // Load today's menu initially
    loadMenuForDay(today);
  }

  // ---------- WEEKLY OVERVIEW FUNCTIONALITY ----------
  
  async function loadWeeklyOverview() {
    const weeklyContainer = document.getElementById('weekly-overview');
    if (!weeklyContainer) return;
    
    // Show loading state
    weeklyContainer.innerHTML = `
      <div class="loading-week">
        <div class="loading-icon">📊</div>
        <p>Loading weekly menu overview...</p>
      </div>
    `;
    
    try {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const weeklyData = [];
      
      // Fetch menu for each day of the week
      for (let i = 0; i < 7; i++) {
        try {
          const date = formatDate(i);
          const menuData = await fetchMenuForDate(i === 0 ? null : date);
          weeklyData.push({
            day: days[i],
            data: menuData.success ? menuData.data : [],
            date: date
          });
        } catch (error) {
          console.error(`Error fetching menu for day ${i}:`, error);
          weeklyData.push({
            day: days[i],
            data: [],
            date: formatDate(i)
          });
        }
      }
      
      // Display weekly overview
      const weekHTML = weeklyData.map((dayData, index) => {
        const dayName = dayData.day.charAt(0).toUpperCase() + dayData.day.slice(1);
        const isToday = index === 0;
        const hasMenu = dayData.data.length > 0;
        
        return `
          <div class="week-day ${isToday ? 'today' : ''}" data-day="${dayData.day}">
            <div class="week-day-header">
              <h4>${dayName}</h4>
              ${isToday ? '<span class="today-badge">Today</span>' : ''}
            </div>
            <div class="week-day-content">
              ${hasMenu ? `
                <div class="menu-summary">
                  <div class="menu-count">${dayData.data.length} special${dayData.data.length !== 1 ? 's' : ''}</div>
                  <div class="menu-highlights">
                    ${dayData.data.slice(0, 2).map(item => `
                      <div class="menu-highlight">
                        <span class="highlight-name">${item.name}</span>
                        <span class="highlight-price">€${parseFloat(item.price).toFixed(2)}</span>
                      </div>
                    `).join('')}
                    ${dayData.data.length > 2 ? `<div class="more-items">+${dayData.data.length - 2} more</div>` : ''}
                  </div>
                </div>
              ` : `
                <div class="no-menu">
                  <span class="no-menu-icon">📝</span>
                  <span>Menu coming soon</span>
                </div>
              `}
            </div>
          </div>
        `;
      }).join('');
      
      weeklyContainer.innerHTML = weekHTML;
      
      // Add click handlers to week day cards
      const weekDayCards = weeklyContainer.querySelectorAll('.week-day');
      weekDayCards.forEach(card => {
        card.addEventListener('click', () => {
          const day = card.getAttribute('data-day');
          
          // Switch to the selected day
          const dayButton = document.querySelector(`[data-day="${day}"]`);
          if (dayButton) {
            dayButton.click();
          }
          
          // Scroll to menu section
          const menuSection = document.getElementById('menu');
          if (menuSection) {
            menuSection.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
      
    } catch (error) {
      console.error('Error loading weekly overview:', error);
      weeklyContainer.innerHTML = `
        <div class="week-error">
          <div class="error-icon">⚠️</div>
          <p>Unable to load weekly overview</p>
          <button class="retry-btn" onclick="loadWeeklyOverview()">Try Again</button>
        </div>
      `;
    }
  }

  // Make loadWeeklyOverview globally accessible for retry buttons
  window.loadWeeklyOverview = loadWeeklyOverview;

  // ---------- AUTO REFRESH FUNCTIONALITY ----------
  
  let autoRefreshInterval;
  let isPageVisible = true;
  
  function startAutoRefresh() {
    // Refresh menu every 30 seconds when page is visible
    autoRefreshInterval = setInterval(() => {
      if (isPageVisible) {
        console.log('Auto-refreshing menu data...');
        const currentDay = getCurrentDay();
        loadMenuForDay(currentDay);
        loadWeeklyOverview();
      }
    }, 30000); // 30 seconds
  }
  
  function stopAutoRefresh() {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }
  
  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) {
      console.log('Page became visible, refreshing menu...');
      const currentDay = getCurrentDay();
      loadMenuForDay(currentDay);
    }
  });
  
  // Start auto refresh when page loads
  function initAutoRefresh() {
    startAutoRefresh();
    
    // Stop auto refresh when page unloads
    window.addEventListener('beforeunload', stopAutoRefresh);
  }

  // ---------- MENU PAGE TUTORIALS ----------
  function showMenuWelcome() {
    // Simplified version without external dependencies
    setTimeout(() => {
      showNotification("Welcome to our dynamic menu! 🍽️ Browse different days to see our rotating specials.", 'info');
    }, 1000);
  }

  function showWeeklyOverviewTutorial() {
    // Simplified version without external dependencies
    const weeklyContainer = document.getElementById('weekly-overview');
    if (weeklyContainer) {
      setTimeout(() => {
        showNotification("Check out our weekly overview! 📊 Click on any day to jump directly to that menu.", 'info');
      }, 3000);
    }
  }

  // ---------- MENU PAGE INITIALIZATION ----------
  
  function initMenuPage() {
    console.log('Initializing menu page...');
    
    // Check if we're on the menu page
    const menuSection = document.getElementById('menu');
    if (!menuSection) return;
    
    // Initialize day selector
    initDaySelector();
    
    // Load weekly overview
    loadWeeklyOverview();
    
    // Initialize auto refresh
    initAutoRefresh();
    
    // Show welcome tutorials
    showMenuWelcome();
    showWeeklyOverviewTutorial();
    
    console.log('Menu page initialized successfully');
  }

  // Initialize menu page
  initMenuPage();
});
