#!/usr/bin/env node

/**
 * Analyze ColorFlex Collections
 * Checks base/furniture collection pairs and reports issues
 */

const fs = require('fs');
const path = require('path');

const COLLECTIONS_FILE = '/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections.json';

function analyzeCollections() {
    console.log('🔍 Analyzing ColorFlex Collections...\n');
    
    if (!fs.existsSync(COLLECTIONS_FILE)) {
        console.error(`❌ Collections file not found: ${COLLECTIONS_FILE}`);
        process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(COLLECTIONS_FILE, 'utf8'));
    const collections = data.collections || [];
    
    // Categorize collections
    const baseCollections = [];
    const furnitureCollections = [];
    const clothingCollections = [];
    const otherCollections = [];
    
    collections.forEach(col => {
        const name = col.name || '';
        
        if (name.includes('.fur-') || name.includes('-fur')) {
            furnitureCollections.push(col);
        } else if (name.includes('.clo-') || name.includes('-clo')) {
            clothingCollections.push(col);
        } else if (!name.includes('.') && !name.includes('-fur') && !name.includes('-clo')) {
            baseCollections.push(col);
        } else {
            otherCollections.push(col);
        }
    });
    
    console.log('📊 Collection Summary:');
    console.log(`   Base collections: ${baseCollections.length}`);
    console.log(`   Furniture collections: ${furnitureCollections.length}`);
    console.log(`   Clothing collections: ${clothingCollections.length}`);
    console.log(`   Other collections: ${otherCollections.length}`);
    console.log('');
    
    // Analyze furniture collections
    console.log('🪑 Furniture Collections Analysis:\n');
    
    const furniturePairs = [];
    const missingBase = [];
    const patternIssues = [];
    
    furnitureCollections.forEach(furCol => {
        const furName = furCol.name;
        
        // Extract base name (handle both .fur- and -fur formats)
        let baseName = furName;
        if (baseName.includes('.fur-')) {
            baseName = baseName.replace(/\.fur-\d+$/, '');
        } else if (baseName.includes('-fur')) {
            baseName = baseName.replace(/-fur.*$/, '');
        }
        
        // Find matching base collection
        const baseCol = baseCollections.find(b => 
            b.name === baseName || 
            b.name.toLowerCase() === baseName.toLowerCase()
        );
        
        const patterns = furCol.patterns || [];
        const basePatterns = baseCol ? (baseCol.patterns || []) : [];
        
        const pair = {
            furniture: furName,
            base: baseName,
            baseFound: !!baseCol,
            baseCollection: baseCol,
            furniturePatterns: patterns.length,
            basePatterns: basePatterns.length,
            patternsMatch: patterns.length === basePatterns.length,
            furniturePatternNames: patterns.map(p => p.name),
            basePatternNames: basePatterns.map(p => p.name)
        };
        
        furniturePairs.push(pair);
        
        if (!baseCol) {
            missingBase.push(pair);
        }
        
        // Check for pattern count mismatches
        if (baseCol && patterns.length !== basePatterns.length) {
            patternIssues.push(pair);
        }
    });
    
    // Report results
    console.log('✅ Furniture Collections with Base:');
    furniturePairs
        .filter(p => p.baseFound && p.patternsMatch)
        .forEach(p => {
            console.log(`   ✅ ${p.furniture} → ${p.base} (${p.furniturePatterns} patterns)`);
        });
    console.log('');
    
    if (missingBase.length > 0) {
        console.log('❌ Furniture Collections Missing Base:');
        missingBase.forEach(p => {
            console.log(`   ❌ ${p.furniture} → Base "${p.base}" NOT FOUND`);
        });
        console.log('');
    }
    
    if (patternIssues.length > 0) {
        console.log('⚠️  Pattern Count Mismatches:');
        patternIssues.forEach(p => {
            console.log(`   ⚠️  ${p.furniture} → ${p.base}`);
            console.log(`      Furniture: ${p.furniturePatterns} patterns`);
            console.log(`      Base: ${p.basePatterns} patterns`);
            console.log(`      Missing in furniture: ${p.basePatternNames.filter(n => !p.furniturePatternNames.includes(n)).join(', ') || 'none'}`);
            console.log(`      Extra in furniture: ${p.furniturePatternNames.filter(n => !p.basePatternNames.includes(n)).join(', ') || 'none'}`);
            console.log('');
        });
    }
    
    // Check naming consistency
    console.log('📝 Naming Format Analysis:\n');
    const dotFormat = furnitureCollections.filter(c => c.name.includes('.fur-')).length;
    const dashFormat = furnitureCollections.filter(c => c.name.includes('-fur') && !c.name.includes('.fur-')).length;
    
    console.log(`   Using .fur- format: ${dotFormat} collections`);
    console.log(`   Using -fur format: ${dashFormat} collections`);
    console.log('');
    
    if (dotFormat > 0 && dashFormat > 0) {
        console.log('⚠️  WARNING: Mixed naming formats detected!');
        console.log('   This may cause issues with base collection lookup.');
        console.log('');
        console.log('   .fur- format examples:');
        furnitureCollections
            .filter(c => c.name.includes('.fur-'))
            .slice(0, 3)
            .forEach(c => console.log(`      - ${c.name}`));
        console.log('');
        console.log('   -fur format examples:');
        furnitureCollections
            .filter(c => c.name.includes('-fur') && !c.name.includes('.fur-'))
            .slice(0, 3)
            .forEach(c => console.log(`      - ${c.name}`));
        console.log('');
    }
    
    // Specific check for cottage-sketch-book
    console.log('🏠 Cottage Sketch Book Analysis:\n');
    const cottageFur = furnitureCollections.find(c => 
        c.name.includes('cottage-sketch-book') && (c.name.includes('.fur-') || c.name.includes('-fur'))
    );
    const cottageBase = baseCollections.find(c => 
        c.name === 'cottage-sketch-book' || c.name.toLowerCase() === 'cottage-sketch-book'
    );
    
    if (cottageFur) {
        console.log(`   Furniture: ${cottageFur.name}`);
        console.log(`   Patterns: ${cottageFur.patterns?.length || 0}`);
        if (cottageFur.patterns) {
            console.log(`   Pattern names: ${cottageFur.patterns.map(p => p.name).join(', ')}`);
        }
    } else {
        console.log('   ❌ Furniture collection not found');
    }
    
    if (cottageBase) {
        console.log(`   Base: ${cottageBase.name}`);
        console.log(`   Patterns: ${cottageBase.patterns?.length || 0}`);
    } else {
        console.log('   ❌ Base collection not found');
    }
    console.log('');
    
    // Recommendations
    console.log('💡 Recommendations:\n');
    if (dotFormat > 0 && dashFormat > 0) {
        console.log('   1. Standardize naming format (recommend .fur- for consistency)');
    }
    if (missingBase.length > 0) {
        console.log(`   2. Create ${missingBase.length} missing base collection(s)`);
    }
    if (patternIssues.length > 0) {
        console.log(`   3. Fix ${patternIssues.length} pattern count mismatch(es)`);
    }
    if (missingBase.length === 0 && patternIssues.length === 0 && (dotFormat === 0 || dashFormat === 0)) {
        console.log('   ✅ All collections look good!');
    }
}

// Run analysis
try {
    analyzeCollections();
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
