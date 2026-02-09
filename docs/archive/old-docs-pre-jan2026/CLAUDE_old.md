# ColorFlex-Shopify Development Notes

## 🚨 CRITICAL: READ THESE FILES FIRST 🚨

**BEFORE making ANY changes to this project, you MUST read:**

1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Data file locations, page structure, deployment rules
   - Where collections.json and colors.json are located (Shopify vs external server)
   - Which page loads from where (wallpaper, clothing, furniture)
   - Collection filtering logic for each page
   - Deployment procedures for each type of change

2. **[docs/session-summaries/](docs/session-summaries/)** - Recent work history
   - Latest session summary shows what was just completed
   - Known issues and pending tasks
   - Files recently modified
   - Current deployment status

3. **[WALLPAPER_PATTERN_PREVIEW_CONSTRAINTS.md](WALLPAPER_PATTERN_PREVIEW_CONSTRAINTS.md)** - 24-inch roll constraint
   - Physical wallpaper printing constraints
   - Pattern preview canvas behavior
   - Why portrait patterns have side padding (this is correct!)
   - Common mistakes to avoid

**Violating the architecture will break working pages. Always consult these files first.**

---

## 📋 Session Summary Protocol

**At the end of each work session, Claude creates a summary:**
- Location: `docs/session-summaries/SESSION_YYYYMMDD_topic.md`
- Includes: Problem, solution, files modified, deployment status, next steps
- See [CLAUDE Start.md](CLAUDE Start.md) for complete protocol

**This ensures:**
- Continuity between sessions
- No duplicate work solving the same problem
- Clear understanding of current system state
- Proper documentation of all changes

---

## 🎯 WORKFLOW PREFERENCES

### File Editing Protocol:
**IMPORTANT**: When identifying and editing a file during our work session, always ensure the edited file is displayed in the user's editor. This allows immediate visibility of changes and streamlines the upload workflow.

**Example**: After editing `src/templates/page.colorflex.liquid`, the user should see that file open in their editor, not a different file.

---

## 🚀 SHOPIFY DEPLOYMENT (USE CLI - NOT COPY/PASTE!)

### ⚠️ IMPORTANT: Always Use Shopify CLI for Deployment

**NEVER ask the user to:**
- Copy/paste files manually
- Upload via Shopify web interface
- Use any method other than CLI

**ALWAYS provide the CLI command after builds:**

```bash
# After any JS/CSS changes:
./deploy-shopify-cli.sh assets

# After template changes:
./deploy-shopify-cli.sh templates

# Mode-specific deployments:
./deploy-shopify-cli.sh furniture
./deploy-shopify-cli.sh clothing
```

**The CLI script:**
- Handles authentication automatically
- Uploads multiple files in one command
- Provides interactive confirmation
- Shows clear success/error messages

**Note:** Claude cannot run the CLI interactively, so always provide the command for the user to execute in their terminal.

---

## 🚀 SHOPIFY PRODUCT CREATION WORKFLOW

### ✅ PREFERRED METHOD: CLI Product Creation

**Use the Shopify Admin API to create products directly** (no manual CSV imports!)

```bash
# Create products for new patterns only (skips existing)
node scripts/shopify-create-products.js english-cottage
node scripts/shopify-create-products.js botanicals

# Dry run to preview what would be created
node scripts/shopify-create-products.js english-cottage --dry-run

# Update existing products
node scripts/shopify-create-products.js english-cottage --update
```

**Prerequisites:**
1. Patterns added to Airtable with ACTIVE checkbox
2. Run incremental update: `./update-collection.sh add-pattern <collection>`
3. Verify `.env` has correct domain: `SHOPIFY_STORE=f63bae-86.myshopify.com`

**⚠️ CRITICAL**: Always use `f63bae-86.myshopify.com` in `.env`, NOT `saffroncottage.shop`
- Custom domains cause 301 redirects
- HTTP spec converts POST to GET on redirects
- Results in "Product created but no ID returned" error
- See **[SHOPIFY_CLI_TROUBLESHOOTING.md](SHOPIFY_CLI_TROUBLESHOOTING.md)** for complete details

### Legacy: CSV Import Method (Fallback Only)

**STEP 1: Generate CSV**
```bash
./update-collection.sh add-pattern <collection-name>
```

**STEP 2: Verify Images Are Deployed**
```bash
curl -I "https://so-animation.com/colorflex/data/collections/<collection>/thumbnails/<pattern>.jpg"
# If 404: ./deploy.sh -collection <collection-name>
```

**STEP 3: Import CSV to Shopify**
- Location: `deployment/csv/shopify-import-<collection>-YYYYMMDD.csv`
- Enable metafield mapping during import
- Metafields format: `product.metafields.color_flex.*`

**What Gets Created (Both Methods):**
- ✅ Product with pattern name as title
- ✅ 3 variants: Wallpaper ($89.99), Fabric ($79.99), Removable Decal ($69.99)
- ✅ 11 ColorFlex metafields (collection, pattern, layers, etc.)
- ✅ Thumbnail image from server

---

## ⚠️ CRITICAL: FILE STRUCTURE

### Source vs Built Files:
- **`src/`** - Edit these files
  - `src/CFM.js` - Main ColorFlex source
  - `src/sections/`, `src/templates/`, `src/snippets/` - Shopify theme files
  - `src/assets/` - JavaScript files for Shopify assets folder
- **`src/assets/`** - Built files ready for Shopify upload
  - `src/assets/color-flex-core.min.js` - Built from CFM.js via webpack
  - `src/assets/ProductConfigurationFlow.js` - Standalone
  - `src/assets/unified-pattern-modal.js` - Standalone ⚠️ **EDIT THIS DIRECTLY**

### Workflow:
1. Edit `src/CFM.js`
2. Run `npm run build` (outputs to `src/assets/`)
3. Deploy using CLI: `./deploy-shopify-cli.sh assets`
4. **Never edit src/assets/color-flex-core.min.js directly**

### ⚠️ CRITICAL: My Designs Modal Architecture
The "My Designs" modal is created by **`unified-pattern-modal.js`** (NOT CFM.js):
- **`unified-pattern-modal.js`** - Creates the modal UI, buttons, and pattern cards
- **`CFM.js`** - Provides helper functions via `window.exportPattern()`, `window.importPattern()`, etc.
- When adding UI features to "My Designs", edit BOTH files:
  - Add UI elements to `unified-pattern-modal.js`
  - Add logic functions to `CFM.js` and expose via `window.functionName`

**Note**: Webpack config updated October 2025 to output to `src/assets/` matching the Shopify folder structure.

### File Tracking (October 2025):
- `.MODIFIED_FILES.txt` tracks all files changed during editing sessions
- Claude updates this file after making changes
- Shows exact paths for Shopify upload vs server deployment
- Prevents confusion about what needs uploading after extensive edits

## Collection Updates

### ⚡ Automatic Collection Discovery (December 2025)
**NEW**: Collections are now automatically discovered from Airtable! No code changes needed for new collections.

**How it works:**
- cf-dl.js fetches collection list from Airtable Meta API
- Filters tables matching pattern: `^\d{1,2}\s*-\s*.+` (e.g., "12 - OCEANA")
- Falls back to hardcoded list if API fails

**To add a new collection:**
1. Create table in Airtable: `{number} - {NAME}`
2. Add master record ending in `-000` with ACTIVE checkbox
3. Run: `./update-collection.sh add-pattern {collection-name}`

**That's it!** See `AUTO_COLLECTION_DISCOVERY.md` for technical details.

### Quick Commands:
```bash
# Complete update (data + images + server deploy + CSV)
./update-collection.sh complete abundance

# Metadata only (data + CSV, no images)
./update-collection.sh metadata abundance

# Images only (download + deploy, no CSV)
./update-collection.sh images abundance

# ✨ NEW: Incremental pattern addition (appends new patterns only)
./update-collection.sh add-pattern coordinates
```

### Incremental Pattern Addition (October 2025):
**Use Case**: When 1-2 new patterns added to Airtable, append them without full refresh

**What it does**:
1. Loads existing `collections.json`
2. Fetches fresh data from Airtable
3. Compares patterns by name (case-insensitive)
4. **Appends ONLY new patterns** (preserves existing)
5. Downloads only new pattern images
6. Deploys new images to server
7. Generates CSV for entire collection

**Benefits**:
- ⚡ **Speed**: 30 seconds vs 3 minutes for small updates
- 🛡️ **Safety**: Preserves existing data (no overwrite risk)
- 💾 **Efficiency**: Downloads only new images
- 🎯 **Clarity**: Console shows exactly what's new

**Example Output**:
```bash
[MAIN] 🔄 INCREMENTAL MODE: Merging new patterns with existing data
[MAIN] 🔍 Checking collection "Coordinates" for new patterns...
[MAIN] ✅ Found 2 NEW patterns in "Coordinates":
     - Baldwynn
     - Bordentown
[MAIN] 🎯 Incremental merge complete: 2 new patterns added
```

See `INCREMENTAL_UPDATE_FEATURE.md` for complete documentation.

### Pipeline Process:
1. Fetches Airtable data → `collections.json`
2. Downloads images locally
3. **Auto-deploys to server** (critical for thumbnails)
4. Generates Shopify CSV in `./deployment/csv/`

### After Pipeline:
- Import CSV to Shopify with metafield mapping
- Upload `assets/color-flex-core.min.js` if code changed

## Pattern Types

### Standard Patterns (Display Only):
- **Collections**: Ancient Tiles, Dished Up, Galleria, Pages, Abundance
- **Behavior**: No color controls, scaling only
- **Detection**: `!pattern.layers || pattern.layers.length === 0`

### ColorFlex Patterns:
- **Collections**: English Cottage, Botanicals, Bombay, etc.
- **Behavior**: Full color customization with layer controls
- **Detection**: `pattern.layers && pattern.layers.length > 0`

## Technical Fixes Applied

### Room Mockup Compositing Order (Critical):
```javascript
// 1. Background color fill
// 2. Tile pattern across canvas
// 3. Draw room mockup ON TOP with source-over
```

### Scale Compensation for ColorFlex:
```javascript
const scale = baseScale * 0.1; // Compensate for currentScale 10→100 change
```

### Half-Drop Tiling:
```javascript
if (pattern.tilingType === "half-drop" && col % 2 === 1) {
    tileY += tileHeight / 2; // Offset odd columns
}
```

### Standard Pattern Size Handling:
```javascript
const sizeRatio = patternSizeInches / 24; // 0.5 for 12x12, 1.0 for 24x24
const scaledWidth = img.width * baseScale * sizeRatio;
```

### Thumbnail Tiling (November 2025):
**Critical:** Thumbnails in "My Designs" should show tiling based on scale setting.

**⚠️ IMPORTANT: Use `currentScale`, NOT `scaleMultiplier`!**

The `scaleMultiplier` values are INVERTED (0.5 = 2X, 0.33 = 3X). Always use `currentScale` which has correct values (100, 200, 300).

```javascript
// In capturePatternThumbnailBuiltIn() function:
// CORRECT: Use currentScale and convert to actual multiplier
const currentScalePercent = appState.currentScale || 100;
const scale = currentScalePercent / 100; // 200 → 2.0, 300 → 3.0

if (scale !== 1.0) {
    // DIVIDE by scale to make tiles smaller (more tiles fit)
    const tileWidth = canvasWidth / scale;
    const tileHeight = canvasHeight / scale;
    for (let x = 0; x < canvasWidth; x += tileWidth) {
        for (let y = 0; y < canvasHeight; y += tileHeight) {
            thumbCtx.drawImage(img, x, y, tileWidth, tileHeight);
        }
    }
}
```

**Result:**
- 1X scale (currentScale=100) = 1 tile fills thumbnail
- 2X scale (currentScale=200) = 4 tiles in thumbnail (2×2 grid)
- 3X scale (currentScale=300) = 9 tiles in thumbnail (3×3 grid)

**The Math:**
- 2X: scale=2.0 → tileWidth = 800px / 2 = 400px → 2×2 grid = 4 tiles ✓
- 3X: scale=3.0 → tileWidth = 800px / 3 = 267px → 3×3 grid = 9 tiles ✓

**Common Mistakes:**
1. Using `scaleMultiplier` directly (values are inverted!)
2. Using `canvasWidth * scale` instead of division (makes tiles bigger, not smaller)

## Cart Integration

### Current Setup:
- **Products**: "Custom Wallpaper" ($30), "Custom Fabric" ($30)
- **Flow**: Saved Pattern → Material Choice → Texture Selection → Cart
- **Data Storage**: Pattern colors as SW numbers in line item properties

### Cart Properties Structure:
```javascript
properties: {
  'Pattern': 'Geometric Waves',
  'Colors': 'Background: SW-7006, Accent: SW-6258',
  'Material': 'Wallpaper',
  '_pattern_data': JSON.stringify(customization)
}
```

## New Collection Requirements

### MANDATORY Steps:
1. Add to `collections.json` via cf-dl.js
2. **Update `main-product.liquid` pattern matching** (critical)
3. Test URL generation for correct collection routing

### Template Update Example:
```liquid
else if (title.includes('pattern1') || title.includes('pattern2') ||
         type.includes('new-collection')) {
  colorFlexCollection = 'new-collection';
}
```

## Key Debugging Rules

### Risk Assessment:
- **Low Risk**: UI changes using existing detection logic
- **Medium Risk**: Multi-file changes or new state management
- **High Risk**: Core rendering pipeline modifications

### Development Workflow:
1. Edit source in `src/`
2. Test changes locally
3. Run `npm run build`
4. Upload to Shopify
5. Verify across pattern types

## Build Commands
- `npm run build` - Production build
- `npm run dev` - Development with watch

## ✅ MAJOR MILESTONE: Core Function Modularization (Sept 27, 2025)

**BREAKTHROUGH**: Successfully implemented comprehensive modular protection system for critical rendering functions to address debugging complexity and code maintainability.

**User Request**: *"I'm thinking It might make debugging easier if we do have some separate pieces of code, and a lot of time is wasted searching Through long files."*

### 🎯 Modular Architecture Implemented:

**Protected Core Modules (`src/core/`):**
- **`pattern-rendering.js`** (469 lines) - Complete updatePreview & updateRoomMockup functions
- **`pattern-selection.js`** (158 lines) - Pattern type detection & selection logic
- **`dependency-mapper.js`** (245 lines) - Comprehensive dependency injection system
- **`module-tester.js`** (395 lines) - Complete testing framework for modular functions
- **`integration-test.js`** (241 lines) - Browser console testing interface
- **`index.js`** (163 lines) - Central module coordinator & validation
- **`core-protected.js`** (186 lines) - Emergency backup functions

### 🔧 Key Features:

**Complete Function Extraction:**
- ✅ Full 370-line `updatePreview` function extracted with all fixes preserved
- ✅ Full 400+ line `updateRoomMockup` function extracted with all fixes preserved
- ✅ All critical bug fixes maintained (aspect ratio, ColorFlex detection, half-drop tiling)

**Dependency Management:**
- ✅ 12 core dependencies automatically mapped and validated
- ✅ Safe proxy system for missing dependencies with graceful fallback
- ✅ Built-in testing for DOM elements, functions, and application state

**Protection & Safety:**
- ✅ Emergency backup functions for critical restoration
- ✅ Version tracking and function guards on all modules
- ✅ Original functions remain untouched during testing
- ✅ Instant rollback capability if modular system fails

### 🚀 Usage Commands:

**Browser Console Testing:**
```javascript
testModularSystem()           // Complete integration test
quickTestModular('both')      // Quick test both functions
switchToModularFunctions()    // Replace originals with modular
restoreOriginalFunctions()    // Restore originals if needed
debugModularSystem()          // Show system debug info
```

**Code Integration:**
```javascript
import CoreModules from './src/core/index.js';
const modularSystem = CoreModules.initializeModularSystem();
await modularSystem.updatePreview();
await modularSystem.updateRoomMockup();
```

### 📈 Benefits Achieved:

1. **Easier Debugging**: Functions separated from 9,271-line CFM.js into focused modules
2. **Dependency Isolation**: All dependencies explicitly mapped with validation
3. **Safe Development**: Test modular functions without affecting production code
4. **Emergency Recovery**: Backup system available if modular changes break functionality
5. **Code Maintainability**: Clear module structure with version tracking

### 🛡️ Protection Strategy:

**Three-Layer Safety System:**
1. **Original Functions**: Remain completely untouched in CFM.js
2. **Modular Functions**: New protected modules with dependency injection
3. **Emergency Backups**: Working copies in core-protected.js for restoration

**Testing Framework:**
- Comprehensive function testing with similarity scoring
- Comparison between modular and original function outputs
- DOM manipulation validation and error handling testing
- Automatic dependency validation before function execution

### ⚠️ Next Steps:

1. **Testing Phase**: Use browser console commands to validate modular functions
2. **Gradual Integration**: Test with different pattern types and collections
3. **Performance Validation**: Ensure modular functions match original performance
4. **Production Switch**: Replace original functions only after comprehensive testing

**Status**: **✅ READY FOR TESTING** - Modular system fully implemented with comprehensive safety measures

## ✅ CART FLOW FIXES - SEPTEMBER 2025

### Comprehensive Cart System Overhaul
**Backup**: `./backups/working_versions/cart_flow_fixes_20250930_111710/`
**Status**: ✅ FULLY FUNCTIONAL CART SYSTEM

**Major Issues Resolved**:
1. **Color Name Formatting Inconsistencies** - Unified `normalizeColorToSwFormat()` across entire application
2. **Add to Cart Color Processing** - Fixed ALL CAPS conversion in ProductConfigurationFlow.js
3. **ColorFlex Direct Access Timing** - Embedded color data in page template for immediate loading
4. **Saved Pattern Collection Switching** - Fixed curated colors not updating across collections
5. **Cart Display Redundancy** - Removed redundant scale properties

**Key Technical Improvements**:
- **Unified Color Normalization**: Single strategy across CFM.js, cart editing, modals, and Add to Cart flow
- **Immediate Data Loading**: ColorFlex page now embeds data to prevent timing issues
- **Enhanced Error Handling**: Graceful fallbacks for missing color data
- **Streamlined Cart Display**: Removed redundant properties while preserving functionality

**Files Modified**:
- `src/CFM.js`: Enhanced color formatting, added curated colors update for saved patterns
- `assets/ProductConfigurationFlow.js`: Fixed color normalization fallback logic
- `src/templates/page.colorflex.liquid`: Added embedded ColorFlex data loading
- `src/sections/cart-edit-modal.liquid`: Unified color normalization strategy
- `assets/unified-pattern-modal.js`: Consistent color display formatting

**Result**: Complete cart flow consistency and reliability across the entire ColorFlex application.

---

## ✅ NOVEMBER 2025 IMPROVEMENTS

### User Experience & Collection Navigation
**Date**: November 11, 2025
**Backup**: `./backups/working_versions/ux_collections_modal_20251111/`

#### 1. First-Time Visitor Welcome Modal
**Feature**: Onboarding modal for new ColorFlex users to reduce confusion and abandonment.

**Implementation**:
- Modal appears on first visit only (localStorage tracking)
- 5-step Quick Start Guide with accurate workflow
- "Don't show this again" checkbox option
- Multiple close methods: X button, "Start Customizing", backdrop click, Escape key
- Beautiful gradient design matching ColorFlex branding
- z-index: 10000 ensures visibility above all elements

**Key Design Elements**:
- Gold accent color (#d4af37) consistent with brand
- Dark gradient background (#1a202c → #2d3748)
- 'Island Moments' cursive font for heading
- Responsive design (max-width: 580px, 90% viewport width)

**Files Modified**:
- `src/templates/page.colorflex.liquid` (lines 42-194)

#### 2. Collections Selection Modal
**Feature**: Click collection header to switch collections without leaving ColorFlex page.

**Implementation**:
- **Clickable Collection Header**: Added "▼" indicator and hover effects to sidebar header
- **Collections Grid Modal**: Beautiful popup showing all collections alphabetically
- **Visual Indicators**:
  - Chameleon icon for ColorFlex-enabled collections (with layers)
  - "🎨 ColorFlex Enabled" badge
  - Pattern count display
  - Gold border on hover
- **Smart Loading**: Retry mechanism (5 attempts, 200ms delays) handles race conditions
- **Fallback to appState**: Uses `window.collectionsData` or `window.appState.collections`

**Backend Support**:
- Exposed `window.collectionsData` after collections load (CFM.js line 6720-6722)
- Exposed `window.switchCollection(collectionName)` function (CFM.js lines 1970-2014)
- Function handles:
  - Collection validation and pattern checking
  - Collection header update (including clothing collections)
  - Thumbnail population for new collection
  - Auto-load first pattern in collection

**Files Modified**:
- `src/templates/page.colorflex.liquid` (lines 196-403: modal + logic)
- `src/CFM.js` (lines 1970-2014: switchCollection, 6720-6722: data exposure)
- `src/assets/color-flex-core.min.js` (built from CFM.js)

**Design Features**:
- Collections sorted alphabetically
- Responsive grid (auto-fill, minmax 200px)
- Hover effects with gold accents
- Chameleon icon detection: checks `p.layers && Array.isArray(p.layers) && p.layers.length > 0`
- Modal styling matches welcome modal for consistency

#### 3. Button Text Update
**Change**: "Save to my list" → "Save to My Designs"
**Rationale**: Tighter labeling, clearer purpose

**Files Modified**:
- `src/templates/page.colorflex.liquid` (line 429: button text, line 117: welcome modal)

#### 4. Homepage Video Positioning Fix
**Issue**: Video in collections-with-video section appeared too high on page.

**Solution**: Changed `.collections-video-container` from `align-items: flex-start` to `align-items: center`

**Outcome**:
- Video now vertically centered relative to collections grid
- Better visual balance
- No cropping issues
- Sticky behavior still works correctly

**Files Modified**:
- `src/sections/collections-with-video.liquid` (line 18: align-items)

**Key Learnings**:
- CSS `position: sticky` with `top` value only affects scroll behavior, NOT initial position
- Shopify CDN caching can be aggressive - changes may take 5-30 minutes to appear
- `align-items` on flex container was the correct approach (not margin/padding on child)

#### Technical Improvements:
- **Race Condition Handling**: Collections modal retries up to 5 times if CFM.js not loaded
- **Pattern Detection**: Smart checking for ColorFlex vs Standard patterns via layers array
- **LocalStorage Tracking**: Welcome modal remembers user preference
- **Function Exposure**: CFM.js now exposes collections and switching functionality globally

**Build Output**:
- `src/assets/color-flex-core.min.js`: 246KB (includes new switchCollection function)

**Testing Instructions**:
1. Clear localStorage: `localStorage.removeItem('colorflexWelcomeSeen')` to test welcome modal
2. Click collection header in sidebar to test collections modal
3. Verify chameleon icons appear only on ColorFlex collections (English Cottage, Bombay, etc.)
4. Test collection switching - should load first pattern immediately

---

## ✅ MULTI-VERSION IMPLEMENTATION - NOVEMBER 11, 2025

### ColorFlex Multi-Mode Architecture (Furniture & Clothing Versions)
**Date**: November 11, 2025 (Afternoon)
**Status**: ✅ IMPLEMENTATION COMPLETE - READY FOR TESTING
**Documentation**: See `MULTI_VERSION_IMPLEMENTATION.md` for complete details

### Overview
Successfully implemented configuration-based multi-version system allowing ColorFlex to run in three distinct modes:
- **WALLPAPER** - Original wallpaper & fabric version (public)
- **FURNITURE** - Custom furniture upholstery version (beta, hidden page)
- **CLOTHING** - Custom apparel design version (beta, hidden page)

### Architecture: Configuration-Based System
- Single codebase with mode detection
- Mode-specific configurations in `src/config/colorFlex-modes.js`
- Dynamic material lists, scale ranges, and mockups per mode
- Independent Shopify templates with access control
- Unified build system with mode-specific outputs

### Files Created

#### Configuration System
**`src/config/colorFlex-modes.js`** (333 lines)
- Complete configuration for WALLPAPER, FURNITURE, CLOTHING modes
- Mode detection: URL param → page path → collection param → default
- Exports: `getCurrentConfig()`, `detectMode()`, `getMaterials()`, `getScaleOptions()`, `isFeatureEnabled()`
- Global export: `window.ColorFlexModes`

#### Templates with Access Control
**`src/templates/page.colorflex-furniture.liquid`** (283 lines)
- Brown theme (#8b4513)
- Access control: Customer tag `furniture-beta` or `?preview=true`
- Furniture-specific welcome modal with zoom instructions
- Beta badge: "🪑 FURNITURE BETA"
- Mode script: `window.COLORFLEX_MODE = 'FURNITURE'`

**`src/templates/page.colorflex-clothing.liquid`** (283 lines)
- Blue theme (#4a90e2)
- Access control: Customer tag `clothing-beta` or `?preview=true`
- Clothing-specific welcome modal with front/back toggle info
- Beta badge: "👕 CLOTHING BETA"
- Mode script: `window.COLORFLEX_MODE = 'CLOTHING'`

### Files Modified

#### Core Application
**`src/CFM.js`**
- Lines 6-19: Import and initialize mode configuration system
- Lines 109-126: Added `getScaleLabel()` helper function using config
- Lines 1363-1368: Updated scale display in pattern cards to use config
- Lines 1433-1438: Updated scale badge to use dynamic config labels
- **Key change**: Replaced all hardcoded scale labels with dynamic config-based system

#### Build System
**`webpack.config.js`** (rewritten)
- Multi-mode build support with environment variables
- Outputs: `color-flex-core.min.js`, `color-flex-furniture.min.js`, `color-flex-clothing.min.js`
- Build modes: `all` (default), `wallpaper`, `furniture`, `clothing`
- DefinePlugin for `process.env.BUILD_MODE`

**`package.json`**
- `npm run build` - Default unified build
- `npm run build:wallpaper` - Wallpaper-only
- `npm run build:furniture` - Furniture-only
- `npm run build:clothing` - Clothing-only
- `npm run build:all` - All three versions

### Configuration Highlights

#### Wallpaper Mode (Default)
- **Materials**: Wallpaper ($89.99), Fabric ($79.99), Removable Decal ($69.99)
- **Scale**: 50%-400% (0.5X, Normal, 2X, 3X, 4X)
- **Mockups**: Room scenes
- **Color**: Gold (#d4af37)

#### Furniture Mode
- **Materials**: Decorator Linen ($29.99), Soft Velvet ($36.99), Faux Suede ($32.99), Drapery Sheer ($24.99)
- **Min Order**: 5 yards
- **Scale**: 100%-200% (Normal, 1.25X, 1.5X, 1.75X, 2X)
- **Mockups**: Furniture pieces with zoom (chair, sofa)
- **Color**: Brown (#8b4513)
- **Special**: Zoom feature (0.7x default, 2.2x zoomed)

#### Clothing Mode
- **Materials**: Cotton Poplin ($24.99), Jersey Knit ($29.99), Silk Charmeuse ($49.99), Performance Polyester ($19.99)
- **Min Order**: 2 yards
- **Scale**: 25%-100% (Small, Medium, Large, X-Large)
- **Mockups**: Garments with front/back toggle (t-shirt, dress, hoodie)
- **Color**: Blue (#4a90e2)
- **Special**: Front/back view toggle

### Mode Detection Priority
1. URL parameter: `?mode=furniture`
2. Page path: `/pages/colorflex-furniture`
3. Collection parameter: `?collection=bombay.fur-1`
4. Default: WALLPAPER

### Deployment Options

#### Recommended: Same Store, Hidden Pages
```
Store: saffroncottage.shop

Pages:
- /pages/colorflex            (public, wallpaper)
- /pages/colorflex-furniture  (hidden, beta)
- /pages/colorflex-clothing   (hidden, beta)

Access:
- Direct URL sharing with beta testers
- ?preview=true for testing without login
- Customer tags: furniture-beta, clothing-beta
```

### Build & Deploy Commands
```bash
# Build all versions
npm run build:all

# Upload to Shopify:
# 1. Templates → page.colorflex-furniture.liquid, page.colorflex-clothing.liquid
# 2. Assets → color-flex-furniture.min.js, color-flex-clothing.min.js
# 3. Create hidden pages in Shopify admin
```

### Testing Checklist
- [ ] Wallpaper mode: No regression, all existing features work
- [ ] Furniture mode: Access control, brown theme, furniture materials, zoom
- [ ] Clothing mode: Access control, blue theme, clothing materials, front/back
- [ ] Mode detection: URL params, page paths, collection params
- [ ] Scale labels: Dynamic config labels display correctly per mode
- [ ] Console logs: Mode detection messages appear

### Key Learnings
- Configuration-based systems provide maximum flexibility with minimal code duplication
- Mode detection at runtime allows single codebase to serve multiple use cases
- Access control via customer tags + preview URL enables safe beta testing
- Webpack environment variables enable mode-specific builds from same source

### Related Documentation
- `MULTI_VERSION_STRATEGY.md` - Original planning document
- `MULTI_VERSION_IMPLEMENTATION.md` - Complete implementation guide with troubleshooting

---

## 🐛 CRITICAL FIX: Room Mockup Dimension Recognition - NOVEMBER 11, 2025

### Mockup Scaling Now Uses Actual Dimensions
**Date**: November 11, 2025 (Late Afternoon)
**Status**: ✅ FIXED AND BUILT
**Severity**: CRITICAL (affected all room mockup pattern scaling)

### Problem
Room mockup pattern scaling was using **hardcoded assumptions** instead of reading actual `mockupWidthInches` and `mockupHeightInches` from collections.json. Changing these values had **zero effect** on pattern scale.

### Root Cause
**Lines 9092-9096** in `updateRoomMockup()` (CFM.js):
```javascript
// WRONG: Hardcoded - treats all rooms as same size!
const PREVIEW_BASE = 700;
const PX_PER_IN_AT_700 = 5;
const pxPerInRoom = PX_PER_IN_AT_700 * (cssW / PREVIEW_BASE);
// Result: Always 4.29 px/inch regardless of actual mockup size
```

### Solution
**Lines 9092-9101** (Fixed):
```javascript
// Calculate px per inch based on actual mockup dimensions
const mockupWidthInches = appState.selectedCollection.mockupWidthInches || 90;
const mockupHeightInches = appState.selectedCollection.mockupHeightInches || 60;
const pxPerInRoom = cssW / mockupWidthInches;

console.log(`📐 Room mockup dimensions: ${mockupWidthInches}x${mockupHeightInches} inches`);
console.log(`📐 Canvas size: ${cssW}x${cssH} px`);
console.log(`📐 Calculated px per inch: ${pxPerInRoom.toFixed(2)} px/in`);
```

### Impact
- **Before**: 90" wide room and 60" wide room rendered patterns identically (wrong!)
- **After**: 90" room uses 6.67 px/in, 60" room uses 10.0 px/in (correct!)
- **Result**: Patterns now scale correctly based on actual room dimensions

### Files Modified
- `src/CFM.js` (lines 9092-9101): Fixed px/inch calculation
- `src/assets/color-flex-core.min.js` (252 KB): Rebuilt with fix

### Deployment
Upload `color-flex-core.min.js` to Shopify assets/. Clear browser cache and verify console shows correct dimensions.

### Related Documentation
- `MOCKUP_DIMENSION_FIX_20251111.md` - Complete technical analysis and testing guide

---

## ✅ SCALE PERSISTENCE FEATURE - NOVEMBER 11, 2025

### User Request:
> "I always wanted to be able to maintain the zoom level when switching patterns."

**Status**: ✅ IMPLEMENTED
**File**: `src/CFM.js` (lines 8271-8348)
**Build**: `src/assets/color-flex-core.min.js` (253 KB)

### Problem Solved:
Previously, when a user set a zoom level (2X, 3X, 4X) and clicked a different pattern, the scale would reset to Normal (1X). Users had to manually re-select their preferred scale for each pattern they viewed.

### Solution:
Scale now persists across pattern changes. The implementation follows the same architecture as the existing color lock feature:

1. **Save Scale Before UI Rebuild** (lines 8271-8273):
```javascript
const savedScaleMultiplier = appState.scaleMultiplier || 1;
console.log(`🔍 Scale persistence: Saved current scale multiplier: ${savedScaleMultiplier}`);
```

2. **Restore Scale After UI Rebuild** (lines 8313-8348):
- Restores `appState.scaleMultiplier` value
- Updates `appState.currentScale` for display consistency
- Re-highlights the active scale button (gold background)
- Logs restoration for debugging

### User Experience:
**Before**: User sets 2X → switches pattern → scale resets to Normal → must click 2X again
**After**: User sets 2X → switches pattern → new pattern loads at 2X automatically

### Benefits:
- Improved workflow efficiency when browsing patterns
- Consistent with color lock feature behavior
- No breaking changes (backward compatible)
- Works across all ColorFlex modes (wallpaper, furniture, clothing)

### Console Output:
```
🔍 Scale persistence: Saved current scale multiplier: 0.5
🔍 Scale persistence: Restoring scale multiplier to 0.5
🔍 Scale persistence: Highlighted button 1 for scale 0.5
```

### Testing:
1. Set scale to 2X on any pattern
2. Click different pattern thumbnail
3. Verify new pattern displays at 2X scale
4. Verify 2X button remains highlighted (gold background)

Upload `color-flex-core.min.js` to Shopify assets/. Clear browser cache and test scale persistence across multiple pattern changes.

### Related Documentation:
- `SCALE_PERSISTENCE_FIX_20251111.md` - Complete implementation guide and testing scenarios

---

## ✅ PROOF DOWNLOAD SIZE FIX - NOVEMBER 20, 2025

### Proof Downloads Now Ignore Scale Setting
**Date**: November 20, 2025
**Status**: ✅ FIXED AND BUILT
**File**: `src/CFM.js`

### Problem
When a user set the UI scale to 2X, 3X, or 4X and downloaded a proof, the proof image file was being generated at the scaled size instead of the standard 24 inches wide. This resulted in inconsistent proof sizes depending on the user's current scale preference.

### Root Cause
Three proof download functions were passing `appState.currentScale` or `pattern.currentScale` to the `generatePatternProof()` function:

1. **Line 12469**: `generatePatternProofWithInfo()` - passing `appState.currentScale`
2. **Line 12671**: `downloadCurrentPatternProof()` - passing `appState.currentScale`
3. **Line 1735**: `downloadSavedPatternProof()` - passing `pattern.currentScale`

This caused the proof canvas to render at the scaled size, making downloads inconsistent.

### Solution
Changed all three functions to pass `null` instead of scale values:

```javascript
// ⚠️ IMPORTANT: Always pass null for scale to ensure proofs are consistently 24 inches wide
// regardless of UI scale setting. User's scale preference affects UI preview only, not downloads.
const proofCanvas = await generatePatternProof(patternName, collectionName, colorArray, null);
```

**Files Modified:**
- `src/CFM.js` (lines 1722-1736, 12343-12375, 12515-12518, 12712-12720)
- `src/assets/color-flex-core.min.js` (261 KB, rebuilt)

### Result
**Canvas Size**: All proof downloads consistently generate at one pattern repeat size (represents 24" × 24" at calculated DPI)

**Scale Behavior**: Scale setting affects **tile size within the canvas**, showing correct repetition for printing:
- **1X (Normal)**: 1 tile fills the 24" canvas (24" repeat)
- **2X**: 4 tiles fit on the 24" canvas (12" repeat)
- **3X**: 9 tiles fit on the 24" canvas (8" repeat)
- **4X**: 16 tiles fit on the 24" canvas (6" repeat)

This ensures the proof accurately represents what will be printed on a 24-inch wide wallpaper roll.

### DPI Metadata Enhancement
**Added**: Automatic DPI metadata insertion to ensure proofs display at exactly 24 inches wide in image editing software.

**Implementation** (`downloadPatternProof()` function, lines 12440-12501):
- Calculates correct DPI based on canvas pixel width: `DPI = pixelWidth ÷ 24`
- Locates JFIF header in JPEG file structure
- Inserts DPI values into X-density and Y-density fields
- Sets density unit to 1 (dots per inch)

**Example DPI calculations:**
- 3600px wide canvas → 150 DPI (3600 ÷ 24)
- 4800px wide canvas → 200 DPI (4800 ÷ 24)
- 1200px wide canvas → 50 DPI (1200 ÷ 24)

**Result**: When client opens proof in Photoshop, Illustrator, or other image editors, the image dimensions will show as exactly 24 inches wide at the calculated DPI, regardless of pixel dimensions.

### Build Output
```bash
npm run build
✅ color-flex-core.min.js: 261 KB
✅ color-flex-furniture.min.js: 261 KB
✅ color-flex-clothing.min.js: 262 KB
```

### Deployment
Upload `src/assets/color-flex-core.min.js` to Shopify assets folder.

---

## 👕 CLOTHING MODE DEPLOYMENT - NOVEMBER 11, 2025

### Overview:
**Status**: ✅ FULLY FUNCTIONAL
**Template**: `src/templates/page.colorflex-clothing.liquid`
**Collections**: 6 clothing collections (76 total patterns)

### Collections Restored:
- **botanicals.clo-1** (4 patterns)
- **bombay.clo-1** (34 patterns) - Default collection
- **traditions.clo-1** (17 patterns)
- **folksie.clo-1** (4 patterns)
- **geometry.clo-1** (9 patterns)
- **ikats.clo-1** (8 patterns)

### Mode-Based Collection Filtering:
**File**: `src/CFM.js` (lines 6782-6806)

Collections are automatically filtered based on the ColorFlex mode:
- **CLOTHING mode**: Shows ONLY `.clo-` collections (6 collections)
- **WALLPAPER mode**: Filters out `.clo-` collections (18 collections)
- **FURNITURE mode**: Shows furniture collections (future)

This ensures complete separation between pages - clothing patterns don't appear on wallpaper page and vice versa.

### Default Collection:
**Template**: `window.CLOTHING_DEFAULT_COLLECTION = 'bombay.clo-1'`
**CFM.js**: Lines 6898-6905 (priority chain for collection selection)

The clothing page automatically loads the Bombay collection (34 patterns) on first visit, preventing "No valid collection found" errors.

### Collections Modal:
**Template**: Lines 217-452

A blue-themed popup modal allows users to switch between clothing collections:
- Click collection header to open modal
- Grid display of all 6 collections with chameleon icons
- Click any collection card to switch collections
- Blue theme (#4a90e2) for clothing aesthetic

### Deployment Steps:
1. Upload `src/assets/color-flex-core.min.js` to Shopify assets/
2. Upload `src/templates/page.colorflex-clothing.liquid` to Shopify templates/
3. Create Shopify page at `/pages/colorflex-clothing` using the template
4. (Optional) Enable access control via customer tags or preview URLs
5. Test with `?preview=true` parameter

### Testing:
1. Load `/pages/colorflex-clothing`
2. Verify Bombay collection loads by default
3. Click collection header → Verify modal opens
4. Verify all 6 collections displayed
5. Click different collection → Verify collection switches
6. Verify scale persists across pattern and collection changes
7. Verify wallpaper page doesn't show clothing collections

### Related Documentation:
- `.MODIFIED_FILES_SESSION3_20251111.md` - Complete deployment guide
- `MULTI_VERSION_IMPLEMENTATION.md` - Multi-version system architecture

---

## ✅ DECEMBER 2025 IMPROVEMENTS

### Color Stepper
**Date**: December 1, 2025
**Status**: ✅ IMPLEMENTED
**File**: `src/CFM.js` (lines 7025-7115, 7493-7784)
**Build**: 269 KB

#### Feature Overview
**Color Stepper** allows users to click **+/− buttons** on each color circle to quickly navigate to lighter or darker Sherwin-Williams colors while preserving the original hue. This provides an intuitive way to explore color variations without manual search.

#### Visual Design
Each color circle now has two small circular buttons:
- **Left side (−)**: Dark gray button - Find darker color
- **Right side (+)**: White button - Find lighter color

**Button Specifications:**
- Size: 20px × 20px
- Position: Absolute, overlaying edges of color circle
- Style: Rounded, semi-transparent with subtle borders
- Hover effect: Scale 1.1× with shadow
- z-index: 10 (always visible)

#### Implementation

**New Function: `findLighterDarkerSWColor()`** (lines 7025-7115)
- Converts current color to HSL (Hue-Saturation-Lightness)
- Adjusts lightness by ±10% per click
- Filters SW colors within ±30° of original hue
- Finds closest match using RGB distance algorithm
- Falls back to entire SW palette if no similar-hue colors found

**Modified Function: `createColorInput()`** (lines 7493-7784)
- Added `colorControlsWrapper` div for relative positioning
- Created `darkerButton` and `lighterButton` elements with inline styles
- Added hover effects with scale and shadow animations
- Attached click handlers that:
  - Stop propagation (prevent color circle click)
  - Call `findLighterDarkerSWColor()` with appropriate direction
  - Update input value and color circle background
  - Update `appState.currentLayers` with new color
  - Re-render previews (updatePreview, updateRoomMockup, populateCoordinates)

#### Algorithm Details

**Lightness Step:** 10% adjustment per click
**Hue Tolerance:** ±30 degrees on 360° color wheel
**Range:** 0% (black) to 100% (white)

**Example Progression:**
```
Snowbound (L=91%) → Click − → L=81% → Find darker SW color
                   → Click + → L=100% → Find lighter SW color
```

**Hue Preservation Strategy:**
1. Filter SW colors within ±30° of current hue (preserves color family)
2. Filter by direction (lighter or darker than current)
3. Find closest match by RGB distance
4. Fallback to all SW colors if no similar-hue matches

#### User Experience

**Workflow Example:**
```
1. User clicks − (darker) on Snowbound layer
   → System finds Silverpointe (darker gray, same hue)
   → Input updates to "Silverpointe"
   → Pattern preview re-renders

2. User clicks − again
   → System finds Repose Gray (even darker)
   → Continues preserving gray family

3. User clicks + (lighter)
   → System reverses: Repose Gray → Silverpointe
```

**Edge Cases:**
- Lightest colors (L≈100%): Click + shows console warning, no change
- Darkest colors (L≈6%): Click − shows console warning, no change
- Neutral grays: Preserves gray family despite low saturation

#### Console Output

**Successful Adjustment:**
```
🎨 Finding darker color for: Snowbound
  Current HSL: h=240, s=8, l=91
  Target lightness: 81 (darker by 10)
  Found 12 candidate colors with similar hue
  ✅ Found darker color: Silverpointe (SW7653)
✅ Updated Page 1 to darker color: Silverpointe
```

#### Performance
- Color lookup + conversion: <1ms
- SW palette filter (1800+ colors): ~5-10ms
- Total per click: ~10-15ms (instant response)
- No network requests, uses existing colorsData

#### Build Output
**Files Modified:**
- `src/CFM.js`: Added findLighterDarkerSWColor(), modified createColorInput()
- `src/assets/color-flex-core.min.js`: 269 KB (minified, +3 KB from previous)

#### Deployment
```bash
npm run build
./deploy-shopify-cli.sh assets
```

**Files to upload:**
- `src/assets/color-flex-core.min.js` (269 KB)
- `src/assets/color-flex-furniture.min.js` (269 KB)
- `src/assets/color-flex-clothing.min.js` (270 KB)

#### Testing Checklist
- [ ] Load ColorFlex page with pattern containing layers
- [ ] Verify +/− buttons appear on each color circle
- [ ] Click − button: verify darker color selected
- [ ] Click + button: verify lighter color selected
- [ ] Verify pattern preview updates automatically
- [ ] Test with multiple layers
- [ ] Test in fabric mode (both mockup and preview update)
- [ ] Check console for debug output

#### Related Documentation
- `COLOR_STEPPER.md` - Complete Color Stepper technical documentation
- `FUNCTIONS_NEEDING_JSDOC.md` - Priority 4: Color Management functions

---

### Multi-Scale & Multi-Scene Clothing Rendering
**Date**: December 26, 2025
**Status**: ✅ IMPLEMENTED
**Files**: `src/blender/colorflex-batch-render.py` (v2.4), `src/blender/render-all-clo2.sh`

#### Feature Overview
The Blender rendering system now generates clothing mockup layers at **4 scale levels** across **2 garment scenes**, allowing users to preview patterns at different sizes on various garments.

**Key Features:**
- **Multi-Scale**: 1.0X, 1.25X, 1.5X, 2.0X pattern sizes on garments
- **Multi-Scene**: Dress + Winter garment models
- **13 Collections**: All ColorFlex collections rendered in both scenes
- **Organized Output**: Files organized by scene in subdirectories

#### Scale Configuration
```python
"render_scales": [1.0, 0.8, 0.667, 0.5]   # UV scale values (lower = larger pattern)
"scale_labels": ["1.0", "1.25", "1.5", "2.0"]  # User-facing labels
```

**How Scaling Works:**
- Lower UV scale value = Larger pattern on garment (fewer repeats)
- UV Mapping node in material controls pattern size
- Pre-rendered at exact sizes for perfect quality (no client-side scaling)

#### Scene Configuration
**Blender Files:**
- `dress-fabric-ready2.blend` → Dress garment (object: "dress")
- `dress-fabric-girl-base2.blend` → Winter garment (object: "winter2")

**Output Structure:**
```
data/collections/botanicals-clo2/layers/
  dress/
    pattern_layer-1_scale-1.0.png
    pattern_layer-1_scale-1.25.png
    pattern_layer-1_scale-1.5.png
    pattern_layer-1_scale-2.0.png
    manifest_pattern.json
  winter/
    pattern_layer-1_scale-1.0.png
    pattern_layer-1_scale-1.25.png
    pattern_layer-1_scale-1.5.png
    pattern_layer-1_scale-2.0.png
    manifest_pattern.json
```

#### File Naming Convention
```
{pattern-slug}_{layer-label}_layer-{N}_scale-{X}.png
```

**Examples:**
```
botanical-stems_silhouettes_layer-1_scale-1.0.png    # Normal size
botanical-stems_silhouettes_layer-1_scale-1.25.png   # 25% larger
botanical-stems_silhouettes_layer-1_scale-1.5.png    # 50% larger
botanical-stems_silhouettes_layer-1_scale-2.0.png    # Double size
```

#### Usage

**Batch Render All Collections (Recommended):**
```bash
cd src/blender
./render-all-clo2.sh
```

Renders:
- **13 collections** × **2 scenes** × **4 scales** = **104 collection-scene combinations**
- Each pattern gets **8 PNG files per layer** (4 scales × 2 scenes)
- Estimated time: ~8-12 hours for complete batch

**Test Single Collection:**
```bash
/Applications/Blender.app/Contents/MacOS/Blender \
  /Volumes/K3/jobs/saffron/blender/dress-fabric-ready2.blend \
  --background \
  --python src/blender/colorflex-batch-render.py \
  -- --collection=botanicals --scene=dress --garment=dress
```

#### Manifest Structure
Each pattern gets a manifest file with multi-scale metadata:

```json
{
  "mockup_type": "clothing",
  "scene": "dress",
  "garment_object": "dress",
  "pattern": "Botanical Stems",
  "scales": {
    "1.0": [{"index": 1, "label": "Silhouettes", "filename": "..."}],
    "1.25": [{"index": 1, "label": "Silhouettes", "filename": "..."}],
    "1.5": [{"index": 1, "label": "Silhouettes", "filename": "..."}],
    "2.0": [{"index": 1, "label": "Silhouettes", "filename": "..."}]
  },
  "available_scales": ["1.0", "1.25", "1.5", "2.0"]
}
```

#### Implementation Details

**Blender Script (`colorflex-batch-render.py`):**
- Accepts `--collection`, `--scene`, `--garment` arguments
- Nested loop: Outer loop for scales, inner loop for layers
- `_set_uv_scale()` function adjusts UV Mapping node before each render
- Forces complete dependency graph update to prevent caching issues

**Batch Script (`render-all-clo2.sh`):**
- Loops through dress and winter scenes
- For each scene, renders all collections
- Passes scene-specific garment object name to Blender

#### Deployment

**Deploy Layer Files to Server:**
```bash
cd src/blender
./deploy-clo2-collections.sh botanicals
# Or deploy all collections:
./deploy-clo2-collections.sh all
```

**Update collections.json:**
```bash
python3 update-clo2-collection.py botanicals
```

**Deploy collections.json:**
```bash
./deploy-shopify-cli.sh data --yes
```

#### Next Steps (Frontend Integration)
1. Update `update-clo2-collection.py` to generate multi-scale `mockupLayers` structure
2. Update CFM.js to load appropriate scale when user clicks scale buttons
3. Add scene selector in UI (dress vs winter garment)

#### Related Documentation
- `MULTI_SCALE_RENDERING.md` - Complete technical documentation and examples
- `src/blender/README.md` - Blender rendering pipeline guide

---

## ✅ OCTOBER 2025 IMPROVEMENTS

### User Interface Enhancements
**Date**: October 1, 2025
**Backup**: `./backups/working_versions/ui_improvements_20251001/`

#### 1. Badge Font-Size Fix (Saved Patterns Modal)
**Issue**: Badge text (Saved:, Layers:, Repeat:) displaying at 20px instead of 11px due to Shopify theme CSS overriding inline styles.

**Solution**: Multi-layer `!important` enforcement:
- Added `font-size: 11px !important;` to all parent containers
- Changed `<strong>` tags to `<span>` with explicit font-size and font-weight
- Added `!important` to `font-family` declarations
- Added `line-height: 1.2` for tighter spacing

**Files Modified**:
- `src/CFM.js` (lines 1165-1250): Pattern card badges
- `assets/unified-pattern-modal.js` (lines 474-527): Modal badges

#### 2. Scale Added to ID Badge
**Feature**: Scale (X1, X2, X3, X4) now appears at end of ID line.

**Format**: `ID: <pattern-id> - <scale>`
**Examples**:
- `ID: SW7006-SW6258-SC0002 - 2X` (200% scale)
- `ID: SW7006-SW6258-SC0002 - 0.5X` (50% scale)
- `ID: SW7006-SW6258-SC0002` (100% scale, no suffix)

**Files Modified**:
- `src/CFM.js` (lines 1173-1184)
- `assets/unified-pattern-modal.js` (lines 723-734)

#### 3. Browser Back Button Added
**Feature**: Simple back button using `window.history.back()` - non-invasive, relies on browser native history.

**Location**: Fixed position (top: 80px, left: 20px)
**Styling**: Gold border (#d4af37), dark background, hover effects

**Files Modified**:
- `src/templates/page.colorflex.liquid` (lines 7-40): ColorFlex page back button
- `src/sections/main-product.liquid` (lines 20-52): Product page back button (already existed)

#### 4. Material Specifications Section
**Feature**: Complete materials & installation guides on product page.

**Includes**:
- 4 Wallpaper options (Prepasted $180, Peel & Stick $320, Unpasted $180, Grasscloth)
- 6 Fabric options ($24-$36/yard, 5-yard minimums)
- Installation & care guide
- FAQ section
- Anchor ID: `#material-specs` for direct linking

**Location**: After product description on main product page (lines 1033-1238)

**Files Modified**:
- `src/sections/main-product.liquid`: Added complete specifications section

#### 5. Material Description Badge
**Feature**: Dynamic material info badge when arriving from ColorFlex with `preferred_material` URL parameter.

**Styling**:
- Background: `rgb(204, 171, 108)` (lighter muted gold)
- Rounded rectangle with material specs
- Only displays when coming from ColorFlex

**Files Modified**:
- `src/sections/main-product.liquid` (lines 890-1031)

### Build Output
**Production File**: `assets/color-flex-core.min.js` (224 KB)
**Build Command**: `npm run build`

### Deployment Files
1. `assets/color-flex-core.min.js` → Shopify assets
2. `assets/unified-pattern-modal.js` → Shopify assets
3. `src/sections/main-product.liquid` → Shopify sections
4. `src/templates/page.colorflex.liquid` → Shopify templates

---

## ✅ THUMBNAIL PRESERVATION FIX - OCTOBER 6, 2025

### Issue: Gradual Thumbnail Loss
**Problem**: Saved patterns were gradually losing their thumbnails after 10-15 saves.

**Root Cause**: localStorage quota (5-10MB) exhaustion due to:
1. Cart thumbnails (`cart_thumbnail_*`) accumulating indefinitely (~2-5KB each)
2. After 20-30 cart additions, 100-200KB consumed
3. Emergency cleanup removing thumbnails from all but most recent 4 patterns

**Timeline Example**:
```
User saves patterns 1-10        → All thumbnails preserved
User adds to cart 10×           → 50KB cart thumbnails accumulate
User saves patterns 11-14       → Still working
User saves pattern 15           → localStorage quota exceeded!
                                → Emergency cleanup triggers
                                → Patterns 1-11 lose thumbnails
```

### Solution: Automatic Cart Thumbnail Cleanup
**Date**: October 6, 2025
**Backup**: `./backups/working_versions/thumbnail_cleanup_20251006_165938/`

**Implementation**:
- New `cleanupOldCartThumbnails()` function (lines 573-634)
- Runs on app startup (line 6228)
- Runs before every pattern save (line 640)

**Cleanup Rules**:
1. Remove cart thumbnails older than 24 hours
2. Keep maximum 10 most recent cart thumbnails
3. Log space freed for monitoring

**Expected Results**:
- Maintains ~30-50KB for cart thumbnails (vs 100-200KB before)
- Prevents emergency cleanup that strips pattern thumbnails
- All 15 saved patterns retain thumbnails indefinitely

**Files Modified**:
- `src/CFM.js` (lines 573-634, 6228, 640)

**Build Output**: `src/assets/color-flex-core.min.js` (234 KB)

---

## Critical Files
- `src/CFM.js` - Main application (502KB) - **INCLUDES CART FLOW FIXES**
- `src/core/` - **NEW: Protected modular system** (1,671 total lines)
- `assets/color-flex-core.min.js` - Production build (216KB) - **UPDATED WITH FIXES**
- `assets/ProductConfigurationFlow.js` - Add to Cart flow (fixed color normalization)
- `src/templates/page.colorflex.liquid` - Enhanced with embedded data loading
- `data/collections.json` - Pattern definitions
- `src/layout/theme.liquid` - URL generation logic