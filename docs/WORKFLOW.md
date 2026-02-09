# Streamlined ColorFlex Update Workflow

## New Clean Structure

### Single Command Updates
```bash
# Complete incremental update (data + images + deploy + CSV)
./update

# Specific operations
./update --download-images    # Just fetch data and images
./update --generate-csv       # Just generate CSV  
./update --deploy-images      # Just deploy to server
./update --collection=ikats   # Process specific collection only
```

### Directory Structure
```
/Volumes/K3/jobs/saffron/colorFlex-shopify/
├── update                          # Top-level launcher script
├── updates/                        # Consolidated update system
│   ├── incremental-update.js       # Main consolidated script
│   ├── enhanced-cf-dl-grok.js      # Reference (archived)
│   └── deployV2.sh                 # Reference (archived)
├── src/scripts/cf-dl.js            # Enhanced data fetcher
├── data/                           # Data files (collections.json, CSV, etc.)
├── backup/                         # All previous versions safely backed up
└── assets/                         # Built application files
```

### Key Improvements

1. **Single Entry Point**: `./update` from root directory
2. **Consolidated Logic**: All update operations in one script
3. **Built-in Deployment**: No separate deployment step needed
4. **Clean Structure**: Removed duplicate files and unused directories
5. **Safe Backups**: All previous scripts backed up in timestamped directory

### Before Manual Shopify Steps

The update process now:
1. ✅ Fetches latest data from Airtable
2. ✅ Downloads any new/missing images  
3. ✅ Deploys images to production server
4. ✅ Generates CSV with proper formatting
5. ✅ Copies CSV to `updates/shopify-import-YYYYMMDD.csv`

**Manual Steps Remaining:**
- Upload `data/collections.json` to Shopify assets
- Import the generated CSV to Shopify admin

This addresses your feedback about the 15-minute external solution vs our extended process - now it's a single command that does everything efficiently.