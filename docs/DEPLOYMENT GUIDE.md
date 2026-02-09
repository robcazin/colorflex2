./update-collection.sh complete cottage-sketch-book

./update-collection.sh add-pattern geometry

This will:
  1. Fetch new patterns from Airtable
  2. Add them to collections.json (9 → 12 patterns)
  3. Download their images
  4. Deploy to server

  Then run:
  node scripts/shopify-create-products.js geometry

  To create the 3 new Shopify products.


  NOW

  ./update-collection.sh add-pattern geometry
  # ✅ Everything happens automatically!

  ---
  Commands & Behavior

  | Command     | Airtable  | Images       | Deploy | Shopify Products    |
  |-------------|-----------|--------------|--------|---------------------|
  | complete    | Fetch all | Download all | ✅      | ✅ Create/update all |
  | add-pattern | Fetch new | Download new | ✅      | ✅ Create NEW only   |
  | metadata    | Fetch all | Skip         | ❌      | ✅ Create/update     |
  | images      | Skip      | Download all | ✅      | ❌ No products       |

  ---
  Optional Flags

  --skip-products - Generate CSV for manual import instead:
  ./update-collection.sh add-pattern geometry --skip-products
  # Creates CSV but skips automatic product creation

  --update-products - Update existing products instead of skipping:
  ./update-collection.sh complete abundance --update-products
  # Updates existing Shopify products with new metadata

  ---
  Example: Test the New Workflow

  Try adding patterns to a test collection:
  # Full automation - single command does everything:
  ./update-collection.sh add-pattern cottage-sketch-book

  # Expected output:
  # ✅ NEW patterns added to collections.json
  # ✅ Images downloaded and deployed
  # ✅ Shopify products created via API
  # ✅ All done - no manual steps!


  For mockup-only changes, this is the simplest single-command solution:

  ./update-collection.sh complete cottage-sketch-book --skip-products

  # Output:
  # ✅ Collections.json updated with mockup metadata
  # ✅ Mockup image downloaded
  # ✅ All images deployed to server
  # ❌ Shopify product creation skipped

  The --skip-products flag prevents creating/updating Shopify products, which is
  exactly what you want when only the mockup changed.