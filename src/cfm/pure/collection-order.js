/**
 * Collection list ordering by designer table number (pure — arguments only).
 */

export function getCollectionOrderNumber(c) {
    if (c == null) return 999;
    if (typeof c.collectionNumber === 'number' && !Number.isNaN(c.collectionNumber)) return c.collectionNumber;
    const tableName = c.tableName || '';
    const num = parseInt(tableName.split(' - ')[0], 10);
    return Number.isNaN(num) ? 999 : num;
}

export function sortCollectionsByNumber(collections) {
    if (!Array.isArray(collections)) return collections;
    return collections.slice().sort((a, b) => {
        const na = getCollectionOrderNumber(a);
        const nb = getCollectionOrderNumber(b);
        if (na !== nb) return na - nb;
        return (a.name || '').localeCompare(b.name || '');
    });
}
