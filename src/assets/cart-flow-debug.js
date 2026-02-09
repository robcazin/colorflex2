/**
 * Cart Flow Diagnostic Script
 * Focus specifically on add-to-cart functionality
 */

console.log('🛒 CART FLOW DIAGNOSTICS');
console.log('========================');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Only run on Custom Wallpaper/Fabric pages
    if (!window.location.pathname.includes('/products/custom-wallpaper') && 
        !window.location.pathname.includes('/products/custom-fabric')) {
        console.log('❌ Not on Custom Wallpaper/Fabric page - skipping cart diagnostics');
        return;
    }

    console.log('✅ On Custom Wallpaper/Fabric page - starting cart diagnostics');

    // 1. Check URL parameters (pattern data)
    const urlParams = new URLSearchParams(window.location.search);
    const hasPatternData = urlParams.get('pattern_name') && urlParams.get('source');
    console.log('📡 Pattern Data in URL:', hasPatternData ? 'YES' : 'NO');
    
    if (hasPatternData) {
        console.log('   Pattern:', urlParams.get('pattern_name'));
        console.log('   Collection:', urlParams.get('collection'));
        console.log('   Source:', urlParams.get('source'));
    }

    // 2. Check for product form
    const productForm = document.querySelector('form[action*="cart/add"], form[action="/cart/add"]');
    console.log('📝 Product Form Found:', productForm ? 'YES' : 'NO');
    
    if (productForm) {
        console.log('   Form Action:', productForm.action);
        console.log('   Form Method:', productForm.method);
        
        // Check for variant selection
        const variantInput = productForm.querySelector('input[name="id"], select[name="id"]');
        console.log('   Variant Input:', variantInput ? 'Found' : 'Missing');
        
        if (variantInput) {
            console.log('   Selected Variant ID:', variantInput.value);
        }
        
        // Check for existing properties
        const propertyInputs = productForm.querySelectorAll('input[name*="properties"]');
        console.log('   Property Inputs:', propertyInputs.length);
        propertyInputs.forEach(input => {
            console.log(`     ${input.name} = "${input.value}"`);
        });
    }

    // 3. Check for add to cart button
    const addToCartBtn = document.querySelector('button[name="add"], button[type="submit"], .btn-add-to-cart');
    console.log('🛒 Add to Cart Button:', addToCartBtn ? 'Found' : 'Missing');
    
    if (addToCartBtn) {
        console.log('   Button Text:', addToCartBtn.textContent.trim());
        console.log('   Button Type:', addToCartBtn.type);
        console.log('   Button Name:', addToCartBtn.name);
    }

    // 4. Monitor form submission
    if (productForm && addToCartBtn) {
        console.log('🔍 Setting up form submission monitoring...');
        
        productForm.addEventListener('submit', function(e) {
            console.log('🚀 FORM SUBMISSION DETECTED!');
            console.log('   Event:', e);
            console.log('   Form Data:');
            
            const formData = new FormData(productForm);
            for (let [key, value] of formData.entries()) {
                console.log(`     ${key}: ${value}`);
            }
            
            // Check if we have required data
            const hasVariant = formData.get('id');
            const hasPatternName = formData.get('properties[Custom Pattern]') || formData.get('properties[Pattern Name]');
            
            console.log('   Has Variant ID:', hasVariant ? 'YES' : 'NO');
            console.log('   Has Pattern Data:', hasPatternName ? 'YES' : 'NO');
            
            if (!hasVariant) {
                console.error('❌ MISSING VARIANT ID - form submission will fail');
            }
            
            if (!hasPatternName) {
                console.warn('⚠️ MISSING PATTERN DATA - cart will not have ColorFlex info');
            }
        });
        
        addToCartBtn.addEventListener('click', function(e) {
            console.log('🖱️ ADD TO CART BUTTON CLICKED');
            console.log('   Button:', this);
            console.log('   Event:', e);
        });
    }

    // 5. Check for pattern display snippet
    setTimeout(() => {
        const patternDisplay = document.getElementById('colorflexPatternDisplay');
        console.log('🎨 Pattern Display Element:', patternDisplay ? 'Found' : 'Missing');
        
        if (patternDisplay) {
            console.log('   Pattern Display Content:', patternDisplay.textContent.substring(0, 100) + '...');
        }
    }, 1000);

    console.log('========================');
});