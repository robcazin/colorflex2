#!/usr/bin/env python3
import csv
import json

# Read the collections data
with open('src/data/collections.json', 'r') as f:
    data = json.load(f)
    collections = data['collections']

# Find New Orleans collection
new_orleans = None
for collection in collections:
    if collection['name'].lower() == 'new-orleans':
        new_orleans = collection
        break

if not new_orleans:
    print("New Orleans collection not found")
    exit(1)

# Create clean CSV with UTF-8 encoding and proper escaping
csv_file = 'deployment/csv/shopify-import-new-orleans-clean.csv'

with open(csv_file, 'w', newline='\n', encoding='utf-8') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    
    # Write header
    header = [
        'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
        'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Price',
        'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable',
        'Variant Inventory Policy', 'Image Src', 'Image Position', 'Image Alt Text'
    ]
    writer.writerow(header)
    
    # Write each pattern
    for pattern in new_orleans['patterns']:
        handle = f"new-orleans-{pattern['name'].lower().replace(' ', '-').replace('&', 'and')}"
        title = pattern['name']
        body = f"<p>{pattern['name']} pattern from our New Orleans collection. Pattern #{pattern['number']}.</p>"
        vendor = 'Saffron Cottage'
        type_val = 'ColorFlex Pattern'
        tags = 'new-orleans, pattern, wallpaper, fabric'
        published = 'TRUE'
        option1_name = 'Application'
        option1_value = 'Pattern'
        variant_sku = pattern['number']
        variant_price = '89.99'
        variant_compare = ''
        variant_shipping = 'TRUE'
        variant_taxable = 'TRUE'
        variant_policy = 'continue'
        # Clean up thumbnail path - remove leading ./ if present
        thumbnail_path = pattern['thumbnail'].replace('./data/collections/new-orleans/thumbnails/', '')
        image_src = f"https://so-animation.com/colorflex/data/collections/new-orleans/thumbnails/{thumbnail_path}"
        image_position = '1'
        image_alt = f"{pattern['name']} pattern thumbnail"
        
        row = [
            handle, title, body, vendor, type_val, tags, published,
            option1_name, option1_value, variant_sku, variant_price,
            variant_compare, variant_shipping, variant_taxable,
            variant_policy, image_src, image_position, image_alt
        ]
        writer.writerow(row)

print(f"✅ Clean CSV created: {csv_file}")