// Authentication module for managing login, signup, and user state

const AUTH_CONFIG = {
  // API_BASE: 'http://localhost:3000/api',
  API_BASE: 'https://mywebserver1234.norwayeast.cloudapp.azure.com/api',
  TOKEN_KEY: 'authToken',
  USER_KEY: 'currentUser'
};

class AuthManager {
  constructor() {
    this.token = this.getStoredToken();
    this.user = this.getStoredUser();
    this.listeners = [];
  }

  // Get stored token from localStorage
  getStoredToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }

  // Get stored user from localStorage
  getStoredUser() {
    const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Register new user
  async register(email, password, firstName, lastName, age) {
    try {
      const response = await fetch(`${AUTH_CONFIG.API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          age
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // After successful registration, log them in
      return await this.login(email, password);
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${AUTH_CONFIG.API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user info
      this.token = data.data.token;
      this.user = data.data.customer;

      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, this.token);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(this.user));

      // Notify listeners of authentication change
      this.notifyListeners();

      return data.data;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Logout user
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    this.notifyListeners();
  }

  // Get authorization header for API requests
  getAuthHeader() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }

  // Add listener for auth state changes
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners of auth state change
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.isAuthenticated(), this.user));
  }
}

// Export singleton instance
window.authManager = new AuthManager();

// Update UI when auth state changes
window.authManager.addListener((isAuthenticated, user) => {
  updateAuthUI(isAuthenticated, user);
});

// Update the header UI based on authentication state
function updateAuthUI(isAuthenticated, user) {
  const authButtons = document.querySelector('.auth-buttons');
  
  if (!authButtons) {
    console.warn('Auth buttons element not found');
    return;
  }

  if (isAuthenticated && user) {
    // Show logged-in state
    authButtons.innerHTML = `
      <div class="user-menu">
        <span class="user-name">👤 ${user.name || user.email}</span>
        <button class="auth-btn logout-btn" id="logoutBtn">Logout</button>
      </div>
    `;
    
    // Add logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.authManager.logout();
        if (window.showToast) {
          window.showToast('Logged out successfully', 'success', 3000);
        }
      });
    }
  } else {
    // Show login/signup buttons
    // Determine correct paths based on current location
    const currentPath = window.location.pathname;
    let loginPath = './login.html';
    let signupPath = './signup.html';
    
    // If we're in a subfolder, adjust paths
    if (currentPath !== '/' && !currentPath.endsWith('/index.html') && !currentPath.endsWith('/main-page/')) {
      loginPath = '../login.html';
      signupPath = '../signup.html';
    }
    
    authButtons.innerHTML = `
      <a href="${loginPath}" class="auth-btn login-btn">Log in</a>
      <a href="${signupPath}" class="auth-btn signup-btn">Sign up</a>
    `;
  }
}

// Make functions globally available
window.updateAuthUI = updateAuthUI;
