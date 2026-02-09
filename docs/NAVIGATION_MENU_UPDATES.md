# Navigation Menu Updates for Simple Mode

## Overview

This document describes the navigation menu changes needed to support the new Extraordinary Color landing page and simple mode pages.

**Date:** January 10, 2026

---

## Required Changes

### 1. Update Home Link

**Current:** Home → (Shopify homepage)
**New:** Home → `/pages/extraordinary-color`

**Purpose:** Direct users to the Extraordinary Color landing page showing furniture and clothing options.

### 2. Add Collections Link

**New Link:** Collections → Opens collections modal (JavaScript)

**Implementation:**
```html
<a href="#" onclick="event.preventDefault(); window.openCollectionsModal();">
  Collections
</a>
```

**Purpose:** Allow users to switch between pattern collections without using the sidebar.

**Note:** The `window.openCollectionsModal()` function is already implemented in both simple templates. It opens a modal with all available collections.

### 3. Remove Contact Link

**Current:** Contact link in main navigation
**Action:** Remove this link

**Purpose:** Simplify navigation. Contact information is available in the footer of the Extraordinary Color page.

---

## Navigation Structure

### Before

```
Home | Collections | Furniture | Clothing | Contact
```

### After

```
Home | Collections | Furniture | Clothing
```

**Link Destinations:**
- **Home** → `/pages/extraordinary-color` (new landing page)
- **Collections** → JavaScript modal (`window.openCollectionsModal()`)
- **Furniture** → `/pages/colorflex-furniture-simple`
- **Clothing** → `/pages/colorflex-clothing-simple`

---

## Implementation Steps

### Option A: Shopify Theme Editor (Recommended)

1. Log into Shopify Admin
2. Go to **Online Store** → **Themes**
3. Click **Customize** on your active theme
4. Navigate to **Header** section
5. Update menu items:
   - Home: Change URL to `/pages/extraordinary-color`
   - Collections: Add new link with `#` URL and add JavaScript onclick handler in theme.liquid
   - Remove Contact link
6. Save changes

### Option B: Edit theme.liquid File

1. Go to **Online Store** → **Themes** → **Actions** → **Edit code**
2. Open `layout/theme.liquid`
3. Find the navigation menu section (usually in `<header>` or `<nav>`)
4. Update menu links as described above
5. Save file

### Adding Collections Modal Support

Add this to your theme's main JavaScript file or in a `<script>` tag in theme.liquid:

```javascript
// Collections modal opener
// Note: This function is defined in ColorFlex pages, so only call if available
function openCollections() {
  if (typeof window.openCollectionsModal === 'function') {
    window.openCollectionsModal();
  } else {
    // Fallback: redirect to a collections page
    window.location.href = '/pages/colorflex-furniture-simple';
  }
}
```

Then use this in your menu:

```html
<a href="#" onclick="event.preventDefault(); openCollections();">
  Collections
</a>
```

---

## Testing Checklist

After making changes, test:

- [ ] Home link redirects to Extraordinary Color page
- [ ] Extraordinary Color page displays correctly
- [ ] Furniture card links to furniture-simple page
- [ ] Clothing card links to clothing-simple page
- [ ] Collections link opens modal (when on ColorFlex pages)
- [ ] Collections link has fallback behavior (when not on ColorFlex pages)
- [ ] Contact link is removed
- [ ] All links work on mobile

---

## Alternative: Keep Both Modes

If you want to keep both standard and simple modes available:

### Navigation Option

```
Home | Collections | Furniture (Advanced) | Furniture (Simple) | Clothing (Advanced) | Clothing (Simple)
```

**Link Destinations:**
- **Furniture (Advanced)** → `/pages/colorflex-furniture` (full color controls)
- **Furniture (Simple)** → `/pages/colorflex-furniture-simple` (simplified)
- **Clothing (Advanced)** → `/pages/colorflex-clothing` (full color controls)
- **Clothing (Simple)** → `/pages/colorflex-clothing-simple` (simplified)

---

## Shopify Navigation Menu Settings

### Creating a New Menu

1. Go to **Online Store** → **Navigation**
2. Click **Add menu**
3. Name: "ColorFlex Main Menu"
4. Add menu items:
   - Home → `/pages/extraordinary-color`
   - Collections → `#` (with JavaScript handler)
   - Furniture → `/pages/colorflex-furniture-simple`
   - Clothing → `/pages/colorflex-clothing-simple`
5. Save menu
6. Assign to header in Theme Customize

### Menu Item Structure

```yaml
ColorFlex Main Menu:
  - Home
      URL: /pages/extraordinary-color
      Type: Page
  - Collections
      URL: #
      Type: Custom
      Note: Requires JavaScript handler
  - Furniture
      URL: /pages/colorflex-furniture-simple
      Type: Page
  - Clothing
      URL: /pages/colorflex-clothing-simple
      Type: Page
```

---

## Notes

- The Collections link will only work properly when on ColorFlex pages (furniture-simple or clothing-simple) because that's where `window.openCollectionsModal()` is defined
- Consider adding a fallback behavior for the Collections link when not on ColorFlex pages
- The Extraordinary Color landing page is fully self-contained and doesn't require any external dependencies
- All ColorFlex pages use the same fonts (Island Moments, Special Elite, IM Fell English)

---

## Related Files

- `/src/templates/page.extraordinary-color.liquid` - Landing page
- `/src/templates/page.colorflex-furniture-simple.liquid` - Furniture simple mode
- `/src/templates/page.colorflex-clothing-simple.liquid` - Clothing simple mode
- `/src/templates/page.colorflex-furniture.liquid` - Furniture standard mode
- `/src/templates/page.colorflex-clothing.liquid` - Clothing standard mode

---

_Last Updated: January 10, 2026_
