# Bassett milestone – Feb 2025

**Commemorated:** Coverlets and repo collections loading at localhost:3333; layer images from local server; optional wall mask and UI roadmap.

## Done in this pass
- Server prefers repo `data/collections.json` when present (coverlets load locally).
- `COLORFLEX_DATA_BASE_URL = window.location.origin` in Bassett so layer/thumbnail requests hit localhost.
- `normalizePath` strips absolute filesystem paths so URLs stay valid.
- Build script injects data base URL into Bassett index.

## Suggested git tag (if using git)
```bash
git add -A && git commit -m "Bassett: repo collections, local data base URL, path normalization"
git tag -a bassett-coverlets-2025-02 -m "Bassett milestone: coverlets + local assets"
```
