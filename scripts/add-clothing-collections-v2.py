#!/usr/bin/env python3
"""
Add 5 clothing collections - handles patterns without slug fields
"""

import json
import os
import glob
import re

# Load collections.json
with open('./data/collections.json', 'r') as f:
    data = json.load(f)

collections = data.get('collections', [])

# Parent collections to create clothing versions for
parent_collections = {
    'bombay': 'Bombay',
    'traditions': 'Traditions',
    'folksie': 'Folksie',
    'geometry': 'Geometry',
    'ikats': 'Ikats'
}

def extract_pattern_slug(pattern):
    """Extract pattern slug from layers path"""
    layers = pattern.get('layers', [])
    if not layers:
        return None

    # Get first layer path
    first_layer = layers[0]
    if isinstance(first_layer, dict):
        layer_path = first_layer.get('path', '')
    else:
        layer_path = first_layer

    # Extract slug from path like: ./data/collections/bombay/layers/andheri-star-flower_star-flower_layer-1.jpg
    match = re.search(r'/layers/([^/_]+)', layer_path)
    if match:
        return match.group(1)

    return None

print("🎨 Creating 5 new clothing collections...\n")

for parent_name, display_name in parent_collections.items():
    print(f"📦 Processing {parent_name}...")

    # Find parent collection
    parent_collection = None
    for coll in collections:
        if coll.get('name') == parent_name:
            parent_collection = coll
            break

    if not parent_collection:
        print(f"  ⚠️  Parent collection '{parent_name}' not found, skipping")
        continue

    # Get parent patterns
    parent_patterns = parent_collection.get('patterns', [])
    if not parent_patterns:
        print(f"  ⚠️  No patterns found in parent collection")
        continue

    print(f"  Found {len(parent_patterns)} patterns in parent collection")

    # Check for clothing layers folder
    clo_layers_dir = f"./data/collections/{parent_name}-clo1/layers"
    if not os.path.exists(clo_layers_dir):
        print(f"  ⚠️  Layers directory not found: {clo_layers_dir}")
        continue

    # Build clothing collection patterns
    clothing_patterns = []

    for parent_pattern in parent_patterns:
        pattern_name = parent_pattern.get('name')

        # Get slug from pattern or extract from layers
        pattern_slug = parent_pattern.get('slug') or extract_pattern_slug(parent_pattern)

        if not pattern_slug:
            print(f"  ⚠️  No slug found for {pattern_name}, skipping")
            continue

        # Check if mockup layers exist for this pattern
        mockup_layers = glob.glob(f"{clo_layers_dir}/{pattern_slug}_*.png")

        if not mockup_layers:
            print(f"  ⚠️  No mockup layers found for {pattern_name} (slug: {pattern_slug}), skipping")
            continue

        # Sort mockup layers by layer number
        mockup_layers.sort()
        mockup_layer_paths = [f"./data/collections/{parent_name}-clo1/layers/{os.path.basename(f)}" for f in mockup_layers]

        # Get thumbnail from parent pattern
        parent_thumbnail = parent_pattern.get('thumbnail', '')
        if not parent_thumbnail:
            # Generate thumbnail path from slug
            parent_thumbnail = f"./data/collections/{parent_name}/thumbnails/{pattern_slug}.jpg"

        # Get parent layers
        parent_layers_raw = parent_pattern.get('layers', [])

        # Convert layers to simple path strings if they're objects
        parent_layers = []
        for layer in parent_layers_raw:
            if isinstance(layer, dict):
                parent_layers.append(layer.get('path', ''))
            else:
                parent_layers.append(layer)

        # Get layer labels
        layer_labels = parent_pattern.get('layerLabels', [])

        # Build clothing pattern
        clothing_pattern = {
            "name": pattern_name,
            "slug": pattern_slug,
            "thumbnail": parent_thumbnail,
            "tilingType": parent_pattern.get('tilingType', 'straight'),
            "size": parent_pattern.get('size', [24, 24]),
            "layerLabels": layer_labels,
            "layers": parent_layers,  # Use parent collection layers for rendering
            "mockupLayers": mockup_layer_paths  # Use clothing-specific PNG layers for display
        }

        clothing_patterns.append(clothing_pattern)
        print(f"    ✅ {pattern_name}: {len(parent_layers)} layers, {len(mockup_layer_paths)} mockup layers")

    if not clothing_patterns:
        print(f"  ⚠️  No valid patterns created, skipping collection")
        continue

    # Create clothing collection
    clothing_collection = {
        "name": f"{parent_name}.clo-1",
        "displayName": f"{display_name} (CLO-1)",
        "curatedColors": parent_collection.get('curatedColors', []),
        "coordinates": parent_collection.get('coordinates', []),
        "patterns": clothing_patterns
    }

    # Add to collections
    collections.append(clothing_collection)
    print(f"  ✅ Created {parent_name}.clo-1 with {len(clothing_patterns)} patterns\n")

# Save updated collections.json
data['collections'] = collections
with open('./data/collections.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Successfully added clothing collections!")
print(f"📊 Total collections: {len(collections)}")
print(f"📄 Updated: ./data/collections.json")
print(f"\n🚀 Next steps:")
print(f"1. Upload collections.json to Shopify assets")
print(f"2. Test patterns in ColorFlex")
