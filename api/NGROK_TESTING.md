# Testing with ngrok (Quick Local Testing)

## Step 1: Install ngrok

**Option A: Homebrew (Mac)**
```bash
brew install ngrok/ngrok/ngrok
```

**Option B: Download**
1. Go to https://ngrok.com/download
2. Download for Mac
3. Unzip and move to `/usr/local/bin/` or add to PATH

## Step 2: Start ngrok

In a new terminal window (keep your API server running on port 3001):

```bash
ngrok http 3001
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3001
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

## Step 3: Update theme.liquid Temporarily

Update `src/layout/theme.liquid`:

```javascript
window.COLORFLEX_API_URL = 'https://abc123.ngrok-free.app/api/upload-thumbnail';
```

Replace `abc123.ngrok-free.app` with your actual ngrok URL.

## Step 4: Deploy Theme

Deploy the updated theme to Shopify.

## Step 5: Test

1. Add a custom pattern to cart
2. Go through checkout
3. Check if thumbnail appears

## Step 6: Clean Up

After testing, either:
- Deploy to Railway (permanent solution)
- Or keep ngrok running for more testing

**Note:** ngrok free tier URLs change each time you restart ngrok. For permanent solution, use Railway.
