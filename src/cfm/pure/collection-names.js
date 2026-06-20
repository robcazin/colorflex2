/**
 * Collection / pattern name string helpers (pure — arguments only).
 */

export function normalizedCollectionName(col) {
    const name = col?.name?.toLowerCase?.();
    return name ? name.replace(/\s+/g, '-') : '';
}

export function patternNameMatches(pattern, standardName) {
    if (!pattern?.name) return false;
    if (pattern.name === standardName) return true;
    const norm = pattern.name.toLowerCase().replace(/[\s-]+/g, '-');
    const standardNorm = standardName.toLowerCase().replace(/[\s-]+/g, '-');
    return norm === standardNorm;
}
