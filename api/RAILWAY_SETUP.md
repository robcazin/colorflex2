# Railway Deployment Guide

## Step-by-Step Railway Setup

### 1. Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended) or email
3. Complete account setup

### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account if not already connected
4. Select the `colorflex2` repository
5. Railway will detect it's a Node.js project

### 3. Configure the Service
1. Railway will create a service automatically
2. Click on the service to configure it
3. Go to "Settings" tab
4. Set the **Root Directory** to: `api`
   - This tells Railway to deploy only the `api/` folder

### 4. Set Environment Variables
1. Go to the "Variables" tab in Railway
2. Add these environment variables:

```
SHOPIFY_STORE=your-store-handle
SHOPIFY_ACCESS_TOKEN=YOUR_SHOPIFY_ADMIN_API_ACCESS_TOKEN
PORT=3001
ALLOWED_ORIGINS=https://your-store.myshopify.com,https://your-custom-domain.com
```

**Important:** 
- Use a **Custom app** Admin API token with permission to create files; never commit real tokens to git
- **`SHOPIFY_STORE` must be the exact myshopify subdomain** (the `your-store` part of `https://your-store.myshopify.com/admin`). Find it under **Settings → Domains** (“Shopify domain”). It often **does not** match your custom domain (e.g. `saffroncottage.shop`). If it is wrong, GraphQL returns **404 Not Found**.
- `ALLOWED_ORIGINS` should include your store URLs (custom domain + `.myshopify.com` if needed)

### 5. Deploy
1. Railway will automatically deploy when you push to GitHub
2. Or click "Deploy" in the Railway dashboard
3. Wait for deployment to complete (usually 1-2 minutes)

### 6. Get Your Railway URL
1. Once deployed, go to the "Settings" tab
2. Under "Domains", you'll see your Railway URL
3. It will look like: `https://your-project-name.up.railway.app`
4. Copy this URL

### 7. Update Shopify Theme
1. Open `src/layout/theme.liquid`
2. Find the line with `window.COLORFLEX_API_URL`
3. Update it to:
   ```javascript
   window.COLORFLEX_API_URL = 'https://your-project-name.up.railway.app/api/upload-thumbnail';
   ```
4. Replace `your-project-name.up.railway.app` with your actual Railway URL
5. Deploy the theme to Shopify

### 8. Test
1. Add a custom pattern to cart on your Shopify store
2. Check browser console for upload messages
3. Verify the thumbnail appears in cart and checkout

## Troubleshooting

### Deployment Fails
- Check Railway logs: Go to "Deployments" → Click on failed deployment → View logs
- Make sure `package.json` is in the `api/` folder
- Verify Root Directory is set to `api`

### API Not Responding
- Check Railway logs for errors
- Verify environment variables are set correctly
- Test the health endpoint: `https://your-railway-url/api/health`

### CORS Errors
- Make sure `ALLOWED_ORIGINS` includes your store URL
- Format: `https://store.myshopify.com,https://your-store.com`

### Thumbnail Upload Fails
- Check Railway logs for API errors
- Verify `SHOPIFY_ADMIN_API_TOKEN` is correct
- Verify `SHOPIFY_STORE` is correct (just the store name, no .myshopify.com)

## Railway Free Tier Limits
- 500 hours/month free compute time
- $5 credit per month
- Should be plenty for this API server

## Custom Domain (Optional)
1. Go to Railway project → Settings → Domains
2. Add a custom domain (e.g., `api.saffroncottage.shop`)
3. Follow Railway's DNS instructions
4. Update `COLORFLEX_API_URL` in theme.liquid with your custom domain
