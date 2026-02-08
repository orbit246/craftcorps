import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle2, XCircle, Info, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const CosmeticStudio = ({ theme, activeAccount, refreshCosmetics }) => {
    const { addToast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFilePath, setSelectedFilePath] = useState(null);
    const [cosmeticName, setCosmeticName] = useState('');

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
            setSelectedFilePath(filePath);

            // Generate a local preview
            setPreviewUrl(`file://${filePath}`);

            // Set default name from file
            const fileName = result.name.replace('.png', '');
            setCosmeticName(fileName);
        } catch (error) {
            console.error('[Studio] Failed to select file:', error);
            addToast('Failed to select file', 'error');
        }
    };

    const handleUpload = async () => {
        if (!selectedFilePath || !activeAccount) return;

        setIsUploading(true);
        try {
            const res = await window.electronAPI.uploadCosmetic({
                filePath: selectedFilePath,
                type: 'CAPE',
                name: cosmeticName || 'Custom Cape'
            });

            if (res.success) {
                addToast('Cosmetic uploaded successfully!', 'success');
                setPreviewUrl(null);
                setSelectedFilePath(null);
                setCosmeticName('');
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
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Create New Cape</span>
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
                                        <p className="text-[9px] text-slate-500 leading-normal">Standard: 64x32px. HD: 2:1 ratio supported (e.g., 256x128px).</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-200">Transparency</span>
                                        <p className="text-[9px] text-slate-500 leading-normal">Fully transparent areas will be invisible in-game. Avoid semi-transparent borders.</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-200">File Constraints</span>
                                        <p className="text-[9px] text-slate-500 leading-normal">Only <b>PNG</b> files are supported. Maximum file size is <b>1MB</b>.</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-200">Global Sync</span>
                                        <p className="text-[9px] text-slate-500 leading-normal">Instantly visible to all Nortix users across all servers.</p>
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
                        <div
                            onClick={handleSelectFile}
                            className="aspect-[21/9] rounded-3xl border-2 border-dashed border-white/5 bg-black/20 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer group"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 group-hover:scale-110 transition-all">
                                <Upload size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-white tracking-tight">Click to Upload Cape</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest">PNG only · MAX 1MB · 64x32 recommended</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black/40 border border-white/10 group">
                                <img
                                    src={previewUrl}
                                    alt="Cape Preview"
                                    className="w-full h-full object-contain p-8 animate-in zoom-in-95 duration-500"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                                <button
                                    onClick={() => { setPreviewUrl(null); setSelectedFilePath(null); }}
                                    className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
                                >
                                    <XCircle size={18} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Preview Mode</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={cosmeticName}
                                        onChange={(e) => setCosmeticName(e.target.value)}
                                        placeholder="Enter cape name..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isUploading
                                        ? 'bg-emerald-500/10 text-emerald-500/50 cursor-not-allowed'
                                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20'}`}
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            <span>Confirm & Upload</span>
                                        </>
                                    )}
                                </button>
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
