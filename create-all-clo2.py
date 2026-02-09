#!/usr/bin/env python3
"""
Clone all CLO-1 collections to CLO-2 format
"""
import json

# Load collections.json
with open('/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections.json', 'r') as f:
    data = json.load(f)

# Collections to clone
clo1_names = [
    'botanicals.clo-1',
    'bombay.clo-1',
    'traditions.clo-1',
    'folksie.clo-1',
    'geometry.clo-1',
    'ikats.clo-1'
]

clo2_collections = []

for clo1_name in clo1_names:
    # Find the CLO-1 collection
    clo1_coll = None
    clo1_index = None
    for i, coll in enumerate(data['collections']):
        if coll['name'] == clo1_name:
            clo1_coll = coll
            clo1_index = i
            break

    if not clo1_coll:
        print(f"❌ Could not find {clo1_name}")
        continue

    # Clone it
    clo2_coll = json.loads(json.dumps(clo1_coll))

    # Get base name (e.g., "botanicals" from "botanicals.clo-1")
    base_name = clo1_name.replace('.clo-1', '')

    # Update collection metadata
    clo2_coll['name'] = f"{base_name}.clo-2"
    clo2_coll['displayName'] = clo2_coll['displayName'].replace('(CLO-1)', '(CLO-2)')

    # Update all pattern paths
    for pattern in clo2_coll['patterns']:
        # Update thumbnail paths
        if 'thumbnail' in pattern:
            # Change from botanicals_clo1 to botanicals-clo2
            pattern['thumbnail'] = pattern['thumbnail'].replace(f'{base_name}_clo1', f'{base_name}-clo2')

        # Update mockupLayers paths
        if 'mockupLayers' in pattern:
            pattern['mockupLayers'] = [
                layer.replace(f'{base_name}_clo1', f'{base_name}-clo2')
                for layer in pattern['mockupLayers']
            ]

        # layers paths stay the same (they point to base collection JPGs)

    clo2_collections.append({
        'collection': clo2_coll,
        'insert_after_index': clo1_index
    })

    print(f"✅ Cloned {clo1_name} → {clo2_coll['name']} ({len(clo2_coll['patterns'])} patterns)")

# Insert CLO-2 collections after their CLO-1 counterparts
# Insert in reverse order so indices don't shift
for item in reversed(clo2_collections):
    insert_index = item['insert_after_index'] + 1
    data['collections'].insert(insert_index, item['collection'])

# Save
with open('/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Created {len(clo2_collections)} CLO-2 collections")
print(f"Total collections now: {len(data['collections'])}")
