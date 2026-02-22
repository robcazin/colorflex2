#!/bin/bash

# ColorFlex Collection Update Script
# Usage: ./update-collection.sh <command> <collection-name>
# Commands: complete, metadata, images
# Uses src/scripts/cf-dl.js script to fetch data, download images, generate CSV, and deploy to server

set -e  # Exit on any error

# Load data path and overrides (data lives on Synology /Volumes/jobs/cf-data, syncs to Backblaze)
if [ -f "config/local.env" ]; then
    set -a
    source config/local.env
    set +a
fi

# Data folder: Synology/Backblaze. Top-level data/ holds collections/, mockups/, collections.json.
LOCAL_DATA_PATH="${COLORFLEX_DATA_PATH:-/Volumes/jobs/cf-data}"
if [ -f "$LOCAL_DATA_PATH/data/collections.json" ]; then
    COLLECTIONS_JSON_PATH="$LOCAL_DATA_PATH/data/collections.json"
else
    COLLECTIONS_JSON_PATH="$LOCAL_DATA_PATH/collections.json"
fi
BACKUP_DIR="./backups"

# Legacy server vars (kept for reference; deploy to server is disabled)
SERVER_HOST="${COLORFLEX_SERVER_HOST:-}"
SERVER_USER="${COLORFLEX_SERVER_USER:-}"
SERVER_PORT="${COLORFLEX_SERVER_PORT:-}"
SERVER_KEY="${COLORFLEX_SERVER_KEY:-}"
SERVER_PATH="${COLORFLEX_SERVER_PATH:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[COLORFLEX]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
ColorFlex Collection Update Script

Usage: $0 <command> <collection-name>

Commands:
  complete    - Full pipeline: fetch data + download images + deploy server + generate CSV + create Shopify products
  metadata    - Data-only update: fetch data + generate CSV (no images, no deploy, no product creation)
  images      - Images-only update: download images + deploy server (no CSV generation, no product creation)
  add-pattern - Incremental: check for NEW patterns only, append to collections.json, download + deploy new images, update CSV + create NEW Shopify products

Collection Names:
  abundance, english-cottage, ancient-tiles, botanicals, bombay, coordinates,
  coverlets, dished-up, farmhouse, folksie, galleria, geometry, ikats,
  new-orleans, pages, silk-road, traditions
  OR use 'all' to update all collections

Examples:
  $0 complete abundance       # Complete abundance collection update + create Shopify products
  $0 metadata english-cottage # Generate CSV only for english-cottage (no images/deploy/products)
  $0 images botanicals         # Download and deploy images only for botanicals (no products)
  $0 add-pattern coordinates  # Check for new patterns in coordinates, append them + create NEW Shopify products
  $0 complete all             # Full update for all collections + create all Shopify products

Options:
  --skip-products             Skip Shopify product creation (manual CSV import instead)
  --update-products           Update existing Shopify products (instead of skipping them)

Environment Variables (can be set in config/local.env):
  COLORFLEX_DATA_PATH          Data folder (default: /Volumes/jobs/cf-data). Synology Cloud Sync → Backblaze.
  COLORFLEX_DATA_BASE_URL      Optional: Backblaze B2 public URL for data; set so CSV/theme use it for image URLs.

EOF
}

# Function to create backup
create_backup() {
    if [ "$CREATE_BACKUP" = true ]; then
        print_status "Creating backup..."
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        BACKUP_FILE="$BACKUP_DIR/collections_backup_$TIMESTAMP.tar.gz"
        
        if [ -d "$LOCAL_DATA_PATH" ]; then
            tar -czf "$BACKUP_FILE" -C "$LOCAL_DATA_PATH" . 2>/dev/null || {
                print_warning "Backup creation failed, continuing anyway..."
            }
            print_status "Backup created: $BACKUP_FILE"
        fi
    fi
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check npm packages
    if [ ! -d "node_modules" ]; then
        print_error "Node modules not found. Run 'npm install' first"
        exit 1
    fi
    
    # Check if we have the cf-dl.js file
    if [ ! -f "src/scripts/cf-dl.js" ]; then
        print_error "cf-dl.js not found in src/scripts/ directory"
        exit 1
    fi
    
    print_status "Dependencies OK"
}

# Function to update collection data
update_collection_data() {
    local collection_name="$1"
    local force_download="$2"
    local generate_csv="$3"
    local incremental="$4"

    print_header "Updating Collection Data"

    # Build command arguments
    local cmd_args=()

    # Download images argument
    if [ "$force_download" = true ]; then
        cmd_args+=("true")
        if [ "$incremental" = true ]; then
            print_status "Incremental mode - will only add NEW patterns"
        else
            print_status "Force download enabled - will re-download all images"
        fi
    else
        cmd_args+=("false")
        print_status "Incremental update - will skip existing images"
    fi

    # Collection name argument
    if [ -n "$collection_name" ] && [ "$collection_name" != "all" ]; then
        cmd_args+=("$collection_name")
        print_status "Updating collection: $collection_name"
    else
        cmd_args+=("null")
        print_status "Updating all collections"
    fi

    # CSV generation argument
    if [ "$generate_csv" = true ]; then
        cmd_args+=("shopify")
        print_status "Will generate Shopify CSV import file"
    fi

    # Incremental/append mode flag
    if [ "$incremental" = true ]; then
        cmd_args+=("incremental")
        print_status "Incremental mode: will append NEW patterns only (preserving existing data)"
    else
        # Force download flag (if needed as separate argument)
        if [ "$force_download" = true ]; then
            cmd_args+=("force")
        fi
    fi

    # Execute the update
    print_status "Running: node src/scripts/cf-dl.js ${cmd_args[*]}"

    if node src/scripts/cf-dl.js "${cmd_args[@]}"; then
        print_status "Collection data update completed successfully"
        return 0
    else
        print_error "Collection data update failed"
        return 1
    fi
}

# Function to deploy to server
deploy_to_server() {
    print_header "Deploying to Server"
    
    # Use environment variables if set, otherwise use defaults
    local server_host="${COLORFLEX_SERVER_HOST:-$SERVER_HOST}"
    local server_user="${COLORFLEX_SERVER_USER:-$SERVER_USER}"
    local server_port="${COLORFLEX_SERVER_PORT:-$SERVER_PORT}"
    local server_key="${COLORFLEX_SERVER_KEY:-$SERVER_KEY}"
    local server_path="${COLORFLEX_SERVER_PATH:-$SERVER_PATH}"
    
    # Build SSH options with key and port
    local ssh_opts="-o ConnectTimeout=5"
    if [ -n "$server_port" ] && [ -n "$server_key" ] && [ -f "$server_key" ]; then
        ssh_opts="$ssh_opts -p $server_port -i $server_key"
        print_status "Using SSH key: $server_key (port: $server_port)"
    elif [ -n "$server_key" ] && [ -f "$server_key" ]; then
        ssh_opts="$ssh_opts -i $server_key"
        print_status "Using SSH key: $server_key"
    else
        print_warning "SSH key not found at: $server_key"
        print_warning "Skipping server deployment - images will be downloaded locally only"
        return 0
    fi
    
    print_status "Deploying to: $server_user@$server_host:$server_path"
    
    # Check if server is reachable
    if ! ssh $ssh_opts "$server_user@$server_host" "echo 'Connection test successful'" &>/dev/null; then
        print_error "Cannot connect to server $server_host"
        print_error "Please check SSH configuration and server availability"
        return 1
    fi
    
    # Create remote backup
    print_status "Creating remote backup..."
    ssh $ssh_opts "$server_user@$server_host" "cd $server_path && tar -czf backup_\$(date +%Y%m%d_%H%M%S).tar.gz data/ 2>/dev/null || echo 'Remote backup skipped'"
    
    # Build rsync options with SSH key
    local rsync_opts="-avz --delete"
    # Exclude Bassett mockup data (main-branch collection updates only; Bassett is local/dev)
    rsync_opts="$rsync_opts --exclude='mockups/bassett'"
    if [ -n "$server_port" ] && [ -n "$server_key" ] && [ -f "$server_key" ]; then
        rsync_opts="$rsync_opts -e 'ssh -p $server_port -i $server_key'"
    elif [ -n "$server_key" ] && [ -f "$server_key" ]; then
        rsync_opts="$rsync_opts -e 'ssh -i $server_key'"
    fi
    
    # Sync data directory
    print_status "Syncing data directory..."
    if eval rsync $rsync_opts "$LOCAL_DATA_PATH/" "$server_user@$server_host:$server_path/data/"; then
        print_status "Data sync completed successfully"
    else
        print_error "Data sync failed"
        return 1
    fi
    
    # Update server permissions
    print_status "Updating server permissions..."
    ssh $ssh_opts "$server_user@$server_host" "cd $server_path && find data/ -type f -exec chmod 644 {} + && find data/ -type d -exec chmod 755 {} +"
    
    print_status "Deployment completed successfully"
    return 0
}

# Function to deploy mockups to external server
deploy_mockups_to_server() {
    print_header "Deploying Mockups to Server"

    # Check if mockups directory exists
    if [ ! -d "data/mockups" ]; then
        print_warning "data/mockups directory not found - skipping mockup deployment"
        return 0
    fi

    # Use environment variables if set, otherwise use defaults
    local server_host="${COLORFLEX_SERVER_HOST:-$SERVER_HOST}"
    local server_user="${COLORFLEX_SERVER_USER:-$SERVER_USER}"
    local server_path="${COLORFLEX_SERVER_PATH:-$SERVER_PATH}"

    print_status "Deploying mockups to: $server_user@$server_host:$server_path/data/mockups/"

    # Use SSH key and port if specified; exclude Bassett (main-branch deploy only)
    local rsync_opts="-avz --progress --exclude='bassett/'"
    if [ -n "$SERVER_PORT" ] && [ -n "$SERVER_KEY" ] && [ -f "$SERVER_KEY" ]; then
        rsync_opts="$rsync_opts -e 'ssh -p $SERVER_PORT -i $SERVER_KEY'"
    fi

    # Sync mockups directory using rsync
    if eval rsync $rsync_opts data/mockups/ "$server_user@$server_host:$server_path/data/mockups/"; then
        print_status "Mockups deployed successfully"
        return 0
    else
        print_error "Mockup deployment failed"
        return 1
    fi
}

# Function to deploy collections.json to Shopify assets
deploy_collections_to_shopify() {
    print_header "Deploying collections.json to Shopify"

    # Check if collections.json exists (data path: Synology cf-data)
    if [ ! -f "$COLLECTIONS_JSON_PATH" ]; then
        print_error "collections.json not found at $COLLECTIONS_JSON_PATH"
        return 1
    fi

    # Check if deploy-shopify-cli.sh exists
    if [ ! -f "./deploy-shopify-cli.sh" ]; then
        print_error "deploy-shopify-cli.sh not found"
        print_warning "You can manually upload $COLLECTIONS_JSON_PATH to Shopify assets"
        return 1
    fi

    print_status "Uploading collections.json to Shopify assets via CLI..."

    # Copy collections.json from data path to src/assets/ for Shopify upload
    cp "$COLLECTIONS_JSON_PATH" src/assets/collections.json

    # Use Shopify CLI to upload (--yes flag for non-interactive mode)
    if ./deploy-shopify-cli.sh data --yes; then
        print_status "Collections.json uploaded to Shopify successfully"
        return 0
    else
        print_error "Shopify upload failed"
        print_warning "You can manually upload $COLLECTIONS_JSON_PATH to Shopify > Online Store > Themes > Assets"
        return 1
    fi
}

# Function to create Shopify products via API
create_shopify_products() {
    local collection_name="$1"

    print_header "Creating Shopify Products"

    # Check if shopify-create-products.js exists
    if [ ! -f "scripts/shopify-create-products.js" ]; then
        print_error "scripts/shopify-create-products.js not found"
        print_warning "Skipping Shopify product creation - you can manually import the CSV"
        return 1
    fi

    # Check for Shopify API credentials in .env, config/local.env, or api/.env (same as other API scripts)
    if [ ! -f ".env" ] && [ ! -f "config/local.env" ] && [ ! -f "api/.env" ]; then
        print_error "No .env, config/local.env, or api/.env - Shopify credentials required (SHOPIFY_STORE, SHOPIFY_ACCESS_TOKEN)"
        print_warning "Skipping Shopify product creation - you can manually import the CSV"
        return 1
    fi

    print_status "Creating products for collection: $collection_name"

    # Build command with options
    local cmd="node scripts/shopify-create-products.js $collection_name"

    # Add --update flag if UPDATE_PRODUCTS is set
    if [ "$UPDATE_PRODUCTS" = true ]; then
        cmd="$cmd --update"
        print_status "Mode: Update existing products"
    else
        print_status "Mode: Create new products only (skip existing)"
    fi

    # Execute the command
    print_status "Running: $cmd"

    if $cmd; then
        print_status "Shopify product creation completed successfully"
        return 0
    else
        print_error "Shopify product creation failed"
        print_warning "You can manually import the CSV file from ./deployment/csv/"
        return 1
    fi
}

# Function to validate results
validate_results() {
    print_header "Validating Results"

    # Check if collections.json was created/updated (primary path or project data/ fallback)
    local json_to_check="$COLLECTIONS_JSON_PATH"
    if [ ! -f "$json_to_check" ] && [ -f "./data/collections.json" ]; then
        json_to_check="./data/collections.json"
        print_status "Using project data/collections.json (primary path not found)"
    fi
    if [ -f "$json_to_check" ]; then
        local collection_count=$(node -e "const data = require(process.argv[1]); console.log(data.collections.length);" "$json_to_check")
        print_status "Collections.json contains $collection_count collections"
    else
        print_error "collections.json not found at $COLLECTIONS_JSON_PATH or ./data/collections.json"
        return 1
    fi

    # Check if CSV was generated (if requested)
    if [ "$GENERATE_CSV" = true ]; then
        local csv_file
        if [ "$COLLECTION_NAME" != "all" ]; then
            csv_file="./deployment/csv/shopify-import-$COLLECTION_NAME-$(date +%Y%m%d).csv"
        else
            csv_file="./deployment/csv/shopify-import-$(date +%Y%m%d).csv"
        fi

        if [ -f "$csv_file" ]; then
            local csv_lines=$(wc -l < "$csv_file")
            print_status "Shopify CSV generated: $csv_file ($csv_lines lines)"
        fi
    fi

    print_status "Validation completed"
    return 0
}

# Parse command line arguments - NEW SIMPLIFIED FORMAT
if [[ $# -lt 1 ]]; then
    print_error "Missing required arguments"
    show_usage
    exit 1
fi

COMMAND=$1
COLLECTION_NAME=${2:-""}

# Parse optional flags
SKIP_PRODUCTS=false
UPDATE_PRODUCTS=false

# Shift past command to parse remaining options
shift

# Parse collection name and flags
while [[ $# -gt 0 ]]; do
    case "$1" in
        --skip-products)
            SKIP_PRODUCTS=true
            shift
            ;;
        --update-products)
            UPDATE_PRODUCTS=true
            shift
            ;;
        --help|help)
            show_usage
            exit 0
            ;;
        *)
            # This must be the collection name
            if [[ -z $COLLECTION_NAME ]]; then
                COLLECTION_NAME=$1
            fi
            shift
            ;;
    esac
done

# Handle help command early (also check before shift)
if [[ $COMMAND == "--help" || $COMMAND == "help" ]]; then
    show_usage
    exit 0
fi

# Check for required collection name for other commands
if [[ -z $COLLECTION_NAME ]]; then
    print_error "Missing collection name"
    show_usage
    exit 1
fi

# Validate command
case $COMMAND in
    complete)
        FORCE_DOWNLOAD=true
        DEPLOY=true
        GENERATE_CSV=true
        INCREMENTAL_MODE=false
        CREATE_PRODUCTS=true
        ;;
    metadata)
        FORCE_DOWNLOAD=false
        DEPLOY=false
        GENERATE_CSV=true
        INCREMENTAL_MODE=false
        CREATE_PRODUCTS=true
        ;;
    images)
        FORCE_DOWNLOAD=true
        DEPLOY=true
        GENERATE_CSV=false
        INCREMENTAL_MODE=false
        CREATE_PRODUCTS=false
        ;;
    add-pattern)
        FORCE_DOWNLOAD=true
        DEPLOY=true
        GENERATE_CSV=true
        INCREMENTAL_MODE=true
        CREATE_PRODUCTS=true
        ;;
    *)
        print_error "Invalid command '$COMMAND'"
        show_usage
        exit 1
        ;;
esac

# Override CREATE_PRODUCTS if --skip-products flag is set
if [ "$SKIP_PRODUCTS" = true ]; then
    CREATE_PRODUCTS=false
    print_warning "Shopify product creation will be skipped (--skip-products flag)"
fi

# Validate collection name (basic check)
if [[ $COLLECTION_NAME != "all" ]] && [[ ! $COLLECTION_NAME =~ ^[a-z-]+$ ]]; then
    print_error "Invalid collection name '$COLLECTION_NAME'"
    print_error "Collection names should contain only lowercase letters and hyphens"
    exit 1
fi

# Set derived variables
UPDATE_ALL=false
CREATE_BACKUP=false
if [[ $COLLECTION_NAME == "all" ]]; then
    UPDATE_ALL=true
fi

# Main execution
main() {
    print_header "ColorFlex Collection Update Script"
    print_status "Starting update process..."
    
    # Show configuration
    echo
    print_status "Configuration:"
    echo "  Command: $COMMAND"
    echo "  Collection: $COLLECTION_NAME"
    echo "  Force Download: $FORCE_DOWNLOAD"
    echo "  Generate CSV: $GENERATE_CSV"
    echo "  Deploy: $DEPLOY"
    echo "  Incremental Mode: $INCREMENTAL_MODE"
    echo "  Create Shopify Products: $CREATE_PRODUCTS"
    if [ "$CREATE_PRODUCTS" = true ]; then
        echo "  Update Existing Products: $UPDATE_PRODUCTS"
    fi
    echo

    # Check dependencies
    check_dependencies

    # Create backup if requested
    create_backup

    # Update collection data
    if ! update_collection_data "$COLLECTION_NAME" "$FORCE_DOWNLOAD" "$GENERATE_CSV" "$INCREMENTAL_MODE"; then
        print_error "Collection update failed"
        exit 1
    fi
    
    # Validate results
    if ! validate_results; then
        print_error "Validation failed"
        exit 1
    fi
    
    # Data lives in Synology cf-data (syncs to Backblaze). So-Animation server deploy is disabled.
    if [ "$DEPLOY" = true ]; then
        print_status "Data path: $LOCAL_DATA_PATH (Synology → Backblaze)"
        print_status "Server deploy is disabled; use COLORFLEX_DATA_BASE_URL in theme for Backblaze URL"
    fi

    # Deploy collections.json to Shopify assets (CRITICAL - needed for wallpaper page)
    if ! deploy_collections_to_shopify; then
        print_warning "collections.json not uploaded to Shopify - check output above"
        print_warning "You can manually upload data/collections.json to Shopify assets"
    fi

    # Create Shopify products via API if requested
    if [ "$CREATE_PRODUCTS" = true ]; then
        if ! create_shopify_products "$COLLECTION_NAME"; then
            print_warning "Shopify product creation encountered errors - check output above"
            print_warning "You can manually import the CSV file from ./deployment/csv/"
        fi
    fi

    print_header "Update Process Completed Successfully!"
    
    # Show summary
    echo
    print_status "Summary:"
    if [ "$INCREMENTAL_MODE" = true ]; then
        echo "  ✅ NEW patterns added to collection: $COLLECTION_NAME"
        echo "  ✅ Existing patterns preserved"
    else
        echo "  ✅ Collection data updated: $COLLECTION_NAME"
    fi
    [ "$FORCE_DOWNLOAD" = true ] && echo "  ✅ Images downloaded"
    [ "$GENERATE_CSV" = true ] && echo "  ✅ Shopify CSV generated: deployment/csv/"
    [ "$DEPLOY" = true ] && echo "  ✅ Data path: $LOCAL_DATA_PATH (Synology → Backblaze)"
    echo "  ✅ collections.json uploaded to Shopify assets"
    [ "$CREATE_BACKUP" = true ] && echo "  ✅ Backup created in: $BACKUP_DIR"
    echo

    # Show command-specific next steps
    case $COMMAND in
        complete|metadata|add-pattern)
            print_status "Next steps:"
            if [ "$CREATE_PRODUCTS" = true ]; then
                echo "  1. ✅ Shopify products created/updated via API"
                echo "  2. Verify products in Shopify admin: Products > All products"
                echo "  3. Test pattern URLs on the website"
                if [ "$INCREMENTAL_MODE" = true ]; then
                    echo ""
                    print_status "Note: Only NEW patterns were added. Existing patterns in Shopify are unaffected."
                fi
            else
                if [ "$COLLECTION_NAME" != "all" ]; then
                    echo "  1. Import ./deployment/csv/shopify-import-$COLLECTION_NAME-$(date +%Y%m%d).csv to Shopify (Products > Import)"
                    echo "  2. CSV includes Tags (e.g. $COLLECTION_NAME, pattern, wallpaper, fabric). Use them to organize:"
                    echo "     In Shopify: Products > Collections > Create collection > Automated > Add condition: Product tag equals \"$COLLECTION_NAME\""
                    echo "  3. Use metafield mapping during import for custom fields (color_flex.*)"
                else
                    echo "  1. Check ./deployment/csv/ for generated CSV file"
                    echo "  2. Import the CSV file to Shopify admin (Products > Import). Tags column organizes products by collection."
                    echo "  3. Create Smart Collections: Product tag equals <collection-name> (e.g. hip-to-be-square)"
                fi
                echo "  4. Test pattern URLs on the website"
                if [ "$INCREMENTAL_MODE" = true ]; then
                    echo ""
                    print_status "Note: Only NEW patterns were added. Existing patterns in Shopify are unaffected."
                fi
            fi
            ;;
        images)
            print_status "Next steps:"
            if [ "$COLLECTION_NAME" != "all" ]; then
                echo "  1. Verify images deployed at https://so-animation.com/colorflex/data/collections/$COLLECTION_NAME/"
            else
                echo "  1. Verify images deployed at https://so-animation.com/colorflex/data/collections/"
            fi
            echo "  2. Test thumbnail loading in ColorFlex app"
            ;;
    esac
}

# Run main function
main "$@"