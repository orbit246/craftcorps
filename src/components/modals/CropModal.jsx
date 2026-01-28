import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LOADERS, COLORS, FALLBACK_VERSIONS } from '../../data/mockData';
import { fetchMinecraftVersions } from '../../utils/minecraftApi';
import { useToast } from '../../contexts/ToastContext';

// Sub-components
import { CropHeader } from './crop/CropHeader';
import { IdentitySection, VersionSection } from './crop/CropSections';
import { AutoConnectSetting, RamOverrideSetting } from './crop/CropAdvancedSettings';
import { CropFooter } from './crop/CropFooter';
import {
    DeleteConfirmOverlay,
    ImportingOverlay,
    LoaderWarningOverlay,
    VersionWarningOverlay
} from './crop/CropOverlays';

const PRESETS = [
    { id: 'survival', label: 'Survival', icon: 'Pickaxe' },
    { id: 'creative', label: 'Creative', icon: 'Box' },
    { id: 'modded', label: 'Modded', icon: 'Zap' },
    { id: 'pvp', label: 'PvP', icon: 'Sword' },
    { id: 'hardcore', label: 'Hardcore', icon: 'Skull' },
];

const THEMES = [
    { id: 'grass', label: 'Grass', colorName: 'Emerald' },
    { id: 'stone', label: 'Stone', colorName: 'Slate' },
    { id: 'nether', label: 'Nether', colorName: 'Rose' },
    { id: 'end', label: 'End', colorName: 'Purple' },
    { id: 'ocean', label: 'Ocean', colorName: 'Blue' },
];

const CropModal = ({ isOpen, onClose, onSave, editingCrop, onDelete, instanceCount = 0 }) => {
    const { t } = useTranslation();
    const { addToast: showToast } = useToast();

    // Core state
    const [name, setName] = useState('');
    const [loader, setLoader] = useState(LOADERS[0]);
    const [version, setVersion] = useState('');
    const [includeSnapshots, setIncludeSnapshots] = useState(false);
    const [versions, setVersions] = useState(FALLBACK_VERSIONS);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [errors, setErrors] = useState({});

    // Advanced state
    const [autoConnect, setAutoConnect] = useState(false);
    const [serverAddress, setServerAddress] = useState('');
    const [ramOverride, setRamOverride] = useState(false);
    const [ram, setRam] = useState(4);

    // UI state
    const [isImporting, setIsImporting] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isLoaderWarningOpen, setIsLoaderWarningOpen] = useState(false);
    const [isVersionWarningOpen, setIsVersionWarningOpen] = useState(false);
    const [pendingLoader, setPendingLoader] = useState(null);
    const [pendingVersion, setPendingVersion] = useState(null);
    const [shouldRender, setShouldRender] = useState(isOpen);

    // Animation Lifecycle
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else {
            const timer = setTimeout(() => setShouldRender(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Data Loading
    useEffect(() => {
        const loadVersions = async () => {
            setLoadingVersions(true);
            const fetchedVersions = await fetchMinecraftVersions(includeSnapshots);
            setVersions(fetchedVersions);
            setLoadingVersions(false);
        };
        loadVersions();
    }, [includeSnapshots]);

    // Form Population
    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setIsImporting(false);
            setIsDeleteConfirmOpen(false);
            if (editingCrop) {
                setName(editingCrop.name);
                const matchedLoader = LOADERS.find(l => l.toLowerCase() === (editingCrop.loader || '').toLowerCase());
                setLoader(matchedLoader || editingCrop.loader);
                setVersion(editingCrop.version);
                setAutoConnect(editingCrop.autoConnect || false);
                setServerAddress(editingCrop.serverAddress || '');
                setRamOverride(editingCrop.ramOverride || false);
                setRam(editingCrop.ram || '4');
            } else {
                setName('');
                setLoader(LOADERS[0]);
                setVersion(versions[0] || '1.21.11');
                setAutoConnect(false);
                setServerAddress('');
                setRamOverride(false);
                setRam('4');
            }
            setIsLoaderWarningOpen(false);
            setPendingLoader(null);
            setIsVersionWarningOpen(false);
            setPendingVersion(null);
        }
    }, [isOpen, editingCrop, versions]);

    // Handlers
    const handleImport = async () => {
        try {
            const dialogRes = await window.electronAPI.importInstanceDialog();
            if (dialogRes.cancelled) return;
            if (!dialogRes.success) {
                showToast(dialogRes.error, 'error');
                return;
            }

            setIsImporting(true);
            await new Promise(r => setTimeout(r, 100));

            const res = await window.electronAPI.performImportInstance(dialogRes.path);

            setIsImporting(false);
            if (res.success) {
                showToast(`Imported ${res.instance.name} successfully!`, 'success');
                window.location.reload();
            } else {
                showToast(`Import failed: ${res.error}`, 'error');
            }
        } catch (e) {
            setIsImporting(false);
            showToast(e.message, 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!version) newErrors.version = true;
        if (autoConnect && !serverAddress.trim()) newErrors.serverAddress = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const finalName = name.trim() || `My World (${instanceCount + 1})`;
        let path = editingCrop?.path;
        if (!editingCrop && window.electronAPI) {
            try {
                path = await window.electronAPI.getNewInstancePath(finalName);
            } catch (err) {
                console.error("Failed to generate instance path:", err);
            }
        }

        onSave({
            ...(editingCrop || {}),
            id: editingCrop ? editingCrop.id : `inst_${Date.now()}`,
            name: finalName,
            loader,
            version,
            status: editingCrop ? editingCrop.status : 'Ready',
            lastPlayed: editingCrop ? editingCrop.lastPlayed : null,
            autoConnect,
            serverAddress: autoConnect ? serverAddress.trim() : '',
            path,
            ramOverride,
            ram: ramOverride ? ram : null
        });
        onClose();
    };

    const handleLoaderChange = (newLoader) => {
        const hasMods = editingCrop && (editingCrop.mods?.length > 0 || editingCrop.loader !== 'Vanilla');
        if (hasMods && newLoader !== loader) {
            setPendingLoader(newLoader);
            setIsLoaderWarningOpen(true);
        } else {
            setLoader(newLoader);
        }
    };

    const handleVersionChange = (newVersion) => {
        const hasMods = editingCrop && (editingCrop.mods?.length > 0 || editingCrop.loader !== 'Vanilla');
        if (hasMods && newVersion !== version) {
            setPendingVersion(newVersion);
            setIsVersionWarningOpen(true);
        } else {
            setVersion(newVersion);
            if (errors.version) setErrors(prev => ({ ...prev, version: false }));
        }
    };

    if (!shouldRender && !isOpen) return null;

    const loaderOptions = LOADERS.map(l => ({
        value: l,
        label: l === 'Vanilla' ? t('crop_loader_vanilla') : l,
    }));

    const versionOptions = versions.map((v, index) => ({
        value: v,
        label: index === 0 ? `${v} ${t('crop_version_latest')}` : v
    }));

    return (
        <div
            className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        >
            <div
                className={`bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-12 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <CropHeader
                    editingCrop={editingCrop}
                    name={name}
                    onImport={handleImport}
                    isImporting={isImporting}
                    onClose={onClose}
                />

                <form onSubmit={handleSubmit} className={`flex flex-col flex-1 min-h-0 relative z-10 ${isImporting ? 'opacity-30 pointer-events-none' : ''}`}>
                    <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-8 custom-scrollbar pb-10">
                        <IdentitySection
                            name={name}
                            setName={setName}
                            errors={errors}
                            setErrors={setErrors}
                            t={t}
                        />

                        <VersionSection
                            loader={loader}
                            handleLoaderChange={handleLoaderChange}
                            loaderOptions={loaderOptions}
                            version={version}
                            handleVersionChange={handleVersionChange}
                            versionOptions={versionOptions}
                            loadingVersions={loadingVersions}
                            includeSnapshots={includeSnapshots}
                            setIncludeSnapshots={setIncludeSnapshots}
                            versions={versions}
                            editingCrop={editingCrop}
                            errors={errors}
                            t={t}
                        />

                        <AutoConnectSetting
                            autoConnect={autoConnect}
                            setAutoConnect={setAutoConnect}
                            serverAddress={serverAddress}
                            setServerAddress={setServerAddress}
                            errors={errors}
                            setErrors={setErrors}
                        />

                        <RamOverrideSetting
                            ramOverride={ramOverride}
                            setRamOverride={setRamOverride}
                            ram={ram}
                            setRam={setRam}
                        />
                    </div>

                    <CropFooter
                        editingCrop={editingCrop}
                        onCancel={onClose}
                        onDelete={() => setIsDeleteConfirmOpen(true)}
                        onOpenFolder={() => window.electronAPI.openPath(editingCrop.path)}
                    />
                </form>

                {/* Overlays */}
                <DeleteConfirmOverlay
                    isOpen={isDeleteConfirmOpen}
                    onCancel={() => setIsDeleteConfirmOpen(false)}
                    name={editingCrop?.name}
                    onConfirm={() => {
                        onDelete(editingCrop.id);
                        onClose();
                    }}
                />

                <ImportingOverlay isImporting={isImporting} />

                <LoaderWarningOverlay
                    isOpen={isLoaderWarningOpen}
                    onCancel={() => {
                        setIsLoaderWarningOpen(false);
                        setPendingLoader(null);
                    }}
                    onConfirm={() => {
                        setLoader(pendingLoader);
                        setIsLoaderWarningOpen(false);
                        setPendingLoader(null);
                    }}
                    currentLoader={loader}
                    pendingLoader={pendingLoader}
                />

                <VersionWarningOverlay
                    isOpen={isVersionWarningOpen}
                    onCancel={() => {
                        setIsVersionWarningOpen(false);
                        setPendingVersion(null);
                    }}
                    onConfirm={() => {
                        setVersion(pendingVersion);
                        setIsVersionWarningOpen(false);
                        setPendingVersion(null);
                        if (errors.version) setErrors(prev => ({ ...prev, version: false }));
                    }}
                    currentVersion={version}
                    pendingVersion={pendingVersion}
                />
            </div>
        </div>
    );
};

export default CropModal;
