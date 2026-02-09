/**
 * ColorFlex Clothing Simple Mode Entry Point
 *
 * This is the entry point for the SIMPLE clothing mode that:
 * - Hides all color controls
 * - Uses horizontal thumbnail layout
 * - Displays 700x700 mockup to match pattern preview
 * - No curated colors section
 * - Keeps garment selector and scale controls
 */

// Set simple mode flag BEFORE loading CFM
window.COLORFLEX_SIMPLE_MODE = true;
console.log('🎨 CLOTHING SIMPLE MODE: Enabled');

// Import main ColorFlex code
import './CFM.js';

console.log('✅ Clothing Simple Mode Loaded');
