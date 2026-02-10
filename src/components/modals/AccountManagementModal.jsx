import React, { useEffect, useState } from 'react';
import { User, X, Check, Trash2, PlusCircle, Shield, Globe, HardDrive, Calendar, MousePointer2, LogOut, Mail, Lock, LogIn, AlertCircle, CheckCircle, Loader2, Gamepad2 } from 'lucide-react';
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
    const [nortixProfile, setNortixProfile] = useState(null);
    const [isLinking, setIsLinking] = useState(false);
    const [linkError, setLinkError] = useState(null);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [emailForm, setEmailForm] = useState({ email: '', password: '' });
    const [authConnections, setAuthConnections] = useState(null);
    const [isLoadingConnections, setIsLoadingConnections] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const fetchAuthConnections = async () => {
        if (window.electronAPI?.getAuthConnections) {
            setIsLoadingConnections(true);
            try {
                const res = await window.electronAPI.getAuthConnections();
                if (res.success) {
                    setAuthConnections(res.connections);
                }
            } catch (error) {
                console.error("Failed to fetch Auth connections:", error);
            } finally {
                setIsLoadingConnections(false);
            }
        }
    };

    const fetchNortixProfile = async () => {
        if (window.electronAPI?.getUserProfile) {
            try {
                const res = await window.electronAPI.getUserProfile();
                if (res.success && res.profile) {
                    setNortixProfile(res.profile);

                    // Also update joined dates for minecraft accounts if relevant
                    const dStr = res.profile.createdAt || res.profile.created_at;
                    if (dStr) {
                        const date = new Date(dStr);
                        if (activeAccount?.id) {
                            setJoinedDates(prev => ({
                                ...prev,
                                [activeAccount.id]: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch Nortix profile:", error);
            }
        }
    };

    const fetchAllData = async () => {
        await Promise.all([
            fetchNortixProfile(),
            fetchAuthConnections()
        ]);
    };

    useEffect(() => {
        if (isOpen) {
            fetchAllData();
        }
    }, [isOpen, activeAccount?.id]);

    const handleLinkDiscord = async () => {
        if (isLinking) return;
        setIsLinking(true);
        setLinkError(null);
        try {
            if (window.electronAPI?.linkDiscord) {
                const res = await window.electronAPI.linkDiscord();
                if (res.success) {
                    await fetchNortixProfile();
                } else {
                    if (res.error !== 'Cancelled by user') {
                        setLinkError(res.error || "Failed to link Discord");
                    }
                }
            }
        } catch (e) {
            setLinkError(e.message);
        } finally {
            setIsLinking(false);
        }
    };

    const handleLinkMicrosoft = async () => {
        if (isLinking) return;
        setIsLinking(true);
        setLinkError(null);
        try {
            if (window.electronAPI?.linkMicrosoftAccount) {
                const res = await window.electronAPI.linkMicrosoftAccount();
                if (res.success) {
                    await fetchNortixProfile();
                } else {
                    setLinkError(res.error || "Failed to link Microsoft");
                }
            }
        } catch (e) {
            setLinkError(e.message);
        } finally {
            setIsLinking(false);
        }
    };

    const handleLinkEmail = async (e) => {
        e.preventDefault();
        if (isLinking) return;
        if (!emailForm.email || !emailForm.password) return;

        setIsLinking(true);
        setLinkError(null);
        try {
            if (window.electronAPI?.linkCredentials) {
                const res = await window.electronAPI.linkCredentials({
                    email: emailForm.email,
                    password: emailForm.password
                });
                if (res.success) {
                    setVerificationSent(true);
                    setLinkError(null);
                } else {
                    setLinkError(res.error || "Failed to link email");
                }
            }
        } catch (e) {
            setLinkError(e.message);
        } finally {
            setIsLinking(false);
        }
    };

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

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 space-y-8">

                    {/* Nortix Account Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4 px-1">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Shield size={12} className="text-purple-500" />
                                Nortix Account
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#1a1c2e] to-[#0f1016] rounded-2xl border border-purple-500/20 p-6 relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-xl">
                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="flex flex-col gap-6 relative z-10">
                                {/* Header Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-purple-500/30 flex items-center justify-center shadow-lg relative overflow-hidden">
                                        {nortixProfile?.avatar ? (
                                            <img src={nortixProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={24} className="text-purple-400" />
                                        )}
                                        {/* Status Dot */}
                                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 box-shadow-glow animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white tracking-tight">
                                            {nortixProfile?.username || nortixProfile?.email || 'Guest User'}
                                        </h3>
                                        <div className="text-xs text-purple-300/60 font-mono mt-0.5 flex items-center gap-2">
                                            <span>ID: {nortixProfile?.id ? (nortixProfile.id.substring(0, 8) + '...') : 'Anonymous'}</span>
                                            {nortixProfile?.email && <span className="w-1 h-1 rounded-full bg-slate-600" />}
                                            {nortixProfile?.email && <span>{nortixProfile.email}</span>}
                                        </div>
                                    </div>
                                    {/* Logout / Actions could go here */}
                                </div>

                                {/* Link Buttons */}
                                <div className="space-y-3">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Linked Methods</div>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Email */}
                                        {nortixProfile?.linkedAccounts?.some(a => a.provider === 'credentials' || a.provider === 'local') || nortixProfile?.email ? (
                                            <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400">
                                                <Mail size={14} />
                                                <span className="text-xs font-bold">Email Linked</span>
                                                <CheckCircle size={12} className="ml-1" />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowEmailForm(!showEmailForm)}
                                                className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${showEmailForm ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <Mail size={14} />
                                                <span className="text-xs font-bold">Link Email</span>
                                                <PlusCircle size={12} className="ml-1 opacity-50" />
                                            </button>
                                        )}

                                        {/* Discord */}
                                        {(authConnections?.connections?.some(a => a.provider === 'discord') || nortixProfile?.linkedAccounts?.some(a => a.provider === 'discord')) ? (
                                            <div className="px-3 py-2 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center gap-2 text-[#5865F2]">
                                                <Gamepad2 size={14} />
                                                <span className="text-xs font-bold">
                                                    Discord: {authConnections?.connections?.find(a => a.provider === 'discord')?.username || 'Connected'}
                                                </span>
                                                <CheckCircle size={12} className="ml-1" />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleLinkDiscord}
                                                disabled={isLinking}
                                                className="px-3 py-2 rounded-lg bg-slate-800/50 border border-white/5 text-slate-400 hover:text-white hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50 transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Gamepad2 size={14} />
                                                <span className="text-xs font-bold">Link Discord</span>
                                                {isLinking ? <Loader2 size={12} className="ml-1 animate-spin" /> : <PlusCircle size={12} className="ml-1 opacity-50" />}
                                            </button>
                                        )}

                                        {/* Microsoft */}
                                        {(authConnections?.connections?.some(a => a.provider === 'microsoft') || nortixProfile?.linkedAccounts?.some(a => a.provider === 'microsoft')) ? (
                                            <div className="px-3 py-2 rounded-lg bg-[#0078D4]/20 border border-[#0078D4]/30 flex items-center gap-2 text-[#0078D4] shadow-[0_0_10px_rgba(0,120,212,0.1)]">
                                                <Globe size={14} />
                                                <span className="text-xs font-bold">
                                                    Microsoft: {authConnections?.connections?.find(a => a.provider === 'microsoft')?.username || 'Connected'}
                                                </span>
                                                <CheckCircle size={12} className="ml-1" />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleLinkMicrosoft}
                                                disabled={isLinking}
                                                className="px-3 py-2 rounded-lg bg-slate-800/50 border border-white/5 text-slate-400 hover:text-white hover:bg-[#0078D4]/20 hover:border-[#0078D4]/50 transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Globe size={14} />
                                                <span className="text-xs font-bold">Link Microsoft</span>
                                                {isLinking ? <Loader2 size={12} className="ml-1 animate-spin" /> : <PlusCircle size={12} className="ml-1 opacity-50" />}
                                            </button>
                                        )}

                                        {/* Any other connections from /auth/connections */}
                                        {authConnections?.connections?.filter(a => a.provider !== 'discord' && a.provider !== 'microsoft' && a.provider !== 'credentials' && a.provider !== 'local').map(conn => (
                                            <div key={conn.provider} className="px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 flex items-center gap-2 text-slate-300">
                                                <Globe size={14} />
                                                <span className="text-xs font-bold capitalize">{conn.provider}: {conn.username}</span>
                                                <CheckCircle size={12} className="ml-1 text-emerald-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Email Form */}
                                {showEmailForm && (
                                    <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                        {verificationSent ? (
                                            <div className="p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center space-y-3">
                                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                                                    <Mail size={24} />
                                                </div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Verification Email Sent</h4>
                                                <p className="text-xs text-slate-400">
                                                    We've sent a link to <span className="text-emerald-400 font-bold">{emailForm.email}</span>.<br />
                                                    Please check your inbox and click the link to confirm.
                                                </p>
                                                <button
                                                    onClick={() => { setShowEmailForm(false); setVerificationSent(false); }}
                                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleLinkEmail} className="p-4 bg-slate-900/80 rounded-xl border border-white/10 space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-slate-500">Email Address</label>
                                                    <div className="relative">
                                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                        <input
                                                            type="email"
                                                            value={emailForm.email}
                                                            onChange={e => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                                                            placeholder="name@example.com"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-slate-500">Password</label>
                                                    <div className="relative">
                                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                        <input
                                                            type="password"
                                                            value={emailForm.password}
                                                            onChange={e => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                                                            placeholder="Create a password"
                                                            required
                                                            minLength={6}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setShowEmailForm(false); setVerificationSent(false); }}
                                                        className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isLinking}
                                                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                                                    >
                                                        {isLinking ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                                                        Secure Account
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {linkError && (
                                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                        <AlertCircle size={12} />
                                        <span>{linkError}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

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
