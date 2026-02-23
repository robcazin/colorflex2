/**
 * Bassett bundle entry. Sets Bassett-only flags first, then loads the main app.
 * This bundle is used only by the local Bassett app (bassett-local). Do not deploy to Shopify.
 * Shopify uses color-flex-core.min.js (from index.core.js), which never loads this file.
 */
import './bassett-flags.js';
import './index.js';
