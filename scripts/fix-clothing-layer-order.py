#!/usr/bin/env python3
"""
Fix Layer Order in Clothing Collections
========================================

Problem: mockupLayers array has reversed order compared to layers array
Solution: Sort mockupLayers to match the layer number order from layers array

Affected: 33 patterns across 5 clothing collections
"""

import json
import re
from datetime import datetime

def extract_layer_number(path):
    """Extract layer number from path like layer-1, layer-2, etc."""
    match = re.search(r'_layer-(\d+)', path)
    if match:
        return int(match.group(1))
    return 0

def fix_mockup_layer_order(pattern):
    """Fix mockupLayers to match the order of layers array"""
    if 'layers' not in pattern or 'mockupLayers' not in pattern:
        return False

    layers = pattern['layers']
    mockupLayers = pattern['mockupLayers']

    # Only fix if there are multiple layers
    if len(layers) < 2 or len(mockupLayers) < 2:
        return False

    # Get layer numbers from layers array
    layer_order = [extract_layer_number(l) for l in layers]

    # Get current mockup layer numbers
    current_mockup_order = [extract_layer_number(m) for m in mockupLayers]

    # Check if they match
    if layer_order == current_mockup_order:
        return False  # Already correct

    # Sort mockupLayers by layer number to match layers order
    sorted_mockup = sorted(mockupLayers, key=extract_layer_number)

    # Update pattern
    pattern['mockupLayers'] = sorted_mockup
    return True

def main():
    # Load collections.json
    input_file = '/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections.json'

    print("Loading collections.json...")
    with open(input_file, 'r') as f:
        data = json.load(f)

    # Backup original file
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = f'/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections-backup-layer-order-fix-{timestamp}.json'

    print(f"Creating backup: {backup_file}")
    with open(backup_file, 'w') as f:
        json.dump(data, f, indent=2)

    # Process clothing collections
    clothing_collections = ['bombay.clo-1', 'traditions.clo-1', 'folksie.clo-1', 'geometry.clo-1', 'ikats.clo-1']

    total_fixed = 0

    for coll_name in clothing_collections:
        for coll in data['collections']:
            if coll['name'] == coll_name:
                fixed_count = 0
                fixed_patterns = []

                for pattern in coll['patterns']:
                    if fix_mockup_layer_order(pattern):
                        fixed_count += 1
                        fixed_patterns.append(pattern['name'])

                if fixed_count > 0:
                    print(f"\n{coll_name}: Fixed {fixed_count} patterns")
                    for p in fixed_patterns:
                        print(f"  ✓ {p}")
                else:
                    print(f"\n{coll_name}: No fixes needed")

                total_fixed += fixed_count
                break

    # Save updated collections.json
    print(f"\n{'='*60}")
    print(f"Total patterns fixed: {total_fixed}")
    print(f"\nSaving updated collections.json...")

    with open(input_file, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"✅ Done! collections.json updated")
    print(f"\nBackup saved to: {backup_file}")
    print(f"\nNext step: Upload collections.json to Shopify Assets")

if __name__ == '__main__':
    main()
