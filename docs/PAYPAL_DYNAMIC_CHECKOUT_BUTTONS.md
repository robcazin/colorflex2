# PayPal / Dynamic Checkout Buttons – Where They Come From & How to Modify

## What they are

The PayPal button (and Apple Pay, etc.) are **Shopify dynamic checkout buttons**. They are **injected by Shopify’s JavaScript**, not by a single line in your theme. The theme only outputs an **empty container**; Shopify’s script (loaded via `{{ content_for_header }}` in `layout/theme.liquid`) then fills it with the actual buttons.

So you won’t find “the PayPal button” in one Liquid file – you find the **container** in Liquid and the **script** in the header.

---

## Where the container is output

### Cart page (main place you see PayPal)

- **Section:** `main-cart-footer`
- **Rendered on:** Cart template (`templates/cart.json`), in the “cart-footer” section (subtotal, Check out button, then dynamic buttons).
- **In the DOM:**  
  - Wrapper: `.cart__dynamic-checkout-buttons.additional-checkout-buttons`  
  - Inner container: `#dynamic-checkout-cart` with `data-shopify="dynamic-checkout-cart"`  
  - Inside that, Shopify injects `<shopify-accelerated-checkout-cart>` (and the PayPal/Apple Pay UI).

**Important:** The file **`sections/main-cart-footer.liquid` does not exist in this repo.** It exists on the live theme. So the Liquid that outputs the PayPal container is on Shopify but not in your local `src/`.

**To get it locally:**

1. Pull the theme:  
   `./deploy-shopify-cli.sh pull`  
   (or `cfp` if you use the aliases)
2. In the pull folder (e.g. `theme-pull/`), open **`sections/main-cart-footer.liquid`**.
3. Search for `cart__dynamic-checkout-buttons` or `content_for_additional_checkout_buttons` or `dynamic-checkout`.
4. Copy that section file into your project:  
   `cp theme-pull/sections/main-cart-footer.liquid src/sections/main-cart-footer.liquid`  
   Then you can edit it and deploy with `./deploy-shopify-cli.sh only sections/main-cart-footer.liquid`.

**Typical Liquid in that section (Dawn/Sense style):**

```liquid
{% if additional_checkout_buttons %}
  <div class="cart__dynamic-checkout-buttons additional-checkout-buttons">
    {{ content_for_additional_checkout_buttons }}
  </div>
{% endif %}
```

That’s the “injection point”: the **container** is output there; Shopify’s script targets `#dynamic-checkout-cart` / `data-shopify="dynamic-checkout-cart"` and fills it with PayPal, etc.

---

## Product page (optional dynamic checkout)

- **Section:** `main-product.liquid`  
- **Block:** `buy_buttons` (with setting **“Dynamic checkout buttons”** / `show_dynamic_checkout`).
- **Snippet:** `snippets/buy-buttons.liquid` – currently only renders the **Add to cart** button; it does **not** output the dynamic checkout container. So even if `show_dynamic_checkout` is true in the schema, the product page may not show PayPal unless some other part of the theme outputs `content_for_additional_checkout_buttons` (e.g. in `main-product.liquid` around the form).

If you want the PayPal/dynamic button on the product page, you’d add something like this where the buy buttons are rendered (e.g. in `buy-buttons.liquid` or in the buy_buttons block in `main-product.liquid`):

```liquid
{% if block.settings.show_dynamic_checkout and additional_checkout_buttons %}
  <div class="product-form__dynamic-checkout-buttons">
    {{ content_for_additional_checkout_buttons }}
  </div>
{% endif %}
```

---

## What you can modify

| Goal | How |
|------|-----|
| **Hide PayPal (cart)** | In your CSS (e.g. section styles or `base.css`): `.cart__dynamic-checkout-buttons { display: none !important; }` or target `#dynamic-checkout-cart`. |
| **Move the buttons** | Edit `main-cart-footer.liquid` (after pulling it): move the `{% if additional_checkout_buttons %}...{{ content_for_additional_checkout_buttons }}...{% endif %}` block above/below the Check out button or elsewhere in the section. |
| **Change size / spacing** | Add CSS for `.cart__dynamic-checkout-buttons`, `.dynamic-checkout__content`, or `.shopify-payment-button__button` (see `src/assets/base.css` and `section-main-product.css` for existing `.shopify-payment-button__*` rules). |
| **Disable on product page** | In theme editor: Product page → Buy buttons block → turn off “Dynamic checkout buttons”. Or in JSON (e.g. `templates/product.json`): set `"show_dynamic_checkout": false` for the buy_buttons block. |
| **Disable on cart** | In `main-cart-footer.liquid` (after adding it to the repo), remove or comment out the block that outputs `content_for_additional_checkout_buttons`, or wrap it in a condition (e.g. a section setting). |

You **cannot** change PayPal’s own logic (e.g. redirect, SDK config) from the theme; that’s controlled by Shopify and PayPal. You can only show/hide, move, or style the **container** and the **outer button styling** (e.g. border, padding, max-width).

---

## Quick reference

| Item | Location |
|------|----------|
| Script that injects buttons | Loaded by Shopify via `{{ content_for_header }}` in `layout/theme.liquid` (you don’t edit this). |
| Cart PayPal container | Output by **`sections/main-cart-footer.liquid`** on the live theme; **pull theme first** to get this file into `src/sections/`. |
| Product dynamic checkout | Controlled by **`show_dynamic_checkout`** in `main-product.liquid` (buy_buttons block); container would be output in or near **`snippets/buy-buttons.liquid`** if you add it. |
| Styling (cart + product) | `.cart__dynamic-checkout-buttons`, `.dynamic-checkout__content`, `.shopify-payment-button__button` in **`src/assets/base.css`** and **`src/assets/section-main-product.css`**. |
