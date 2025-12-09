// === LOGIN LOGIC ===
document.addEventListener('DOMContentLoaded', function() {
  const dialog = document.getElementById('loginDialog');
  const adminContainer = document.querySelector('.admin-container');

  // Only proceed if dialog exists (not on customer.html)
  if (!dialog) {
    return;
  }

  // Check if user has valid auth token
  const adminToken = localStorage.getItem('adminToken');
  const isLoggedIn = adminToken && adminToken.length > 0;

  if (!isLoggedIn) {
    dialog.showModal();
  } else {
    adminContainer.style.display = 'flex';
    document.body.classList.remove('pre-login');
  }

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');

  const closeBtn = document.querySelector('.close-btn');
  if (closeBtn) closeBtn.addEventListener('click', () => dialog.close());

  // Only add event listener if loginForm exists
  if (!loginForm) {
    console.warn('Login form not found on this page');
    return;
  }

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    let isValid = true;

    // Validate email format
    if (!emailInput.value.includes('@')) {
      emailError.style.display = 'block';
      emailError.textContent = 'Please enter a valid email';
      isValid = false;
    } else {
      emailError.style.display = 'none';
    }

    // Validate password length
    if (passwordInput.value.length < 4) {
      passwordError.style.display = 'block';
      passwordError.textContent = 'Password must be at least 4 characters';
      isValid = false;
    } else {
      passwordError.style.display = 'none';
    }

    if (!isValid) {
      return;
    }

    // Attempt login with backend
    try {
      const response = await fetch('https://mywebserver1234.norwayeast.cloudapp.azure.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailInput.value,
          password: passwordInput.value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        passwordError.style.display = 'block';
        passwordError.textContent = data.error || 'Invalid email or password';
        return;
      }

      // Check if user is admin
      if (!data.data.customer.isAdmin) {
        passwordError.style.display = 'block';
        passwordError.textContent = 'Admin access required';
        return;
      }

      // Store token
      localStorage.setItem('adminToken', data.data.token);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Close dialog and show admin area
      dialog.close();
      adminContainer.style.display = 'flex';
      document.body.classList.remove('pre-login');

      console.log('Login successful for:', data.data.customer.email);
    } catch (error) {
      console.error('Login error:', error);
      passwordError.style.display = 'block';
      passwordError.textContent = 'Connection error. Please try again.';
    }
  });
});