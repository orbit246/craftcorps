import React, { useState } from 'react';
import { Globe, Download, Search } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { equipCosmetic } from '../../utils/cosmeticsApi';
import Cape2DRender from '../common/Cape2DRender';

const CommunityCosmetics = ({
    categorizedCosmetics,
    activeAccount,
    refreshCosmetics,
    theme,
    toggleCosmetic
}) => {
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    // Filter for unowned capes
    const communityCapes = (categorizedCosmetics['Capes'] || []).filter(item => !item.isOwned);

    const handleGrab = async (item) => {
        if (!activeAccount) return;
        try {
            // Attempt to equip directly (simulate getting it)
            // In a real app, this would be Purchase -> Then Equip
            await equipCosmetic(
                activeAccount.backendAccessToken || activeAccount.accessToken,
                item.id,
                activeAccount.uuid || activeAccount.id
            );

            addToast(`Acquired ${item.name}!`, 'success');

            // Toggle it locally immediately to reflect change?
            // Actually refreshCosmetics should handle reloading ownership.
            if (refreshCosmetics) refreshCosmetics();

            // Also toggle locally if toggleCosmetic supports adding unowned items (it might not)
            if (toggleCosmetic) toggleCosmetic({ ...item, isOwned: true });

        } catch (e) {
            console.error(e);
            addToast('Failed to acquire cosmetic', 'error');
        }
    };

    const filteredCapes = communityCapes.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 h-full">
            {/* Header / Search */}
            <div className={`p-6 rounded-[2rem] border relative overflow-hidden flex flex-col gap-4 ${theme === 'white' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/40 border-white/5'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <Globe size={20} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-black text-white tracking-tight">Community Store</h2>
                            <p className="text-xs text-slate-400">Discover new capes created by the community.</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search capes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full py-3 pl-10 pr-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${theme === 'white' ? 'bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400' : 'bg-black/20 border border-white/5 text-white placeholder:text-slate-600'}`}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {filteredCapes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-900/40 flex items-center justify-center border border-white/5">
                            <Globe size={32} className="opacity-20" />
                        </div>
                        <p>No new capes found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredCapes.map(item => (
                            <div key={item.id} className={`group relative rounded-3xl p-3 border transition-all overflow-hidden ${theme === 'white' ? 'bg-white border-slate-200 hover:border-purple-400 hover:shadow-lg' : 'bg-slate-900/40 border-white/5 hover:border-purple-500/50 hover:bg-slate-800/40'}`}>
                                {/* Preview */}
                                <div className={`aspect-square rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden ${theme === 'white' ? 'bg-slate-100' : 'bg-slate-900/60 shadow-inner'}`}>
                                    <div className="w-full h-full flex items-center justify-center p-4 transition-transform duration-500 group-hover:scale-110">
                                        <Cape2DRender
                                            capeUrl={item.texture}
                                            scale={8}
                                            className="w-auto h-full max-h-[90%] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-xs font-bold truncate ${theme === 'white' ? 'text-slate-700' : 'text-slate-200'}`}>{item.name}</span>
                                        <span className="text-[10px] text-slate-500 truncate">By {item.author || 'Community'}</span>
                                    </div>
                                    <button
                                        onClick={() => handleGrab(item)}
                                        className="p-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white transition-all shadow-lg shadow-purple-500/20 active:scale-95 hover:scale-105 shrink-0"
                                        title="Get this cape"
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityCosmetics;
