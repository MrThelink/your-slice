/**
 * HSL (Helsinki Region Transport) Integration Module
 * 
 * This module integrates the Helsinki public transport API to provide:
 * - Real-time bus/tram/metro information for routes near the restaurant
 * - Journey planning information
 * - Transport accessibility information
 * 
 * API Documentation: https://www.hsl.fi/avoindata
 * Routing API: https://api.digitransit.fi/routing/v2/hsl/gtfs/v1
 */

class HSLIntegration {
  constructor() {
    this.restaurantCoords = {
      lat: 60.1699,
      lon: 24.9384,
      name: "Your Slice Pizza Restaurant"
    };
    
    // HSL API endpoint for routing
    this.routingAPI = 'https://api.digitransit.fi/routing/v2/hsl/gtfs/v1';
    
    // HSL GTFS Realtime endpoints
    this.realtimeAPI = 'https://api.digitransit.fi/realtime/vehicle-positions/v1';
    
    this.cache = {
      stops: null,
      lastUpdate: null
    };
  }

  /**
   * Initialize HSL module and load nearby stops
   */
  async init() {
    console.log('🚌 Initializing HSL integration...');
    try {
      await this.loadNearbyStops();
      await this.loadTransportRoutes();
      this.setupAutoRefresh();
      console.log('✅ HSL integration initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing HSL integration:', error);
    }
  }

  /**
   * GraphQL query to find nearby transit stops using Digitransit API
   */
  async loadNearbyStops() {
    try {
      const query = `
        {
          nearest(lat: ${this.restaurantCoords.lat}, lon: ${this.restaurantCoords.lon}, maxResults: 5, maxDistance: 500) {
            edges {
              node {
                id
                place {
                  __typename
                  ... on Stop {
                    name
                    code
                    lat
                    lon
                    routes {
                      gtfsId
                      shortName
                      longName
                      mode
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(this.routingAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      
      if (data.data && data.data.nearest) {
        this.cache.stops = data.data.nearest.edges;
        this.cache.lastUpdate = new Date();
        this.displayNearbyStops();
        return data.data.nearest.edges;
      } else {
        console.warn('No nearby stops found in HSL data');
        this.showFallbackTransportInfo();
      }
    } catch (error) {
      console.error('Error loading nearby stops:', error);
      this.showFallbackTransportInfo();
    }
  }

  /**
   * Get journey planning data for directions to the restaurant
   */
  async getJourneyPlan(userLat, userLon) {
    try {
      const query = `
        {
          plan(
            fromLat: ${userLat}
            fromLon: ${userLon}
            toLat: ${this.restaurantCoords.lat}
            toLon: ${this.restaurantCoords.lon}
            numItineraries: 3
          ) {
            itineraries {
              startTime
              endTime
              duration
              walkDistance
              legs {
                startTime
                endTime
                mode
                distance
                duration
                route {
                  shortName
                  longName
                  mode
                }
                from {
                  name
                  lat
                  lon
                }
                to {
                  name
                  lat
                  lon
                }
              }
            }
          }
        }
      `;

      const response = await fetch(this.routingAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      
      if (data.data && data.data.plan && data.data.plan.itineraries) {
        return data.data.plan.itineraries;
      }
      return null;
    } catch (error) {
      console.error('Error getting journey plan:', error);
      return null;
    }
  }

  /**
   * Load transport routes information (buses, trams, metros, trains)
   */
  async loadTransportRoutes() {
    try {
      const query = `
        {
          stops(first: 10, lat: ${this.restaurantCoords.lat}, lon: ${this.restaurantCoords.lon}) {
            edges {
              node {
                id
                name
                code
                lat
                lon
                routes {
                  gtfsId
                  shortName
                  longName
                  mode
                  color
                  textColor
                }
                stoptimesWithoutPatterns(numberOfDepartures: 4) {
                  scheduledArrival
                  realtime
                  realtimeState
                  trip {
                    routeShortName
                    headsign
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(this.routingAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      
      if (data.data && data.data.stops) {
        this.displayTransportRoutes(data.data.stops.edges);
      }
    } catch (error) {
      console.error('Error loading transport routes:', error);
    }
  }

  /**
   * Display nearby stops information
   */
  displayNearbyStops() {
    const container = document.getElementById('hsl-nearby-stops');
    if (!container) return;

    if (!this.cache.stops || this.cache.stops.length === 0) {
      container.innerHTML = '<p class="hsl-message">No nearby transit stops found</p>';
      return;
    }

    let html = '<div class="hsl-stops-grid">';
    
    this.cache.stops.forEach((stopData) => {
      const stop = stopData.node.place;
      if (!stop || !stop.routes) return;

      const distance = this.calculateDistance(
        this.restaurantCoords.lat,
        this.restaurantCoords.lon,
        stop.lat,
        stop.lon
      );

      html += `
        <div class="hsl-stop-card">
          <div class="stop-header">
            <h4>${stop.name}</h4>
            <span class="stop-code">${stop.code || 'N/A'}</span>
          </div>
          <p class="stop-distance">📍 ${distance}m away</p>
          <div class="stop-routes">
      `;

      stop.routes.slice(0, 4).forEach(route => {
        const modeIcon = this.getModeIcon(route.mode);
        html += `
          <span class="route-badge route-${route.mode.toLowerCase()}" title="${route.longName}">
            ${modeIcon} ${route.shortName}
          </span>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Display available transport routes
   */
  displayTransportRoutes(stopsData) {
    const container = document.getElementById('hsl-routes-info');
    if (!container) return;

    if (!stopsData || stopsData.length === 0) {
      this.showFallbackTransportInfo();
      return;
    }

    let html = '<div class="hsl-routes-container">';
    let routeCount = 0;

    stopsData.forEach(stopData => {
      const stop = stopData.node;
      if (!stop.routes || routeCount >= 6) return;

      html += `
        <div class="hsl-route-info">
          <div class="route-stop-name">
            <strong>${stop.name}</strong>
            ${stop.code ? `<span class="stop-code">${stop.code}</span>` : ''}
          </div>
      `;

      stop.routes.slice(0, 3).forEach(route => {
        const modeIcon = this.getModeIcon(route.mode);
        const bgColor = route.color ? `#${route.color}` : 'var(--primary)';
        const textColor = route.textColor ? `#${route.textColor}` : 'white';
        
        html += `
          <div class="route-item" style="background-color: ${bgColor}; color: ${textColor};">
            <span class="route-icon">${modeIcon}</span>
            <div class="route-details">
              <strong>${route.shortName}</strong>
              <small>${route.longName}</small>
            </div>
          </div>
        `;
        routeCount++;
      });

      html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Show fallback transport information when API fails
   */
  showFallbackTransportInfo() {
    const stopsContainer = document.getElementById('hsl-nearby-stops');
    const routesContainer = document.getElementById('hsl-routes-info');

    if (stopsContainer) {
      stopsContainer.innerHTML = `
        <div class="hsl-fallback">
          <h4>🚌 Public Transport Near You</h4>
          <p>Major transit stops within walking distance:</p>
          <ul>
            <li><strong>Kaisaniemi Stop</strong> - 350m away: Trams 3, 6, 7, 8, 9</li>
            <li><strong>Senaatintori Stop</strong> - 450m away: Buses 14, 24, 35</li>
            <li><strong>Central Railway Station</strong> - 600m away: Trains, Trams 3, 4, 5, 6, 7, 8, 9</li>
          </ul>
          <p class="hsl-note">For real-time departure information, visit <a href="https://www.hsl.fi/en" target="_blank">HSL.fi</a></p>
        </div>
      `;
    }

    if (routesContainer) {
      routesContainer.innerHTML = `
        <div class="hsl-fallback">
          <h4>🚇 Available Transport Modes</h4>
          <div class="transport-modes-grid">
            <div class="mode-card">
              <span class="mode-icon">🚌</span>
              <p>Buses</p>
            </div>
            <div class="mode-card">
              <span class="mode-icon">🚋</span>
              <p>Trams</p>
            </div>
            <div class="mode-card">
              <span class="mode-icon">🚇</span>
              <p>Metro</p>
            </div>
            <div class="mode-card">
              <span class="mode-icon">🚂</span>
              <p>Trains</p>
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Get icon for transport mode
   */
  getModeIcon(mode) {
    const icons = {
      'BUS': '🚌',
      'TRAM': '🚋',
      'SUBWAY': '🚇',
      'RAIL': '🚂',
      'FERRY': '⛴️',
      'WALK': '🚶',
      'BICYCLE': '🚴'
    };
    return icons[mode] || '🚌';
  }

  /**
   * Calculate distance between two coordinates (in meters, using Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // convert to meters
    
    return Math.round(distance);
  }

  /**
   * Get directions using public transport
   */
  async getPublicTransportDirections() {
    if (!navigator.geolocation) {
      if (window.showToast) {
        window.showToast('Geolocation is not supported by this browser.', 'error', 4000);
      }
      return;
    }

    if (window.showToast) {
      window.showToast('Getting your location for transit directions...', 'info', 2000);
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const itineraries = await this.getJourneyPlan(latitude, longitude);

      if (itineraries && itineraries.length > 0) {
        this.displayJourneyPlan(itineraries);
      } else {
        window.showToast('Could not find public transport routes', 'warning', 4000);
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      window.showToast('Unable to get your location or directions', 'error', 4000);
    }
  }

  /**
   * Display journey plan/directions
   */
  displayJourneyPlan(itineraries) {
    const container = document.getElementById('journey-plan');
    if (!container) return;

    let html = '<div class="journey-options">';

    itineraries.forEach((itinerary) => {
      const duration = Math.round(itinerary.duration / 60); // convert to minutes
      const startTime = new Date(itinerary.startTime).toLocaleTimeString('fi-FI', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const endTime = new Date(itinerary.endTime).toLocaleTimeString('fi-FI', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      html += `
        <div class="journey-option">
          <div class="journey-summary">
            <span class="journey-duration">⏱️ ${duration} min</span>
            <span class="journey-time">${startTime} → ${endTime}</span>
            <span class="journey-distance">📍 ${Math.round(itinerary.walkDistance)}m walk</span>
          </div>
          <div class="journey-legs">
      `;

      itinerary.legs.forEach(leg => {
        const modeIcon = this.getModeIcon(leg.mode);
        const legDuration = Math.round(leg.duration / 60);

        html += `
          <div class="journey-leg">
            <span class="leg-icon">${modeIcon}</span>
            <div class="leg-info">
              <strong>${leg.mode}</strong>
              ${leg.route ? `<span class="leg-route">${leg.route.shortName}</span>` : ''}
              <small>${leg.from.name} → ${leg.to.name}</small>
              <p class="leg-duration">${legDuration} min • ${Math.round(leg.distance)}m</p>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
    container.style.display = 'block';
  }

  /**
   * Setup auto-refresh of transit information (every 5 minutes)
   */
  setupAutoRefresh() {
    setInterval(() => {
      this.loadTransportRoutes();
    }, 5 * 60 * 1000); // 5 minutes
  }
}

// Initialize HSL integration when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.hslIntegration = new HSLIntegration();
    window.hslIntegration.init();
  });
} else {
  window.hslIntegration = new HSLIntegration();
  window.hslIntegration.init();
}
