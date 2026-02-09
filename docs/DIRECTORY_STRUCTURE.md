# Clean ColorFlex Directory Structure

## Final Streamlined Structure (Aug 25, 2025)

```
/Volumes/K3/jobs/saffron/colorFlex-shopify/
├── 🚀 EXECUTION
│   ├── update                          # Single command launcher
│   └── updates/                        # Update system
│       ├── incremental-update.js       # Consolidated update script
│       ├── enhanced-cf-dl-grok.js      # Reference (archived)
│       └── deployV2.sh                 # Reference (archived)
│
├── 💻 SOURCE CODE
│   ├── src/
│   │   ├── CFM.js                      # Main ColorFlex application (65k lines)
│   │   ├── scripts/cf-dl.js            # Enhanced Airtable data fetcher
│   │   ├── sections/                   # Shopify template sections
│   │   │   ├── colorflex-app.liquid    # ColorFlex interface section
│   │   │   ├── main-product.liquid     # Product page integration
│   │   │   └── main-cart-items.liquid  # Cart integration
│   │   ├── templates/                  # Shopify page templates
│   │   │   └── page.colorflex.liquid   # ColorFlex page template
│   │   ├── layout/
│   │   │   └── theme.liquid            # Theme layout
│   │   ├── snippets/
│   │   │   └── colorflex-cart-item.liquid # Cart item snippet
│   │   └── styles/                     # CSS files
│   ├── dist/                           # Built application files
│   └── assets/                         # Shopify-ready assets
│       ├── color-flex-core.min.js      # Built application
│       ├── color-flex-core.min-bu.js   # Working backup version
│       ├── collections.json            # Pattern metadata
│       └── colors.json                 # Color definitions
│
├── 📊 DATA
│   ├── data/
│   │   ├── collections.json            # Current pattern metadata
│   │   ├── colors.json                 # Color palette data
│   │   ├── collections/                # Pattern image files (1GB+)
│   │   │   ├── abundance/              # 36 patterns
│   │   │   ├── bombay/                 # 34 patterns
│   │   │   ├── botanicals/             # 10 patterns
│   │   │   ├── coordinates/            # 20 patterns
│   │   │   ├── coverlets/              # 23 patterns
│   │   │   ├── english-cottage/        # 19 patterns
│   │   │   ├── farmhouse/              # 10 patterns
│   │   │   ├── folksie/                # 4 patterns
│   │   │   ├── geometry/               # 7 patterns
│   │   │   ├── ikats/                  # 8 patterns
│   │   │   ├── new-orleans/            # 8 patterns
│   │   │   ├── silk-road/              # 6 patterns
│   │   │   └── traditions/             # 6 patterns
│   │   └── shopify-import.csv          # Latest Shopify import file
│   └── config/
│       └── shopify.json                # Shopify API configuration
│
├── 🔧 BUILD & CONFIG
│   ├── package.json                    # Node.js dependencies
│   ├── webpack.config.js              # Build configuration
│   ├── cors.php, cors-fixed.php       # Server CORS handling
│   └── fix_csv.py                     # CSV utility
│
├── 📚 DOCUMENTATION
│   ├── README.md                      # Project overview
│   ├── CLAUDE.md                      # Session context & status
│   └── WORKFLOW.md                    # Usage instructions
│
└── 🗃️ BACKUPS
    └── backup/                        # Timestamped backups
        ├── 20250825_154235_cleanup_preparation/
        └── 20250825_164330_final_cleanup/
```

## Key Improvements

### ✅ **Eliminated Clutter:**
- **Removed**: 15+ duplicate scripts, old deployment directories, test files
- **Consolidated**: Multiple cf-dl versions into single enhanced script
- **Organized**: All backups in timestamped directories

### ✅ **Single Command Workflow:**
```bash
./update                    # Complete update: fetch + deploy + CSV
./update --help             # Usage information
```

### ✅ **Clear File Ownership:**
- **Source of Truth**: `src/CFM.js`, `data/collections.json`
- **Active Templates**: `src/sections/` and `src/templates/`
- **Built Assets**: `assets/` directory (Shopify-ready)
- **Update System**: `updates/` directory

### ✅ **Safe History:**
- All previous versions preserved in timestamped backups
- No working files lost during cleanup
- Easy rollback if needed

## Total Cleanup Results
- **Files Removed**: ~200 duplicate/obsolete files
- **Directories Cleaned**: 8 major directories consolidated
- **Size Reduction**: ~50MB of duplicate scripts/docs removed
- **Complexity**: Single `./update` command replaces 15+ separate scripts

This structure supports efficient development while maintaining all historical context in organized backups.