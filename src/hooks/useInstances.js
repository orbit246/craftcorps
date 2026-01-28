import { useState, useEffect } from 'react';
import { INITIAL_INSTANCES } from '../data/mockData';

export const useInstances = () => {
    const [instances, setInstances] = useState([]);
    const [selectedInstance, setSelectedInstance] = useState(null);
    const [editingCrop, setEditingCrop] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    // Load instances from backend (disk) on mount
    useEffect(() => {
        const loadInstances = async () => {
            setIsLoading(true);
            try {
                if (window.electronAPI && window.electronAPI.getInstances) {

                    // 1. Try to fast-load last selected instance
                    let hasSetInitial = false;
                    try {
                        const lastPath = await window.electronAPI.storeGet('lastSelectedInstancePath');
                        if (lastPath) {
                            const lastInstance = await window.electronAPI.getInstanceByPath(lastPath);
                            if (lastInstance) {
                                setSelectedInstance(lastInstance);
                                hasSetInitial = true;
                            }
                        }
                    } catch (e) {
                        console.warn("Fast-load failed:", e);
                    }

                    // 2. Load all instances
                    const loaded = await window.electronAPI.getInstances();

                    if (loaded && loaded.length > 0) {
                        // Patch default instance (retroactive fix)
                        const patchedInstances = loaded.map(inst => {
                            let changed = false;
                            const patched = { ...inst };

                            if (inst.name === 'CraftCorps Client' && !inst.icon) {
                                patched.icon = '/images/cc-logo.png';
                                changed = true;
                            }

                            if (inst.name === 'CraftCorps Client' && !inst.modManifest) {
                                patched.version = '1.21.11';
                                patched.modManifest = [
                                    { id: 'sodium', name: 'Sodium (FPS)' },
                                    { id: 'lithium', name: 'Lithium (Logic Fixes)' },
                                    { id: 'iris', name: 'Iris (Shaders)' },
                                    { id: 'fabric-api', name: 'Fabric API' },
                                    { id: 'sodium-extra', name: 'Sodium Extra' },
                                    { id: 'reeses-sodium-options', name: "Reese's Sodium Options" },
                                    { id: 'appleskin', name: 'AppleSkin' },
                                    { id: 'zoomify', name: 'Zoomify' },
                                    { id: 'continuity', name: 'Continuity' },
                                    { id: 'craftcorps-core', name: 'CraftCorps Core', directUrl: 'https://download.craftcorps.net/craftcorps-cosmetics-0.1.3.jar' }
                                ];
                                changed = true;
                            }

                            if (changed && window.electronAPI?.saveInstance) {
                                window.electronAPI.saveInstance(patched).catch(err => console.error("Failed to patch instance:", err));
                                return patched;
                            }
                            return inst;
                        });

                        // Sort by lastPlayed descending (newest first)
                        const sorted = patchedInstances.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
                        setInstances(sorted);

                        // Select first if we haven't set one yet
                        if (!hasSetInitial) {
                            setSelectedInstance(sorted[0]);
                        }
                    } else {
                        // Create default 'CraftCorps Client' instance if none exist
                        let defaultPath = null;
                        try {
                            if (window.electronAPI?.getNewInstancePath) {
                                defaultPath = await window.electronAPI.getNewInstancePath('CraftCorps Client');
                            }
                        } catch (e) {
                            console.error("Failed to generate default path:", e);
                        }

                        console.log("[Instances] No instances found. Creating default 'CraftCorps Client'...");
                        const defaultInstance = {
                            id: `cc_client_${Date.now()}`,
                            name: 'CraftCorps Client',
                            version: '1.21.11',
                            loader: 'Vanilla', // Start with nothing
                            status: 'Ready',
                            lastPlayed: null,
                            iconColor: 'bg-emerald-500',
                            bgGradient: 'from-emerald-600/30 to-slate-900',
                            created: Date.now(),
                            path: defaultPath,
                            icon: '/images/cc-logo.png',
                            modManifest: [] // Start with nothing
                        };

                        // Auto-save to persistence so it exists
                        try {
                            if (window.electronAPI?.saveInstance) {
                                await window.electronAPI.saveInstance(defaultInstance);
                            }
                        } catch (err) {
                            console.error("Failed to save default instance:", err);
                        }

                        setInstances([defaultInstance]);
                        setSelectedInstance(defaultInstance);
                    }
                } else {
                    // Fallback to localStorage or mock (dev mode)
                    try {
                        const saved = localStorage.getItem('craftcorps_instances');
                        setInstances(saved ? JSON.parse(saved) : INITIAL_INSTANCES);
                    } catch (e) {
                        setInstances(INITIAL_INSTANCES);
                    }
                }
            } catch (e) {
                console.error("Failed to load instances:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadInstances();
    }, []);

    // Sync selected instance status update if it was edited
    useEffect(() => {
        if (selectedInstance && instances.length > 0) {
            const updatedSelected = instances.find(i => i.id === selectedInstance.id);
            if (updatedSelected) {
                // If the object reference changed but ID is same, update selection to keep in sync
                // But avoid infinite loop if object is identical
                if (JSON.stringify(updatedSelected) !== JSON.stringify(selectedInstance)) {
                    setSelectedInstance(updatedSelected);
                }
            }
        }

        // Persist last selected instance path
        if (selectedInstance && selectedInstance.path && window.electronAPI?.storeSet) {
            window.electronAPI.storeSet('lastSelectedInstancePath', selectedInstance.path);
        }
    }, [instances, selectedInstance]);

    // Hydrate CraftCorps Client Manifest after a delay (Render first, then load)
    useEffect(() => {
        if (isLoading || instances.length === 0) return;

        const ccClient = instances.find(inst => inst.name === 'CraftCorps Client' && (!inst.modManifest || inst.modManifest.length === 0 || inst.modManifest.some(m => m.id === 'craftcorps-core')));
        if (ccClient) {
            console.log("[Instances] CraftCorps Client detected with no manifest. Scheduling hydration...");
            const timer = setTimeout(async () => {
                const hydratedManifest = [
                    { id: 'sodium', name: 'Sodium (FPS)' },
                    { id: 'lithium', name: 'Lithium (Logic Fixes)' },
                    { id: 'iris', name: 'Iris (Shaders)' },
                    { id: 'fabric-api', name: 'Fabric API' },
                    { id: 'sodium-extra', name: 'Sodium Extra' },
                    { id: 'reeses-sodium-options', name: "Reese's Sodium Options" },
                    { id: 'appleskin', name: 'AppleSkin' },
                    { id: 'zoomify', name: 'Zoomify' },
                    { id: 'continuity', name: 'Continuity' },
                    { id: 'craftcorps', name: 'CraftCorps Core', directUrl: 'https://download.craftcorps.net/craftcorps-cosmetics-0.1.3.jar' }
                ];

                // Functional update to avoid clobbering other state changes (like lastPlayed)
                setInstances(prev => prev.map(inst => {
                    if (inst.id === ccClient.id) {
                        const updated = {
                            ...inst,
                            loader: 'Fabric',
                            modManifest: hydratedManifest
                        };
                        // Persist the individual update
                        if (window.electronAPI?.saveInstance) {
                            window.electronAPI.saveInstance(updated).catch(err => console.error(err));
                        }
                        return updated;
                    }
                    return inst;
                }));
                console.log("[Instances] CraftCorps Client hydrated with Fabric and Mod Manifest.");
            }, 3000); // 3 second delay after rendering
            return () => clearTimeout(timer);
        }
    }, [instances, isLoading]);

    const handleSaveCrop = async (cropData) => {
        setIsLoading(true);
        // Save to Backend
        if (window.electronAPI && window.electronAPI.saveInstance) {
            await window.electronAPI.saveInstance(cropData);
        }

        if (editingCrop) {
            // Update existing
            setInstances(prev => prev.map(inst => inst.id === cropData.id ? { ...inst, ...cropData } : inst));
        } else {
            // Create new
            setInstances(prev => [...prev, cropData]);
            // Always set the newly created instance as active per user request
            setSelectedInstance(cropData);
        }
        setIsLoading(false);
    };

    const handleDeleteCrop = async (id) => {
        const instanceToDelete = instances.find(i => i.id === id);

        // Remove from state first (optimistic UI update)
        const newInstances = instances.filter(i => i.id !== id);
        setInstances(newInstances);

        // If we deleted the currently selected one, fallback
        if (selectedInstance && selectedInstance.id === id) {
            setSelectedInstance(newInstances.length > 0 ? newInstances[0] : null);
        }

        // Delete File System Folder
        if (instanceToDelete && instanceToDelete.path && window.electronAPI) {
            try {
                // Stop any background downloads for this instance
                if (window.electronAPI.modrinthCancelInstanceInstalls) {
                    await window.electronAPI.modrinthCancelInstanceInstalls(instanceToDelete.path);
                }

                // Delete folder
                const res = await window.electronAPI.deleteInstanceFolder(instanceToDelete.path);
                if (!res.success) {
                    console.error("Failed to delete folder:", res.error);
                }
            } catch (e) {
                console.error("Error invoking delete:", e);
            }
        }
    };

    const handleNewCrop = () => {
        setEditingCrop(null);
        setShowCropModal(true);
    };

    const handleEditCrop = (inst) => {
        setEditingCrop(inst);
        setShowCropModal(true);
    };

    const updateLastPlayed = (id) => {
        const targetId = id || (selectedInstance ? selectedInstance.id : null);
        if (!targetId) return;

        // Find the instance
        const instanceToUpdate = instances.find(i => i.id === targetId);

        if (!instanceToUpdate) return;

        // Update it
        const updatedInstance = { ...instanceToUpdate, lastPlayed: Date.now() };

        // Create new order: [updated, ...others]
        const otherInstances = instances.filter(i => i.id !== targetId);
        const newInstances = [updatedInstance, ...otherInstances];

        setInstances(newInstances);

        // Persist update
        if (window.electronAPI?.saveInstance) {
            window.electronAPI.saveInstance(updatedInstance);
        }
    };

    const reorderInstances = (startIndex, endIndex) => {
        setInstances(prev => {
            const result = Array.from(prev);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            // Note: We don't persist order to disk yet unless we save a separate order file
            // or add an 'order' field to instance.json.
            // For now, reordering is memory-only until next reload :( 
            // To fix this we'd need to save all instances with new index, or use a config file.
            // Leaving as-is for now as per minimal changes for "downloaded modpacks" fix.
            return result;
        });
    };

    const handleRestoreDefault = async () => {
        setIsLoading(true);
        let defaultPath = null;
        try {
            if (window.electronAPI?.getNewInstancePath) {
                defaultPath = await window.electronAPI.getNewInstancePath('CraftCorps Client');
            }
        } catch (e) {
            console.error("Failed to generate default path:", e);
        }

        const defaultInstance = {
            id: `cc_client_${Date.now()}`,
            name: 'CraftCorps Client',
            version: '1.21.11',
            loader: 'Vanilla', // Start with nothing
            status: 'Ready',
            lastPlayed: null,
            iconColor: 'bg-emerald-500',
            bgGradient: 'from-emerald-600/30 to-slate-900',
            created: Date.now(),
            path: defaultPath,
            icon: '/images/cc-logo.png',
            modManifest: [] // Start with nothing
        };

        try {
            if (window.electronAPI?.saveInstance) {
                await window.electronAPI.saveInstance(defaultInstance);
            }
        } catch (err) {
            console.error("Failed to save default instance:", err);
        }

        setInstances([defaultInstance]);
        setSelectedInstance(defaultInstance);
        setIsLoading(false);
    };

    return {
        instances,
        setInstances,
        selectedInstance,
        setSelectedInstance,
        editingCrop,
        setEditingCrop,
        showCropModal,
        setShowCropModal,
        handleSaveCrop,
        handleDeleteCrop,
        handleNewCrop,
        handleEditCrop,
        handleRestoreDefault,
        updateLastPlayed,
        reorderInstances,
        isLoading
    };
};
