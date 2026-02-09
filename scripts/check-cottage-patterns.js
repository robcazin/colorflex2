const fs = require('fs');
const path = require('path');

const dataPath = '/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const col = data.collections.find(c => c.name === 'cottage-sketch-book.fur-1');
if (!col) {
    console.log('Collection not found');
    process.exit(1);
}

console.log(`Collection: ${col.name}`);
console.log(`Total patterns: ${col.patterns.length}`);
console.log('');

// Check first few patterns
col.patterns.slice(0, 5).forEach((p, i) => {
    console.log(`${i+1}. Pattern: ${p.name}`);
    console.log(`   mockupLayers type: ${typeof p.mockupLayers}`);
    console.log(`   mockupLayers is array: ${Array.isArray(p.mockupLayers)}`);
    
    if (!Array.isArray(p.mockupLayers) && typeof p.mockupLayers === 'object' && p.mockupLayers !== null) {
        console.log(`   Top-level keys: ${Object.keys(p.mockupLayers).join(', ')}`);
        const sofa = p.mockupLayers['Sofa-Capitol'];
        if (sofa && typeof sofa === 'object') {
            console.log(`   Sofa-Capitol scales: ${Object.keys(sofa).join(', ')}`);
            const scale1 = sofa['1.0'];
            if (scale1 && Array.isArray(scale1)) {
                console.log(`   1.0 scale layers count: ${scale1.length}`);
                if (scale1.length > 0) {
                    console.log(`   First layer type: ${typeof scale1[0]}`);
                    if (typeof scale1[0] === 'object') {
                        console.log(`   First layer path: ${scale1[0].path || 'N/A'}`);
                    } else {
                        console.log(`   First layer value: ${scale1[0]}`);
                    }
                }
            }
        }
    } else if (Array.isArray(p.mockupLayers)) {
        console.log(`   Array length: ${p.mockupLayers.length}`);
        if (p.mockupLayers.length > 0) {
            console.log(`   First item type: ${typeof p.mockupLayers[0]}`);
            if (typeof p.mockupLayers[0] === 'object') {
                console.log(`   First item path: ${p.mockupLayers[0].path || 'N/A'}`);
            } else {
                console.log(`   First item: ${p.mockupLayers[0]}`);
            }
        }
    }
    console.log('');
});
