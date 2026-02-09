#!/usr/bin/env python3
"""
Remove duplicate botanicals.clo-1 entry (keep the one with parent collection thumbnails)
"""

import json

# Load collections.json
with open('./data/collections.json', 'r') as f:
    data = json.load(f)

collections = data.get('collections', [])

# Find botanicals.clo-1 entries
botanicals_entries = []
for i, coll in enumerate(collections):
    if coll.get('name') == 'botanicals.clo-1':
        botanicals_entries.append((i, coll))

print(f"Found {len(botanicals_entries)} botanicals.clo-1 entries")

if len(botanicals_entries) > 1:
    # Check which one uses parent collection thumbnails
    for idx, (i, coll) in enumerate(botanicals_entries):
        patterns = coll.get('patterns', [])
        if patterns:
            first_thumbnail = patterns[0].get('thumbnail', '')
            print(f"Entry {idx + 1} (index {i}): {first_thumbnail}")

            # Keep the one that uses ./data/collections/botanicals/thumbnails/
            if 'botanicals/thumbnails/' in first_thumbnail:
                print(f"  → This one uses parent collection thumbnails (KEEP)")
            elif 'botanicals_clo1/thumbnails/' in first_thumbnail:
                print(f"  → This one uses duplicate path (REMOVE)")

    # Remove the first one (uses botanicals_clo1)
    print(f"\nRemoving entry at index {botanicals_entries[0][0]}")
    collections.pop(botanicals_entries[0][0])

    # Update collections
    data['collections'] = collections

    # Write back
    with open('./data/collections.json', 'w') as f:
        json.dump(data, f, indent=2)

    print(f"✅ Removed duplicate botanicals.clo-1 entry")
    print(f"📊 Total collections now: {len(collections)}")
else:
    print("No duplicates found")
