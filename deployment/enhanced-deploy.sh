#!/bin/bash

# Enhanced ColorFlex Deploy Script - Dual Resolution Pipeline
# Optimized for UI proxy files, Shopify images, and print production
# Usage: ./enhanced-deploy.sh [option]

# Server configuration
SCP="scp -P 2222 -i ../code-build/deploy_key"
RSYNC_CMD() {
    rsync -avz --progress -e "ssh -p 2222 -i ../code-build/deploy_key" "$@"
}

# Destinations
UI_SERVER="soanimat@162.241.24.65:/home4/soanimat/public_html/colorflex/"
SHOPIFY_STAGING="soanimat@162.241.24.65:/home4/soanimat/public_html/shopify-assets/"
PRINT_SERVER="soanimat@162.241.24.65:/home4/soanimat/secure/print-assets/"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Enhanced ColorFlex Deploy - Dual Resolution Pipeline${NC}"
echo -e "${BLUE}=========================================================${NC}"

# Enhanced usage with resolution-focused options
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Enhanced Deployment Options:${NC}"
    echo ""
    echo -e "${CYAN}📱 UI Assets (Customer Facing - Fast Loading)${NC}"
    echo "  -ui-assets           Deploy 400px thumbnails, 800px layers (WebP)"
    echo "  -ui-collection <name> Deploy specific collection UI assets"
    echo "  -ui-thumbnails       Deploy UI thumbnails only (400px)"
    echo "  -ui-layers           Deploy UI layers only (800px)"
    echo ""
    echo -e "${PURPLE}🛍️  Shopify Integration${NC}" 
    echo "  -shopify-images      Deploy 1200px product images (JPEG)"
    echo "  -shopify-collection <name>  Deploy specific collection to Shopify staging"
    echo "  -shopify-thumbnails  Deploy Shopify thumbnails only (1200px)"
    echo ""
    echo -e "${RED}🖨️  Print Production (Secure - Hi-Res)${NC}"
    echo "  -print-assets        Deploy print-ready files (original resolution)"
    echo "  -print-collection <name>  Deploy specific collection print files"
    echo "  -print-metadata      Deploy compositing metadata and instructions"
    echo ""
    echo -e "${GREEN}⚙️  Layer-Focused Operations${NC}"
    echo "  -layers-only         Deploy layer files (all resolutions)"
    echo "  -layers-ui           Deploy UI layer files only (800px)"
    echo "  -layers-print        Deploy print layer files only (original)"
    echo "  -compositing-data    Deploy blend modes, positioning metadata"
    echo ""
    echo -e "${BLUE}🔧 Processing & Building${NC}"
    echo "  -build-ui            Build UI assets with enhanced cf-dl"
    echo "  -build-shopify       Build Shopify-optimized images"
    echo "  -build-print         Build print-ready assets"
    echo "  -build-all           Build all resolution types"
    echo ""
    echo -e "${YELLOW}🚀 Combined Operations${NC}"
    echo "  -deploy-production   UI + Shopify (customer-facing)"
    echo "  -deploy-complete     Everything (UI + Shopify + Print + Metadata)"
    echo "  -sync-collection <name>  Full sync specific collection all resolutions"
    echo ""
    echo -e "${CYAN}💡 Examples:${NC}"
    echo "  $0 -build-ui -ui-assets           # Build and deploy UI assets"
    echo "  $0 -ui-collection botanicals      # Deploy botanicals UI only"
    echo "  $0 -shopify-collection botanicals # Deploy botanicals to Shopify"
    echo "  $0 -sync-collection botanicals    # Full sync botanicals all resolutions"
    echo "  $0 -deploy-production             # Deploy customer-facing assets"
    exit 1
fi

# Enhanced build functions with resolution targeting
build_ui_assets() {
    echo -e "${YELLOW}🔨 Building UI assets (400px thumbnails, 800px layers)...${NC}"
    node enhanced-cf-dl.js true null ui-only
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ UI assets built successfully${NC}"
    else
        echo -e "${RED}❌ UI build failed${NC}"
        exit 1
    fi
}

build_shopify_assets() {
    echo -e "${YELLOW}🔨 Building Shopify assets (1200px images)...${NC}"
    node enhanced-cf-dl.js true null shopify
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Shopify assets built successfully${NC}"
    else
        echo -e "${RED}❌ Shopify build failed${NC}"
        exit 1
    fi
}

build_print_assets() {
    echo -e "${YELLOW}🔨 Building print assets (original resolution)...${NC}"
    node enhanced-cf-dl.js true null print
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Print assets built successfully${NC}"
    else
        echo -e "${RED}❌ Print build failed${NC}"
        exit 1
    fi
}

build_all_assets() {
    echo -e "${YELLOW}🔨 Building all resolution types...${NC}"
    node enhanced-cf-dl.js true null full
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ All assets built successfully${NC}"
    else
        echo -e "${RED}❌ Full build failed${NC}"
        exit 1
    fi
}

# UI deployment functions
deploy_ui_assets() {
    echo -e "${CYAN}📱 Deploying UI assets...${NC}"
    
    if [ ! -d "src/data/collections" ]; then
        echo -e "${RED}❌ Collections directory not found${NC}"
        exit 1
    fi
    
    # Deploy thumbnails (400px WebP)
    echo -e "${BLUE}📸 Deploying UI thumbnails (400px)...${NC}"
    for collection in src/data/collections/*/; do
        if [ -d "${collection}thumbnails" ]; then
            collection_name=$(basename "$collection")
            RSYNC_CMD "${collection}thumbnails/" "${UI_SERVER}data/collections/${collection_name}/thumbnails/"
        fi
    done
    
    # Deploy layers (800px WebP)
    echo -e "${BLUE}🎨 Deploying UI layers (800px)...${NC}"
    for collection in src/data/collections/*/; do
        if [ -d "${collection}layers" ]; then
            collection_name=$(basename "$collection")
            RSYNC_CMD "${collection}layers/" "${UI_SERVER}data/collections/${collection_name}/layers/"
        fi
    done
    
    echo -e "${GREEN}✅ UI assets deployed${NC}"
}

deploy_ui_collection() {
    local collection_name=$1
    echo -e "${CYAN}🎯 Deploying UI assets for collection: ${collection_name}${NC}"
    
    local collection_path="src/data/collections/${collection_name}"
    if [ ! -d "$collection_path" ]; then
        echo -e "${RED}❌ Collection not found: $collection_path${NC}"
        exit 1
    fi
    
    # Deploy UI thumbnails
    if [ -d "${collection_path}/thumbnails" ]; then
        echo -e "${BLUE}📸 Deploying ${collection_name} thumbnails...${NC}"
        RSYNC_CMD "${collection_path}/thumbnails/" "${UI_SERVER}data/collections/${collection_name}/thumbnails/"
    fi
    
    # Deploy UI layers
    if [ -d "${collection_path}/layers" ]; then
        echo -e "${BLUE}🎨 Deploying ${collection_name} layers...${NC}"
        RSYNC_CMD "${collection_path}/layers/" "${UI_SERVER}data/collections/${collection_name}/layers/"
    fi
    
    echo -e "${GREEN}✅ Collection '${collection_name}' UI assets deployed${NC}"
}

# Shopify deployment functions
deploy_shopify_images() {
    echo -e "${PURPLE}🛍️ Deploying Shopify product images...${NC}"
    
    # Deploy Shopify thumbnails (1200px JPEG)
    echo -e "${BLUE}📸 Deploying Shopify thumbnails (1200px)...${NC}"
    for collection in src/data/collections/*/; do
        if [ -d "${collection}thumbnails-shopify" ]; then
            collection_name=$(basename "$collection")
            RSYNC_CMD "${collection}thumbnails-shopify/" "${SHOPIFY_STAGING}collections/${collection_name}/"
        fi
    done
    
    echo -e "${GREEN}✅ Shopify images deployed to staging${NC}"
    echo -e "${YELLOW}💡 Next: Upload from staging to Shopify assets via admin${NC}"
}

deploy_shopify_collection() {
    local collection_name=$1
    echo -e "${PURPLE}🎯 Deploying Shopify images for: ${collection_name}${NC}"
    
    local collection_path="src/data/collections/${collection_name}"
    if [ ! -d "$collection_path" ]; then
        echo -e "${RED}❌ Collection not found: $collection_path${NC}"
        exit 1
    fi
    
    if [ -d "${collection_path}/thumbnails-shopify" ]; then
        echo -e "${BLUE}📸 Deploying ${collection_name} Shopify images...${NC}"
        RSYNC_CMD "${collection_path}/thumbnails-shopify/" "${SHOPIFY_STAGING}collections/${collection_name}/"
        echo -e "${GREEN}✅ Collection '${collection_name}' Shopify images deployed${NC}"
    else
        echo -e "${RED}❌ No Shopify images found for ${collection_name}${NC}"
        echo -e "${YELLOW}💡 Run: node enhanced-cf-dl.js true ${collection_name} shopify${NC}"
    fi
}

# Print production deployment functions
deploy_print_assets() {
    echo -e "${RED}🖨️ Deploying print-ready assets (SECURE)...${NC}"
    
    # Deploy print layers (original resolution)
    echo -e "${BLUE}🎨 Deploying print layers (original resolution)...${NC}"
    for collection in src/data/collections/*/; do
        if [ -d "${collection}layers-print" ]; then
            collection_name=$(basename "$collection")
            RSYNC_CMD "${collection}layers-print/" "${PRINT_SERVER}collections/${collection_name}/layers/"
        fi
    done
    
    # Deploy print composites
    echo -e "${BLUE}🖼️ Deploying print composites...${NC}"
    for collection in src/data/collections/*/; do
        if [ -d "${collection}composites-print" ]; then
            collection_name=$(basename "$collection")
            RSYNC_CMD "${collection}composites-print/" "${PRINT_SERVER}collections/${collection_name}/composites/"
        fi
    done
    
    echo -e "${GREEN}✅ Print assets deployed to secure server${NC}"
}

deploy_print_metadata() {
    echo -e "${RED}📋 Deploying print metadata and compositing instructions...${NC}"
    
    # Deploy metadata
    for collection in src/data/collections/*/; do
        if [ -d "${collection}metadata" ]; then
            collection_name=$(basename "$collection")
            RSYNC_CMD "${collection}metadata/" "${PRINT_SERVER}collections/${collection_name}/metadata/"
        fi
    done
    
    echo -e "${GREEN}✅ Print metadata deployed${NC}"
}

# Layer-focused deployment functions
deploy_layers_only() {
    echo -e "${GREEN}🎨 Deploying layer files (all resolutions)...${NC}"
    
    # UI layers
    deploy_ui_layers_only
    
    # Print layers
    echo -e "${BLUE}🖨️ Deploying print layers...${NC}"
    for collection in src/data/collections/*/; do
        if [ -d "${collection}layers-print" ]; then
            collection_name=$(basename "$collection")
            RSYNC_CMD "${collection}layers-print/" "${PRINT_SERVER}collections/${collection_name}/layers/"
        fi
    done
    
    echo -e "${GREEN}✅ All layer files deployed${NC}"
}

deploy_ui_layers_only() {
    echo -e "${BLUE}🎨 Deploying UI layers only (800px)...${NC}"
    for collection in src/data/collections/*/; do
        if [ -d "${collection}layers" ]; then
            collection_name=$(basename "$collection")
            RSYNC_CMD "${collection}layers/" "${UI_SERVER}data/collections/${collection_name}/layers/"
        fi
    done
    echo -e "${GREEN}✅ UI layers deployed${NC}"
}

deploy_compositing_data() {
    echo -e "${GREEN}📐 Deploying compositing metadata...${NC}"
    
    # Deploy to both UI server (for real-time compositing) and print server
    for collection in src/data/collections/*/; do
        if [ -d "${collection}metadata" ]; then
            collection_name=$(basename "$collection")
            # UI server
            RSYNC_CMD "${collection}metadata/" "${UI_SERVER}data/collections/${collection_name}/metadata/"
            # Print server
            RSYNC_CMD "${collection}metadata/" "${PRINT_SERVER}collections/${collection_name}/metadata/"
        fi
    done
    
    echo -e "${GREEN}✅ Compositing data deployed${NC}"
}

# Combined operations
deploy_production() {
    echo -e "${YELLOW}🚀 Production deployment (UI + Shopify)...${NC}"
    echo -e "${BLUE}Customer-facing assets only${NC}"
    
    deploy_ui_assets
    deploy_shopify_images
    
    echo -e "${GREEN}🎉 Production deployment completed!${NC}"
}

deploy_complete() {
    echo -e "${YELLOW}🚀 Complete deployment (ALL resolutions)...${NC}"
    
    create_backup
    deploy_ui_assets
    deploy_shopify_images
    deploy_print_assets
    deploy_print_metadata
    deploy_compositing_data
    
    echo -e "${GREEN}🎉 Complete deployment finished!${NC}"
}

sync_collection() {
    local collection_name=$1
    echo -e "${YELLOW}🔄 Full sync for collection: ${collection_name}${NC}"
    
    # Build all resolutions for this collection
    echo -e "${BLUE}🔨 Building all resolutions...${NC}"
    node enhanced-cf-dl.js true "$collection_name" full
    
    # Deploy to all destinations
    deploy_ui_collection "$collection_name"
    deploy_shopify_collection "$collection_name"
    
    # Deploy print assets for this collection
    local collection_path="src/data/collections/${collection_name}"
    if [ -d "${collection_path}/layers-print" ]; then
        echo -e "${RED}🖨️ Deploying print assets...${NC}"
        RSYNC_CMD "${collection_path}/layers-print/" "${PRINT_SERVER}collections/${collection_name}/layers/"
    fi
    
    if [ -d "${collection_path}/metadata" ]; then
        RSYNC_CMD "${collection_path}/metadata/" "${UI_SERVER}data/collections/${collection_name}/metadata/"
        RSYNC_CMD "${collection_path}/metadata/" "${PRINT_SERVER}collections/${collection_name}/metadata/"
    fi
    
    echo -e "${GREEN}✅ Collection '${collection_name}' fully synchronized${NC}"
}

# Backup function
create_backup() {
    echo -e "${YELLOW}💾 Creating server backup...${NC}"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ssh -p 2222 -i ../code-build/deploy_key soanimat@162.241.24.65 "
        cd /home4/soanimat/public_html/
        tar -czf colorflex_backup_${TIMESTAMP}.tar.gz colorflex/
        echo 'Backup created: colorflex_backup_${TIMESTAMP}.tar.gz'
    "
}

# Command line argument processing
while [[ $# -gt 0 ]]; do
    case "$1" in
        # Building
        -build-ui)
            build_ui_assets
            shift
            ;;
        -build-shopify)
            build_shopify_assets
            shift
            ;;
        -build-print)
            build_print_assets
            shift
            ;;
        -build-all)
            build_all_assets
            shift
            ;;
        
        # UI deployment
        -ui-assets)
            deploy_ui_assets
            shift
            ;;
        -ui-collection)
            if [ -n "$2" ]; then
                deploy_ui_collection "$2"
                shift 2
            else
                echo -e "${RED}❌ Collection name required${NC}"
                exit 1
            fi
            ;;
        -ui-layers)
            deploy_ui_layers_only
            shift
            ;;
        
        # Shopify deployment
        -shopify-images)
            deploy_shopify_images
            shift
            ;;
        -shopify-collection)
            if [ -n "$2" ]; then
                deploy_shopify_collection "$2"
                shift 2
            else
                echo -e "${RED}❌ Collection name required${NC}"
                exit 1
            fi
            ;;
        
        # Print deployment
        -print-assets)
            deploy_print_assets
            shift
            ;;
        -print-metadata)
            deploy_print_metadata
            shift
            ;;
        
        # Layer-focused
        -layers-only)
            deploy_layers_only
            shift
            ;;
        -compositing-data)
            deploy_compositing_data
            shift
            ;;
        
        # Combined operations
        -deploy-production)
            deploy_production
            shift
            ;;
        -deploy-complete)
            deploy_complete
            shift
            ;;
        -sync-collection)
            if [ -n "$2" ]; then
                sync_collection "$2"
                shift 2
            else
                echo -e "${RED}❌ Collection name required${NC}"
                exit 1
            fi
            ;;
        
        # Utility
        -backup)
            create_backup
            shift
            ;;
        
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo "Run $0 without arguments to see usage."
            exit 1
            ;;
    esac
done

echo -e "${GREEN}🎉 Enhanced deployment completed!${NC}"