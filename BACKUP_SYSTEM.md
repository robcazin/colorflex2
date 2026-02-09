# ColorFlex Backup System

## Overview

The ColorFlex project has two backup systems:
1. **Asset Backup System** - For backing up minified JS/CSS files before deployment
2. **Full Backup System** - For comprehensive backups of all source code and data

## Full Backup System

### Full Backup Script
**Location:** `scripts/full-backup.sh`

Creates a comprehensive backup of:
- All source code (`src/` directory)
- All data files (`data/` directory)
- Documentation (`docs/` directory)
- Scripts (`scripts/` directory)
- Configuration files (`config/` directory)
- Root-level important files

### Usage
```bash
bash scripts/full-backup.sh
```

### Backup Location
Backups are stored in `backups/full-backup-YYYY-MM-DD_HH-MM-SS/`

Each backup includes:
- Complete directory structure
- `BACKUP_MANIFEST.txt` with backup details
- Size information

### When to Use Full Backup
- Before major feature implementations
- Before significant refactoring
- After completing major milestones
- Before deploying to production
- Regular scheduled backups (recommended weekly)

## Asset Backup System

Quick local backup system for testing deployments without Git commits.

## Quick Start

### Automatic Backups
Backups are **automatically created** before deploying assets:
```bash
./deploy-shopify-cli.sh assets      # Auto-creates backup before deploying
./deploy-shopify-cli.sh furniture   # Auto-creates backup before deploying
./deploy-shopify-cli.sh clothing   # Auto-creates backup before deploying
```

### Manual Backup
Create a backup manually with a description:
```bash
./scripts/backup-assets.sh create "Before testing furniture fix"
```

### List Backups
```bash
./scripts/backup-assets.sh list        # Show last 10 backups
./scripts/backup-assets.sh list 5      # Show last 5 backups
```

### Restore from Backup
```bash
# Restore from latest backup
./scripts/backup-assets.sh restore latest

# Restore from specific backup
./scripts/backup-assets.sh restore 20250115_143022_assets
```

### Clean Old Backups
```bash
./scripts/backup-assets.sh clean       # Remove backups older than 30 days
./scripts/backup-assets.sh clean 7     # Remove backups older than 7 days
```

## How It Works

1. **Backup Location**: `./backups/` directory (git-ignored)
2. **Backup Format**: Timestamped folders (e.g., `20250115_143022_assets`)
3. **Files Backed Up**:
   - `color-flex-core.min.js`
   - `color-flex-furniture.min.js`
   - `color-flex-clothing.min.js`
   - `color-flex-furniture-simple.min.js`
   - `color-flex-clothing-simple.min.js`
   - `unified-pattern-modal.js`
   - `ProductConfigurationFlow.js`
   - `colorflex-simple-mode.css`

4. **Metadata**: Each backup includes `_metadata.json` with:
   - Timestamp
   - Description (if provided)
   - Git commit hash (if available)
   - Git branch (if available)

## Workflow Example

```bash
# 1. Build your changes
npm run build:furniture

# 2. Deploy (backup created automatically)
./deploy-shopify-cli.sh assets

# 3. Test on Shopify
# ... if something breaks ...

# 4. Quick rollback (no Git needed!)
./scripts/backup-assets.sh restore latest

# 5. Re-deploy the old version
./deploy-shopify-cli.sh assets
```

## Tips

- **Always test after deploying** - backups are created before deployment, so you can rollback immediately
- **Use descriptive backup names** when creating manually: `./scripts/backup-assets.sh create "Before multi-res fix"`
- **Clean old backups regularly** to save disk space: `./scripts/backup-assets.sh clean 7`
- **The `latest` symlink** always points to the most recent backup for quick access

## Integration with Deploy Script

The deploy script automatically:
1. Creates a backup before deploying assets
2. Includes timestamp and deployment type in backup description
3. Shows backup info after creation

You can skip the backup by modifying the deploy script, but it's recommended to keep it enabled for safety.
