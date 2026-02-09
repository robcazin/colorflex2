// Fabric Specifications Database
// Based on Airtable data provided by user

const FABRIC_SPECIFICATIONS = {
    // Fabric types with pricing, width, and requirements
    'SOFT VELVET': {
        pricePerYard: 29.00,
        width: '58"',
        minimumYards: 5,
        description: 'Luxurious soft velvet with rich texture',
        material: 'fabric'
    },
    'DECORATOR LINEN': {
        pricePerYard: 29.00,
        width: '56"',
        minimumYards: 5,
        description: 'Premium decorator linen for upholstery',
        material: 'fabric'
    },
    'DRAPERY SHEER': {
        pricePerYard: 24.00,
        width: '56"',
        minimumYards: 5,
        description: 'Lightweight sheer fabric for window treatments',
        material: 'fabric'
    },
    'LIGHTWEIGHT LINEN': {
        pricePerYard: 26.00,
        width: '62"',
        minimumYards: 5,
        description: 'Versatile lightweight linen fabric',
        material: 'fabric'
    },
    'FAUX SUEDE': {
        pricePerYard: 36.00,
        width: '58"',
        minimumYards: 5,
        description: 'Premium faux suede with authentic texture',
        material: 'fabric'
    },
    'DRAPERY LIGHT BLOCK': {
        pricePerYard: 31.00,
        width: '56"',
        minimumYards: 5,
        description: 'Light-blocking drapery fabric',
        material: 'fabric'
    },

    // Wallpaper options (assumed standard pricing)
    'WALLPAPER': {
        pricePerRoll: 89.99,
        coverage: '56 sq ft',
        minimumRolls: 1,
        description: 'Professional-grade removable wallpaper',
        material: 'wallpaper'
    },
    'REMOVABLE DECAL': {
        pricePerRoll: 69.99,
        coverage: '56 sq ft',
        minimumRolls: 1,
        description: 'Vinyl decal for temporary decoration',
        material: 'decal'
    }
};

// Utility functions for pricing calculations
const FabricPricing = {

    // Get fabric specification by type
    getFabricSpec: function(fabricType) {
        const normalizedType = fabricType.toUpperCase().trim();
        return FABRIC_SPECIFICATIONS[normalizedType] || null;
    },

    // Calculate total price for fabric order
    calculateFabricPrice: function(fabricType, yards) {
        const spec = this.getFabricSpec(fabricType);
        if (!spec || spec.material !== 'fabric') {
            return { error: 'Invalid fabric type' };
        }

        const actualYards = Math.max(yards, spec.minimumYards);
        const totalPrice = actualYards * spec.pricePerYard;

        return {
            fabricType: fabricType,
            requestedYards: yards,
            actualYards: actualYards,
            minimumMet: yards >= spec.minimumYards,
            pricePerYard: spec.pricePerYard,
            totalPrice: totalPrice,
            width: spec.width,
            description: spec.description
        };
    },

    // Calculate wallpaper pricing
    calculateWallpaperPrice: function(rolls) {
        const spec = FABRIC_SPECIFICATIONS['WALLPAPER'];
        const actualRolls = Math.max(rolls, spec.minimumRolls);
        const totalPrice = actualRolls * spec.pricePerRoll;

        return {
            requestedRolls: rolls,
            actualRolls: actualRolls,
            pricePerRoll: spec.pricePerRoll,
            totalPrice: totalPrice,
            coverage: spec.coverage,
            description: spec.description
        };
    },

    // Get quantity label for material type
    getQuantityLabel: function(materialType) {
        switch(materialType.toLowerCase()) {
            case 'fabric':
                return 'Yards';
            case 'wallpaper':
            case 'decal':
                return 'Rolls';
            default:
                return 'Quantity';
        }
    },

    // Get minimum quantity for material type
    getMinimumQuantity: function(materialType, fabricType = null) {
        if (materialType.toLowerCase() === 'fabric' && fabricType) {
            const spec = this.getFabricSpec(fabricType);
            return spec ? spec.minimumYards : 5;
        } else {
            const spec = FABRIC_SPECIFICATIONS[materialType.toUpperCase()];
            return spec ? (spec.minimumRolls || spec.minimumYards || 1) : 1;
        }
    },

    // Format price display
    formatPrice: function(price) {
        return `$${price.toFixed(2)}`;
    },

    // Get all available fabric types
    getAvailableFabrics: function() {
        return Object.keys(FABRIC_SPECIFICATIONS).filter(key =>
            FABRIC_SPECIFICATIONS[key].material === 'fabric'
        );
    },

    // Get fabric details for display
    getFabricDetails: function(fabricType) {
        const spec = this.getFabricSpec(fabricType);
        if (!spec) return null;

        return {
            name: fabricType,
            price: this.formatPrice(spec.pricePerYard),
            width: spec.width,
            minimum: `${spec.minimumYards} yards`,
            description: spec.description
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FABRIC_SPECIFICATIONS, FabricPricing };
} else if (typeof window !== 'undefined') {
    window.FABRIC_SPECIFICATIONS = FABRIC_SPECIFICATIONS;
    window.FabricPricing = FabricPricing;
}