import os, json, copy

CONFIG = {
    "collections_json": "/Volumes/K3/jobs/saffron/color-flex/data/local-collections.json",
    "render_root":       "/Volumes/K3/jobs/saffron/color-flex/data/clothing/patterns",
    "source_collection": "botanicals",            # clone baseline from here
    "new_collection":    "botanicals.clo-1",      # output name
    "new_display":       "Botanicals (CLO-1)",
    "mockup":            "clothing",
    "mockup_image":      "/assets/mockups/clothing/clo-1.jpg"
}

def slugify(s): return s.lower().replace(" ","-")

def load_json(path):
    with open(path, "r") as f:
        return json.load(f)

def save_json(path, obj):
    with open(path, "w") as f:
        json.dump(obj, f, indent=2)

def find_collection(doc, name):
    if doc.get("name") == name:
        return doc
    for c in doc.get("collections", []):
        if c.get("name") == name:
            return c
    return None

def upsert_collection(doc, coll):
    # If root is a single collection
    if doc.get("name") and not doc.get("collections"):
        # turn into multi-collection holder
        doc = {"collections":[doc]}
    # upsert by name
    if "collections" not in doc:
        doc["collections"] = []
    for i,c in enumerate(doc["collections"]):
        if c.get("name") == coll["name"]:
            doc["collections"][i] = coll
            return doc
    doc["collections"].append(coll)
    return doc

def read_manifest(pattern_slug):
    mpath = os.path.join(CONFIG["render_root"], pattern_slug, "manifest.json")
    if not os.path.exists(mpath):
        return None
    with open(mpath, "r") as f:
        return json.load(f)

def main():
    doc = load_json(CONFIG["collections_json"])
    src = find_collection(doc, CONFIG["source_collection"])
    if not src:
        raise SystemExit(f"Source collection '{CONFIG['source_collection']}' not found in JSON.")

    # Build new collection by cloning high-level props
    new_coll = {
        "name": CONFIG["new_collection"],
        "displayName": CONFIG["new_display"],
        "mockup": CONFIG["mockup"],
        "mockupImage": CONFIG["mockup_image"],
        "patterns": []
    }

    # Walk source patterns and replace their layer paths from manifests
    for p in src.get("patterns", []):
        name = p.get("name")
        slug = p.get("slug") or slugify(name)
        tiling = p.get("tilingType", "standard")

        mani = read_manifest(slug)
        if not mani:
            print(f"⚠️  No manifest for '{name}' at {os.path.join(CONFIG['render_root'], slug)} — skipping.")
            continue

        # Use labels & files from manifest to ensure exact filenames
        layers_out = []
        labels = []
        for layer in mani.get("layers", []):
            labels.append(layer.get("label"))
            layers_out.append(
                os.path.join("clothing", "patterns", slug, layer.get("filename"))
                .replace("\\","/")
            )

        new_coll["patterns"].append({
            "name": name,
            "slug": slug,
            "tilingType": tiling,
            "layerLabels": labels,
            "layers": layers_out
        })

    # Insert/replace new collection in the JSON document
    updated = upsert_collection(doc, new_coll)
    save_json(CONFIG["collections_json"], updated)

    print(f"✅ Inserted/updated '{CONFIG['new_collection']}' with {len(new_coll['patterns'])} patterns.")
    print(f"📁 Saved: {CONFIG['collections_json']}")

if __name__ == "__main__":
    main()
