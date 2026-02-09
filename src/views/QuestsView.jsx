import React, { useState, useEffect } from 'react';
import { Scroll, CheckCircle, Circle, Gem, Gift, RefreshCw, Lock, Star, ChevronRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const getRarityColor = (rarity) => {
    switch (rarity) {
        case 'Legendary': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
        case 'Epic': return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
        case 'Rare': return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
        default: return { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    }
};

const QuestRow = ({ quest, onClaim, theme }) => {
    const isCompleted = quest.progress >= quest.target;
    const isClaimed = quest.claimed;
    const percentage = Math.min(100, (quest.progress / quest.target) * 100);
    const rarityColors = getRarityColor(quest.rarity);

    return (
        <div className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${theme === 'white'
            ? 'bg-white/80 border-slate-200 hover:shadow-md'
            : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60'
            } ${isClaimed ? 'opacity-50' : ''}`}>

            {/* Progress Bar Background (Subtle) */}
            <div className={`absolute bottom-0 left-0 h-1 w-full ${theme === 'white' ? 'bg-slate-100' : 'bg-white/5'}`}>
                <div
                    className={`h-full transition-all duration-1000 ease-out ${isClaimed ? 'bg-slate-500' : 'bg-emerald-500'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex items-center p-4 gap-4">
                {/* Icon / Status */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border ${isClaimed
                    ? (theme === 'white' ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-800 border-slate-700 text-slate-500')
                    : isCompleted
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : (theme === 'white' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400')
                    }`}>
                    {isClaimed ? <CheckCircle size={20} /> : isCompleted ? <Gift size={24} className="animate-bounce-slow" /> : <Scroll size={20} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-base truncate ${theme === 'white' ? 'text-slate-800' : 'text-slate-200'}`}>
                            {quest.title}
                        </h3>
                        {quest.rarity && (
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${rarityColors.bg} ${rarityColors.text} ${rarityColors.border}`}>
                                {quest.rarity}
                            </span>
                        )}
                    </div>
                    <p className={`text-sm truncate ${theme === 'white' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {quest.description}
                    </p>
                </div>

                {/* Progress Text */}
                <div className="text-right hidden sm:block mr-2">
                    <div className={`text-xs font-bold ${theme === 'white' ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-1`}>
                        Progress
                    </div>
                    <div className={`text-sm font-mono ${theme === 'white' ? 'text-slate-700' : 'text-slate-300'}`}>
                        {quest.progress} <span className="text-slate-500">/</span> {quest.target}
                    </div>
                </div>

                {/* Rewards & Action */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                    <div className={`flex flex-col items-end ${isClaimed ? 'opacity-50' : ''}`}>
                        <div className={`flex items-center gap-1.5 font-bold ${theme === 'white' ? 'text-emerald-600' : 'text-emerald-400'}`}>
                            <Gem size={16} />
                            <span>{quest.reward}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onClaim(quest.id)}
                        disabled={!isCompleted || isClaimed}
                        className={`h-10 px-5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isClaimed
                            ? 'bg-transparent text-slate-500 cursor-not-allowed'
                            : isCompleted
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-95'
                                : (theme === 'white' ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-slate-500')
                            }`}
                    >
                        {isClaimed ? (
                            <span className="flex items-center gap-1">Claimed <CheckCircle size={14} /></span>
                        ) : isCompleted ? (
                            <span>Claim</span>
                        ) : (
                            <span className="opacity-50">{Math.round(percentage)}%</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuestsView = ({ theme }) => {
    const { addToast } = useToast();
    const [shards, setShards] = useState(1250);

    // Mock Quests Data with Rarity
    const [quests, setQuests] = useState([
        {
            id: 'daily-1',
            title: "First Steps",
            description: "Play the game for 1 hour to get started.",
            progress: 45,
            target: 60,
            reward: 100,
            rarity: 'Common',
            claimed: false,
            type: 'DAILY'
        },
        {
            id: 'weekly-1',
            title: "Community Builder",
            description: "Join or create a multiplayer server.",
            progress: 1,
            target: 1,
            reward: 300,
            rarity: 'Rare',
            claimed: false, // Ready to claim
            type: 'WEEKLY'
        },
        {
            id: 'daily-2',
            title: "Social Butterfly",
            description: "Invite a friend to play with you.",
            progress: 0,
            target: 1,
            reward: 500,
            rarity: 'Epic',
            claimed: false,
            type: 'DAILY'
        },
        {
            id: 'milestone-1',
            title: "Mod Master",
            description: "Install your first modpack.",
            progress: 1,
            target: 1,
            reward: 200,
            rarity: 'Common',
            claimed: true,
            type: 'MILESTONE'
        },
        {
            id: 'legend-1',
            title: "The Collector",
            description: "Collect 10 different cosmetic items.",
            progress: 3,
            target: 10,
            reward: 1000,
            rarity: 'Legendary',
            claimed: false,
            type: 'MILESTONE'
        }
    ]);

    const handleClaim = (id) => {
        setQuests(prev => prev.map(q => {
            if (q.id === id) {
                setShards(s => s + q.reward);
                addToast(`Claimed ${q.reward} Shards!`, "success");
                return { ...q, claimed: true };
            }
            return q;
        }));
    };

    // Sorting Logic:
    // 1. Ready to Claim (Completed && !Claimed) - Top Priority
    // 2. In Progress (!Completed && !Claimed)
    // 3. Claimed (Completed && Claimed) - Bottom Priority
    const sortedQuests = [...quests].sort((a, b) => {
        const aReady = a.progress >= a.target && !a.claimed;
        const bReady = b.progress >= b.target && !b.claimed;

        if (aReady && !bReady) return -1;
        if (!aReady && bReady) return 1;

        if (a.claimed && !b.claimed) return 1;
        if (!a.claimed && b.claimed) return -1;

        // Secondary sort by Rarity or Type if needed, but let's keep it simple
        return 0;
    });

    return (
        <div className={`w-full h-full overflow-y-auto custom-scrollbar relative animate-in fade-in duration-500 select-none ${theme === 'white' ? 'bg-slate-50' : 'bg-transparent'}`}>

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden fixed">
                <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${theme === 'white' ? 'bg-emerald-300' : 'bg-emerald-600/30'}`} />
                <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${theme === 'white' ? 'bg-indigo-300' : 'bg-indigo-600/30'}`} />
            </div>

            <div className="min-h-full w-full flex flex-col items-center py-12 px-6 relative z-10">

                {/* Header Section */}
                <div className="w-full max-w-5xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h1 className={`text-4xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r ${theme === 'white' ? 'from-slate-900 to-slate-700' : 'from-white to-slate-400'}`}>
                            Quests
                        </h1>
                        <p className={`text-lg ${theme === 'white' ? 'text-slate-600' : 'text-slate-400'}`}>
                            Complete tasks to earn Shards and rewards.
                        </p>
                    </div>

                    {/* Seeds Counter */}
                    <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-transform hover:scale-105 ${theme === 'white'
                        ? 'bg-white/90 border-slate-200 shadow-sm'
                        : 'bg-slate-900/60 border-white/10 shadow-xl'
                        }`}>
                        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
                            <Gem size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'white' ? 'text-slate-400' : 'text-slate-500'}`}>Total Shards</span>
                            <span className={`text-2xl font-black ${theme === 'white' ? 'text-slate-800' : 'text-white'}`}>{shards.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Quests List */}
                <div className="w-full max-w-5xl flex flex-col gap-3">
                    {/* Active Section Header */}
                    {sortedQuests.some(q => !q.claimed) && (
                        <div className={`text-xs font-bold uppercase tracking-widest mb-1 mt-2 pl-1 ${theme === 'white' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Active Quests
                        </div>
                    )}

                    {sortedQuests.filter(q => !q.claimed).map(quest => (
                        <QuestRow
                            key={quest.id}
                            quest={quest}
                            onClaim={handleClaim}
                            theme={theme}
                        />
                    ))}

                    {/* Completed Section Header */}
                    {sortedQuests.some(q => q.claimed) && (
                        <div className={`text-xs font-bold uppercase tracking-widest mb-1 mt-8 pl-1 flex items-center gap-2 ${theme === 'white' ? 'text-slate-400' : 'text-slate-500'}`}>
                            <CheckCircle size={12} />
                            Completed
                        </div>
                    )}

                    {sortedQuests.filter(q => q.claimed).map(quest => (
                        <QuestRow
                            key={quest.id}
                            quest={quest}
                            onClaim={handleClaim}
                            theme={theme}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default QuestsView;
