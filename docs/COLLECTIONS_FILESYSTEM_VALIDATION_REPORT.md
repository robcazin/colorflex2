# Collections.json to Filesystem Validation Report

**Date:** 2026-01-22  
**Validation Script:** `scripts/validate-collections-filesystem.js`

## Summary

✅ **99.7% Success Rate** - 13,676 out of 13,716 files found

### Statistics
- **Total Collections:** 44
- **Total Patterns:** 714
- **Files Checked:** 13,716
- **Files Found:** 13,676
- **Files Missing:** 40

## Issues Found

### 1. Missing Collection Thumbnail (1 file)
- **oceana**: `/data/collections/oceana/oceana-thumb.jpg`
  - Collection exists but thumbnail file is missing

### 2. Missing Mockup Layers (39 files)
All from **coverlets.fur-1** collection, using old furniture path format:

**Old Format (in collections.json):**
```
data/furniture/sofa-capitol/patterns/coverlets/charleston-bay/charleston-bay_shadows_layer-1.png
```

**Expected Format (actual filesystem):**
```
data/collections/coverlets-fur/layers/Sofa-Capitol/charleston-bay_shadows_layer-1_scale-1.0.png
```

**Affected Patterns:**
- Charleston Bay (2 layers)
- Franklin (4 layers)
- Oxford (4 layers)
- ... and 29 more

**Root Cause:** Coverlets collection uses the old furniture path structure (`data/furniture/sofa-capitol/patterns/...`) instead of the new structure (`data/collections/{collection}-fur/layers/...`).

### 3. Variant Collection Directory Naming (12 directories)

**Note:** This is NOT an error - it's expected behavior.

Collections.json uses dot notation (`.fur-1`) but filesystem uses hyphens (`-fur`):
- JSON: `bombay.fur-1`, `folksie.fur-1`, etc.
- Filesystem: `bombay-fur`, `folksie-fur`, etc.

The validation script correctly maps `.fur-1` → `-fur` when checking directories.

## Key Findings

### ✅ What's Working
1. **99.7% of all files are present and correctly referenced**
2. **All base collections** have their files in the correct locations
3. **Most variant collections** (clothing and furniture) have correct paths
4. **Pattern layers** (for pattern preview) are all present
5. **Thumbnails** are mostly present (only 1 missing)

### ⚠️ What Needs Attention

1. **Coverlets Furniture Collection**
   - Uses old path format in `collections.json`
   - Needs to be updated to new format OR files need to be moved to old location
   - Affects 39 mockup layer files

2. **Oceana Collection**
   - Missing collection thumbnail
   - Easy fix: create or download the thumbnail

## Recommendations

### Immediate Actions

1. **Fix Coverlets Furniture Paths**
   - Option A: Update `collections.json` to use new path format
     - Change `data/furniture/sofa-capitol/patterns/coverlets/...` 
     - To: `https://so-animation.com/colorflex/data/collections/coverlets-fur/layers/Sofa-Capitol/...`
   - Option B: Move files to old location (not recommended)

2. **Add Oceana Thumbnail**
   - Create or download `oceana-thumb.jpg` to `/data/collections/oceana/`

### Long-term Considerations

1. **Path Format Standardization**
   - All new collections should use the new format: `data/collections/{collection}-fur/layers/{furniture-type}/...`
   - Consider migrating old collections (like Coverlets) to new format

2. **Validation Script**
   - Run this validation script regularly to catch issues early
   - Consider adding to CI/CD pipeline

## Running the Validation

```bash
node scripts/validate-collections-filesystem.js
```

The script will:
- Check all file paths in `collections.json`
- Compare to actual filesystem
- Generate detailed report in `tmp/collections-validation-report.json`
- Exit with error code if issues found

## Detailed Report

A full JSON report is saved to:
```
tmp/collections-validation-report.json
```

This includes:
- Per-collection breakdown
- Per-pattern breakdown
- Missing file details with expected paths
- Variant collection mapping
