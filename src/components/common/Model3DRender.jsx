import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { loadBBModel } from '../../utils/BBModelLoader';

import { loadGLTFModel } from '../../utils/GLTFModelLoader';
import { applyRendererSettings, resetAndApplyLighting, THREE_CONFIG } from '../../utils/threeConfig';


/**
 * Renders an arbitrary 3D Model (JSON+UV) with auto-rotation
 * Uses BBModelLoader to support Blockbench/Bedrock/GeckoLib formats
 */
const Model3DRender = ({ modelUrl, textureUrl, className = '', autoRotate = true, scale = 1 }) => {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const modelRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !modelUrl) return;

        let mounted = true;

        // Scene Setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera Setup
        const camera = new THREE.PerspectiveCamera(THREE_CONFIG.CAMERA_FOV, 1, 0.1, 1000);
        camera.position.set(0, 0, 40); // Start further back
        camera.lookAt(0, 0, 0);

        // Renderer Setup
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: true
        });
        applyRendererSettings(renderer);

        const updateSize = () => {
            if (!mounted || !canvasRef.current) return;
            const parent = canvasRef.current?.parentElement;
            if (!parent) return;

            const width = parent.clientWidth;
            const height = parent.clientHeight;
            const dpr = Math.max(window.devicePixelRatio || 1, 2);

            renderer.setSize(width, height);
            renderer.setPixelRatio(dpr);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        updateSize();

        // Lighting Setup
        resetAndApplyLighting(scene);

        // Load Model
        const loadModel = async () => {
            try {
                let group;
                if (modelUrl.toLowerCase().includes('.gltf') || modelUrl.toLowerCase().includes('.glb')) {
                    group = await loadGLTFModel(modelUrl, null);
                } else {
                    group = await loadBBModel(modelUrl, textureUrl);
                }

                // Note: Loaders now use MeshBasicMaterial for 100% color accuracy.

                if (!mounted) return;

                if (group) {
                    // Center and Scale Model
                    // 1. Calculate bounding box of the raw model
                    const box = new THREE.Box3().setFromObject(group);
                    const center = new THREE.Vector3();
                    box.getCenter(center);
                    const size = new THREE.Vector3();
                    box.getSize(size);

                    // 2. Remove any initial position offset from the model itself
                    // We move the group so its bounding box center is at (0,0,0)
                    group.position.x = -center.x;
                    group.position.y = -center.y;
                    group.position.z = -center.z;

                    // 3. Normalize scale to fit in view
                    // Max dimension should be around 24 units for a good fit in the grid
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const targetSize = 24 * scale;

                    if (maxDim > 0) {
                        const scaleFactor = targetSize / maxDim;
                        group.scale.set(scaleFactor, scaleFactor, scaleFactor);
                        // IMPORTANT: Scale the position offset too if we want it centered at 0,0,0
                        group.position.multiplyScalar(scaleFactor);
                    }

                    // Rotation Container
                    const pivotGroup = new THREE.Group();
                    pivotGroup.add(group);

                    // Initial Rotation for nice angle
                    pivotGroup.rotation.y = Math.PI / 4;
                    pivotGroup.rotation.x = 0.2;

                    scene.add(pivotGroup);
                    modelRef.current = pivotGroup;
                } else {
                    console.warn('[Model3DRender] Failed to generate geometry');
                }
            } catch (err) {
                console.error('[Model3DRender] Error loading model', err);
            }
        };

        loadModel();

        // Animation loop
        let time = 0;
        const animate = () => {
            if (!mounted) return;
            animationFrameRef.current = requestAnimationFrame(animate);

            time += 0.01;

            if (modelRef.current) {
                if (autoRotate) {
                    modelRef.current.rotation.y += 0.01;
                }

                // Gentle float
                modelRef.current.position.y = Math.sin(time) * 1.0;
            }

            renderer.render(scene, camera);
        };

        animate();

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            updateSize();
        });

        if (canvasRef.current.parentElement) {
            resizeObserver.observe(canvasRef.current.parentElement);
        }

        // Cleanup
        return () => {
            mounted = false;
            resizeObserver.disconnect();

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            if (sceneRef.current) {
                sceneRef.current.clear();
                renderer.dispose();
            }
        };
    }, [modelUrl, textureUrl, autoRotate, scale]);

    return (
        <canvas
            ref={canvasRef}
            className={`model-3d-render ${className}`}
            style={{
                width: '100%',
                height: '100%',
                display: 'block'
            }}
        />
    );
};

export default Model3DRender;
