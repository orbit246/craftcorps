import { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

export const useToolkitInstaller = (selectedInstance, installedMods, onRefreshMods, isLoadingMods) => {
    const { addToast: showToast } = useToast();
    const [isInstallingManifest, setIsInstallingManifest] = useState(false);
    const [ignoredMods, setIgnoredMods] = useState([]);

    // Calculate missing mods based on manifest
    const missingManifestMods = useMemo(() => {
        if (!selectedInstance?.modManifest || !installedMods) return [];
        return selectedInstance.modManifest.filter(m => {
            const isInstalled = installedMods.some(inst =>
                (inst.modId && inst.modId.toLowerCase() === m.id.toLowerCase()) ||
                (inst.fileName && inst.fileName.toLowerCase().includes(m.id.toLowerCase()))
            );
            return !isInstalled;
        });
    }, [selectedInstance, installedMods]);

    // Cleanup ignored mods if instance changes
    useEffect(() => {
        setIgnoredMods([]);
    }, [selectedInstance?.id]);

    const handleInstallManifest = async () => {
        if (!window.electronAPI || !selectedInstance || missingManifestMods.length === 0) return;

        // Filter out already ignored mods to be sure
        const modsToInstall = missingManifestMods.filter(m => !ignoredMods.includes(m.id));
        if (modsToInstall.length === 0) return;

        setIsInstallingManifest(true);
        const startMessage = `Installing toolkit (${modsToInstall.length} mods)...`;
        showToast(startMessage, 'info');

        let successCount = 0;
        let failCount = 0;
        const newlyFailed = [];

        for (const mod of modsToInstall) {
            let attempts = 0;
            let success = false;

            while (attempts < 2 && !success) {
                attempts++;
                try {
                    const res = await window.electronAPI.modrinthInstallMod({
                        project: { project_id: mod.id, title: mod.name, directUrl: mod.directUrl },
                        gameVersion: selectedInstance.version,
                        loader: selectedInstance.loader?.toLowerCase() || 'fabric',
                        instancePath: selectedInstance.path
                    });

                    if (res.success) {
                        success = true;
                        successCount++;
                    } else if (attempts === 2) {
                        failCount++;
                        newlyFailed.push(mod.id);
                        console.error(`Failed to install ${mod.name} after 2 tries:`, res.error);
                    }
                } catch (e) {
                    if (attempts === 2) {
                        failCount++;
                        newlyFailed.push(mod.id);
                        console.error(`Error installing ${mod.name} after 2 tries:`, e);
                    }
                }
            }
        }

        if (newlyFailed.length > 0) {
            setIgnoredMods(prev => [...prev, ...newlyFailed]);
        }

        setIsInstallingManifest(false);

        if (successCount > 0 && failCount === 0) {
            showToast(`Installed ${successCount} mods successfully!`, 'success');
        } else if (successCount > 0 && failCount > 0) {
            showToast(`Installed ${successCount} mods, but ${failCount} failed to download.`, 'warning');
        } else if (failCount > 0) {
            showToast(`Failed to download ${failCount} toolkit mods after retries.`, 'error');
        }

        if (successCount > 0) {
            onRefreshMods();
        }
    };

    // Auto-install trigger
    useEffect(() => {
        if (isLoadingMods) return; // Wait for loading to finish

        const untriedMods = missingManifestMods.filter(m => !ignoredMods.includes(m.id));

        // Use a ref or simple check to ensure we don't spam
        const isClient = selectedInstance?.name === 'CraftCorps Client';

        if (isClient &&
            untriedMods.length > 0 &&
            !isInstallingManifest) {

            // We depend on external loading states passed in, but strictly we can just wait a bit
            // The HomeView logic checked isLoadingMods/isLoadingInstances. 
            // We can simplify: if we see missing mods, we try to install them after a delay.

            const timer = setTimeout(() => {
                handleInstallManifest();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [selectedInstance?.id, missingManifestMods.length, isInstallingManifest, ignoredMods, isLoadingMods]);

    return {
        missingManifestMods,
        isInstallingManifest,
        handleInstallManifest
    };
};
