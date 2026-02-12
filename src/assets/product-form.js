if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        const loadingSpinner = this.querySelector('.loading__spinner');
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');

        const resetButton = () => {
          this.submitButton.classList.remove('loading');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          const s = this.querySelector('.loading__spinner');
          if (s) s.classList.add('hidden');
        };

        try {
        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        // 🔢 QUANTITY FIX: Ensure custom quantity is synced before submission
        const customQtyInput = document.getElementById('customQuantity');
        if (customQtyInput) {
          const customQty = parseInt(customQtyInput.value) || 1;
          console.log('🔢 Custom quantity detected:', customQty);
          
          // Find or create quantity input in this form
          let qtyInput = this.form.querySelector('input[name="quantity"]');
          if (!qtyInput) {
            qtyInput = document.createElement('input');
            qtyInput.type = 'hidden';
            qtyInput.name = 'quantity';
            this.form.appendChild(qtyInput);
            console.log('✅ Created quantity input in product form');
          }
          qtyInput.value = customQty;
          console.log('✅ Synced custom quantity to form:', customQty);
        }
        
        const formData = new FormData(this.form);
        
        // 🔍 DEBUG: Log what's actually being submitted to cart
        console.log('🚀 SHOPIFY FORM SUBMISSION DEBUG (product-form.js)');
        console.log('📝 Form action:', this.form.action);
        console.log('📋 Form data being submitted to Shopify cart:');
        try {
          for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
          }
        } catch (e) {
          console.warn('⚠️ FormData.entries() log failed:', e);
        }
        
        // Check specifically for quantity and ColorFlex properties
        const quantity = formData.get('quantity');
        const pattern = formData.get('properties[Custom Pattern]') || formData.get('properties[Pattern Name]');
        const colors = formData.get('properties[Custom Colors]') || formData.get('properties[Colors]');
        
        console.log('🔍 KEY FIELDS IN SHOPIFY SUBMISSION:');
        console.log('  Quantity:', quantity);
        console.log('  Pattern:', pattern);
        console.log('  Colors:', colors);
        
        if (!quantity || quantity === '1') {
          console.warn('⚠️ Quantity issue in Shopify submission');
        }
        if (!pattern) {
          console.warn('⚠️ No pattern data in Shopify submission');
        }
        
        if (this.cart && typeof this.cart.getSectionsToRender === 'function') {
          const sections = this.cart.getSectionsToRender();
          if (Array.isArray(sections)) {
            formData.append(
              'sections',
              sections.map((section) => section.id)
            );
          }
          formData.append('sections_url', window.location.pathname);
          if (typeof this.cart.setActiveElement === 'function') {
            this.cart.setActiveElement(document.activeElement);
          }
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    CartPerformance.measure("add:paint-updated-sections", () => {
                      this.cart.renderContents(response);
                    });
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              CartPerformance.measure("add:paint-updated-sections", () => {
                this.cart.renderContents(response);
              });
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            const spinner = this.querySelector('.loading__spinner');
            if (spinner) spinner.classList.add('hidden');

            CartPerformance.measureFromEvent("add:user-action", evt);
          });
        } catch (e) {
          console.error('Product form submit error:', e);
          resetButton();
        }
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}
