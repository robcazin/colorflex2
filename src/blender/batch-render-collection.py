#!/usr/bin/env python3
"""
Batch render all patterns in a collection
Usage: python batch-render-collection.py <collection> <garment> [rotation]
Example: python batch-render-collection.py farmhouse pantsuit 0
"""

import json
import subprocess
import sys
import os
from pathlib import Path

# Configuration for PC (D:\jobs-local-pc\EC\)
COLLECTIONS_JSON = r"D:\jobs-local-pc\EC\data\collections.json"
BLEND_FILE_DRESS = r"D:\jobs-local-pc\EC\blender\dress-fabric-girl-base2.blend"
BLEND_FILE_PANTSUIT = r"D:\jobs-local-pc\EC\blender\dress-fabric-girl-base2.blend"
BLENDER_EXE = r"C:\Program Files\Blender Foundation\Blender 4.3\blender.exe"
RENDER_SCRIPT = r"D:\jobs-local-pc\EC\blender\render-single-pattern.py"

def batch_render_collection(collection_name, garment_type, rotation=0):
    """Render all patterns in a collection"""

    # Load collections.json
    print(f"📖 Loading collections from: {COLLECTIONS_JSON}")
    with open(COLLECTIONS_JSON, 'r') as f:
        data = json.load(f)

    # Find collection
    collection = None
    for coll in data.get("collections", []):
        if coll.get("name") == collection_name:
            collection = coll
            break

    if not collection:
        print(f"❌ Collection not found: {collection_name}")
        return False

    patterns = collection.get("patterns", [])
    print(f"\n🎨 Found {len(patterns)} patterns in {collection_name}")
    print(f"👗 Rendering garment: {garment_type}")
    print(f"🔄 Rotation: {rotation}°\n")

    # Choose blend file
    blend_file = BLEND_FILE_DRESS if garment_type == "dress" else BLEND_FILE_PANTSUIT
    garment_object = "dress" if garment_type == "dress" else "dress"  # Same object for both

    # Render each pattern
    success_count = 0
    failed = []

    for idx, pattern in enumerate(patterns, 1):
        pattern_name = pattern.get("name", "Unknown")
        print(f"\n{'='*60}")
        print(f"[{idx}/{len(patterns)}] Rendering: {pattern_name}")
        print(f"{'='*60}")

        # Build Blender command
        cmd = [
            BLENDER_EXE,
            blend_file,
            "--background",
            "--python", str(RENDER_SCRIPT),
            "--",
            f"--collection={collection_name}",
            f"--pattern={pattern_name}",
            f"--garment={garment_type}",
            f"--garment-object={garment_object}",
            f"--rotation={rotation}"
        ]

        try:
            result = subprocess.run(cmd, capture_output=False, check=True)
            print(f"✅ Completed: {pattern_name}")
            success_count += 1
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed: {pattern_name}")
            failed.append(pattern_name)

    # Summary
    print(f"\n{'='*60}")
    print(f"📊 BATCH RENDER COMPLETE")
    print(f"{'='*60}")
    print(f"✅ Successful: {success_count}/{len(patterns)}")
    if failed:
        print(f"❌ Failed: {len(failed)}")
        for name in failed:
            print(f"   - {name}")

    return len(failed) == 0

def main():
    if len(sys.argv) < 3:
        print("Usage: python batch-render-collection.py <collection> <garment> [rotation]")
        print("")
        print("Examples:")
        print("  python batch-render-collection.py farmhouse pantsuit 0")
        print("  python batch-render-collection.py traditions dress 90")
        print("  python batch-render-collection.py english-cottage pantsuit 180")
        sys.exit(1)

    collection = sys.argv[1]
    garment = sys.argv[2]
    rotation = int(sys.argv[3]) if len(sys.argv) > 3 else 0

    if garment not in ["dress", "pantsuit"]:
        print(f"❌ Invalid garment: {garment}")
        print("   Must be 'dress' or 'pantsuit'")
        sys.exit(1)

    success = batch_render_collection(collection, garment, rotation)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
