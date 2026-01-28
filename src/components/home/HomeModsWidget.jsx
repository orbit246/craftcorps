import React from 'react';
import { Layers, Settings, Package } from 'lucide-react';

const HomeModsWidget = ({
    mods,
    isLoading,
    onToggleEdit
}) => {
    // Take the first few mods to display for the "short list"
    const displayMods = mods ? mods.slice(0, 8) : [];
    const remainingCount = mods ? Math.max(0, mods.length - 8) : 0;

    return (
        <div className="flex flex-col gap-4 w-full mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="flex items-center justify-between w-full pr-4">
                <div className="flex flex-col gap-0.5">
                    <h4 className="text-xl font-bold text-white tracking-tight">Mods</h4>
                    <p className="text-sm text-slate-500 font-medium">Mods active in this instance</p>
                </div>
                <button
                    onClick={onToggleEdit}
                    className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-white/10 transition-all group"
                >
                    <span className="text-xs font-bold uppercase tracking-wider">Manage Mods</span>
                    <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
            </div>

            {/* The Widget Card */}
            <div className="bg-slate-900/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
                {isLoading ? (
                    <div className="flex flex-wrap gap-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-8 w-24 bg-slate-800/50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : (mods && mods.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {displayMods.map((mod, index) => (
                            <div
                                key={mod.path || index}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-white/5 text-slate-300 text-xs font-medium hover:bg-slate-700/50 hover:text-white transition-colors cursor-default"
                                title={mod.fileName || mod.name}
                            >
                                <Package size={12} className="text-emerald-500/70" />
                                <span className="truncate max-w-[150px]">{mod.name || mod.fileName}</span>
                            </div>
                        ))}
                        {remainingCount > 0 && (
                            <div className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                +{remainingCount} more
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-8 text-slate-600 gap-2">
                        <Package size={20} />
                        <span className="font-medium">No mods installed</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeModsWidget;
