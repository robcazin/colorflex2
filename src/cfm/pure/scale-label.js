/**
 * Scale label from config (pure — scaleConfig passed explicitly).
 */

export function getScaleLabelFromConfig(scaleValue, scaleConfig) {
    const config = scaleConfig;
    if (!config || !config.scale || !config.scale.labels) {
        if (scaleValue === 50) return '0.5X';
        if (scaleValue === 100) return 'Normal';
        if (scaleValue === 200) return '2X';
        if (scaleValue === 300) return '3X';
        if (scaleValue === 400) return '4X';
        return `${scaleValue}%`;
    }

    return config.scale.labels[scaleValue] || `${scaleValue}%`;
}
