#!/usr/bin/env node
/**
 * ColorFlex benchmark – baseline metrics for collections, assets, and optional timings.
 * Usage: node scripts/benchmark.js [--json] [--log]
 *   --json   Output machine-readable JSON only
 *   --log    Append summary line to docs/benchmark-log.txt with timestamp
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const outJson = args.includes('--json');
const doLog = args.includes('--log');

function sizeMB(filePath) {
    try {
        const s = fs.statSync(filePath);
        return (s.size / (1024 * 1024)).toFixed(2);
    } catch (_) {
        return null;
    }
}

function collect() {
    const start = Date.now();
    const dataPath = process.env.COLORFLEX_DATA_PATH
        ? path.join(process.env.COLORFLEX_DATA_PATH, 'data', 'collections.json')
        : path.join(projectRoot, 'data', 'collections.json');
    const assetsPath = path.join(projectRoot, 'src', 'assets', 'collections.json');
    const collectionsPath = fs.existsSync(dataPath) ? dataPath : assetsPath;

    let collections = [];
    let parseTimeMs = 0;
    if (fs.existsSync(collectionsPath)) {
        const parseStart = Date.now();
        const raw = fs.readFileSync(collectionsPath, 'utf8');
        const data = JSON.parse(raw);
        parseTimeMs = Date.now() - parseStart;
        collections = data.collections || [];
    }

    const totalPatterns = collections.reduce((sum, c) => sum + (c.patterns?.length || 0), 0);
    const colorFlexPatterns = collections.reduce((sum, c) => {
        return sum + (c.patterns || []).filter(p => p.colorFlex === true).length;
    }, 0);
    const byCollection = collections.map(c => ({
        name: c.name,
        patterns: c.patterns?.length || 0,
        colorFlex: (c.patterns || []).filter(p => p.colorFlex === true).length,
        mockupId: c.mockupId || null
    }));

    const mockupsPath = path.join(projectRoot, 'src', 'assets', 'mockups.json');
    let mockupCount = 0;
    if (fs.existsSync(mockupsPath)) {
        try {
            const m = JSON.parse(fs.readFileSync(mockupsPath, 'utf8'));
            mockupCount = Object.keys(m.mockups || {}).length;
        } catch (_) {}
    }

    const distPath = path.join(projectRoot, 'dist');
    const assetsDir = path.join(projectRoot, 'src', 'assets');
    const files = [
        collectionsPath,
        mockupsPath,
        path.join(distPath, 'color-flex-core.min.js'),
        path.join(assetsDir, 'color-flex-bassett.min.js')
    ].filter(Boolean);
    const fileSizes = {};
    files.forEach(f => {
        const name = path.basename(f);
        const mb = sizeMB(f);
        if (mb != null) fileSizes[name] = `${mb} MB`;
    });

    const totalMs = Date.now() - start;
    const out = {
        timestamp: new Date().toISOString(),
        collectionsPath: collectionsPath.replace(projectRoot, '<root>'),
        collectionCount: collections.length,
        totalPatterns,
        colorFlexPatterns,
        standardPatterns: totalPatterns - colorFlexPatterns,
        mockupCount,
        parseTimeMs,
        totalMs,
        fileSizes,
        byCollection: byCollection.sort((a, b) => b.patterns - a.patterns)
    };
    return out;
}

function main() {
    const out = collect();
    if (outJson) {
        console.log(JSON.stringify(out, null, 2));
    } else {
        console.log('\n--- ColorFlex benchmark ---\n');
        console.log(`Timestamp:     ${out.timestamp}`);
        console.log(`Data source:   ${out.collectionsPath}`);
        console.log(`Collections:   ${out.collectionCount}`);
        console.log(`Total patterns: ${out.totalPatterns} (ColorFlex: ${out.colorFlexPatterns}, Standard: ${out.standardPatterns})`);
        console.log(`Mockups:       ${out.mockupCount}`);
        console.log(`Parse time:    ${out.parseTimeMs} ms`);
        console.log(`Total run:     ${out.totalMs} ms`);
        console.log('\nFile sizes:');
        Object.entries(out.fileSizes).forEach(([name, size]) => console.log(`  ${name}: ${size}`));
        console.log('\nTop collections by pattern count:');
        out.byCollection.slice(0, 15).forEach(c => {
            console.log(`  ${c.name}: ${c.patterns} (${c.colorFlex} ColorFlex) ${c.mockupId ? `mockupId=${c.mockupId}` : ''}`);
        });
        console.log('');
    }
    if (doLog) {
        const logPath = path.join(projectRoot, 'docs', 'benchmark-log.txt');
        const line = `${out.timestamp}\tcollections=${out.collectionCount}\tpatterns=${out.totalPatterns}\tcolorFlex=${out.colorFlexPatterns}\tparseMs=${out.parseTimeMs}\n`;
        try {
            fs.mkdirSync(path.dirname(logPath), { recursive: true });
            fs.appendFileSync(logPath, line);
            if (!outJson) console.log(`Appended to ${logPath}`);
        } catch (e) {
            console.error('Could not append to log:', e.message);
        }
    }
}

main();
