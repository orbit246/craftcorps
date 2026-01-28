import { Sprout, Plus, Sparkles, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EmptyState = ({ onNewCrop, onRestoreDefault }) => {
    const { t } = useTranslation();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center mb-12 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4 mx-auto border border-white/5 ring-1 ring-white/10">
                    <Sprout size={32} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-200 mb-2">{t('home_no_crops')}</h3>
                <p className="text-slate-500 text-sm">You don't have any Minecraft instances yet. How would you like to start?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                {/* Option 1: Custom Instance */}
                <button
                    onClick={onNewCrop}
                    className="group relative flex flex-col items-center p-8 bg-slate-900/40 border border-white/10 rounded-[2rem] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 ring-1 ring-inset ring-white/5 text-center"
                >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                        <Plus size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-100 mb-2">Create Custom</h4>
                    <p className="text-slate-500 text-xs leading-relaxed px-4">Build your own instance from scratch with any version and loader.</p>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] blur-xl pointer-events-none" />
                </button>

                {/* Option 2: CraftCorps Client */}
                <button
                    onClick={onRestoreDefault}
                    className="group relative flex flex-col items-center p-8 bg-slate-900/40 border border-white/10 rounded-[2rem] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 ring-1 ring-inset ring-white/5 text-center"
                >
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                        <Sparkles size={28} />
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <h4 className="text-lg font-bold text-slate-100 line-clamp-1 leading-tight">CraftCorps Client</h4>
                        <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed px-4">Quick-start with optimized performance mods and verified settings.</p>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] blur-xl pointer-events-none" />
                </button>
            </div>
        </div>
    );
};

export default EmptyState;
