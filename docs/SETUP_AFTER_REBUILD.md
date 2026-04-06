# Setup after system rebuild

Use this when you've reinstalled macOS (or rebuilt the system) and need to run `update-collection.sh` or the ColorFlex build/deploy pipeline.

---

## 1. Install Node.js

The update script and build require **Node.js** (which includes `npm`).

**Option A – Homebrew (recommended on Mac):**
```bash
# Install Homebrew if you don't have it: https://brew.sh
brew install node
```

**Option B – Official installer:**  
Download the LTS version from [nodejs.org](https://nodejs.org) and run the installer.

**Verify:**
```bash
node --version   # e.g. v20.x or v22.x
npm --version
```

---

## 2. Install project dependencies

From the **project root** (`colorflex2`):

```bash
cd /Volumes/K3/jobs/colorflex2
npm install
```

This installs everything in `package.json` (webpack, babel, dotenv, Airtable, etc.) into `node_modules/`.

---

## 3. Install Shopify CLI (for theme deploy)

Required for `./deploy-shopify-cli.sh` (assets, data, sections, etc.).

**Quick option (no install):** The deploy script falls back to `npx shopify`, so you can run `./deploy-shopify-cli.sh data` (or assets, etc.) without installing Shopify CLI globally. The first run may take a moment while npx downloads the package.

**Option A – Homebrew:**
```bash
brew tap shopify/shopify && brew install shopify-cli
```

**Option B – npm global (if you get EACCES permission denied):**  
Use a user-owned directory for global npm packages so you don’t need sudo:

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install -g @shopify/cli @shopify/theme
```

**Verify:**
```bash
shopify version
```

---

## 4. Optional: config and data path

- **config/local.env** – If you use a custom data path or Airtable/Backblaze keys, restore or recreate `config/local.env` (see `update-collection.sh` or repo docs for variables).
- **Data volume** – Canonical data is on **`smb://soanimation._smb._tcp.local/jobs/cf-data`**. Mount that share, then set `COLORFLEX_DATA_PATH` in `config/local.env` to the mount path (the folder that contains `data/`). Ensure the volume is mounted so `data/collections.json` and image paths exist.

### Recreating ~/.env (if you used one)

If you had a **`~/.env`** that you sourced from `~/.zshrc` or `~/.bashrc` so env vars were available in every terminal, you can recreate it. The project does not require ~/.env; it uses **config/local.env** when you run scripts from the repo. Use ~/.env only if you want the same variables available globally (e.g. when running the Bassett server from **colorflex2-bassett** without a local config).

Suggested **~/.env** (copy values from `config/local.env` where you have them; adjust paths for your machine):

```bash
# Data folder (Synology/Backblaze mount or local). Folder that contains data/ (e.g. data/collections.json).
export COLORFLEX_DATA_PATH="/Volumes/jobs/cf-data"

# Optional: Backblaze B2 (bucket cf-data) for API uploads / public URL
# export B2_KEY_ID="your-key-id"
# export B2_APPLICATION_KEY="your-app-key"
# export B2_BUCKET_NAME="cf-data"
# export COLORFLEX_DATA_BASE_URL="https://s3.us-east-005.backblazeb2.com/cf-data"

# Bassett (when running server from colorflex2-bassett but using colorflex2's build)
export BASSETT_REPO_ROOT="/Volumes/K3/jobs/colorflex2"
export BASSETT_PSD_PATH="/Volumes/K3/jobs/saffron/colorFlex-shopify/data/mockups/bassett/sofa-with-pillows-mockup-1.psd"
export BASSETT_USE_PHOTOSHOP=1

# Optional: Shopify (for update-collection.sh, API scripts) – or keep in config/local.env only
# export SHOPIFY_STORE="your-store.myshopify.com"
# export SHOPIFY_ACCESS_TOKEN="YOUR_ADMIN_API_TOKEN"
# export SHOPIFY_THEME_PASSWORD="YOUR_THEME_PASSWORD"
```

Then in **~/.zshrc** (or **~/.bashrc**):  
`[ -f ~/.env ] && source ~/.env`

---

## 5. Run the update again

```bash
./update-collection.sh complete traditions
```

If you only need data/CSV without images or product creation:

```bash
./update-collection.sh metadata traditions
```

---

## Quick checklist

| Step              | Command / check                          |
|-------------------|------------------------------------------|
| Node.js installed | `node --version`                         |
| Dependencies      | `npm install` in project root            |
| Shopify CLI       | `shopify version` (brew or npm install)  |
| Config (optional) | `config/local.env` present if you use it |
| Data path (opt.) | Synology/volume mounted if needed        |
| Run update        | `./update-collection.sh complete traditions` |
| Deploy theme      | `./deploy-shopify-cli.sh assets` or `data` |
