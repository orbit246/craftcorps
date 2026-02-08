import React, { useState, useEffect } from 'react';
import { X, Server, Plus, Loader2, Copy, Check, ShieldCheck, Globe, Info, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';

const MyServersModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    // List | Register | Verify
    const [view, setView] = useState('list');
    const [servers, setServers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedServer, setSelectedServer] = useState(null);

    // Form States
    const [regForm, setRegForm] = useState({ ip: '', port: '25565', name: '', description: '', categories: [] });
    const [checkStatus, setCheckStatus] = useState('idle'); // idle | checking | success | error
    const [checkError, setCheckError] = useState(null);
    const [serverPingData, setServerPingData] = useState(null);

    const [verifyToken, setVerifyToken] = useState(null);
    const [verifyLoading, setVerifyLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchServers();
            setView('list');
            resetRegForm();
        }
    }, [isOpen]);

    const resetRegForm = () => {
        setRegForm({ ip: '', port: '25565', name: '', description: '', categories: [] });
        setCheckStatus('idle');
        setCheckError(null);
        setServerPingData(null);
    };

    const fetchServers = async () => {
        setIsLoading(true);
        try {
            if (window.electronAPI?.getMyServers) {
                const res = await window.electronAPI.getMyServers();
                if (res.success && res.servers) {
                    setServers(res.servers);
                }
            }
        } catch (e) {
            console.error('Fetch servers failed:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckServer = async (e) => {
        e.preventDefault();
        if (!regForm.ip) return;

        setCheckStatus('checking');
        setCheckError(null);

        try {
            if (!window.electronAPI?.pingServer) {
                addToast('Update pending. Please restart.', 'error');
                setCheckStatus('idle');
                return;
            }

            const res = await window.electronAPI.pingServer(regForm.ip);
            if (res.success) {
                setCheckStatus('success');
                setServerPingData(res);

                // Auto-fill fields if they are empty
                setRegForm(prev => ({
                    ...prev,
                    name: prev.name || res.hostname || (res.motd ? res.motd.split(' ')[0] : '') || '',
                    description: prev.description || res.motd || ''
                }));

                addToast(`Found server: ${res.version}`, 'success');
            } else {
                setCheckStatus('error');
                setCheckError(res.error || 'Server unreachable');
                addToast(res.error || 'Server unreachable', 'error');
            }
        } catch (e) {
            setCheckStatus('error');
            setCheckError(e.message);
        }
    };

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            const payload = {
                ip: regForm.ip
            };

            if (!window.electronAPI?.registerServer) {
                addToast('Update pending. Please restart the application.', 'error');
                setIsLoading(false);
                return;
            }

            const res = await window.electronAPI.registerServer(payload);
            if (res.success) {
                // Determine ID from response format
                const serverId = res.serverId || res.server?.id || res.id || res.data?.id;
                addToast('Server Registered!', 'success');

                // Reset and go to list
                fetchServers();
                setView('list');

                // Only go to verify if they want to? No, better to show list with "Verify" button as requested
                // "If server is alive, make the buton "complete" green when user presses it the sever would be added! But add a "unverified" badge and a button to "verify" the server"
            } else {
                addToast(res.error || 'Registration failed', 'error');
            }
        } catch (e) {
            console.error('Registration error:', e);
            addToast(e.message || 'Registration failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const loadVerificationToken = async (serverId) => {
        setVerifyLoading(true);
        setVerifyToken(null);
        try {
            if (!window.electronAPI?.getServerToken) {
                addToast('Update pending. Please restart.', 'error');
                return;
            }
            const res = await window.electronAPI.getServerToken(serverId);
            if (res.success) {
                setVerifyToken(res.verificationToken || res.token);
            } else {
                addToast('Failed to generate token', 'error');
            }
        } catch (e) {
            addToast('Failed to get token', 'error');
        } finally {
            setVerifyLoading(false);
        }
    };



    const handleVerify = async () => {
        if (!selectedServer || !verifyToken) return;
        setVerifyLoading(true);
        try {
            if (!window.electronAPI?.verifyServerRegistration) {
                addToast('Update pending. Please restart.', 'error');
                return;
            }
            const res = await window.electronAPI.verifyServerRegistration({
                token: verifyToken
            });
            if (res.success) {
                addToast('Server Verified Successfully!', 'success');
                fetchServers();
                setView('list');
            } else {
                addToast(res.error || 'Verification failed. Check MOTD.', 'error');
            }
        } catch (e) {
            addToast('Verification error', 'error');
        } finally {
            setVerifyLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
                            <Server size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">My Servers</h2>
                            <p className="text-xs text-slate-500 font-medium">Manage and register your Minecraft servers</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 relative">
                    {/* View: LIST */}
                    {view === 'list' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Servers</h3>
                                <button
                                    onClick={() => {
                                        resetRegForm();
                                        setView('register');
                                    }}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/20"
                                >
                                    <Plus size={16} />
                                    Register Server
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-600">
                                    <Loader2 size={32} className="animate-spin mb-4" />
                                    <span>Loading servers...</span>
                                </div>
                            ) : servers.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                                    <Server size={48} className="mb-4 opacity-50" />
                                    <h4 className="text-lg font-bold text-slate-500">No Servers Found</h4>
                                    <p className="text-sm mb-6 max-w-xs text-center mx-auto mt-2 opacity-70">
                                        Register your server to verify ownership and gain visibility in the launcher.
                                    </p>
                                    <button
                                        onClick={() => setView('register')}
                                        className="text-emerald-500 hover:text-emerald-400 text-sm font-bold underline"
                                    >
                                        Register now
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {servers.map((s) => (
                                        <div key={s.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between group hover:border-slate-600 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 relative overflow-hidden">
                                                    {s.server?.iconUrl ? (
                                                        <img src={s.server.iconUrl} alt="Server Icon" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Server size={20} className="text-slate-600" />
                                                    )}
                                                    {s.verification?.isVerified && (
                                                        <div className="absolute bottom-0 right-0 bg-emerald-500 text-slate-900 p-0.5 rounded-tl-md">
                                                            <Check size={8} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-200 flex items-center gap-2">
                                                        {s.server?.name || 'Unnamed Server'}
                                                        {s.verification?.isVerified ? (
                                                            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Verified</span>
                                                        ) : (
                                                            <span className="bg-amber-500/10 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Unverified</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                                                        {s.endpoints?.[0]?.ip}:{s.endpoints?.[0]?.port}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {!s.verification?.isVerified && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedServer(s);
                                                            loadVerificationToken(s.id);
                                                            setView('verify');
                                                        }}
                                                        className="px-3 py-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold rounded-lg transition-colors border border-amber-500/20"
                                                    >
                                                        Verify Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* View: REGISTER */}
                    {view === 'register' && (
                        <div className="max-w-md mx-auto animate-in slide-in-from-right-8 duration-300">
                            <button
                                onClick={() => setView('list')}
                                className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 mb-3 transition-colors"
                            >
                                <b className="text-lg">←</b> Back to List
                            </button>

                            <h3 className="text-xl font-bold text-white mb-1">Register Server</h3>
                            <p className="text-sm text-slate-500 mb-4 font-medium">Enter your server details to begin verification.</p>

                            <form onSubmit={(e) => { e.preventDefault(); checkStatus === 'success' ? handleRegister() : handleCheckServer(e); }} className="space-y-3">
                                <div className="flex gap-4 items-start">
                                    {/* Left: Icon Preview */}
                                    <div className={`w-28 h-28 shrink-0 rounded-2xl bg-slate-950 border-2 flex items-center justify-center transition-all duration-500 overflow-hidden relative ${checkStatus === 'success' ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/10' : 'border-slate-800 grayscale'}`}>
                                        {serverPingData?.icon ? (
                                            <img src={serverPingData.icon} alt="Server Icon" className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
                                        ) : (
                                            <Server size={32} className={checkStatus === 'success' ? 'text-emerald-500' : 'text-slate-800'} />
                                        )}
                                        {checkStatus === 'checking' && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Loader2 size={24} className="text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Input Fields */}
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-2 space-y-0.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Server IP</label>
                                                <input
                                                    type="text"
                                                    required
                                                    disabled={checkStatus === 'success' || checkStatus === 'checking'}
                                                    value={regForm.ip}
                                                    onChange={e => {
                                                        setRegForm({ ...regForm, ip: e.target.value });
                                                        if (checkStatus !== 'idle') setCheckStatus('idle');
                                                    }}
                                                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors font-mono ${checkError ? 'border-red-500/50' : 'border-slate-800 focus:border-emerald-500/50'}`}
                                                    placeholder="play.example.com"
                                                />
                                            </div>
                                            <div className="space-y-0.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Port</label>
                                                <input
                                                    type="number"
                                                    required
                                                    disabled={checkStatus === 'success' || checkStatus === 'checking'}
                                                    value={regForm.port}
                                                    onChange={e => setRegForm({ ...regForm, port: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-colors font-mono"
                                                    placeholder="25565"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-500">Server Status & MOTD</label>
                                            <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 min-h-[56px] flex flex-col justify-center transition-all duration-300">
                                                {checkStatus === 'success' ? (
                                                    <div className="animate-in fade-in slide-in-from-left-2">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">ONLINE • {serverPingData.version}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 leading-tight line-clamp-2 font-mono italic">
                                                            {serverPingData.motd || "No MOTD provided."}
                                                        </p>
                                                    </div>
                                                ) : checkError ? (
                                                    <div className="flex items-center gap-2 text-red-400 animate-in shake-1">
                                                        <Info size={14} />
                                                        <span className="text-xs font-bold">{checkError}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Globe size={14} />
                                                        <span className="text-xs font-medium italic">Enter IP to check status...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {checkStatus !== 'success' ? (
                                    <button
                                        type="submit"
                                        disabled={checkStatus === 'checking' || !regForm.ip}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:grayscale"
                                    >
                                        {checkStatus === 'checking' ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                                        <span>Check Server Status</span>
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={handleRegister}
                                            disabled={isLoading}
                                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40 animate-in zoom-in-95 group"
                                        >
                                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} className="group-hover:rotate-90 transition-transform" />}
                                            <span>Add Server to List</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCheckStatus('idle')}
                                            className="text-xs text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest transition-colors py-2"
                                        >
                                            Edit IP Address
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* View: VERIFY */}
                    {view === 'verify' && (
                        <div className="max-w-md mx-auto animate-in slide-in-from-right-8 duration-300">
                            <button
                                onClick={() => setView('list')}
                                className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 mb-6 transition-colors"
                            >
                                <b className="text-lg">←</b> Back to List
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 border border-amber-500/20">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Verify Ownership</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                    To verify you own <b>{selectedServer?.ip || selectedServer?.server?.name}</b>, please set your server MOTD to the token below.
                                </p>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 relative group">
                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Verification Token</div>
                                {verifyLoading && !verifyToken ? (
                                    <div className="flex items-center gap-2 text-slate-500 py-2">
                                        <Loader2 size={16} className="animate-spin" /> Generating token...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <code className="flex-1 font-mono text-lg text-emerald-400 break-all select-all">
                                            {verifyToken}
                                        </code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(verifyToken);
                                                addToast('Token copied!', 'success');
                                            }}
                                            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-800"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            onClick={() => loadVerificationToken(selectedServer.id)}
                                            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-800"
                                            title="Regenerate Token"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start mb-6">
                                <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-300 leading-relaxed">
                                    1. Copy the token above.<br />
                                    2. Paste it as your server <b>motd</b> in <code>server.properties</code>.<br />
                                    3. Restart your server.<br />
                                    4. Click "Check Verification" below.
                                </div>
                            </div>

                            <button
                                onClick={handleVerify}
                                disabled={verifyLoading || !verifyToken}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                            >
                                {verifyLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                <span>Check Verification</span>
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MyServersModal;
