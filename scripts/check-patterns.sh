#!/bin/bash

# Quick script to check pattern counts in collections.json

COLLECTIONS_FILE="/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections.json"

if [ ! -f "$COLLECTIONS_FILE" ]; then
    echo "❌ Collections file not found: $COLLECTIONS_FILE"
    exit 1
fi

echo "🔍 Checking Furniture Collections and Base Collections"
echo "======================================================"
echo ""

# Use node to parse JSON (more reliable than grep)
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$COLLECTIONS_FILE', 'utf8'));
const collections = data.collections || [];

// Find furniture collections
const furnitureCols = collections.filter(c => c.name && (c.name.includes('.fur-') || c.name.includes('-fur')));
const baseCols = collections.filter(c => c.name && !c.name.includes('.fur-') && !c.name.includes('-fur') && !c.name.includes('.clo-') && !c.name.includes('-clo'));

console.log('Furniture Collections:');
furnitureCols.forEach(fur => {
    const patterns = fur.patterns || [];
    const furName = fur.name;
    
    // Extract base name
    let baseName = furName;
    if (baseName.includes('.fur-')) {
        baseName = baseName.replace(/\.fur-\d+\$/, '');
    } else if (baseName.includes('-fur')) {
        baseName = baseName.replace(/-fur.*\$/, '');
    }
    
    // Find base collection
    const base = baseCols.find(b => b.name === baseName || b.name.toLowerCase() === baseName.toLowerCase());
    const basePatterns = base ? (base.patterns || []) : [];
    
    console.log(\`\n  \${furName}:\`);
    console.log(\`    Patterns: \${patterns.length}\`);
    if (patterns.length > 0 && patterns.length <= 5) {
        console.log(\`    Names: \${patterns.map(p => p.name).join(', ')}\`);
    } else if (patterns.length > 5) {
        console.log(\`    First 5: \${patterns.slice(0, 5).map(p => p.name).join(', ')}...\`);
    }
    console.log(\`    Base: \${baseName} \${base ? '✅' : '❌ NOT FOUND'}\`);
    if (base) {
        console.log(\`    Base patterns: \${basePatterns.length}\`);
        if (patterns.length !== basePatterns.length) {
            console.log(\`    ⚠️  PATTERN COUNT MISMATCH!\`);
        }
    }
});

console.log(\`\n\nSummary:\`);
console.log(\`  Total furniture collections: \${furnitureCols.length}\`);
console.log(\`  Total base collections: \${baseCols.length}\`);
"
