// build-your-slice.js - Pizza builder page functionality
document.addEventListener("DOMContentLoaded", function () {
  
  // ---------- PIZZA MODIFICATION SYSTEM ----------
  let modifyingPizzaIndex = null;
  
  // Global modification state that persists across page operations
  window.pizzaModificationState = {
    isModifying: false,
    index: null,
    originalPizza: null,
    
    setModificationMode: function(index, pizza) {
      this.isModifying = true;
      this.index = index;
      this.originalPizza = pizza;
      modifyingPizzaIndex = index;
      console.log('🔄 Modification state set:', this);
    },
    
    clearModificationMode: function() {
      this.isModifying = false;
      this.index = null;
      this.originalPizza = null;
      modifyingPizzaIndex = null;
      console.log('✅ Modification state cleared');
    },
    
    getModificationIndex: function() {
      // Return the stored index, with localStorage as backup
      if (this.isModifying && this.index !== null) {
        return this.index;
      }
      
      // Backup: check localStorage
      const modData = localStorage.getItem('modifyingPizza');
      if (modData) {
        try {
          const { index } = JSON.parse(modData);
          return index;
        } catch (e) {
          console.error('Error parsing modification data:', e);
        }
      }
      
      return null;
    }
  };
  
  let pizzaConfig = {
    base: { name: "Original", price: 0 },
    sauce: { name: "Tomato Sauce", price: 0 },
    cheese: { name: "Mozzarella", price: 0 },
    toppings: []
  };

  // Function to clear modification UI
  function clearModificationUI() {
    const modificationBanner = document.querySelector(".modification-banner");
    if (modificationBanner) {
      modificationBanner.remove();
    }
    
    // Reset button text
    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
      nextBtn.textContent = "Complete Your Slice";
    }
  }

  // Function to cancel modification
  window.cancelModification = function() {
    localStorage.removeItem('modifyingPizza');
    modifyingPizzaIndex = null;
    clearModificationUI();
    
    if (window.showToast) {
      window.showToast('Modification cancelled. Returning to home page.', 'info', 2000);
    }
    
    setTimeout(() => {
      window.location.href = '../';
    }, 1000);
  };

  function modifyPizza(cartIndex) {
    console.log('Modifying pizza at index:', cartIndex);
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const pizza = cart[cartIndex];
    
    // Store the index of the pizza being modified
    modifyingPizzaIndex = cartIndex;
    
    // Store pizza data for modification
    localStorage.setItem('modifyingPizza', JSON.stringify({
      index: cartIndex,
      pizza: pizza
    }));
    
    if (window.showToast) {
      window.showToast('Opening pizza builder for modifications...', 'info', 2000);
    }
    
    // Redirect to builder page
    setTimeout(() => {
      window.location.href = 'build-your-slice.html';
    }, 1000);
  }

  function initPizzaModification() {
    console.log('=== initPizzaModification called ===');
    
    // Check if we're modifying an existing pizza
    const modificationData = localStorage.getItem('modifyingPizza');
    console.log('Modification data from localStorage:', modificationData);
    
    if (!modificationData) {
      // Ensure we're not in modification mode
      modifyingPizzaIndex = null;
      clearModificationUI();
      console.log('No modification data found, clearing modification state');
      return;
    }      try {
        const { index, pizza } = JSON.parse(modificationData);
        
        // Set both local and global modification state
        modifyingPizzaIndex = index;
        window.pizzaModificationState.setModificationMode(index, pizza);
        
        console.log('=== ENTERING MODIFICATION MODE ===');
        console.log('Initializing pizza modification for:', pizza);
        console.log('Setting modifyingPizzaIndex to:', index);
        console.log('Current modifyingPizzaIndex value:', modifyingPizzaIndex);
        console.log('Global modification state:', window.pizzaModificationState);
      
      // Update UI to show modification mode
      const builderSection = document.querySelector(".builder-section");
      if (builderSection) {
        const existingBanner = document.querySelector(".modification-banner");
        if (existingBanner) existingBanner.remove();
        
        const banner = document.createElement('div');
        banner.className = 'modification-banner';
        banner.innerHTML = `
          <div class="modification-notice">
            <h3>🔄 MODIFICATION MODE</h3>
            <p>You are modifying your existing pizza: <strong>${pizza.name}</strong></p>
            <p>Make your changes and click "Update Your Pizza" to save them.</p>
            <button class="cancel-modification-btn" onclick="cancelModification()">Cancel Changes</button>
          </div>
        `;
        banner.style.cssText = `
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        
        // Add styles for the cancel button
        const cancelBtn = banner.querySelector('.cancel-modification-btn');
        if (cancelBtn) {
          cancelBtn.style.cssText = `
            background: rgba(255,255,255,0.2);
            border: 2px solid white;
            color: white;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
            transition: all 0.3s ease;
          `;
        }
        
        builderSection.insertBefore(banner, builderSection.firstChild);
        
        // Show modification tutorial (if tutorials enabled)
        if (typeof areTutorialsDisabled === 'function' && !areTutorialsDisabled()) {
          setTimeout(() => {
            if (typeof showTutorial === 'function') {
              showTutorial('You\'re in modification mode! Change any ingredient and click "Update Your Pizza" when done.', 'top', '🔄');
            }
          }, 1000);
        }
      }
      
      // Update button text
      const completeBtn = document.getElementById("nextBtn");
      if (completeBtn) {
        completeBtn.textContent = "Update Your Pizza";
        console.log('Updated button text to: Update Your Pizza');
      }
      
      // Store prefill data for later use when builder is ready
      if (pizza.details && typeof pizza.details === 'string') {
        // Parse customizations from details string
        const customizations = pizza.details.split(', ');
        window.pendingPrefillData = { type: 'customizations', data: customizations };
        console.log('Stored customizations for prefill:', customizations);
      } else if (pizza.config) {
        // Use config if available
        window.pendingPrefillData = { type: 'config', data: pizza.config };
        console.log('Stored config for prefill:', pizza.config);
      }
      
      // Add a visual debug indicator to confirm modification mode is active
      if (window.showToast) {
        window.showToast(`🔄 Modification mode active for index ${index}`, 'info', 3000);
      }
      
      // Don't clear modification data immediately - wait until completion
    } catch (error) {
      console.error('Error parsing modification data:', error);
      localStorage.removeItem('modifyingPizza');
      clearModificationUI();
    }
  }

  function prefillBuilder(customizations) {
    console.log('Prefilling builder with:', customizations);
    
    // Extract components from customizations
    let base = "Original";
    let sauce = "Tomato Sauce";
    let cheese = "Mozzarella";
    const toppings = [];
    
    customizations.forEach(item => {
      if (item.includes("Base:")) {
        base = item.replace("Base:", "").trim();
      } else if (item.includes("Sauce:")) {
        sauce = item.replace("Sauce:", "").trim();
      } else if (item.includes("Cheese:")) {
        cheese = item.replace("Cheese:", "").trim();
      } else if (item.includes("Toppings:")) {
        const toppingsStr = item.replace("Toppings:", "").trim();
        if (toppingsStr !== "None") {
          toppings.push(...toppingsStr.split(", "));
        }
      }
    });
    
    // Select options in the builder
    selectBuilderOption('base', base);
    selectBuilderOption('sauce', sauce);
    selectBuilderOption('cheese', cheese);
    toppings.forEach(topping => selectBuilderOption('topping', topping));
    
    console.log('Builder pre-filled with:', { base, sauce, cheese, toppings });
  }

  function prefillBuilderFromConfig(config) {
    console.log('Prefilling builder from config:', config);
    
    // Update the pizzaConfig with the loaded configuration
    if (config.base) {
      pizzaConfig.base = config.base;
      selectBuilderOption('base', config.base.name);
    }
    if (config.sauce) {
      pizzaConfig.sauce = config.sauce;
      selectBuilderOption('sauce', config.sauce.name);
    }
    if (config.cheese) {
      pizzaConfig.cheese = config.cheese;
      selectBuilderOption('cheese', config.cheese.name);
    }
    if (config.toppings && config.toppings.length > 0) {
      pizzaConfig.toppings = [...config.toppings];
      config.toppings.forEach(topping => selectBuilderOption('topping', topping.name));
    }
    
    // Update the visual display after a short delay
    setTimeout(() => {
      if (typeof updatePizzaVisualization === 'function') {
        updatePizzaVisualization();
      }
      if (typeof updatePrice === 'function') {
        updatePrice();
      }
    }, 300);
  }

  function selectBuilderOption(type, name) {
    const selector = type === 'base' ? '#step1' : 
                    type === 'sauce' ? '#step2' : 
                    type === 'cheese' ? '#step3' : '#step4';
    
    const cards = document.querySelectorAll(`${selector} .option-card`);
    cards.forEach(card => {
      if (card.dataset.name === name) {
        setTimeout(() => card.click(), 50);
      }
    });
  }

  function updatePizzaInCart(updatedPizza, overrideIndex = null) {
    console.log('=== updatePizzaInCart called ===');
    console.log('modifyingPizzaIndex:', modifyingPizzaIndex);
    console.log('overrideIndex:', overrideIndex);
    console.log('updatedPizza:', updatedPizza);
    console.log('pizzaModificationState:', window.pizzaModificationState);
    
    // Determine target index with multiple fallbacks
    let targetIndex = overrideIndex || window.pizzaModificationState.getModificationIndex() || modifyingPizzaIndex;
    
    // Final fallback: get from localStorage directly
    if (targetIndex === null) {
      const modificationData = localStorage.getItem('modifyingPizza');
      if (modificationData) {
        try {
          const { index } = JSON.parse(modificationData);
          targetIndex = index;
          console.log('Using index from localStorage fallback:', targetIndex);
        } catch (e) {
          console.error('Error parsing modification data:', e);
          return;
        }
      }
    }
    
    if (targetIndex !== null) {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      console.log('Current cart:', cart);
      console.log('Cart length:', cart.length);
      console.log('Target index:', targetIndex);
      
      if (cart[targetIndex]) {
        console.log('Original pizza at index:', cart[targetIndex]);
        console.log('Updating pizza at index:', targetIndex);
        
        // Update the existing pizza
        cart[targetIndex] = {
          ...cart[targetIndex],
          ...updatedPizza
        };
        
        console.log('Updated pizza:', cart[targetIndex]);
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Clear modification data immediately
        localStorage.removeItem('modifyingPizza');
        
        // Call global updateCart if available
        if (typeof updateCart === 'function') {
          updateCart();
        } else if (window.updateCart) {
          window.updateCart();
        }
        
        // EXIT MODIFICATION MODE - reset both local and global state
        modifyingPizzaIndex = null;
        window.pizzaModificationState.clearModificationMode();
        clearModificationUI();
        
        // Show success message and redirect
        if (window.showToast) {
          window.showToast("Pizza updated successfully!", 'success', 2000);
        }
        
        setTimeout(() => {
          window.location.href = '../';
        }, 1500);        } else {
          console.error('No pizza found at index:', targetIndex);
          console.error('Cart contents:', cart);
          console.error('This looks like an index mismatch - treating as NEW PIZZA instead');
          
          // Instead of falling back to adding as new, throw an error to prevent duplication
          if (window.showToast) {
            window.showToast('Error: Cannot find pizza to modify. Creating new pizza instead.', 'warning', 4000);
          }
          
          // Clear modification data since it's invalid
          localStorage.removeItem('modifyingPizza');
          window.pizzaModificationState.clearModificationMode();
          
          // Add as new pizza instead using the manual method
          console.log('Adding as new pizza due to index error');
          cart.push(updatedPizza);
          localStorage.setItem('cart', JSON.stringify(cart));
          
          if (typeof updateCart === 'function') {
            updateCart();
          } else if (window.updateCart) {
            window.updateCart();
          }
          
          if (window.showToast) {
            window.showToast("New pizza added to cart!", 'success', 2000);
          }
          
          setTimeout(() => {
            window.location.href = '../';
          }, 1500);
        }
      } else {
        console.error('updatePizzaInCart called but no valid index available');
        console.error('targetIndex:', targetIndex);
        console.error('modifyingPizzaIndex:', modifyingPizzaIndex);
        console.error('pizzaModificationState:', window.pizzaModificationState);
        
        // If we get here, something is seriously wrong - treat as new pizza
        console.log('Treating as new pizza due to missing index');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(updatedPizza);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        if (window.updateCart) {
          window.updateCart();
        }
        
        if (window.showToast) {
          window.showToast("Pizza added to cart!", 'success', 2000);
        }
        
        setTimeout(() => {
          window.location.href = '../';
        }, 1500);
      }
  }

  // ---------- PIZZA BUILDER FUNCTIONALITY ----------
  function initPizzaBuilder() {
    const builderSection = $(".builder-section");
    if (!builderSection) return;

    // Show builder welcome tutorial (if enabled)
    if (typeof showBuilderWelcome === 'function') {
      showBuilderWelcome();
    }

    // Reset pizzaConfig to defaults
    pizzaConfig = {
      base: { name: "Original", price: 0 },
      sauce: { name: "Tomato Sauce", price: 0 },
      cheese: { name: "Mozzarella", price: 0 },
      toppings: []
    };

    const basePrice = 3.00;

    // Initialize modification system AFTER pizzaConfig is reset
    initPizzaModification();

    // DOM Elements
    const steps = document.querySelectorAll(".step");
    const stepContents = document.querySelectorAll(".step-content");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const optionCards = document.querySelectorAll(".option-card");
    const selectedOptions = document.getElementById("selectedOptions");
    const currentPrice = document.getElementById("currentPrice");
    const toppingsCounter = document.getElementById("selectedToppingsCount");
    const pizzaCanvas = document.getElementById("pizzaCanvas");
    const pizzaBase = pizzaCanvas ? pizzaCanvas.querySelector(".pizza-base") : null;
    const pizzaSauce = pizzaCanvas ? pizzaCanvas.querySelector(".pizza-sauce") : null;
    const pizzaCheese = pizzaCanvas ? pizzaCanvas.querySelector(".pizza-cheese") : null;
    const pizzaToppings = pizzaCanvas ? pizzaCanvas.querySelector(".pizza-toppings") : null;

    let currentStep = 1;

    function updateStepNavigation() {
      // Update step indicators
      steps.forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.toggle("active", stepNum === currentStep);
      });

      // Update step content visibility
      stepContents.forEach(content => {
        const contentStep = content.id.replace("step", "");
        content.style.display = (parseInt(contentStep) === currentStep) ? "block" : "none";
      });

      // Update button states
      if (prevBtn) prevBtn.disabled = currentStep === 1;

      const stepTitles = ["", "Base", "Sauce", "Cheese", "Toppings", "Size"];
      if (nextBtn) {
        if (currentStep === 5) {
          // Check if we're still in modification mode
          nextBtn.textContent = modifyingPizzaIndex !== null ? "Update Your Pizza" : "Complete Your Slice";
        } else {
          nextBtn.textContent = `Next: Choose ${stepTitles[currentStep + 1]}`;
        }
      }

      updatePizzaVisualization();
      updatePrice();
    }

    // Option selection
    optionCards.forEach(card => {
      card.addEventListener("click", function() {
        const type = this.dataset.type;
        const name = this.dataset.name;
        const price = parseFloat(this.dataset.price);

        if (type === "topping") {
          // Multiple toppings allowed, max 3
          const index = pizzaConfig.toppings.findIndex(t => t.name === name);
          if (index > -1) {
            pizzaConfig.toppings.splice(index, 1);
            this.classList.remove("selected");
            showToast(`Removed ${name}`, 'info', 2000);
          } else if (pizzaConfig.toppings.length < 3) {
            pizzaConfig.toppings.push({ name, price });
            this.classList.add("selected");
            showToast(`Added ${name}`, 'success', 2000);
            
            // Show warning when reaching max toppings
            if (pizzaConfig.toppings.length === 3) {
              showMaxToppingsWarning();
            }
          } else {
            // Already at max toppings
            showMaxToppingsWarning();
            return;
          }
          updateToppingsCounter();
        } else {
          // Single choice options
          const parent = this.closest(".options-grid");
          parent.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
          this.classList.add("selected");

          pizzaConfig[type] = { name, price };
          
          // Show step completion hint for non-topping steps (if tutorials enabled)
          if (type !== 'topping' && !areTutorialsDisabled()) {
            showStepCompletionHint(type);
          }
        }

        updatePizzaVisualization();
        updatePrice();
      });
    });

    // Navigation buttons
    if (nextBtn) {
      nextBtn.addEventListener("click", function() {
        if (currentStep < 5) {
          currentStep++;
          updateStepNavigation();
          
          // Show tutorial for new step (if tutorials enabled)
          if (!areTutorialsDisabled()) {
            const stepNames = ["", "Base", "Sauce", "Cheese", "Toppings", "Size"];
            showTutorial(`Now choose your ${stepNames[currentStep].toLowerCase()}. Click on any option to select it.`, 'bottom', '👆');
          }
        } else {
          completePizza();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function() {
        if (currentStep > 1) {
          currentStep--;
          updateStepNavigation();
        }
      });
    }

    function updateToppingsCounter() {
      if (toppingsCounter) {
        toppingsCounter.textContent = `${pizzaConfig.toppings.length}/3 toppings selected`;
        
        // Add warning class when at max
        if (pizzaConfig.toppings.length === 3) {
          toppingsCounter.classList.add('max-reached');
        } else {
          toppingsCounter.classList.remove('max-reached');
        }
      }
    }

    function updatePizzaVisualization() {
      if (!pizzaCanvas) return;
      
      // Update base
      if (pizzaBase) {
        pizzaBase.className = "pizza-base";
        if (pizzaConfig.base.name !== "Original") {
          pizzaBase.classList.add(pizzaConfig.base.name.toLowerCase().replace(" ", "-"));
        }
      }
      
      // Update sauce
      if (pizzaSauce) {
        pizzaSauce.className = "pizza-sauce";
        if (pizzaConfig.sauce.name !== "None") {
          pizzaSauce.classList.add("active");
          pizzaSauce.classList.add(pizzaConfig.sauce.name.toLowerCase().split(" ")[0]);
        }
      }
      
      // Update cheese
      if (pizzaCheese) {
        pizzaCheese.className = "pizza-cheese";
        if (pizzaConfig.cheese.name !== "None") {
          pizzaCheese.classList.add("active");
          pizzaCheese.classList.add(pizzaConfig.cheese.name.toLowerCase().split(" ")[0]);
        }
      }
      
      // Update toppings
      if (pizzaToppings) {
        pizzaToppings.innerHTML = "";
        pizzaConfig.toppings.forEach((topping, index) => {
          const toppingEl = document.createElement("div");
          toppingEl.className = `topping ${topping.name.toLowerCase().replace(" ", "-")} active new`;
          
          // Random position for toppings
          const angle = Math.random() * Math.PI * 2;
          const distance = 60 + Math.random() * 80;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          
          toppingEl.style.left = `calc(50% + ${x}px)`;
          toppingEl.style.top = `calc(50% + ${y}px)`;
          
          pizzaToppings.appendChild(toppingEl);
          
          setTimeout(() => {
            toppingEl.classList.remove("new");
          }, 600);
        });
      }
      
      // Update summary text
      if (selectedOptions) {
        selectedOptions.innerHTML = `
          <div><strong>Base:</strong> ${pizzaConfig.base.name}</div>
          <div><strong>Sauce:</strong> ${pizzaConfig.sauce.name}</div>
          <div><strong>Cheese:</strong> ${pizzaConfig.cheese.name}</div>
          <div><strong>Toppings:</strong> ${pizzaConfig.toppings.length > 0 ? pizzaConfig.toppings.map(t => t.name).join(", ") : "None"}</div>
        `;
      }
    }

    function updatePrice() {
      if (!currentPrice) return;
      
      let total = basePrice;
      total += pizzaConfig.base.price;
      total += pizzaConfig.sauce.price;
      total += pizzaConfig.cheese.price;
      total += pizzaConfig.toppings.reduce((sum, t) => sum + t.price, 0);
      currentPrice.textContent = `€${total.toFixed(2)}`;
    }

    function completePizza() {
      console.log('=== completePizza called ===');
      console.log('modifyingPizzaIndex:', modifyingPizzaIndex);
      console.log('pizzaModificationState:', window.pizzaModificationState);
      
      // Get modification index from the global state
      const modificationIndex = window.pizzaModificationState.getModificationIndex();
      console.log('Modification index from global state:', modificationIndex);
      
      // Double-check modification status from localStorage as backup
      const modificationData = localStorage.getItem('modifyingPizza');
      console.log('localStorage modifyingPizza:', modificationData);
      
      const totalPrice = parseFloat(currentPrice.textContent.replace("€", ""));
      const customizations = [
        `Base: ${pizzaConfig.base.name}`,
        `Sauce: ${pizzaConfig.sauce.name}`,
        `Cheese: ${pizzaConfig.cheese.name}`,
        `Toppings: ${pizzaConfig.toppings.length > 0 ? pizzaConfig.toppings.map(t => t.name).join(", ") : "None"}`
      ];

      console.log('Pizza customizations:', customizations);

      // Check multiple conditions to determine if we're in modification mode
      const isModifying = modificationIndex !== null || 
                         window.pizzaModificationState.isModifying || 
                         modificationData || 
                         modifyingPizzaIndex !== null;
      
      console.log('🔍 Modification check results:');
      console.log('- modificationIndex:', modificationIndex);
      console.log('- pizzaModificationState.isModifying:', window.pizzaModificationState.isModifying);
      console.log('- modificationData exists:', !!modificationData);
      console.log('- modifyingPizzaIndex:', modifyingPizzaIndex);
      console.log('- Final isModifying decision:', isModifying);
      
      if (isModifying) {
        console.log('=== MODIFICATION MODE: Updating existing pizza ===');
        console.log('Using modification index:', modificationIndex);
        
        // Update existing pizza
        updatePizzaInCart({
          name: "Custom Pizza Slice",
          price: totalPrice,
          details: customizations.join(', '),
          config: pizzaConfig,
          type: 'pizza'
        }, modificationIndex);
      } else {
        console.log('=== NEW PIZZA MODE: Adding new pizza ===');
        // Add new pizza
        const newPizza = {
          name: "Custom Pizza Slice",
          price: totalPrice,
          details: customizations.join(', '),
          config: pizzaConfig,
          type: 'pizza'
        };
        
        console.log('Adding new pizza:', newPizza);
        
        if (typeof addToCart === 'function') {
          addToCart(newPizza);
        } else if (window.addToCart) {
          window.addToCart(newPizza);
        } else {
          // Fallback: add to cart manually
          console.log('Adding pizza manually to localStorage');
          const cart = JSON.parse(localStorage.getItem('cart')) || [];
          cart.push(newPizza);
          localStorage.setItem('cart', JSON.stringify(cart));
          
          if (window.updateCart) {
            window.updateCart();
          }
        }
        
        resetBuilder();
        
        // Show success and offer navigation options
        setTimeout(() => {
          if (typeof showCompletionOptions === 'function') {
            showCompletionOptions();
          }
        }, 1000);
      }
    }

    function resetBuilder() {
      currentStep = 1;
      pizzaConfig.base = { name: "Original", price: 0 };
      pizzaConfig.sauce = { name: "Tomato Sauce", price: 0 };
      pizzaConfig.cheese = { name: "Mozzarella", price: 0 };
      pizzaConfig.toppings = [];

      optionCards.forEach(card => card.classList.remove("selected"));
      
      // Select defaults
      const firstBaseCard = document.querySelector("#step1 .option-card");
      if (firstBaseCard) firstBaseCard.classList.add("selected");
      
      const defaultSauceCard = document.querySelector("#step2 .option-card[data-name='Tomato Sauce']");
      if (defaultSauceCard) defaultSauceCard.classList.add("selected");
      
      const defaultCheeseCard = document.querySelector("#step3 .option-card[data-name='Mozzarella']");
      if (defaultCheeseCard) defaultCheeseCard.classList.add("selected");

      // Remove modification banner if it exists
      const modificationBanner = $(".modification-banner");
      if (modificationBanner) {
        modificationBanner.remove();
      }

      // Reset modification index
      modifyingPizzaIndex = null;

      updateStepNavigation();
      updateToppingsCounter();
    }

    function showCompletionOptions() {
      showTutorial(
        "Pizza created! 🍕 Want to build another slice or check out other options? You can also view your cart to proceed to checkout.",
        'center',
        '🎉'
      );
    }

    // Initialize pizza builder
    updateStepNavigation();
    updateToppingsCounter();
    
    // Set initial defaults
    const firstBaseCard = document.querySelector("#step1 .option-card");
    if (firstBaseCard) firstBaseCard.classList.add("selected");
    
    // Check for pending prefill data from modification
    if (window.pendingPrefillData) {
      console.log('Applying pending prefill data:', window.pendingPrefillData);
      
      setTimeout(() => {
        if (window.pendingPrefillData.type === 'customizations') {
          applyCustomizations(window.pendingPrefillData.data);
        } else if (window.pendingPrefillData.type === 'config') {
          applyConfig(window.pendingPrefillData.data);
        }
        
        // Clear the pending data
        window.pendingPrefillData = null;
        
        // Update display
        updatePizzaVisualization();
        updatePrice();
        updateToppingsCounter();
      }, 500);
    }
    
    // Helper functions to apply prefill data
    function applyCustomizations(customizations) {
      customizations.forEach(item => {
        if (item.includes("Base:")) {
          const baseName = item.replace("Base:", "").trim();
          selectOptionByName('base', baseName);
        } else if (item.includes("Sauce:")) {
          const sauceName = item.replace("Sauce:", "").trim();
          selectOptionByName('sauce', sauceName);
        } else if (item.includes("Cheese:")) {
          const cheeseName = item.replace("Cheese:", "").trim();
          selectOptionByName('cheese', cheeseName);
        } else if (item.includes("Toppings:")) {
          const toppingsStr = item.replace("Toppings:", "").trim();
          if (toppingsStr !== "None") {
            const toppings = toppingsStr.split(", ");
            toppings.forEach(topping => selectOptionByName('topping', topping));
          }
        }
      });
    }
    
    function applyConfig(config) {
      if (config.base) {
        pizzaConfig.base = config.base;
        selectOptionByName('base', config.base.name);
      }
      if (config.sauce) {
        pizzaConfig.sauce = config.sauce;
        selectOptionByName('sauce', config.sauce.name);
      }
      if (config.cheese) {
        pizzaConfig.cheese = config.cheese;
        selectOptionByName('cheese', config.cheese.name);
      }
      if (config.toppings && config.toppings.length > 0) {
        pizzaConfig.toppings = [...config.toppings];
        config.toppings.forEach(topping => selectOptionByName('topping', topping.name));
      }
    }
    
    function selectOptionByName(type, name) {
      const selector = type === 'base' ? '#step1' : 
                      type === 'sauce' ? '#step2' : 
                      type === 'cheese' ? '#step3' : '#step4';
      
      const cards = document.querySelectorAll(`${selector} .option-card`);
      cards.forEach(card => {
        if (card.dataset.name === name) {
          // Simulate click to properly set up the selection
          setTimeout(() => {
            card.click();
          }, 100);
        }
      });
    }
  }

  // ---------- BUILDER TUTORIALS ----------
  function showBuilderWelcome() {
    setTimeout(() => {
      showTutorial(
        "Welcome to the Pizza Builder! 🍕 Create your perfect slice step by step. Use the navigation buttons to move between steps, and click on ingredients to select them.",
        'top',
        '👋'
      );
    }, 500);
  }

  function showMaxToppingsWarning() {
    showToast('Maximum 3 toppings allowed! Remove a topping to add a different one.', 'warning', 4000);
  }

  function showStepCompletionHint(type) {
    const messages = {
      base: "Great choice! Your pizza base is selected. 🍞",
      sauce: "Sauce selected! This will add great flavor. 🍅",
      cheese: "Perfect! Cheese makes everything better. 🧀"
    };
    
    if (messages[type]) {
      showToast(messages[type], 'success', 2000);
    }
  }

  // Helper function (if not available in shared.js)
  function $(selector) {
    return document.querySelector(selector);
  }

  // Function to manually clear modification state (for debugging)
  window.clearModificationState = function() {
    console.log('Manually clearing modification state...');
    localStorage.removeItem('modifyingPizza');
    modifyingPizzaIndex = null;
    clearModificationUI();
    
    if (window.showToast) {
      window.showToast('Modification state cleared!', 'success', 2000);
    }
    
    // Refresh the page to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Debug function to check modification state
  function checkModificationState() {
    console.log('Modification State Check:');
    console.log('- modifyingPizzaIndex:', modifyingPizzaIndex);
    console.log('- localStorage modifyingPizza:', localStorage.getItem('modifyingPizza'));
    console.log('- Modification banner exists:', !!document.querySelector('.modification-banner'));
  }

  // Make functions globally available
  window.modifyPizza = modifyPizza;
  window.checkModificationState = checkModificationState;

  // ---------- INITIALIZE BUILDER PAGE ----------
  window.initializeBuilderPage = function() {
    console.log('Initializing pizza builder page...');
    
    // Initialize pizza builder
    initPizzaBuilder();
  };

  // Fail-safe: Clear modification state on page unload
  window.addEventListener('beforeunload', function() {
    // If we're leaving the page and still have modification data, clean it up
    if (localStorage.getItem('modifyingPizza') && modifyingPizzaIndex === null) {
      localStorage.removeItem('modifyingPizza');
    }
  });

  // Fail-safe: Check for orphaned modification state on load
  window.addEventListener('load', function() {
    const modificationData = localStorage.getItem('modifyingPizza');
    if (modificationData && modifyingPizzaIndex === null) {
      console.log('Found orphaned modification data, cleaning up...');
      localStorage.removeItem('modifyingPizza');
      clearModificationUI();
    }
  });

  // Initialize builder page (will be called by shared.js)
  // initializeBuilderPage();
});
