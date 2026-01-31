import React, { useEffect, useState } from 'react';
import { User, X, Check, Trash2, PlusCircle, Shield, Globe, HardDrive, Calendar, MousePointer2, LogOut } from 'lucide-react';
import PlayerAvatar from '../common/PlayerAvatar';

const AccountManagementModal = ({
    isOpen,
    onClose,
    accounts,
    activeAccount,
    onSwitchAccount,
    onRemoveAccount,
    onAddAccount
}) => {
    const [joinedDates, setJoinedDates] = useState({});

    useEffect(() => {
        if (isOpen && window.electronAPI?.getUserProfile) {
            // In a real app, you might fetch profiles for all accounts
            // For now, we'll just fetch for the active one to show detail
            window.electronAPI.getUserProfile().then(res => {
                if (res.success && res.profile) {
                    const dStr = res.profile.createdAt || res.profile.created_at;
                    if (dStr) {
                        const date = new Date(dStr);
                        setJoinedDates(prev => ({
                            ...prev,
                            [activeAccount?.id]: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        }));
                    }
                }
            }).catch(console.error);
        }
    }, [isOpen, activeAccount?.id]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 w-full max-w-2xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] select-none">

                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            <User className="text-emerald-500" size={24} />
                            Identity Management
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage your connected game identities and sessions</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">

                    {/* Active Account Detail View (Redesigned) */}
                    <div className="mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 relative overflow-hidden">
                            {/* Background Effect */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="absolute top-6 right-6 z-20">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                    Active Account
                                </span>
                            </div>

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="relative group">
                                    <div className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="w-20 h-20 rounded-xl bg-slate-900 border-2 border-slate-700 overflow-hidden shadow-2xl relative z-10">
                                        <PlayerAvatar name={activeAccount?.name} uuid={activeAccount?.uuid} size={80} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-700 z-20">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse box-shadow-glow" title="Online" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <h3 className="text-2xl font-bold text-white tracking-tight select-text">{activeAccount?.name || 'Guest User'}</h3>

                                    <div className="flex flex-col gap-1 opacity-70">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                {activeAccount?.type} Account
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-1">
                                            UUID: <span className="text-slate-400 select-all">{activeAccount?.uuid || 'N/A'}</span>
                                        </div>
                                        {joinedDates[activeAccount?.id] && (
                                            <div className="text-xs text-slate-500 font-mono">
                                                Member Since: <span className="text-slate-400">{joinedDates[activeAccount?.id]}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All Accounts Grid */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Connected Identities</div>
                            <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[10px] font-black">
                                {accounts?.length || 0} TOTAL
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {accounts?.map(acc => {
                                const isActive = activeAccount?.id === acc.id;
                                return (
                                    <div
                                        key={acc.id}
                                        className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${isActive
                                            ? 'bg-emerald-500/5 border-emerald-500/40 ring-1 ring-emerald-500/20'
                                            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                                            }`}
                                    >
                                        <div className="relative w-12 h-12 rounded-xl bg-slate-950 border border-white/10 p-0.5 overflow-hidden flex-shrink-0">
                                            <PlayerAvatar name={acc.name} uuid={acc.uuid} size={48} />
                                        </div>

                                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white tracking-tight truncate select-text">{acc.name}</span>
                                                {isActive && (
                                                    <div className="bg-emerald-500 text-white p-0.5 rounded-full">
                                                        <Check size={10} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span>{acc.type} Session</span>
                                                <span className="text-slate-600">•</span>
                                                <span>{new Date().toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!isActive ? (
                                                <>
                                                    <button
                                                        onClick={() => onSwitchAccount(acc)}
                                                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-wider text-slate-300"
                                                    >
                                                        Switch
                                                    </button>
                                                    <button
                                                        onClick={() => onRemoveAccount(acc.id)}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                        title="Remove account"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => onRemoveAccount(acc.id)}
                                                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 transition-all text-[11px] font-black uppercase tracking-wider flex items-center gap-2"
                                                    title="Log Out"
                                                >
                                                    <LogOut size={14} />
                                                    <span>Log Out</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                onClick={onAddAccount}
                                className="w-full mt-2 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 text-slate-500 hover:text-emerald-400 transition-all group"
                            >
                                <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-bold uppercase tracking-widest">Connect New Identity</span>
                            </button>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default AccountManagementModal;
