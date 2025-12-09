/**
 * Custom Language Switcher Module
 * Provides multi-language support with localStorage persistence
 * Supports: Finnish (fi), English (en)
 */

class LanguageSwitcher {
  constructor() {
    this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.translations = {
      en: {
        // Navigation
        'nav-home': 'Home',
        'nav-build': 'Build Your Slice',
        'nav-menu': 'Menu',
        'nav-contact': 'Contact',
        'nav-login': 'Login',
        'nav-signup': 'Sign Up',
        'nav-admin': 'Admin',
        
        // Hero Section
        'hero-title': 'Create Your Perfect Pizza Slice',
        'hero-subtitle': 'Customize every aspect of your pizza slice - from dough to toppings - baked fresh right before your eyes',
        'hero-btn': 'Build Your Slice Now',
        
        // About Section
        'about-title': 'About Your Slice',
        'about-subtitle': 'Discover what makes us special',
        'about-heading': 'Fresh, Customized Pizza Slices',
        'custom-creations': 'Custom Creations',
        'freshly-baked': 'Freshly Baked',
        'vegan-options': 'Vegan Options',
        'fast-delivery': 'Fast Delivery',
        
        // Today's Menu
        'todays-menu': "Today's Special Menu",
        'menu-subtitle': 'Fresh offerings prepared just for you',
        'view-full-menu': 'View Full Menu',
        'no-menu': "Today's Menu",
        'check-back': 'Check back later for today\'s special offerings!',
        
        // Location
        'visit-us': 'Visit Us',
        'location-subtitle': 'Find our location and get directions',
        'our-restaurant': 'Our Restaurant',
        'address': 'Address',
        'phone': 'Phone',
        'email': 'Email',
        'opening-hours': 'Opening Hours',
        'get-directions': 'Get Directions',
        
        // HSL Section
        'hsl-title': 'Getting Here by Public Transport',
        'hsl-subtitle': "Helsinki region's easy and eco-friendly transportation options",
        'plan-journey': 'Plan Journey by Public Transport',
        'about-hsl': 'About HSL',
        'hsl-description': 'HSL (Helsingin Seudun Liikenne) operates buses, trams, metro, commuter trains, and ferries across the Helsinki region. With over 100 routes, it\'s the most convenient way to reach Your Slice from anywhere in the metropolitan area.',
        'learn-more': 'Learn more',
        'hsl-website': 'HSL Official Website',
        'journey-planner': 'Journey Planner',
        'tickets-prices': 'Tickets & Prices',
        
        // Contact Page
        'contact-us': 'Contact Your Slice',
        'contact-subtitle': 'Get in touch with us - we\'d love to hear from you!',
        'visit': 'Visit Us',
        'call-us': 'Call Us',
        'email-us': 'Email Us',
        'send-message': 'Send us a Message',
        'your-name': 'Your Name',
        'your-email': 'Your Email',
        'subject': 'Subject',
        'your-message': 'Your Message',
        'send-btn': 'Send Message',
        'faq': 'Frequently Asked Questions',
        
        // Footer
        'footer-about': 'Creating the perfect customized pizza slice, baked fresh right before your eyes.',
        'quality': 'Quality ingredients, amazing taste, and your personal touch.',
        'quick-links': 'Quick Links',
        'copyright': '© 2025 Your Slice. All rights reserved. | Made with 🍕 and ❤️',
      },
      fi: {
        // Navigation
        'nav-home': 'Koti',
        'nav-build': 'Rakenna oma pizzasi',
        'nav-menu': 'Ruokalista',
        'nav-contact': 'Ota yhteyttä',
        'nav-login': 'Kirjaudu',
        'nav-signup': 'Rekisteröidy',
        'nav-admin': 'Ylläpitäjä',
        
        // Hero Section
        'hero-title': 'Luo täydellinen pizzasiivusi',
        'hero-subtitle': 'Mukauta pizzasiivusi jokainen osa - pohjasta täytteisiin - paistettu tuoreena silmiesi edessä',
        'hero-btn': 'Rakenna pizzasi nyt',
        
        // About Section
        'about-title': 'Tietoa meistä',
        'about-subtitle': 'Tutustu siihen, mikä tekee meistä erityiset',
        'about-heading': 'Tuoreita, mukautettuja pizzasiivuja',
        'custom-creations': 'Mukautetut luomukset',
        'freshly-baked': 'Tuoreesti paistettu',
        'vegan-options': 'Vegaanitason vaihtoehdot',
        'fast-delivery': 'Nopea toimitus',
        
        // Today's Menu
        'todays-menu': 'Tämän päivän erikoisruokalista',
        'menu-subtitle': 'Tuoreita tarjouksia valmistettuja juuri sinulle',
        'view-full-menu': 'Näytä koko ruokalista',
        'no-menu': 'Tämän päivän ruokalista',
        'check-back': 'Tarkista myöhemmin saadaksesi tämän päivän erityistarjouksia!',
        
        // Location
        'visit-us': 'Vieraile meillä',
        'location-subtitle': 'Löydä sijaintimme ja saat ohjeet',
        'our-restaurant': 'Ravintolaamme',
        'address': 'Osoite',
        'phone': 'Puhelin',
        'email': 'Sähköposti',
        'opening-hours': 'Aukioloajat',
        'get-directions': 'Hanki ohjeet',
        
        // HSL Section
        'hsl-title': 'Saapuminen joukkoliikenteellä',
        'hsl-subtitle': 'Helsingin alueen kätevät ja ympäristöystävälliset kulkuvälineet',
        'plan-journey': 'Suunnittele matka joukkoliikenteellä',
        'about-hsl': 'Tietoa HSL:stä',
        'hsl-description': 'HSL (Helsingin Seudun Liikenne) operoi busseja, raitiovaunuja, metroa, lähijunia ja lautoja Helsingin alueella. Yli 100 reitillä se on kätevä tapa päästä Your Sliceen mistä tahansa pääkaupunkiseudulta.',
        'learn-more': 'Lue lisää',
        'hsl-website': 'HSL:n virallinen sivusto',
        'journey-planner': 'Reittiopas',
        'tickets-prices': 'Liput ja hinnat',
        
        // Contact Page
        'contact-us': 'Ota yhteyttä Your Sliceen',
        'contact-subtitle': 'Ota meihin yhteyttä - kuulemme mielellä sinusta!',
        'visit': 'Vieraile',
        'call-us': 'Soita meille',
        'email-us': 'Lähetä sähköpostia',
        'send-message': 'Lähetä meille viesti',
        'your-name': 'Nimesi',
        'your-email': 'Sähköpostisi',
        'subject': 'Aihe',
        'your-message': 'Viestisi',
        'send-btn': 'Lähetä viesti',
        'faq': 'Usein kysytyt kysymykset',
        
        // Footer
        'footer-about': 'Luomme täydellistä mukautettua pizzasiivua, paistettu tuoreena silmiesi edessä.',
        'quality': 'Laadukkaita ainesosia, hämmästyttävää makua ja sinun henkilökohtaista koskettasi.',
        'quick-links': 'Pikalinkit',
        'copyright': '© 2025 Your Slice. Kaikki oikeudet pidätetään. | Tehty 🍕:lla ja ❤️:llä',
      }
    };
    
    this.init();
  }

  /**
   * Initialize the language switcher
   */
  init() {
    this.createLanguageSwitcher();
    this.translatePage();
  }

  /**
   * Create the language switcher UI
   */
  createLanguageSwitcher() {
    // Check if switcher already exists
    if (document.getElementById('language-switcher')) {
      return;
    }

    const switcher = document.createElement('div');
    switcher.id = 'language-switcher';
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
      <button class="lang-btn ${this.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">
        <span class="flag">🇬🇧</span> EN
      </button>
      <button class="lang-btn ${this.currentLanguage === 'fi' ? 'active' : ''}" data-lang="fi">
        <span class="flag">🇫🇮</span> FI
      </button>
    `;

    // Always insert at the top of body to avoid timing issues with header loading
    document.body.insertBefore(switcher, document.body.firstChild);

    // Add event listeners
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setLanguage(e.target.closest('.lang-btn').dataset.lang);
      });
    });
  }

  /**
   * Set the current language and update the page
   */
  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'fi') return;
    
    this.currentLanguage = lang;
    localStorage.setItem('selectedLanguage', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Translate page
    this.translatePage();
  }

  /**
   * Translate all elements on the page
   */
  translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const text = this.getTranslation(key);
      if (text) {
        element.textContent = text;
      }
    });

    // Also handle placeholders
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const text = this.getTranslation(key);
      if (text) {
        element.placeholder = text;
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLanguage;
  }

  /**
   * Get translation for a key
   */
  getTranslation(key) {
    return this.translations[this.currentLanguage][key] || this.translations['en'][key];
  }

  /**
   * Change language
   */
  change(lang) {
    this.setLanguage(lang);
  }

  /**
   * Get current language
   */
  getLanguage() {
    return this.currentLanguage;
  }
}

// Initialize language switcher when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure body is fully ready
    setTimeout(() => {
      window.languageSwitcher = new LanguageSwitcher();
    }, 50);
  });
} else {
  // Small delay to ensure body is fully ready
  setTimeout(() => {
    window.languageSwitcher = new LanguageSwitcher();
  }, 50);
}
