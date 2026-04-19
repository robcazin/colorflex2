/**
 * Static manifest for wallpaper palette proof (paths relative to this HTML file).
 * Cottage Tulips: real multi-layer Saffron Cottage–style assets in repo.
 */

const SPECIAL = '../special/';
const IMG = '../img/';

export const PATTERN_WALLPAPER_PROOF_MANIFEST = [
  {
    id: 'cottage-tulips',
    name: '11-001 Cottage Tulips',
    mode: 'layered',
    layers: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
      (n) => `${SPECIAL}11-001 - COTTAGE TULIPS - LAYER ${n}.jpg`
    )
  },
  {
    id: 'garden-path',
    name: 'Garden path (flat reference)',
    mode: 'flat',
    flat: IMG + 'garden-path-bg.jpg'
  },
  {
    id: 'fabric-1',
    name: 'Fabric swatch (flat reference)',
    mode: 'flat',
    flat: IMG + 'fabric-1.jpg'
  }
];
