// contact.js - Contact page specific functionality
document.addEventListener("DOMContentLoaded", function () {
  
  // ---------- CONTACT FORM HANDLING ----------
  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(this);
      const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };
      
      // Validate form
      if (!validateContactForm(contactData)) {
        return;
      }
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      // Simulate form submission
      setTimeout(() => {
        // Reset form
        this.reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showToast('Thank you for your message! We will get back to you soon.', 'success', 4000);
        
        // Optional: Store message locally for demo purposes
        storeContactMessage(contactData);
        
      }, 1500);
    });
  }

  function validateContactForm(data) {
    if (!data.name || data.name.trim().length < 2) {
      showToast('Please enter a valid name (at least 2 characters).', 'error', 4000);
      return false;
    }
    
    if (!data.email || !isValidEmail(data.email)) {
      showToast('Please enter a valid email address.', 'error', 4000);
      return false;
    }
    
    if (!data.subject) {
      showToast('Please select a subject.', 'error', 4000);
      return false;
    }
    
    if (!data.message || data.message.trim().length < 10) {
      showToast('Please enter a message (at least 10 characters).', 'error', 4000);
      return false;
    }
    
    return true;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function storeContactMessage(data) {
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    messages.unshift({
      ...data,
      timestamp: new Date().toISOString(),
      id: Date.now()
    });
    
    // Keep only last 50 messages
    if (messages.length > 50) {
      messages.splice(50);
    }
    
    localStorage.setItem('contactMessages', JSON.stringify(messages));
  }

  // ---------- MAP INITIALIZATION ----------
  function initContactMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    try {
      const map = L.map('map').setView([60.1699, 24.9384], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const shopCoords = [60.1699, 24.9384];
      L.marker(shopCoords).addTo(map)
        .bindPopup('<strong>Your Slice</strong><br>Pizza Street 123<br>00100 Helsinki<br>Finland')
        .openPopup();
      
      // Add click handler for getting directions
      map.on('click', function(e) {
        if (navigator.geolocation) {
          showToast('Click "Get Directions" button for navigation help!', 'info', 3000);
        }
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
      mapElement.innerHTML = `
        <div style="height: 400px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 12px;">
          <div style="text-align: center; color: #666;">
            <p>📍 Your Slice</p>
            <p>Pizza Street 123, 00100 Helsinki, Finland</p>
            <p style="font-size: 0.9em; margin-top: 10px;">Map temporarily unavailable</p>
          </div>
        </div>
      `;
    }
  }

  // ---------- CONTACT PAGE TUTORIALS ----------
  function showContactWelcome() {
    setTimeout(() => {
      showTutorial(
        "Get in touch with us! 📞 Fill out the contact form, check our FAQ section, or find us on the map. We'd love to hear from you!",
        'top',
        '💬'
      );
    }, 800);
  }

  function showFAQTutorial() {
    const faqSection = document.querySelector('.faq-section');
    if (faqSection && !areTutorialsDisabled()) {
      setTimeout(() => {
        showTutorial(
          "Check out our FAQ section below for quick answers to common questions! 📋 You might find what you're looking for without having to wait for a response.",
          'bottom',
          '❓'
        );
      }, 5000);
    }
  }

  // ---------- FAQ ENHANCEMENT ----------
  function initFAQInteraction() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      item.addEventListener('click', function() {
        this.classList.toggle('expanded');
        
        // Add visual feedback
        const header = this.querySelector('h4');
        if (header) {
          header.style.color = this.classList.contains('expanded') ? 'var(--primary)' : '';
        }
      });
      
      // Add hover effect
      item.style.cursor = 'pointer';
      item.title = 'Click to expand/collapse';
    });
  }

  // ---------- COMPONENT LOADING ----------
  // Component loading handled by shared.js

  // ---------- FORM FIELD ENHANCEMENTS ----------
  function initFormEnhancements() {
    // Add character counter for message field
    const messageField = document.getElementById('message');
    if (messageField) {
      const counter = document.createElement('div');
      counter.className = 'character-counter';
      counter.style.cssText = 'text-align: right; font-size: 0.9em; color: #666; margin-top: 5px;';
      messageField.parentNode.appendChild(counter);
      
      function updateCounter() {
        const length = messageField.value.length;
        counter.textContent = `${length}/500 characters`;
        
        if (length > 450) {
          counter.style.color = '#ff9800';
        } else if (length > 500) {
          counter.style.color = '#f44336';
        } else {
          counter.style.color = '#666';
        }
      }
      
      messageField.addEventListener('input', updateCounter);
      messageField.addEventListener('keyup', updateCounter);
      updateCounter(); // Initial call
    }

    // Add form field focus enhancements
    const formFields = document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea');
    formFields.forEach(field => {
      field.addEventListener('focus', function() {
        this.parentNode.classList.add('focused');
      });
      
      field.addEventListener('blur', function() {
        this.parentNode.classList.remove('focused');
        if (this.value.trim() !== '') {
          this.parentNode.classList.add('filled');
        } else {
          this.parentNode.classList.remove('filled');
        }
      });
    });
  }

  // ---------- CONTACT PAGE INITIALIZATION ----------
  window.initializeContactPage = function() {
    console.log('Initializing contact page...');
    
    // Initialize contact form
    initContactForm();
    
    // Initialize map
    initContactMap();
    
    // Initialize FAQ interactions
    initFAQInteraction();
    
    // Initialize form enhancements
    initFormEnhancements();
    
    // Show welcome tutorials
    showContactWelcome();
    showFAQTutorial();
    
    console.log('Contact page initialized successfully');
  };

  // Initialize will be called by shared.js after components load
});
