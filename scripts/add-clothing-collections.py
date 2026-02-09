#!/usr/bin/env python3
"""
Generate clothing collection entries for collections.json
Uses parent collection data with clothing-specific layer paths
"""

import json
import os
import glob
from collections import defaultdict

# Collections to add clothing variants for
CLOTHING_COLLECTIONS = [
    'bombay',
    'traditions',
    'folksie',
    'geometry',
    'ikats',
    'botanicals',
    'ancient-tiles'
]

def get_pattern_layers(clo_layers_dir):
    """
    Parse layer files to group them by pattern name
    Returns: {pattern_name: [layer_files]}
    """
    pattern_layers = defaultdict(list)

    layer_files = glob.glob(os.path.join(clo_layers_dir, '*.png'))
    layer_files += glob.glob(os.path.join(clo_layers_dir, '*.jpg'))

    for layer_file in sorted(layer_files):
        basename = os.path.basename(layer_file)
        # Extract pattern name (everything before the last underscore + layer number)
        # Example: andheri-star-flower_star-flower_layer-1.png
        parts = basename.rsplit('_layer-', 1)
        if len(parts) == 2:
            pattern_part = parts[0]
            # Get the main pattern name (first part before first underscore describing the layer)
            pattern_name = pattern_part.split('_')[0]
            pattern_layers[pattern_name].append(layer_file)

    return pattern_layers

def create_clothing_collection(parent_collection, collection_name):
    """
    Create a clothing collection entry based on parent collection
    """
    clo_name = f"{collection_name}-clo1"
    clo_layers_dir = f"./data/collections/{clo_name}/layers/"

    # Check if clothing layers directory exists
    if not os.path.exists(clo_layers_dir.replace('./', '')):
        print(f"⚠️  Skipping {clo_name}: layers directory not found")
        return None

    # Get pattern layers
    pattern_layers = get_pattern_layers(clo_layers_dir.replace('./', ''))

    if not pattern_layers:
        print(f"⚠️  Skipping {clo_name}: no layer files found")
        return None

    # Create clothing collection entry
    clothing_collection = {
        "name": f"{collection_name}.clo-1",
        "displayName": f"{parent_collection.get('displayName', collection_name.title())} (CLO-1)",
        "curatedColors": parent_collection.get('curatedColors', []),
        "coordinates": parent_collection.get('coordinates', []),
        "patterns": []
    }

    # Create pattern entries
    for pattern_name in sorted(pattern_layers.keys()):
        layer_files = pattern_layers[pattern_name]

        # Find matching pattern in parent collection for metadata
        parent_pattern = None
        for p in parent_collection.get('patterns', []):
            if p.get('name', '').lower().replace(' ', '-').replace('_', '-') == pattern_name:
                parent_pattern = p
                break

        # Build layer labels from file names
        layer_labels = []
        layers = []
        for layer_file in sorted(layer_files):
            basename = os.path.basename(layer_file)
            # Extract layer description
            parts = basename.rsplit('_layer-', 1)
            if len(parts) == 2:
                layer_desc = parts[0].split('_', 1)
                if len(layer_desc) > 1:
                    label = layer_desc[1].replace('-', ' ').replace('_', ' ').title()
                    layer_labels.append(label)
                else:
                    layer_labels.append(f"Layer {len(layers) + 1}")

            layers.append(os.path.join(clo_layers_dir, basename))

        # Create pattern entry
        pattern_entry = {
            "name": pattern_name.replace('-', ' ').title(),
            "slug": pattern_name,
            "thumbnail": f"./data/collections/{collection_name}/thumbnails/{pattern_name}.jpg",
            "tilingType": parent_pattern.get('tilingType', 'straight') if parent_pattern else "straight",
            "size": parent_pattern.get('size', [24, 24]) if parent_pattern else [24, 24],
            "layerLabels": layer_labels,
            "layers": layers
        }

        clothing_collection["patterns"].append(pattern_entry)

    print(f"✅ Created {clo_name} with {len(clothing_collection['patterns'])} patterns")
    return clothing_collection

def main():
    # Load collections.json
    collections_file = './data/collections.json'

    with open(collections_file, 'r') as f:
        data = json.load(f)

    collections = data.get('collections', [])

    # Create index of parent collections
    parent_collections = {}
    for coll in collections:
        name = coll.get('name', '')
        if name in CLOTHING_COLLECTIONS:
            parent_collections[name] = coll

    # Generate clothing collections
    clothing_collections = []
    for collection_name in CLOTHING_COLLECTIONS:
        if collection_name not in parent_collections:
            print(f"⚠️  Parent collection '{collection_name}' not found")
            continue

        parent = parent_collections[collection_name]
        clothing_coll = create_clothing_collection(parent, collection_name)

        if clothing_coll:
            clothing_collections.append(clothing_coll)

    # Add clothing collections to data
    data['collections'].extend(clothing_collections)

    # Write updated collections.json
    output_file = './data/collections-with-clothing.json'
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n✅ Generated {len(clothing_collections)} clothing collections")
    print(f"📄 Output saved to: {output_file}")
    print(f"\nTo apply changes:")
    print(f"  mv ./data/collections.json ./data/collections-backup.json")
    print(f"  mv {output_file} ./data/collections.json")

if __name__ == '__main__':
    main()
