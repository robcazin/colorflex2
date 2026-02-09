#!/usr/bin/env python3
"""
Generate Shopify CSV for clothing collections
"""

import json
import csv
import os

def clean_name(name):
    """Convert slug to display name"""
    return name.replace('-', ' ').title()

def get_collection_display_name(collection_name):
    """Get proper display name for collection"""
    names = {
        'bombay': 'Bombay',
        'traditions': 'Traditions',
        'folksie': 'Folksie',
        'geometry': 'Geometry',
        'ikats': 'Ikats',
        'botanicals': 'Botanicals',
        'ancient-tiles': 'Ancient Tiles'
    }
    return names.get(collection_name, collection_name.title())

def main():
    # Load collections.json
    with open('./data/collections.json', 'r') as f:
        data = json.load(f)

    collections = data.get('collections', [])

    # CSV rows
    rows = []

    # Find all clothing collections
    for coll in collections:
        coll_name = coll.get('name', '')

        # Only process .clo-1 collections
        if not coll_name.endswith('.clo-1'):
            continue

        # Extract parent collection name
        parent_name = coll_name.replace('.clo-1', '')
        collection_display = get_collection_display_name(parent_name)

        patterns = coll.get('patterns', [])

        print(f"Processing {coll_name}: {len(patterns)} patterns")

        for pattern in patterns:
            pattern_name = pattern.get('name', '')
            pattern_slug = pattern.get('slug', '')
            thumbnail_path = pattern.get('thumbnail', '')
            size = pattern.get('size', [24, 24])
            tiling_type = pattern.get('tilingType', 'straight')
            layers = pattern.get('layers', [])
            layer_labels = pattern.get('layerLabels', [])

            # Generate handle (unique identifier for Shopify)
            handle = f"{parent_name}-{pattern_slug}-clo1"

            # Build title
            title = f"{pattern_name} (Clothing)"

            # Build body/description
            body_html = f"""<p><strong>Collection:</strong> {collection_display} - Clothing Collection</p>
<p><strong>Pattern:</strong> {pattern_name}</p>
<p><strong>Size:</strong> {size[0]}" × {size[1]}"</p>
<p><strong>Tiling:</strong> {tiling_type.title()}</p>
<p><strong>Customizable Layers:</strong> {len(layers)}</p>
<ul>
{"".join(f"<li>{label}</li>" for label in layer_labels)}
</ul>
<p>This pattern is available in clothing mode with zoom controls (50%, 75%, 100%) for detailed preview.</p>
<p><em>Fully customizable with ColorFlex technology - choose your colors!</em></p>"""

            # Vendor
            vendor = "Saffron Cottage"

            # Product type
            product_type = "Wallpaper & Fabric"

            # Tags
            tags = [
                "ColorFlex",
                "Clothing",
                "Clothing Collection",
                collection_display,
                tiling_type.title(),
                f"{len(layers)} Layers"
            ]
            tags_str = ", ".join(tags)

            # Published status
            published = "TRUE"

            # Convert thumbnail path to URL
            # ./data/collections/bombay/thumbnails/pattern.jpg ->
            # https://so-animation.com/colorflex/data/collections/bombay/thumbnails/pattern.jpg
            if thumbnail_path.startswith('./'):
                thumbnail_path = thumbnail_path[2:]
            image_src = f"https://so-animation.com/colorflex/{thumbnail_path}"

            # Image alt text
            image_alt = f"{pattern_name} - {collection_display} Clothing Collection"

            # Variant data
            variant_price = "0.00"  # Free customization, pricing happens at material selection
            variant_sku = f"{parent_name.upper()}-{pattern_slug.upper()}-CLO1"
            variant_inventory = "deny"  # Don't track inventory for digital products
            variant_fulfillment = "manual"

            # SEO
            seo_title = f"{pattern_name} - {collection_display} Clothing | ColorFlex Custom Wallpaper & Fabric"
            seo_description = f"Customize {pattern_name} from the {collection_display} clothing collection. {len(layers)} customizable layers with ColorFlex technology. Preview at multiple zoom levels."

            # Metafields for ColorFlex data
            metafield_collection = f"namespace.collection||{parent_name}||string"
            metafield_pattern = f"namespace.pattern_slug||{pattern_slug}||string"
            metafield_clothing_mode = f"namespace.clothing_mode||true||boolean"
            metafield_colorflex_id = f"namespace.colorflex_id||{handle}||string"

            # Create row
            row = {
                'Handle': handle,
                'Title': title,
                'Body (HTML)': body_html,
                'Vendor': vendor,
                'Product Category': product_type,
                'Type': product_type,
                'Tags': tags_str,
                'Published': published,
                'Option1 Name': 'Material',
                'Option1 Value': 'Customizable',
                'Variant SKU': variant_sku,
                'Variant Grams': '0',
                'Variant Inventory Tracker': '',
                'Variant Inventory Policy': variant_inventory,
                'Variant Fulfillment Service': variant_fulfillment,
                'Variant Price': variant_price,
                'Variant Compare At Price': '',
                'Variant Requires Shipping': 'TRUE',
                'Variant Taxable': 'TRUE',
                'Variant Barcode': '',
                'Image Src': image_src,
                'Image Position': '1',
                'Image Alt Text': image_alt,
                'Gift Card': 'FALSE',
                'SEO Title': seo_title,
                'SEO Description': seo_description,
                'Google Shopping / Google Product Category': 'Home & Garden > Decor',
                'Google Shopping / Gender': '',
                'Google Shopping / Age Group': '',
                'Google Shopping / MPN': '',
                'Google Shopping / AdWords Grouping': '',
                'Google Shopping / AdWords Labels': '',
                'Google Shopping / Condition': 'new',
                'Google Shopping / Custom Product': 'TRUE',
                'Google Shopping / Custom Label 0': 'ColorFlex',
                'Google Shopping / Custom Label 1': collection_display,
                'Google Shopping / Custom Label 2': 'Clothing Collection',
                'Google Shopping / Custom Label 3': '',
                'Google Shopping / Custom Label 4': '',
                'Variant Image': '',
                'Variant Weight Unit': 'lb',
                'Variant Tax Code': '',
                'Cost per item': '',
                'Status': 'active'
            }

            rows.append(row)

    # Write CSV
    output_file = './deployment/csv/shopify-import-clothing-collections-20251011.csv'

    if rows:
        fieldnames = rows[0].keys()

        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

        print(f"\n✅ Generated CSV with {len(rows)} products")
        print(f"📄 Output: {output_file}")
        print(f"\nCollections breakdown:")

        # Count by collection
        from collections import Counter
        collection_counts = Counter([row['Google Shopping / Custom Label 1'] for row in rows])
        for coll, count in sorted(collection_counts.items()):
            print(f"  {coll}: {count} patterns")
    else:
        print("⚠️  No clothing collections found")

if __name__ == '__main__':
    main()
