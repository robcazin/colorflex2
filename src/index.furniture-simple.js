/**
 * ColorFlex Furniture Simple Mode Entry Point
 *
 * This is the entry point for the SIMPLE furniture mode that:
 * - Hides all color controls
 * - Uses horizontal thumbnail layout
 * - Displays 700x700 mockup to match pattern preview
 * - No curated colors section
 */

// Set simple mode flag BEFORE loading CFM
window.COLORFLEX_SIMPLE_MODE = true;
console.log('🎨 FURNITURE SIMPLE MODE: Enabled');

// Import main ColorFlex code
import './CFM.js';

console.log('✅ Furniture Simple Mode Loaded');
