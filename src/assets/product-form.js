/**
 * Upload ColorFlex data-URL thumbnail before /cart/add so line items get properties[_pattern_preview]=https://...
 * (Cart page Liquid uses it in main-cart-items.liquid.) Hosted Shopify checkout still shows the variant image
 * for the line thumbnail; replacing that requires a Checkout UI extension that reads this property.
 */
async function ensureColorFlexPatternPreviewOnFormData(formData) {
  let existing = formData.get('properties[_pattern_preview]');
  if (existing && String(existing).trim() !== '' && /^https?:\/\//i.test(String(existing).trim())) {
    return;
  }
  const isColorFlex =
    formData.get('properties[ColorFlex Design]') === 'Yes' ||
    !!(formData.get('properties[Custom Pattern]') || '').trim();
  if (!isColorFlex) return;

  let thumb = null;
  try {
    thumb = localStorage.getItem('colorflexCurrentThumbnail');
  } catch (e) {
    /* ignore */
  }
  if ((!thumb || thumb.length < 80) && typeof window.capturePatternThumbnail === 'function') {
    try {
      thumb = window.capturePatternThumbnail();
    } catch (e) {
      /* ignore */
    }
  }
  if (!thumb || !thumb.startsWith('data:image') || thumb.length < 256) {
    console.warn(
      'ColorFlex: No canvas thumbnail to upload; set window.COLORFLEX_API_URL and run /api/upload-thumbnail so _pattern_preview can be stored.'
    );
    return;
  }

  const apiUrl = window.COLORFLEX_API_URL || '/api/upload-thumbnail';
  const patternName = (formData.get('properties[Custom Pattern]') || 'pattern').toString().slice(0, 120);
  const safeName = patternName.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'pattern';
  const filename = 'colorflex-' + safeName + '-' + Date.now() + '.jpg';

  const controller = new AbortController();
  const timeoutId = setTimeout(function () {
    controller.abort();
  }, 8000);

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thumbnail: thumb, filename: filename }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      console.warn('ColorFlex thumbnail upload HTTP error:', res.status);
      return;
    }
    const data = await res.json();
    if (data && data.success && data.url) {
      try {
        if (formData.has('properties[_pattern_preview]')) {
          formData.delete('properties[_pattern_preview]');
        }
      } catch (delErr) {
        /* older browsers: append may duplicate key; Shopify uses last value in some paths */
      }
      formData.append('properties[_pattern_preview]', data.url);
      console.log('ColorFlex: Added properties[_pattern_preview] before cart add');
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('ColorFlex thumbnail upload skipped:', err && err.message ? err.message : err);
  }
}

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

        const self = this;
        (async function () {
          try {
            const config = fetchConfig('javascript');
            config.headers['X-Requested-With'] = 'XMLHttpRequest';
            delete config.headers['Content-Type'];

            // 🔢 QUANTITY FIX: Ensure custom quantity is synced before submission
            const customQtyInput = document.getElementById('customQuantity');
            if (customQtyInput) {
              const customQty = parseInt(customQtyInput.value) || 1;
              console.log('🔢 Custom quantity detected:', customQty);

              let qtyInput = self.form.querySelector('input[name="quantity"]');
              if (!qtyInput) {
                qtyInput = document.createElement('input');
                qtyInput.type = 'hidden';
                qtyInput.name = 'quantity';
                self.form.appendChild(qtyInput);
                console.log('✅ Created quantity input in product form');
              }
              qtyInput.value = customQty;
              console.log('✅ Synced custom quantity to form:', customQty);
            }

            const formData = new FormData(self.form);

            await ensureColorFlexPatternPreviewOnFormData(formData);

            console.log('🚀 SHOPIFY FORM SUBMISSION DEBUG (product-form.js)');
            console.log('📝 Form action:', self.form.action);
            console.log('📋 Form data being submitted to Shopify cart:');
            try {
              for (let [key, value] of formData.entries()) {
                const preview =
                  key === 'properties[_pattern_preview]' && value && String(value).length > 120
                    ? String(value).substring(0, 120) + '…'
                    : value;
                console.log('  ' + key + ': ' + preview);
              }
            } catch (e) {
              console.warn('⚠️ FormData.entries() log failed:', e);
            }

            const quantity = formData.get('quantity');
            const pattern =
              formData.get('properties[Custom Pattern]') || formData.get('properties[Pattern Name]');
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

            if (self.cart && typeof self.cart.getSectionsToRender === 'function') {
              const sections = self.cart.getSectionsToRender();
              if (Array.isArray(sections)) {
                formData.append(
                  'sections',
                  sections.map((section) => section.id)
                );
              }
              formData.append('sections_url', window.location.pathname);
              if (typeof self.cart.setActiveElement === 'function') {
                self.cart.setActiveElement(document.activeElement);
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
                  self.handleErrorMessage(response.description);

                  const soldOutMessage = self.submitButton.querySelector('.sold-out-message');
                  if (!soldOutMessage) return;
                  self.submitButton.setAttribute('aria-disabled', true);
                  self.submitButtonText.classList.add('hidden');
                  soldOutMessage.classList.remove('hidden');
                  self.error = true;
                  return;
                } else if (!self.cart) {
                  window.location = window.routes.cart_url;
                  return;
                }

                const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
                if (!self.error)
                  publish(PUB_SUB_EVENTS.cartUpdate, {
                    source: 'product-form',
                    productVariantId: formData.get('id'),
                    cartData: response,
                  }).then(() => {
                    CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
                  });
                self.error = false;
                const quickAddModal = self.closest('quick-add-modal');
                if (quickAddModal) {
                  document.body.addEventListener(
                    'modalClosed',
                    () => {
                      setTimeout(() => {
                        CartPerformance.measure('add:paint-updated-sections', () => {
                          self.cart.renderContents(response);
                        });
                      });
                    },
                    { once: true }
                  );
                  quickAddModal.hide(true);
                } else {
                  CartPerformance.measure('add:paint-updated-sections', () => {
                    self.cart.renderContents(response);
                  });
                }
              })
              .catch((e) => {
                console.error(e);
              })
              .finally(() => {
                self.submitButton.classList.remove('loading');
                if (self.cart && self.cart.classList.contains('is-empty')) self.cart.classList.remove('is-empty');
                if (!self.error) self.submitButton.removeAttribute('aria-disabled');
                const spinner = self.querySelector('.loading__spinner');
                if (spinner) spinner.classList.add('hidden');

                CartPerformance.measureFromEvent('add:user-action', evt);
              });
          } catch (e) {
            console.error('Product form submit error:', e);
            resetButton();
          }
        })();
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
