# Templates restored (downloaded Feb 8, ~4:44 PM)

These were added from the previous theme. Why you need them:

| Template | Purpose |
|----------|--------|
| **404.json** | Error page when a URL doesn’t exist. Without it, 404s use a fallback or break. |
| **article.json** | Layout for a single blog post (`/blogs/xxx/articles/yyy`). |
| **blog.json** | Blog listing page (`/blogs/xxx`). |
| **collection.json** | Collection page (`/collections/handle`). Required for normal collection browsing. |
| **list-collections.json** | “All collections” index at `/collections`. |
| **page.json** | Default page template for regular pages (e.g. About, FAQ). |
| **page.contact.json** | Contact page template (form, etc.). |
| **password.json** | Storefront password page when the store is password-protected. |
| **product.custom-fabric.json** | Alternate product template for custom fabric products. |
| **product.custom-wallpaper.json** | Alternate product template for custom wallpaper products. |
| **search.json** | Search results page. |
| **customers/** | Customer account area: login, register, account, addresses, order history, reset password, activate account. |

**Not overwritten (your custom/ColorFlex):**  
index.json, product.json, cart.json, page.colorflex*.liquid, page.extraordinary-color.liquid, page.materials.liquid, gift_card.liquid.

Upload: run `./deploy-shopify-cli.sh all` (or push templates via CLI) so these are on the live theme.
