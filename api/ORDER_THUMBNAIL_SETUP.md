# Order Thumbnail Extraction Setup

This system extracts thumbnails from ColorFlex orders and saves them for admin viewing.

## How It Works

1. **Customer checks out** → Order is created with `_pattern_preview` in line item properties
2. **Webhook fires** → Shopify sends order data to `/api/orders/thumbnail-extract`
3. **Thumbnail extracted** → Base64 image is extracted from `_pattern_preview` property
4. **Thumbnail saved** → Saved as image file in `order-thumbnails/` directory
5. **Optional upload** → Can upload to Shopify Files and store URL in order metafields

## Setup Instructions

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Set Environment Variables

Add to your `.env` file or environment:

```bash
SHOPIFY_STORE=f63bae-86.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_admin_api_token
PORT=3001
```

### 3. Start the API Server

```bash
npm start
# or for development:
npm run dev
```

### 4. Set Up Shopify Webhook

1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Click "Create webhook"
3. Configure:
   - **Event**: `Order creation`
   - **Format**: `JSON`
   - **URL**: `https://your-api-server.com/api/orders/thumbnail-extract`
   - **API version**: `2025-01` (or latest)
4. Click "Save webhook"

### 5. Test the Webhook

After a test order is created, check:
- `order-thumbnails/` directory for saved image files
- Order metafields in Shopify Admin (if upload enabled)
- API server logs for extraction status

## Manual Extraction

To extract thumbnails from existing orders, use the manual script:

```bash
node api/extract-existing-order-thumbnails.js [order-id]
```

Or extract from all recent orders:

```bash
node api/extract-existing-order-thumbnails.js --all [limit]
```

## File Locations

- **Thumbnails saved to**: `order-thumbnails/[order-id]-[order-number]-[collection]-[pattern]-[line-item-id].jpg`
- **Shopify Files**: Uploaded to Shopify Files (if credentials provided)
- **Order Metafields**: Stored in `colorflex.line_item_[id]_thumbnail` metafield

## Admin Viewing

Admins can view thumbnails in two ways:

1. **Order Metafields**: Check order metafields in Shopify Admin for thumbnail URLs
2. **Local Files**: Access files in `order-thumbnails/` directory
3. **Shopify Files**: View in Shopify Admin → Content → Files

## Troubleshooting

### Thumbnails not extracting
- Check API server logs for errors
- Verify webhook is firing (check webhook delivery logs in Shopify)
- Ensure `_pattern_preview` property exists in order line items

### Thumbnails too large
- Base64 images can be large - ensure API server has enough memory
- Consider compressing thumbnails before saving

### Webhook not receiving data
- Verify webhook URL is publicly accessible
- Check webhook delivery logs in Shopify Admin
- Ensure API server is running and accessible
