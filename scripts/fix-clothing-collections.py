#!/usr/bin/env python3
"""
Fix clothing collections to use parent collection layer paths
"""

import json

# Load collections.json
with open('./data/collections.json', 'r') as f:
    data = json.load(f)

collections = data.get('collections', [])

# Map of clothing collection to parent collection
clothing_to_parent = {
    'bombay.clo-1': 'bombay',
    'traditions.clo-1': 'traditions',
    'folksie.clo-1': 'folksie',
    'geometry.clo-1': 'geometry',
    'ikats.clo-1': 'ikats',
    'botanicals.clo-1': 'botanicals'
}

# Create index of parent collections with their patterns
parent_patterns = {}
for coll in collections:
    name = coll.get('name', '')
    if name in clothing_to_parent.values():
        parent_patterns[name] = {}
        for pattern in coll.get('patterns', []):
            pattern_name = pattern.get('name', '').lower().replace(' ', '-')
            parent_patterns[name][pattern_name] = pattern

print(f"Found parent collections: {list(parent_patterns.keys())}")

# Fix clothing collections
fixed_count = 0
for coll in collections:
    name = coll.get('name', '')

    if name not in clothing_to_parent:
        continue

    parent_name = clothing_to_parent[name]
    print(f"\n🔧 Fixing {name} (parent: {parent_name})")

    if parent_name not in parent_patterns:
        print(f"  ⚠️  Parent collection not found!")
        continue

    patterns = coll.get('patterns', [])

    for pattern in patterns:
        pattern_slug = pattern.get('slug', '')
        pattern_name_display = pattern.get('name', '')

        # Find matching parent pattern
        parent_pattern = parent_patterns[parent_name].get(pattern_slug)

        if not parent_pattern:
            print(f"  ⚠️  No parent pattern found for: {pattern_slug}")
            continue

        # Copy layers from parent
        parent_layers = parent_pattern.get('layers', [])

        if parent_layers:
            # Extract just the path from parent layers (they might be objects)
            if isinstance(parent_layers[0], dict):
                pattern['layers'] = [layer.get('path') for layer in parent_layers]
            else:
                pattern['layers'] = parent_layers

            print(f"  ✅ {pattern_name_display}: {len(parent_layers)} layers")
            fixed_count += 1
        else:
            print(f"  ⚠️  {pattern_name_display}: No parent layers found")

# Write back
with open('./data/collections.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Fixed {fixed_count} patterns")
print(f"📄 Updated: ./data/collections.json")
