// index.js - Home page specific functionality
document.addEventListener("DOMContentLoaded", function () {
  // ---------- HERO SECTION FUNCTIONALITY ----------
  function initHeroSection() {
    const buildButton = $(".hero .btn-primary") || $("#buildNowBtn");
    
    if (buildButton) {
      buildButton.addEventListener("click", () => {
        // Navigate to build-your-slice page
        window.location.href = './builder/';
      });
    }
  }

  // ---------- LOCATION MAP FUNCTIONALITY ----------
  function initLocationMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.log('Map element not found');
      return;
    }

    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      console.log('Leaflet not loaded, waiting...');
      setTimeout(initLocationMap, 100);
      return;
    }

    console.log('Initializing map...');
    
    try {
      const map = L.map('map').setView([60.1699, 24.9384], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const shopCoords = [60.1699, 24.9384];
      L.marker(shopCoords).addTo(map)
        .bindPopup('Your Slice<br>Pizza Street 123, Helsinki')
        .openPopup();
        
      console.log('Map initialized successfully');

      // Make getDirections function available globally
      window.getDirections = function() {
        if (navigator.geolocation) {
          if (window.showToast) {
            window.showToast('Getting your location...', 'info', 2000);
          }
          navigator.geolocation.getCurrentPosition(function(position) {
            const userCoords = [position.coords.latitude, position.coords.longitude];
            
            // Add user marker
            L.marker(userCoords).addTo(map)
              .bindPopup('Your location')
              .openPopup();
              
            // Draw simple line between points
            L.polyline([userCoords, shopCoords], {
              color: 'blue',
              weight: 4,
              opacity: 0.7
            }).addTo(map);
            
            // Fit map to show both markers
            const group = new L.featureGroup([
              L.marker(userCoords),
              L.marker(shopCoords)
            ]);
            map.fitBounds(group.getBounds().pad(0.1));
            
            if (window.showToast) {
              window.showToast('Route displayed! For detailed public transport directions, use HSL Journey Planner.', 'success', 5000);
            }
          }, function(error) {
            console.error('Geolocation error:', error);
            if (window.showToast) {
              window.showToast('Unable to get your location. Please enable location services.', 'error', 4000);
            }
          });
        } else {
          if (window.showToast) {
            window.showToast("Geolocation is not supported by this browser.", 'error', 4000);
          }
        }
      };
      
    } catch (error) {
      console.error('Error initializing map:', error);
      mapElement.innerHTML = '<p>Unable to load map. Please refresh the page.</p>';
    }
  }

  // ---------- HOME PAGE WELCOME TUTORIAL ----------
  function showHomeWelcome() {
    setTimeout(() => {
      showTutorial(
        "Welcome to Your Slice! 🍕 Build your perfect pizza with our interactive builder or check out our daily menu specials. Click on any section to explore!",
        'top',
        '👋'
      );
    }, 1000);
  }

  // ---------- TODAY'S MENU PREVIEW (if present) ----------
  function initTodaysMenuPreview() {
    const todaysMenuContainer = document.getElementById('todays-menu-container');
    if (!todaysMenuContainer) return;

    // Fetch today's menu preview
    fetchTodaysMenuPreview();
  }

  async function fetchTodaysMenuPreview() {
    try {
      const response = await fetch('http://localhost:3001/api/menu/today');
      const data = await response.json();
      
      if (data.success && data.data) {
        displayTodaysMenuPreview(data.data);
      } else {
        showEmptyMenuMessage();
      }
    } catch (error) {
      console.error('Error fetching today\'s menu:', error);
      showEmptyMenuMessage();
    }
  }

  function displayTodaysMenuPreview(menuItems) {
    const todaysMenuContainer = document.getElementById('todays-menu-container');
    
    // Clear existing content
    todaysMenuContainer.innerHTML = '';
    
    // Add header
    const header = document.createElement('h3');
    header.textContent = 'Today\'s Special Menu';
    header.className = 'menu-preview-header';
    todaysMenuContainer.appendChild(header);
    
    // Create items grid
    const itemsGrid = document.createElement('div');
    itemsGrid.className = 'menu-preview-grid';
    
    menuItems.slice(0, 3).forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.className = 'menu-preview-item';
      itemCard.innerHTML = `
        <h4>${item.name}</h4>
        <p>${item.description}</p>
        <span class="price">€${parseFloat(item.price).toFixed(2)}</span>
      `;
      itemsGrid.appendChild(itemCard);
    });
    
    todaysMenuContainer.appendChild(itemsGrid);
    
    // Add "View Full Menu" button
    const viewMenuBtn = document.createElement('button');
    viewMenuBtn.className = 'btn btn-secondary';
    viewMenuBtn.textContent = 'View Full Menu';
    viewMenuBtn.addEventListener('click', () => {
      window.location.href = './menu/';
    });
    
    todaysMenuContainer.appendChild(viewMenuBtn);
  }

  function showEmptyMenuMessage() {
    const todaysMenuContainer = document.getElementById('todays-menu-container');
    if (!todaysMenuContainer) return;
    
    todaysMenuContainer.innerHTML = `
      <div class="empty-menu">
        <h3>Today's Menu</h3>
        <p>Check back later for today's special offerings!</p>
        <button class="btn btn-secondary" onclick="window.location.href='./menu/'">View Full Menu</button>
      </div>
    `;
  }

  // Helper function (if not available in shared.js)
  function $(selector) {
    return document.querySelector(selector);
  }

  // ---------- INITIALIZE HOME PAGE ----------
  window.initializeHomePage = function() {
    console.log('Initializing home page...');
    
    // Initialize hero section
    initHeroSection();
    
    // Initialize location map
    initLocationMap();
    
    // Initialize today's menu preview
    initTodaysMenuPreview();
    
    // Show welcome tutorial
    showHomeWelcome();
  };

  // Initialize will be called by shared.js after components load
});
