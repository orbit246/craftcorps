import React, { useState, useEffect } from 'react';
import { Paintbrush, Layers, Settings, Aperture, Globe } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from 'react-i18next';

// Imported Sub-components
import AccountProfile from '../components/home/AccountProfile';
import InstanceHero from '../components/home/InstanceHero';
import HomeRightPanel from '../components/home/HomeRightPanel';
import EmptyState from '../components/home/EmptyState';
import QuickSwitchPanel from '../components/home/QuickSwitchPanel';
import ServerSwitchPanel from '../components/home/ServerSwitchPanel';
import HomeSkeleton from '../components/home/HomeSkeleton';
import HomeCosmeticsWidget from '../components/home/HomeCosmeticsWidget';
import HomeModsWidget from '../components/home/HomeModsWidget';
import { useWardrobe } from '../hooks/useWardrobe';
import { useClientLibrariesInstaller } from '../hooks/useClientLibrariesInstaller';
import { useInstanceContent } from '../hooks/useInstanceContent';

const HomeView = ({
    selectedInstance,
    launchStatus,
    launchStep,
    launchProgress,
    launchFeedback,
    onPlay,
    onStop,
    activeAccount,
    instances,
    onManageAll,
    setSelectedInstance,
    onNewCrop,
    onEditCrop,
    onBrowseMods, // New prop
    onBrowseShaders, // New prop
    // Account System Props
    accounts,
    onSwitchAccount,
    onAddAccount,
    onLogout,
    onManageAccounts,
    showProfileMenu,
    setShowProfileMenu,
    onManageServers,
    disableAnimations,
    theme,
    isLoadingInstances,
    runningInstances,
    launchCooldown,
    onSaveCrop,
    setActiveTab,
    showCropModal,
    showLoginModal,
    onRestoreDefault
}) => {
    const { t } = useTranslation();
    const { addToast: showToast } = useToast();
    const { activeCosmetics, isLoadingCosmetics, refreshCosmetics } = useWardrobe(activeAccount);

    useEffect(() => {
        // Give time for backend caches and auth state to settle
        const timer = setTimeout(() => {
            if (activeAccount) {
                refreshCosmetics();
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [activeAccount]);

    const [isDragging, setIsDragging] = useState(false);
    const [showQuickSwitch, setShowQuickSwitch] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(() => {
        const saved = localStorage.getItem('home_showAdvanced');
        return saved === 'true';
    });
    const lastScrollY = React.useRef(0);
    const contentScrollRef = React.useRef(null);

    // -- Content Management Hook --
    const {
        // State
        installedMods, setInstalledMods, isLoadingMods,
        resourcePacks, isLoadingResourcePacks,
        installedShaders, isLoadingShaders,

        // Methods
        handleRefreshMods, handleAddMods, handleDeleteMod,
        handleRefreshResourcePacks, handleAddResourcePacks, handleDeleteResourcePack,
        handleRefreshShaders, handleAddShaders, handleDeleteShader,

        // Global
        handleLazyLoad
    } = useInstanceContent(selectedInstance);

    // Manifest Logic (via hook)
    const {
        missingManifestMods,
        isInstallingManifest,
        installProgress,
        handleInstallManifest
    } = useClientLibrariesInstaller(selectedInstance, installedMods, handleRefreshMods, isLoadingMods, isLoadingInstances, launchStatus);

    // Persist showAdvanced
    useEffect(() => {
        localStorage.setItem('home_showAdvanced', showAdvanced);
    }, [showAdvanced]);

    // Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!window.electronAPI || !window.electronAPI.getPathForFile) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files)
                .map(f => window.electronAPI.getPathForFile(f))
                .filter(p => p && p.toLowerCase().endsWith('.jar'));

            if (files.length > 0) {
                handleAddMods(files);
            } else {
                showToast('Please drop .jar files', 'warning');
            }
        }
    };

    const handleResourcePackDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!window.electronAPI || !window.electronAPI.getPathForFile) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files)
                .map(f => window.electronAPI.getPathForFile(f))
                .filter(p => p && p.toLowerCase().endsWith('.zip'));

            if (files.length > 0) {
                handleAddResourcePacks(files);
            } else {
                showToast('Please drop .zip files for resource packs', 'warning');
            }
        }
    };

    const handleShaderDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!window.electronAPI || !window.electronAPI.getPathForFile) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files)
                .map(f => window.electronAPI.getPathForFile(f))
                .filter(p => p && p.toLowerCase().endsWith('.zip'));

            if (files.length > 0) {
                handleAddShaders(files);
            } else {
                showToast('Please drop .zip files for shaders', 'warning');
            }
        }
    };

    const handleScroll = (e) => {
        const currentScrollY = e.target.scrollTop;

        // Show if at the very top or scrolling up
        if (currentScrollY < 50 || currentScrollY < lastScrollY.current) {
            setShowQuickSwitch(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            // Hide if scrolling down and past the top area
            setShowQuickSwitch(false);
        }

        lastScrollY.current = currentScrollY;
    };

    // Lazy Load Mods on Scroll
    // Lazy Load Mods on Scroll
    // In this refactor, lazy loading is triggered by the HomeRightPanel component.
    // The handler handleLazyLoad is passed down via useInstanceContent hook.
    // Listener for background updates (Lazy Load)
    useEffect(() => {
        if (!selectedInstance || !window.electronAPI) return;

        const handleUpdate = (data) => {
            if (data.instancePath === selectedInstance.path) {
                console.log('[Home] Background mods updated');
                setInstalledMods(data.mods);
            }
        };

        if (window.electronAPI.onInstanceModsUpdated) {
            window.electronAPI.onInstanceModsUpdated(handleUpdate);
        }

        return () => {
            if (window.electronAPI.removeInstanceModsListener) {
                window.electronAPI.removeInstanceModsListener();
            }
        };
    }, [selectedInstance]);

    const isModded = selectedInstance && selectedInstance.loader !== 'Vanilla';

    return (
        <div className={`flex-1 flex flex-col select-none overflow-hidden h-full`}>

            {/* Top Section: Content & Backgrounds */}
            <div className={`flex-1 flex relative overflow-hidden ${isModded && showAdvanced ? 'justify-start' : 'justify-center'}`}>
                {/* Voxel Blueprint Layer */}
                <div className="isometric-grid opacity-60" />

                {/* Background Depth */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(30,41,59,0.4),_transparent_70%)] pointer-events-none" />

                {/* Top Right Control Cluster (Account + Actions) */}
                <div className="fixed top-20 right-8 flex flex-col items-end gap-3 z-[100] pointer-events-none">
                    {/* Profile Widget */}
                    <div className="glass-spotlight p-2 rounded-2xl shadow-2xl relative z-[100] pointer-events-auto">
                        <AccountProfile
                            activeAccount={activeAccount}
                            accounts={accounts}
                            showProfileMenu={showProfileMenu}
                            setShowProfileMenu={setShowProfileMenu}
                            onSwitchAccount={onSwitchAccount}
                            onAddAccount={onAddAccount}
                            onLogout={onLogout}
                            onManageAccounts={onManageAccounts}
                            onManageServers={onManageServers}
                        />
                    </div>
                </div>

                {/* Main Content Area - Split View */}
                <div className={`flex-1 flex overflow-hidden relative z-10 ${selectedInstance ? 'pt-12 pl-8' : ''}`}>
                    {/* Left Column: Hero & Greetings */}
                    <div ref={contentScrollRef} className={`flex-1 flex flex-col ${selectedInstance ? 'items-start pr-12' : 'items-center justify-center'} gap-6 min-w-0 overflow-y-auto custom-scrollbar pb-12`}>
                        {isLoadingInstances ? (
                            <HomeSkeleton theme={theme} />
                        ) : selectedInstance ? (
                            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                                <div className="flex flex-col gap-2 w-full">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        Continue Playing
                                    </h4>
                                    <InstanceHero
                                        selectedInstance={selectedInstance}
                                        launchStatus={launchStatus}
                                        launchStep={launchStep}
                                        launchProgress={launchProgress}
                                        launchFeedback={launchFeedback}
                                        onPlay={onPlay}
                                        onStop={onStop}
                                        theme={theme}
                                        isAdvanced={showAdvanced}
                                        setShowAdvanced={setShowAdvanced}
                                        onEditCrop={onEditCrop}
                                        accounts={accounts}
                                        activeAccount={activeAccount}
                                        runningInstances={runningInstances}
                                        launchCooldown={launchCooldown}
                                        allowOverflow={false}
                                        modCount={installedMods?.length || 0}
                                        onSaveCrop={onSaveCrop}
                                        setShowProfileMenu={setShowProfileMenu}
                                        isInstallingManifest={isInstallingManifest}
                                        installProgress={installProgress}
                                    />
                                </div>

                                {/* Section: Server Bar */}
                                {!showAdvanced && (
                                    <div className="flex flex-col gap-4 w-full mt-3">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex flex-col gap-0.5">
                                                <h4 className="text-xl font-bold text-white tracking-tight">Continue on Servers</h4>
                                                <p className="text-sm text-slate-500 font-medium">
                                                    Join with <span className="font-bold text-slate-300">{selectedInstance?.name}</span> instance
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('discover')}
                                                className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-white/10 transition-all group"
                                            >
                                                <span className="text-xs font-bold uppercase tracking-wider">Show more on Discovery</span>
                                                <Globe size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                        <ServerSwitchPanel
                                            selectedInstance={selectedInstance}
                                            onJoinServer={(server) => {
                                                const launchParams = { ...selectedInstance, autoConnect: true, serverAddress: server.ip };
                                                onPlay(launchParams);
                                            }}
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {/* Section: Active Cosmetics */}
                                {!showAdvanced && selectedInstance && (
                                    <HomeCosmeticsWidget
                                        activeCosmetics={activeCosmetics}
                                        isLoadingCosmetics={isLoadingCosmetics}
                                        onOpenWardrobe={() => setActiveTab('wardrobe')}
                                    />
                                )}

                                {/* Section: Mods Widget */}
                                {!showAdvanced && selectedInstance && (
                                    <HomeModsWidget
                                        mods={installedMods}
                                        isLoading={isLoadingMods}
                                        onToggleEdit={() => {
                                            setShowAdvanced(true);
                                            // Custom slow smooth scroll (1000ms)
                                            if (contentScrollRef.current) {
                                                const element = contentScrollRef.current;
                                                const start = element.scrollTop;
                                                const duration = 1000;
                                                const startTime = performance.now();

                                                const animateScroll = (currentTime) => {
                                                    const elapsed = currentTime - startTime;
                                                    const progress = Math.min(elapsed / duration, 1);

                                                    // Ease out cubic function
                                                    const ease = 1 - Math.pow(1 - progress, 3);

                                                    element.scrollTop = start * (1 - ease);

                                                    if (progress < 1) {
                                                        requestAnimationFrame(animateScroll);
                                                    }
                                                };
                                                requestAnimationFrame(animateScroll);
                                            }
                                        }}
                                    />
                                )}

                                {/* Modded Details Section */}
                                <HomeRightPanel
                                    selectedInstance={selectedInstance}
                                    isModded={isModded}
                                    showAdvanced={showAdvanced}
                                    theme={theme}
                                    // Mods
                                    installedMods={installedMods}
                                    isLoadingMods={isLoadingMods}
                                    onRefreshMods={handleRefreshMods}
                                    onAddMods={handleAddMods}
                                    onBrowseMods={onBrowseMods}
                                    onDeleteMod={handleDeleteMod}
                                    missingManifestMods={missingManifestMods}
                                    onInstallManifest={handleInstallManifest}
                                    isInstallingManifest={isInstallingManifest}
                                    // Resource Packs
                                    resourcePacks={resourcePacks}
                                    isLoadingResourcePacks={isLoadingResourcePacks}
                                    onRefreshResourcePacks={handleRefreshResourcePacks}
                                    onAddResourcePacks={handleAddResourcePacks}
                                    onDeleteResourcePack={handleDeleteResourcePack}
                                    // Shaders
                                    installedShaders={installedShaders}
                                    isLoadingShaders={isLoadingShaders}
                                    onRefreshShaders={handleRefreshShaders}
                                    onAddShaders={handleAddShaders}
                                    onBrowseShaders={onBrowseShaders}
                                    onDeleteShader={handleDeleteShader}
                                    // Drag and Drop
                                    isDraggingGlobal={isDragging}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDropMod={handleDrop}
                                    onDropResourcePack={handleResourcePackDrop}
                                    onDropShader={handleShaderDrop}
                                    // Lazy Load
                                    onLazyLoad={handleLazyLoad}
                                />
                            </div>
                        ) : (
                            <EmptyState onNewCrop={onNewCrop} onRestoreDefault={onRestoreDefault} />
                        )}
                    </div>
                </div>
            </div>

            {/* Baked Quick Switch at Bottom - Persistent Footer */}
            {selectedInstance && !showAdvanced && !showCropModal && !showLoginModal && (
                <div className="flex-none z-[100]">
                    <QuickSwitchPanel
                        instances={instances}
                        selectedInstance={selectedInstance}
                        setSelectedInstance={setSelectedInstance}
                        onManageAll={onManageAll}
                        onNewCrop={onNewCrop}
                        className="w-full bg-slate-900/40 backdrop-blur-2xl shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.5)] border-t border-white/20 rounded-t-[2.5rem] rounded-b-none pt-5 pb-4 px-8 ring-1 ring-inset ring-white/5"
                    />
                </div>
            )}
        </div>
    );
};

export default HomeView;
