# Sections comparison: colorflex2 vs previous theme

Use this to compare **colorflex2** `src/sections/` with the previous theme’s sections (e.g. from `theme_export__saffroncottage-shop-updated-copy-of-sense__18SEP2025-0914am/sections/` or your backup).

**Previous theme path:**  
`/Volumes/K3/jobs/saffron/colorFlex-shopify/theme_export__saffroncottage-shop-updated-copy-of-sense__18SEP2025-0914am/sections/`

---

## In both themes (compare these first)

| Section | Notes |
|--------|--------|
| **header.liquid** | colorflex2 has calculator + menu; compare layout/classes with previous. |
| **header-group.json** | Compare settings (logo_position, menu, color_scheme). |
| **footer.liquid** | Compare structure. |
| **footer-group.json** | Compare. |
| **main-product.liquid** | colorflex2 is your main ColorFlex product section; only compare structure if needed. |
| **main-collection-banner.liquid** | You fixed grid by copying from previous; banner may still be minimal. |
| **main-collection-product-grid.liquid** | You replaced from previous theme. |
| **main-list-collections.liquid** | Compare. |
| **rich-text.liquid** | colorflex2 was rewritten block-based; compare if issues. |
| **contact-form.liquid** | Compare. |
| **email-signup-banner.liquid** | Compare. |
| **main-404.liquid** | Compare. |
| **main-account.liquid** | Compare. |
| **main-activate-account.liquid** | Compare. |
| **main-addresses.liquid** | Compare. |
| **main-article.liquid** | Compare. |
| **main-blog.liquid** | Compare. |
| **main-cart-items.liquid** | Compare. |
| **main-login.liquid** | Compare. |
| **main-order.liquid** | Compare. |
| **main-page.liquid** | Compare. |
| **main-register.liquid** | Compare. |
| **main-reset-password.liquid** | Compare. |
| **main-search.liquid** | Compare. |
| **related-products.liquid** | Compare. |
| **global-cart-restoration.liquid** | Compare. |
| **colorflex-app.liquid** (and variants) | colorflex2 has several; previous has colorflex-app + bu variants. |
| **contact-form.liquid** | Compare. |

---

## Only in colorflex2 (keep or remove)

| Section | Notes |
|--------|--------|
| cart-edit-modal.liquid | Colorflex-specific. |
| collections-with-video.liquid | Used by homepage index? |
| colorflex-app-final-clean.liquid | Colorflex. |
| colorflex-app-final.liquid | Colorflex. |
| colorflex-app-updated.liquid | Colorflex. |
| main-product-clean.liquid | Variant. |
| main-product-on-shopfy-right-now.liquid | Variant. |
| main-product-shopifycurrent.liquid | Variant. |
| SHOPIFY-NOW.liquid | Temp/ref. |
| TEMP.liquid | Temp. |
| Shopify Cart Integration.md | Doc, not section. |

---

## Only in previous theme (copy over if a template needs them)

| Section | Likely used by |
|--------|-----------------|
| announcement-bar.liquid | layout / theme.liquid |
| apps.liquid | App blocks |
| bulk-quick-order-list.liquid | Quick order |
| cart-drawer.liquid | Cart type = drawer |
| cart-icon-bubble.liquid | Header/cart |
| cart-live-region-text.liquid | A11y |
| cart-notification-button.liquid | Cart notification |
| cart-notification-product.liquid | Cart notification |
| collage.liquid | index / pages |
| collapsible-content.liquid | Pages |
| collection-list.liquid | List collections / pages |
| custom-liquid.liquid | Pages |
| featured-blog.liquid | index |
| featured-collection.liquid | index |
| featured-product.liquid | index |
| image-banner.liquid | index / pages |
| image-with-text.liquid | index / pages |
| main-cart-footer.liquid | cart.json |
| main-password-footer.liquid | password |
| main-password-header.liquid | password |
| multicolumn.liquid | index / pages |
| multirow.liquid | index / pages |
| newsletter.liquid | index / pages |
| page.liquid | page.json |
| pickup-availability.liquid | main-product |
| predictive-search.liquid | Search / header |
| quick-order-list.liquid | Quick order |
| slideshow.liquid | index |
| video.liquid | index / pages |

---

## Quick checklist

- [ ] main-collection-banner.liquid –  **done** ( copied from previous)
- [ ] main-collection-product-grid.liquid – **done** (you copied from previous).
- [ ] header / header-group – layout (middle-center, menus) and right icons already adjusted.
- [ ] Any template that 404s or shows “section not found” → add or restore that section from previous theme.
- [ ] index.json / list-collections / page templates – confirm which section types they reference and that those sections exist and aren’t stubs.

Deploy sections after changes:  
`./deploy-shopify-cli.sh sections`  
(or add the section to the script if it’s not in the list).
