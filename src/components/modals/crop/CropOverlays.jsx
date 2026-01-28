import React from 'react';
import { Trash2, Loader2, Zap, Clock } from 'lucide-react';

export const DeleteConfirmOverlay = ({ isOpen, onCancel, onConfirm, name }) => {
    if (!isOpen) return null;
    return (
        <div
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200"
            onClick={onCancel}
        >
            <div className="relative z-10 w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500 animate-in zoom-in duration-300 ring-1 ring-red-500/20">
                    <Trash2 size={32} />
                </div>
                <h4 className="relative z-10 text-xl font-bold text-slate-200 mb-2">Delete Instance?</h4>
                <p className="relative z-10 text-slate-400 mb-8 max-w-xs text-sm">
                    Are you sure you want to delete <span className="font-bold text-slate-200">{name}</span>?
                    <br /><span className="text-red-400/80">This action cannot be undone.</span>
                </p>
                <div className="relative z-10 flex gap-3 w-full">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ImportingOverlay = ({ isImporting }) => {
    if (!isImporting) return null;
    return (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
            <h4 className="text-lg font-bold text-slate-200 mb-1">Importing Modpack...</h4>
            <p className="text-slate-400 text-sm">Copying files via Warp Drive</p>
        </div>
    );
};

export const LoaderWarningOverlay = ({ isOpen, onCancel, onConfirm, currentLoader, pendingLoader }) => {
    if (!isOpen) return null;
    return (
        <div
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200"
            onClick={onCancel}
        >
            <div className="relative z-10 w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 text-amber-500 animate-in zoom-in duration-300 ring-1 ring-amber-500/20">
                    <Zap size={32} />
                </div>
                <h4 className="relative z-10 text-xl font-bold text-slate-200 mb-2">Change Mod Loader?</h4>
                <p className="relative z-10 text-slate-400 mb-8 max-w-xs text-sm">
                    Switching from <span className="font-bold text-slate-200">{currentLoader}</span> to <span className="font-bold text-slate-200">{pendingLoader}</span> may cause your installed mods to stop working.
                    <br /><br />
                    <span className="text-amber-400/80">Mods are usually built for a specific loader (e.g. Fabric mods won't work on Forge).</span>
                </p>
                <div className="relative z-10 flex gap-3 w-full">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                    >
                        Keep Current
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all active:scale-95"
                    >
                        Switch Anyway
                    </button>
                </div>
            </div>
        </div>
    );
};

export const VersionWarningOverlay = ({ isOpen, onCancel, onConfirm, currentVersion, pendingVersion }) => {
    if (!isOpen) return null;
    return (
        <div
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200"
            onClick={onCancel}
        >
            <div className="relative z-10 w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 text-amber-500 animate-in zoom-in duration-300 ring-1 ring-amber-500/20">
                    <Clock size={32} />
                </div>
                <h4 className="relative z-10 text-xl font-bold text-slate-200 mb-2">Change Game Version?</h4>
                <p className="relative z-10 text-slate-400 mb-8 max-w-xs text-sm">
                    Switching from <span className="font-bold text-slate-200">{currentVersion}</span> to <span className="font-bold text-slate-200">{pendingVersion}</span> will likely break your currently installed mods.
                    <br /><br />
                    <span className="text-amber-400/80">Most Minecraft mods are version-locked and will not run on a different game version.</span>
                </p>
                <div className="relative z-10 flex gap-3 w-full">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                    >
                        Keep Current
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all active:scale-95"
                    >
                        Switch Anyway
                    </button>
                </div>
            </div>
        </div>
    );
};
