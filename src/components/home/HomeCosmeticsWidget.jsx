import React from 'react';
import { Pencil, Box } from 'lucide-react';
import Cape2DRender from '../common/Cape2DRender';

const HomeCosmeticsWidget = ({
    activeCosmetics,
    isLoadingCosmetics,
    onOpenWardrobe
}) => {
    return (
        <div className="flex flex-col gap-4 w-full mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between w-full pr-4">
                <div className="flex flex-col gap-0.5">
                    <h4 className="text-xl font-bold text-white tracking-tight">Active Cosmetics</h4>
                    <p className="text-sm text-slate-500 font-medium">Customize how others see you!</p>
                </div>
                <button
                    onClick={onOpenWardrobe}
                    className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-white/10 transition-all group"
                >
                    <span className="text-xs font-bold uppercase tracking-wider">Customize in Wardrobe</span>
                    <Pencil size={14} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* The Widget Card */}
            <div className="bg-slate-900/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                    {isLoadingCosmetics ? (
                        // Loading Skeletons
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/20 border border-white/5 animate-pulse">
                                <div className="w-12 h-12 rounded-xl bg-slate-800/50 shrink-0" />
                                <div className="flex flex-col gap-2 flex-1">
                                    <div className="h-4 w-24 bg-slate-800/50 rounded" />
                                    <div className="h-3 w-16 bg-slate-800/30 rounded" />
                                </div>
                            </div>
                        ))
                    ) : (activeCosmetics && activeCosmetics.length > 0 ? (
                        activeCosmetics.map(cosmetic => (
                            <div
                                key={cosmetic.id}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-950/60 flex items-center justify-center overflow-hidden shrink-0 shadow-inner p-1">
                                    {cosmetic.texture ? (
                                        (cosmetic.type || '').toLowerCase() === 'cape' ? (
                                            <Cape2DRender
                                                capeUrl={cosmetic.texture}
                                                scale={3}
                                                className="w-auto h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                                            />
                                        ) : (
                                            <img src={cosmetic.texture} alt={cosmetic.name} className="w-full h-full object-contain" />
                                        )
                                    ) : (
                                        <Box size={24} className="text-slate-600" />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-white truncate leading-tight mb-0.5">{cosmetic.name}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{cosmetic.type || 'Cosmetic'}</span>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />

                                {/* Subtle Background Glow on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        ))
                    ) : (
                        <div
                            className="col-span-full flex items-center gap-6 p-10 rounded-3xl bg-white/5 border border-dashed border-white/10 group hover:border-white/20 transition-all cursor-pointer"
                            onClick={onOpenWardrobe}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                                <Box size={28} />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-lg font-bold text-slate-400 group-hover:text-slate-200 transition-colors">No active cosmetics</p>
                                <p className="text-sm text-slate-500">Equip items in the wardrobe to see them here.</p>
                            </div>
                            <div className="ml-auto text-xs font-bold text-emerald-500/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                Open Wardrobe →
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeCosmeticsWidget;
