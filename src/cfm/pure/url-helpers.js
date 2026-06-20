/**
 * URL / path helpers that do not depend on CFM shell state (pure).
 */

/** Use when loading an image with crossOrigin for canvas: avoids reusing a cached response that lacked CORS headers. */
export function urlForCorsFetch(url) {
    if (!url || typeof url !== 'string') return url;
    var sep = url.indexOf('?') >= 0 ? '&' : '?';
    return url + sep + '_cf=cors';
}

/**
 * B2 S3-compatible GETs often return Access-Control-Allow-Credentials: true together with a reflected
 * Access-Control-Allow-Origin. Per Fetch CORS, a credentialed response is not allowed when the request
 * uses credentials mode "omit" (HTML crossOrigin="anonymous"), so the image fails before drawImage.
 * Omit crossOrigin for these URLs so the bitmap loads; canvas may be tainted (on-screen display is fine).
 */
export function colorFlexB2OmitImgCrossOrigin(url) {
    return !!(url && typeof url === 'string' && url.toLowerCase().includes('backblazeb2.com'));
}

/**
 * Resolve the effective ColorFlex data base URL from a theme-provided value (e.g. window.COLORFLEX_DATA_BASE_URL).
 * Pass empty/falsy to use the default Backblaze bucket URL.
 */
export function resolveColorFlexDataBaseUrl(themeBaseUrlRaw) {
    var base =
        typeof themeBaseUrlRaw !== 'undefined' && themeBaseUrlRaw !== null && themeBaseUrlRaw !== ''
            ? String(themeBaseUrlRaw).trim().replace(/\/$/, '')
            : 'https://s3.us-east-005.backblazeb2.com/cf-data';
    if (base && !/^https?:\/\//i.test(base)) {
        base = 'https://' + base;
    }
    return base;
}
