#!/bin/bash

# ColorFlex-Shopify Deploy Script
# Usage: ./deploy.sh [option]
# 
# Deploys ColorFlex application and collection data to production server
# Based on your original deploy script with collections support

# SSH key path (override with COLORFLEX_DEPLOY_KEY)
# Fallback: grab from colorFlex-shopify dev folder (saffron/code-build)
SSH_KEY="${COLORFLEX_DEPLOY_KEY:-../code-build/deploy_key}"
if [ ! -f "$SSH_KEY" ] && [ -z "${COLORFLEX_DEPLOY_KEY}" ]; then
    DEV_KEY="/Volumes/K3/jobs/saffron/code-build/deploy_key"
    if [ -f "$DEV_KEY" ]; then
        SSH_KEY="$DEV_KEY"
    fi
fi

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${YELLOW}⚠️  SSH key not found at: $SSH_KEY${NC}"
    echo -e "${YELLOW}⚠️  Skipping server deployment (no password prompts)${NC}"
    echo -e "${YELLOW}💡 Set COLORFLEX_DEPLOY_KEY=/path/to/key to use your key${NC}"
    echo -e "${YELLOW}   Or COLORFLEX_SKIP_DEPLOY=true to suppress this message${NC}"
    if [ "${COLORFLEX_SKIP_DEPLOY}" != "true" ]; then
        exit 0
    fi
fi

# SCP command base and destination
SCP="scp -P 2222 -i $SSH_KEY"
DEST="soanimat@162.241.24.65:/home4/soanimat/public_html/colorflex/"
DATA_DEST="soanimat@162.241.24.65:/home4/soanimat/public_html/colorflex/data/"
IMG_DEST="soanimat@162.241.24.65:/home4/soanimat/public_html/colorflex/img/"
COLLECTIONS_DEST="soanimat@162.241.24.65:/home4/soanimat/public_html/colorflex/data/collections/"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 ColorFlex-Shopify Deploy Script${NC}"
echo -e "${BLUE}===================================${NC}"

# Check if an argument is provided, otherwise show usage
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage: $0 [option]${NC}"
    echo ""
    echo "📦 Application Deployment:"
    echo "  -app     Deploy built application files (dist/)"
    echo "  -css     Deploy CSS files only"
    echo ""
    echo "📊 Data Deployment:"
    echo "  -data       Deploy server data files (colors.json, furniture-config.json)"
    echo "  -collections Deploy collections.json from src/assets/ to server (colorFlex data)"
    echo "  -csv        Deploy Shopify CSV files"  
    echo "  -shopify    Upload collections.json to Shopify assets (manual step required)"
    echo ""
    echo "🖼️  Collections Deployment:"
    echo "  -images  Deploy all collection images and assets"
    echo "  -collection <name>  Deploy specific collection images"
    echo ""
    echo "🖼️  ColorFlex img (so-animation.com/colorflex/img/):"
    echo "  -img     Deploy src/img/ folder (e.g. modal-tiled-bg.png) to server"
    echo ""
    echo "🔧 Utility Options:"
    echo "  -build   Build application before deployment"
    echo "  -all     Deploy everything (build + app + data + images)"
    echo "  -backup  Create server backup before deployment"
    echo ""
    echo "💡 Examples:"
    echo "  $0 -build -app     # Build and deploy application"
    echo "  $0 -collection botanicals  # Deploy botanicals images only"
    echo "  $0 -img           # Deploy src/img/ (tiled background, etc.) to server"
    echo "  $0 -collections   # Deploy collections.json (standard/colorFlex pattern fixes) to server"
    echo "  $0 -all           # Full deployment"
    exit 1
fi

# Function to check if build exists
check_build() {
    if [ ! -d "dist" ] || [ ! -f "dist/color-flex-core.min.js" ]; then
        echo -e "${RED}❌ No build found in dist/. Run with -build first.${NC}"
        exit 1
    fi
}

# Function to create server backup
create_backup() {
    echo -e "${YELLOW}💾 Creating server backup...${NC}"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ssh -p 2222 -i "$SSH_KEY" soanimat@162.241.24.65 "
        cd /home4/soanimat/public_html/
        tar -czf CF8_backup_${TIMESTAMP}.tar.gz CF8/
        echo 'Backup created: CF8_backup_${TIMESTAMP}.tar.gz'
    "
}

# Function to build application
build_app() {
    echo -e "${YELLOW}🔨 Building application with CSS protection...${NC}"
    npm run build:protected
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build completed successfully${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
}

# Function to deploy application files
deploy_app() {
    check_build
    echo -e "${YELLOW}📦 Deploying application files...${NC}"
    $SCP dist/color-flex-core.min.js $DEST
    $SCP dist/color-flex-core.min.css $DEST
    if [ -f "dist/color-flex-core.min.js.LICENSE.txt" ]; then
        $SCP dist/color-flex-core.min.js.LICENSE.txt $DEST
    fi
    echo -e "${GREEN}✅ Application files deployed${NC}"
}

# Function to deploy CSS only
deploy_css() {
    check_build
    echo -e "${YELLOW}🎨 Deploying CSS files...${NC}"
    $SCP dist/color-flex-core.min.css $DEST
    echo -e "${GREEN}✅ CSS files deployed${NC}"
}

# Function to deploy data files
deploy_data() {
    echo -e "${YELLOW}📊 Deploying server data files...${NC}"
    echo -e "${BLUE}ℹ️  NOTE: collections.json is deployed to server, Shopify assets upload is manual${NC}"

    if [ -f "data/collections.json" ]; then
        $SCP data/collections.json $DATA_DEST
        echo -e "${GREEN}✅ collections.json deployed${NC}"
    fi

    if [ -f "data/colors.json" ]; then
        $SCP data/colors.json $DATA_DEST
        echo -e "${GREEN}✅ colors.json deployed${NC}"
    fi

    if [ -f "data/furniture-config.json" ]; then
        # Fix furniture config paths for server
        sed 's|"\.\/data\/|"\/colorflex\/data\/|g' data/furniture-config.json > /tmp/furniture-config.json
        $SCP /tmp/furniture-config.json $DATA_DEST
        rm -f /tmp/furniture-config.json
        echo -e "${GREEN}✅ furniture-config.json deployed with path fixes${NC}"
    fi
}

# Function to deploy Shopify CSV
deploy_csv() {
    echo -e "${YELLOW}📋 Deploying Shopify CSV files...${NC}"
    if [ -f "data/shopify-import.csv" ]; then
        $SCP data/shopify-import.csv $DATA_DEST
        echo -e "${GREEN}✅ shopify-import.csv deployed${NC}"
    else
        echo -e "${RED}❌ shopify-import.csv not found. Generate it with: node data/cf-dl.js false null shopify${NC}"
    fi
}

# Function to deploy all collection images
deploy_all_images() {
    echo -e "${YELLOW}🖼️  Deploying all collection images...${NC}"
    if [ ! -d "data/collections" ]; then
        echo -e "${RED}❌ Collections directory not found: data/collections${NC}"
        exit 1
    fi
    
    # Use rsync for efficient directory sync
    rsync -avz --progress -e "ssh -p 2222 -i $SSH_KEY" \
          data/collections/ \
          soanimat@162.241.24.65:/home4/soanimat/public_html/colorflex/data/collections/
    
    echo -e "${GREEN}✅ All collection images deployed${NC}"
}

# Function to deploy specific collection
deploy_collection() {
    local collection_name=$1
    echo -e "${YELLOW}🎯 Deploying collection: ${collection_name}${NC}"
    
    # if [ ! -d "manual-deploy/assets/data/collections/${collection_name}" ]; then
    if [ ! -d "data/collections/${collection_name}" ]; then
        echo -e "${RED}❌ Collection not found: data/assets/data/collections/${collection_name}${NC}"
        exit 1
    fi
    
    # Use rsync for efficient sync
    rsync -avz --progress -e "ssh -p 2222 -i $SSH_KEY" \
          data/collections/${collection_name}/ \
          soanimat@162.241.24.65:/home4/soanimat/public_html/colorflex/data/collections/${collection_name}/
    
    echo -e "${GREEN}✅ Collection '${collection_name}' deployed${NC}"
}

# Function to deploy collections.json from theme assets to server
deploy_collections_json() {
    echo -e "${YELLOW}📋 Deploying collections.json to server (so-animation.com/colorflex/data/)...${NC}"
    if [ ! -f "src/assets/collections.json" ]; then
        echo -e "${RED}❌ src/assets/collections.json not found.${NC}"
        exit 1
    fi
    $SCP src/assets/collections.json "$DATA_DEST"
    echo -e "${GREEN}✅ collections.json deployed${NC}"
}

# Function to deploy src/img/ folder to server (modal tiles, chameleon, etc.)
deploy_img() {
    echo -e "${YELLOW}🖼️  Deploying src/img/ to server (so-animation.com/colorflex/img/)...${NC}"
    if [ ! -d "src/img" ]; then
        echo -e "${RED}❌ Local src/img/ folder not found. Create it and add files (e.g. modal-tiled-bg.png).${NC}"
        exit 1
    fi
    rsync -avz --progress -e "ssh -p 2222 -i $SSH_KEY" \
          src/img/ \
          "$IMG_DEST"
    echo -e "${GREEN}✅ src/img/ deployed${NC}"
}

# Function to prepare collections.json for Shopify assets upload
prepare_shopify_upload() {
    echo -e "${YELLOW}📤 Preparing collections.json for Shopify assets upload...${NC}"
    
    if [ ! -f "data/collections.json" ]; then
        echo -e "${RED}❌ collections.json not found${NC}"
        exit 1
    fi
    
    # Create Shopify-ready version with correct image paths
    echo -e "${BLUE}🔧 Fixing image paths for Shopify assets...${NC}"
    
    # Since data is now at ./data/, paths are already correct for Shopify
    # Just copy the file to collections-shopify.json for backward compatibility
    cp data/collections.json ./collections-shopify.json
    
    echo -e "${GREEN}✅ Shopify-ready collections.json created: ./collections-shopify.json${NC}"
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Go to your Shopify admin → Online Store → Themes"
    echo "2. Click 'Actions' → 'Edit code' on your active theme"
    echo "3. In the Assets section, upload ./collections-shopify.json as 'collections.json'"
    echo "4. The app will automatically fetch from Shopify CDN"
    echo ""
    echo -e "${YELLOW}💡 File ready for upload: ./collections-shopify.json${NC}"
}

# Handle command line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -build)
            build_app
            shift
            ;;
        -backup)
            create_backup
            shift
            ;;
        -app)
            deploy_app
            shift
            ;;
        -css)
            deploy_css
            shift
            ;;
        -data)
            deploy_data
            shift
            ;;
        -collections)
            deploy_collections_json
            shift
            ;;
        -csv)
            deploy_csv
            shift
            ;;
        -images)
            deploy_all_images
            shift
            ;;
        -img)
            deploy_img
            shift
            ;;
        -collection)
            if [ -n "$2" ]; then
                deploy_collection "$2"
                shift 2
            else
                echo -e "${RED}❌ Collection name required after -collection${NC}"
                exit 1
            fi
            ;;
        -shopify)
            prepare_shopify_upload
            shift
            ;;
        -all)
            echo -e "${BLUE}🚀 Full deployment starting...${NC}"
            create_backup
            build_app
            deploy_app
            deploy_data
            deploy_csv
            deploy_all_images
            echo -e "${GREEN}🎉 Full deployment completed!${NC}"
            shift
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo "Run $0 without arguments to see usage."
            exit 1
            ;;
    esac
done

echo -e "${GREEN}🎉 Deployment completed!${NC}"