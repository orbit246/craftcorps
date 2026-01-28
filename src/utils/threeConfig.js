import * as THREE from 'three';

/**
 * Global Three.js Configuration for CraftCorps
 * Ensures visual consistency across character previews, thumbnails, and loaders.
 */
export const THREE_CONFIG = {
    // Color Management
    OUTPUT_COLOR_SPACE: THREE.SRGBColorSpace,
    TEXTURE_COLOR_SPACE: THREE.SRGBColorSpace,
    TONE_MAPPING: THREE.ACESFilmicToneMapping, // For premium, cinematic look
    TONE_MAPPING_EXPOSURE: 1.0,
    CAMERA_FOV: 50,

    // Lighting Intensities (Balanced for Tone Mapping)
    // We use DirectionalLights for consistency across all views
    AMBIENT_LIGHT_COLOR: 0xffffff,
    AMBIENT_LIGHT_INTENSITY: 2.5, // Significant increase for vibrancy with ACES

    KEY_LIGHT_INTENSITY: 2.0,    // Main directional light
    FILL_LIGHT_INTENSITY: 1.2,   // Secondary (fills shadows)
    RIM_LIGHT_INTENSITY: 1.5,    // Backlight (defines edges)

    // Light Positions
    KEY_LIGHT_POS: [-20, 40, 30],
    FILL_LIGHT_POS: [20, -10, 20],
    RIM_LIGHT_POS: [0, 10, -30],

    // Material Defaults for Cosmetics
    COSMETIC_MATERIAL_PROPS: {
        transparent: true,
        side: THREE.DoubleSide
    },

    // Texture Filtering
    PIXEL_TEXTURE_FILTER: {
        mag: THREE.NearestFilter,
        min: THREE.NearestFilter
    }
};

/**
 * Adds a standardized, high-fidelity lighting rig to any scene.
 * Ensures character and thumbnails match perfectly.
 */
export const addStandardLighting = (scene) => {
    // 1. Ambient Light
    const ambient = new THREE.AmbientLight(
        THREE_CONFIG.AMBIENT_LIGHT_COLOR,
        THREE_CONFIG.AMBIENT_LIGHT_INTENSITY
    );
    scene.add(ambient);

    // 2. Key Light (Top-Left-Front)
    const key = new THREE.DirectionalLight(0xffffff, THREE_CONFIG.KEY_LIGHT_INTENSITY);
    key.position.set(...THREE_CONFIG.KEY_LIGHT_POS);
    scene.add(key);

    // 3. Fill Light (Right-Front)
    const fill = new THREE.DirectionalLight(0xffffff, THREE_CONFIG.FILL_LIGHT_INTENSITY);
    fill.position.set(...THREE_CONFIG.FILL_LIGHT_POS);
    scene.add(fill);

    // 4. Rim Light (Back)
    const rim = new THREE.DirectionalLight(0xffffff, THREE_CONFIG.RIM_LIGHT_INTENSITY);
    rim.position.set(...THREE_CONFIG.RIM_LIGHT_POS);
    scene.add(rim);

    return { ambient, key, fill, rim };
};

/**
 * Ensures a WebGLRenderer is configured with the global color and tone mapping settings.
 */
export const applyRendererSettings = (renderer) => {
    if (!renderer) return;
    renderer.outputColorSpace = THREE_CONFIG.OUTPUT_COLOR_SPACE;
    renderer.toneMapping = THREE_CONFIG.TONE_MAPPING;
    renderer.toneMappingExposure = THREE_CONFIG.TONE_MAPPING_EXPOSURE;
};

/**
 * Standardizes a scene by removing all existing lights and applying the global rig.
 */
export const resetAndApplyLighting = (scene) => {
    if (!scene) return;

    // Remove all existing lights
    const lights = [];
    scene.traverse(obj => {
        if (obj.isLight) lights.push(obj);
    });
    lights.forEach(l => scene.remove(l));

    // Apply new rig
    return addStandardLighting(scene);
};

/**
 * Creates a standard material for cosmetics based on shared config.
 * Uses MeshBasicMaterial to ensure 100% color accuracy (ignores scene lighting).
 * NOTE: If using MeshStandardMaterial for items, ensure intensities are balanced.
 * For now, we stick to Basic for cosmetics as per previous turns, but 
 * allowing the scene lights to hit the character's base skin.
 */
export const createCosmeticMaterial = (texture) => {
    return new THREE.MeshBasicMaterial({
        map: texture,
        alphaTest: 0.1, // Help with transparent textures
        ...THREE_CONFIG.COSMETIC_MATERIAL_PROPS
    });
};

/**
 * Applies standard texture settings to ensure consistency.
 */
export const applyTextureSettings = (texture, isPixelArt = true) => {
    if (!texture) return;

    texture.colorSpace = THREE_CONFIG.TEXTURE_COLOR_SPACE;

    if (isPixelArt) {
        texture.magFilter = THREE_CONFIG.PIXEL_TEXTURE_FILTER.mag;
        texture.minFilter = THREE_CONFIG.PIXEL_TEXTURE_FILTER.min;
    }

    texture.needsUpdate = true;
};
