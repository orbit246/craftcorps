import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from 'react-i18next';

export const useInstanceContent = (selectedInstance) => {
    const { t } = useTranslation();
    const { addToast: showToast } = useToast();

    // -- State --
    const [installedMods, setInstalledMods] = useState([]);
    const [isLoadingMods, setIsLoadingMods] = useState(false);

    const [resourcePacks, setResourcePacks] = useState(null);
    const [isLoadingResourcePacks, setIsLoadingResourcePacks] = useState(false);

    const [installedShaders, setInstalledShaders] = useState(null);
    const [isLoadingShaders, setIsLoadingShaders] = useState(false);

    // -- Handler Helpers --
    const getElectron = () => window.electronAPI;

    // -- Mods Methods --
    const handleRefreshMods = useCallback(async () => {
        if (!selectedInstance?.path || !getElectron()) return;
        setIsLoadingMods(true);
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Refresh timed out')), 5000));
            const mods = await Promise.race([
                getElectron().getInstanceMods(selectedInstance.path),
                timeoutPromise
            ]);
            setInstalledMods(mods);
        } catch (e) {
            console.error(e);
            showToast(t('Failed to refresh mods'), 'error');
        } finally {
            setIsLoadingMods(false);
        }
    }, [selectedInstance?.path, t, showToast]);

    const handleAddMods = useCallback(async (filePaths = null) => {
        if (!selectedInstance?.path || !getElectron()) {
            showToast(t('Error: Configuration missing'), 'error');
            return;
        }

        let files = filePaths;
        if (!files) {
            try {
                files = await getElectron().selectModFiles();
            } catch (err) {
                console.error(err);
                return;
            }
        }

        if (files && Array.isArray(files) && files.length > 0) {
            showToast(t('Adding mods...'), 'info');
            try {
                const result = await getElectron().addInstanceMods(selectedInstance.path, files);

                if (result.success) {
                    if (result.added > 0) {
                        showToast(t('Successfully added {{count}} mods', { count: result.added }), 'success');
                    }
                    if (result.addedMods && Array.isArray(result.addedMods)) {
                        setInstalledMods(prev => {
                            if (!Array.isArray(prev)) return result.addedMods;
                            const prevPaths = new Set(prev.map(m => m.path));
                            const newMods = result.addedMods.filter(m => !prevPaths.has(m.path));
                            return [...newMods, ...prev];
                        });
                    }
                } else {
                    showToast(result.error || t('Failed to add mods'), 'error');
                }

                if (result.errors && result.errors.length > 0) {
                    result.errors.slice(0, 3).forEach(err => showToast(`Skipped: ${err}`, 'warning'));
                    if (result.errors.length > 3) {
                        showToast(`${result.errors.length} files skipped (check console)`, 'warning');
                    }
                }
            } catch (e) {
                console.error(e);
                showToast(e.message || t('Error adding mods'), 'error');
            }
        }
    }, [selectedInstance?.path, t, showToast]);

    const handleDeleteMod = useCallback(async (mod) => {
        if (!mod.path || !getElectron()) return;
        try {
            const result = await getElectron().deleteMod(mod.path);
            if (result.success) {
                setInstalledMods(prev => prev.filter(m => m.path !== mod.path));
                showToast(t('Mod deleted'), 'success');
            } else {
                showToast(result.error || t('Failed to delete mod'), 'error');
            }
        } catch (e) {
            console.error(e);
        }
    }, [t, showToast]);

    // -- Resource Packs Methods --
    const handleRefreshResourcePacks = useCallback(async () => {
        if (!selectedInstance?.path || !getElectron()) return;
        setIsLoadingResourcePacks(true);
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Refresh timed out')), 5000));
            const packs = await Promise.race([
                getElectron().getInstanceResourcePacks(selectedInstance.path),
                timeoutPromise
            ]);
            setResourcePacks(packs);
        } catch (e) {
            console.error(e);
            showToast(t('Failed to refresh resource packs'), 'error');
        } finally {
            setIsLoadingResourcePacks(false);
        }
    }, [selectedInstance?.path, t, showToast]);

    const handleAddResourcePacks = useCallback(async (filePaths = null) => {
        if (!selectedInstance?.path || !getElectron()) {
            showToast(t('Error: Configuration missing'), 'error');
            return;
        }

        let files = filePaths;
        if (!files) {
            try {
                files = await getElectron().selectResourcePackFiles();
            } catch (err) {
                console.error(err);
                return;
            }
        }

        if (files && Array.isArray(files) && files.length > 0) {
            showToast('Adding resource packs...', 'info');
            try {
                const result = await getElectron().addInstanceResourcePacks(selectedInstance.path, files);

                if (result.success) {
                    if (result.added > 0) {
                        showToast(`Successfully added ${result.added} resource packs`, 'success');
                    }
                    if (result.addedPacks && Array.isArray(result.addedPacks)) {
                        setResourcePacks(prev => {
                            if (!Array.isArray(prev)) return result.addedPacks;
                            const prevPaths = new Set(prev.map(p => p.path));
                            const newPacks = result.addedPacks.filter(p => !prevPaths.has(p.path));
                            return [...newPacks, ...prev];
                        });
                    }
                } else {
                    showToast(result.error || 'Failed to add resource packs', 'error');
                }

                if (result.errors && result.errors.length > 0) {
                    result.errors.slice(0, 3).forEach(err => showToast(err, 'warning'));
                }
            } catch (e) {
                console.error(e);
                showToast(e.message || 'Error adding resource packs', 'error');
            }
        }
    }, [selectedInstance?.path, t, showToast]);

    const handleDeleteResourcePack = useCallback(async (pack) => {
        if (!pack.path || !getElectron()) return;
        try {
            const result = await getElectron().deleteResourcePack(pack.path);
            if (result.success) {
                setResourcePacks(prev => (prev || []).filter(p => p.path !== pack.path));
                showToast('Resource pack deleted', 'success');
            } else {
                showToast(result.error || 'Failed to delete resource pack', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Error deleting resource pack', 'error');
        }
    }, [showToast]);

    // -- Shaders Methods --
    const handleRefreshShaders = useCallback(async () => {
        if (!selectedInstance?.path || !getElectron()) return;
        setIsLoadingShaders(true);
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Refresh timed out')), 5000));
            const shaders = await Promise.race([
                getElectron().getInstanceShaders(selectedInstance.path),
                timeoutPromise
            ]);
            setInstalledShaders(shaders);
        } catch (e) {
            console.error(e);
            showToast('Failed to refresh shaders', 'error');
        } finally {
            setIsLoadingShaders(false);
        }
    }, [selectedInstance?.path, showToast]);

    const handleAddShaders = useCallback(async (filePaths = null) => {
        if (!selectedInstance?.path || !getElectron()) {
            showToast(t('Error: Configuration missing'), 'error');
            return;
        }

        let files = filePaths;
        if (!files) {
            try {
                files = await getElectron().selectShaderFiles();
            } catch (err) {
                console.error(err);
                return;
            }
        }

        if (files && Array.isArray(files) && files.length > 0) {
            showToast('Adding shaders...', 'info');
            try {
                const result = await getElectron().addInstanceShaders(selectedInstance.path, files);

                if (result.success) {
                    if (result.added > 0) {
                        showToast(`Successfully added ${result.added} shaders`, 'success');
                    }
                    if (result.addedShaders && Array.isArray(result.addedShaders)) {
                        setInstalledShaders(prev => {
                            if (!Array.isArray(prev)) return result.addedShaders;
                            const prevPaths = new Set(prev.map(p => p.path));
                            const newShaders = result.addedShaders.filter(p => !prevPaths.has(p.path));
                            return [...newShaders, ...prev];
                        });
                    }
                } else {
                    showToast(result.error || 'Failed to add shaders', 'error');
                }
            } catch (e) {
                console.error(e);
                showToast(e.message || 'Error adding shaders', 'error');
            }
        }
    }, [selectedInstance?.path, t, showToast]);

    const handleDeleteShader = useCallback(async (shader) => {
        if (!shader.path || !getElectron()) return;
        try {
            const result = await getElectron().deleteShader(shader.path);
            if (result.success) {
                setInstalledShaders(prev => (prev || []).filter(p => p.path !== shader.path));
                showToast('Shader deleted', 'success');
            } else {
                showToast(result.error || 'Failed to delete shader', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Error deleting shader', 'error');
        }
    }, [showToast]);

    // -- Combined Lazy Load --
    const handleLazyLoad = useCallback(() => {
        handleRefreshMods();
        handleRefreshResourcePacks();
        handleRefreshShaders();
    }, [handleRefreshMods, handleRefreshResourcePacks, handleRefreshShaders]);

    // -- Background Listener --
    // We can handle the background event here too
    // But usually that needs useEffect with cleanup

    return {
        // State
        installedMods, setInstalledMods, isLoadingMods,
        resourcePacks, setResourcePacks, isLoadingResourcePacks,
        installedShaders, setInstalledShaders, isLoadingShaders,

        // Methods
        handleRefreshMods, handleAddMods, handleDeleteMod,
        handleRefreshResourcePacks, handleAddResourcePacks, handleDeleteResourcePack,
        handleRefreshShaders, handleAddShaders, handleDeleteShader,

        // Global
        handleLazyLoad
    };
};
