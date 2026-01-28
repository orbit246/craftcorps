import React, { useState, useEffect, useRef } from 'react';
import ModsList from './ModsList';
import ResourcePacksList from './ResourcePacksList';
import ShadersList from './ShadersList';

const HomeRightPanel = ({
    selectedInstance,
    isModded,
    showAdvanced,
    theme,
    // Mods
    installedMods,
    isLoadingMods,
    onRefreshMods,
    onAddMods,
    onBrowseMods,
    onDeleteMod,
    missingManifestMods,
    onInstallManifest,
    isInstallingManifest,
    // Resource Packs
    resourcePacks,
    isLoadingResourcePacks,
    onRefreshResourcePacks,
    onAddResourcePacks,
    onDeleteResourcePack,
    // Shaders
    installedShaders,
    isLoadingShaders,
    onRefreshShaders,
    onAddShaders,
    onBrowseShaders,
    onDeleteShader,
    // Drag and Drop (Global State passed down if needed, or handled locally)
    isDraggingGlobal,
    onDragOver,
    onDragLeave,
    onDropMod,
    onDropResourcePack,
    onDropShader,
    // Lazy Load Trigger
    onLazyLoad
}) => {
    const [activeSubTab, setActiveSubTab] = useState('mods');
    const panelRef = useRef(null);
    const [hasTriggeredLoad, setHasTriggeredLoad] = useState(false);

    // Reset lazy load state when instance changes
    useEffect(() => {
        setHasTriggeredLoad(false);
    }, [selectedInstance?.id]);

    // Intersection Observer for Lazy Loading
    useEffect(() => {
        if (!selectedInstance || !isModded || hasTriggeredLoad) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setHasTriggeredLoad(true);
                if (onLazyLoad) onLazyLoad();
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (panelRef.current) {
            observer.observe(panelRef.current);
        }

        return () => observer.disconnect();
    }, [selectedInstance, isModded, hasTriggeredLoad, onLazyLoad]);


    return (
        <div
            className={`w-full transition-all duration-700 ease-in-out ${isModded && showAdvanced ? 'opacity-100 max-h-[2000px] translate-y-0' : 'opacity-0 max-h-0 translate-y-20 overflow-hidden'}`}
        >
            {isModded && (
                <div ref={panelRef} className="w-full mt-4">
                    <div className="flex flex-col h-[750px] overflow-hidden relative bg-slate-900/50 border border-white/5 shadow-xl rounded-3xl">
                        {/* Tabs Header */}
                        <div className="flex items-center justify-start px-6 pt-6 pb-4 border-b border-white/5">
                            <div className="flex gap-4">
                                {['mods', 'resourcepacks', 'shaders'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveSubTab(tab)}
                                        className={`text-sm font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${activeSubTab === tab ? 'text-white border-white' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative">
                            {activeSubTab === 'mods' && (
                                <ModsList
                                    installedMods={installedMods}
                                    selectedInstance={selectedInstance}
                                    isLoading={isLoadingMods}
                                    onRefresh={onRefreshMods}
                                    onAdd={onAddMods}
                                    onBrowse={onBrowseMods}
                                    onDelete={onDeleteMod}
                                    isDraggingGlobal={isDraggingGlobal}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDropMod}
                                    missingManifestMods={missingManifestMods}
                                    onInstallManifest={onInstallManifest}
                                    isInstallingManifest={isInstallingManifest}
                                    theme={theme}
                                    className="!bg-transparent !border-none !rounded-none !shadow-none !h-full !p-6"
                                />
                            )}
                            {activeSubTab === 'resourcepacks' && (
                                <ResourcePacksList
                                    resourcePacks={resourcePacks}
                                    selectedInstance={selectedInstance}
                                    isLoading={isLoadingResourcePacks}
                                    onRefresh={onRefreshResourcePacks}
                                    onAdd={onAddResourcePacks}
                                    onDelete={onDeleteResourcePack}
                                    isDraggingGlobal={isDraggingGlobal}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDropResourcePack}
                                    theme={theme}
                                    className="!bg-transparent !border-none !rounded-none !shadow-none !h-full !p-6"
                                />
                            )}
                            {activeSubTab === 'shaders' && (
                                <ShadersList
                                    shaders={installedShaders}
                                    selectedInstance={selectedInstance}
                                    isLoading={isLoadingShaders}
                                    onRefresh={onRefreshShaders}
                                    onAdd={onAddShaders}
                                    onBrowse={onBrowseShaders}
                                    onDelete={onDeleteShader}
                                    isDraggingGlobal={isDraggingGlobal}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDropShader}
                                    theme={theme}
                                    className="!bg-transparent !border-none !rounded-none !shadow-none !h-full !p-6"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeRightPanel;
