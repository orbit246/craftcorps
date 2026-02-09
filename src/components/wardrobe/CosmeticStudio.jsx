import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle2, XCircle, Info, Sparkles, Wand2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import Cape2DRender from '../common/Cape2DRender';

const CosmeticStudio = ({ theme, activeAccount, refreshCosmetics, studioState, setStudioState }) => {
    const { addToast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    // Destructure state from props to keep UI in sync with parent state
    // Use fallback if studioState isn't provided (for standalone testing)
    const previewUrl = studioState?.previewUrl || null;
    const selectedFilePath = studioState?.selectedFilePath || null;
    const cosmeticName = studioState?.cosmeticName || '';
    const isPublic = studioState?.isPublic || false;

    // Helper to update specific fields in parent state
    const updateState = (updates) => {
        if (setStudioState) {
            setStudioState(prev => ({ ...prev, ...updates }));
        }
    };

    const handleRenderError = () => {
        addToast('Invalid cape file. Unable to render preview.', 'error');
        updateState({
            previewUrl: null,
            selectedFilePath: null,
            cosmeticName: '',
            testCapeUrl: null
        });
    };

    const handleSelectFile = async () => {
        try {
            const result = await window.electronAPI.selectFile({
                title: 'Select Cape Image',
                filters: [{ name: 'Images', extensions: ['png'] }]
            });

            if (!result) return;

            // Enforce MAX SIZE: 1MB
            const maxSize = 1 * 1024 * 1024; // 1 MB
            if (result.size > maxSize) {
                addToast('File too large. Maximum size is 1MB.', 'error');
                return;
            }

            // Ensure it's a PNG (though filter should handle it, double check)
            if (!result.name.toLowerCase().endsWith('.png')) {
                addToast('Please select a PNG image.', 'error');
                return;
            }

            const filePath = result.path;

            // Generate a local preview using main process to bypass file:// restrictions
            try {
                if (window.electronAPI?.readSkinFile) {
                    const res = await window.electronAPI.readSkinFile(filePath);
                    if (res.success && res.dataUri) {
                        updateState({
                            selectedFilePath: filePath,
                            previewUrl: res.dataUri,
                            cosmeticName: result.name.replace('.png', '')
                        });
                    } else {
                        throw new Error(res.error || 'Failed to read file');
                    }
                } else {
                    // Fallback for non-electron (dev web only) or if API missing
                    updateState({
                        selectedFilePath: filePath,
                        previewUrl: `file://${filePath}`,
                        cosmeticName: result.name.replace('.png', '')
                    });
                }
            } catch (e) {
                console.error('[Studio] Preview generation failed:', e);
                addToast(`Failed to load preview: ${e.message}`, 'error');
                updateState({
                    previewUrl: null,
                    selectedFilePath: null
                });
                return;
            }
        } catch (error) {
            console.error('[Studio] Failed to select file:', error);
            addToast('Failed to select file', 'error');
        }
    };

    const handleUpload = async () => {
        if (!selectedFilePath || !activeAccount) return;

        if (cosmeticName.trim().length < 3) {
            addToast('Cosmetic name must be at least 3 characters long.', 'error');
            return;
        }

        setIsUploading(true);
        try {
            const res = await window.electronAPI.uploadCosmetic({
                filePath: selectedFilePath,
                type: 'CAPE',
                name: cosmeticName || 'Custom Cape',
                isPublic: isPublic
            });

            if (res.success) {
                addToast('Cosmetic uploaded successfully!', 'success');
                updateState({
                    previewUrl: null,
                    selectedFilePath: null,
                    cosmeticName: '',
                    isPublic: false,
                    testCapeUrl: null
                });
                if (refreshCosmetics) refreshCosmetics();
            } else {
                throw new Error(res.error || 'Upload failed');
            }
        } catch (error) {
            console.error('[Studio] Upload error:', error);
            addToast(error.message, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Intro Header */}
            <div className={`p-8 rounded-[2rem] border relative overflow-hidden ${theme === 'white' ? 'bg-white border-slate-200 shadow-lg' : 'bg-slate-900/60 border-white/10 shadow-2xl backdrop-blur-xl'}`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Wand2 size={120} className="text-emerald-500" />
                </div>

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Cosmetic Creator</h2>
                    </div>
                    <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                        Design and upload your own unique cosmetics. Currently, you can upload custom capes to represent your personality or team identity.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Upload Tool */}
                <div className={`flex flex-col gap-6 p-8 rounded-[2rem] border ${theme === 'white' ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-white/5'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 group/info relative">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Create New Cosmetic</span>
                            <div className="text-slate-600 hover:text-emerald-400 cursor-help transition-colors">
                                <Info size={14} />
                            </div>

                            {/* Technical Details Tooltip */}
                            <div className="absolute left-0 top-full mt-2 w-72 p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-[60] backdrop-blur-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={14} className="text-emerald-400" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Technical Specs</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-200">Resolution</span>
                                        <p className="text-[11px] text-slate-300 leading-normal">Standard: 64x32px. HD: 2:1 ratio supported (e.g., 256x128px).</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-200">Transparency</span>
                                        <p className="text-[11px] text-slate-300 leading-normal">Fully transparent areas will be invisible in-game. Avoid semi-transparent borders.</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-200">File Constraints</span>
                                        <p className="text-[11px] text-slate-300 leading-normal">Only <b>PNG</b> files are supported. Maximum file size is <b>1MB</b>.</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-200">Visibility & Review</span>
                                        <p className="text-[11px] text-slate-300 leading-normal">Instantly usable by you. Public visibility requires moderator approval (approx. 24 hours).</p>
                                    </div>
                                </div>
                                <div className="absolute -top-1 left-12 w-2 h-2 bg-slate-900 border-l border-t border-white/10 rotate-45" />
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Live Beta</span>
                        </div>
                    </div>

                    {!previewUrl ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Cosmetic Type</label>
                                <div className="relative">
                                    <select
                                        value="CAPE"
                                        onChange={() => { }}
                                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer ${theme === 'white'
                                                ? 'bg-white border-slate-200 text-slate-700'
                                                : 'bg-black/40 border-white/10 text-white'
                                            }`}
                                    >
                                        <option value="CAPE" className={theme === 'white' ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-200'}>Cape</option>
                                        <option value="HAT" disabled className={theme === 'white' ? 'bg-white text-slate-400' : 'bg-slate-900 text-slate-600'}>Hat (Coming Soon)</option>
                                        <option value="GLASSES" disabled className={theme === 'white' ? 'bg-white text-slate-400' : 'bg-slate-900 text-slate-600'}>Glasses (Coming Soon)</option>
                                        <option value="WINGS" disabled className={theme === 'white' ? 'bg-white text-slate-400' : 'bg-slate-900 text-slate-600'}>Wings (Coming Soon)</option>
                                        <option value="ITEM_SKIN" disabled className={theme === 'white' ? 'bg-white text-slate-400' : 'bg-slate-900 text-slate-600'}>Item Skin (Coming Soon)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={handleSelectFile}
                                className={`aspect-[21/9] rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/30 transition-all cursor-pointer group bg-slate-900/40`}
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 group-hover:scale-110 transition-all">
                                    <Upload size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-white tracking-tight">Click to Upload Cape</p>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest">PNG only · MAX 1MB · 64x32 recommended</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className={`relative aspect-video rounded-3xl overflow-hidden border border-white/5 group flex items-center justify-center bg-slate-900/40`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-slow-sweep pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-50 pointer-events-none" />
                                <div className="absolute inset-0 animate-shimmer opacity-[0.03] pointer-events-none" />

                                <Cape2DRender
                                    capeUrl={previewUrl}
                                    scale={8}
                                    className="object-contain animate-in zoom-in-95 duration-500 drop-shadow-2xl relative z-10"
                                    onError={handleRenderError}
                                />
                                <button
                                    onClick={() => updateState({
                                        previewUrl: null,
                                        selectedFilePath: null,
                                        testCapeUrl: null
                                    })}
                                    className="absolute top-4 right-4 z-20 p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
                                >
                                    <XCircle size={18} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Preview Mode</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">

                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={cosmeticName}
                                        onChange={(e) => updateState({ cosmeticName: e.target.value })}
                                        placeholder="Enter cape name..."
                                        maxLength={32}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                    <div className="flex justify-between ml-1">
                                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                                            Min 3 chars
                                        </span>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${cosmeticName.length >= 3 ? 'text-emerald-500' : 'text-slate-600'}`}>
                                            {cosmeticName.length}/32
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-white">Publicly Visible</span>
                                        <span className="text-[10px] text-slate-500">Allow others to see it in library</span>
                                    </div>
                                    <button
                                        onClick={() => updateState({ isPublic: !isPublic })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${isPublic ? 'bg-emerald-500' : 'bg-slate-700'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${isPublic ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => updateState({ testCapeUrl: studioState?.testCapeUrl === previewUrl ? null : previewUrl })}
                                        className={`py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${studioState?.testCapeUrl === previewUrl
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                            : 'bg-slate-800/40 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-white'}`}
                                    >
                                        {studioState?.testCapeUrl === previewUrl ? <EyeOff size={16} /> : <Eye size={16} />}
                                        {studioState?.testCapeUrl === previewUrl ? 'Stop Testing' : 'Test Model'}
                                    </button>

                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className={`py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isUploading
                                            ? 'bg-emerald-500/10 text-emerald-500/50 cursor-not-allowed'
                                            : 'bg-emerald-500 text-emerald-50 hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20'}`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirm & Upload</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Warning Message - Moved to Bottom */}
            <div className="flex items-start gap-4 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Community Rules & Guidelines</span>
                    <p className="text-[11px] font-medium text-amber-500/80 leading-relaxed">
                        By uploading content, you agree that your designs comply with our community standards. Offensive, inappropriate, or copyrighted material is strictly prohibited and will be removed without notice. Repeated violations may result in account restrictions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CosmeticStudio;
