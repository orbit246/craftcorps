import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { applyTextureSettings, createCosmeticMaterial } from './threeConfig';

/**
 * Loads a GLTF/GLB model from a URL.
 * Optional: Applies a texture override if provided.
 */
export const loadGLTFModel = async (url, textureUrl = null) => {
    try {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(url);
        const group = gltf.scene;



        return group;
    } catch (error) {
        console.error('[GLTFModelLoader] Error loading GLTF:', error);
        return null;
    }
};
