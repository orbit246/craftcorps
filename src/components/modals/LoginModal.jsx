import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { User, X, Loader2, ShieldCheck, ChevronRight, WifiOff, Info, Check, Gamepad2, Mail, ArrowLeft, Lock, LogIn } from 'lucide-react';
import { telemetry } from '../../services/TelemetryService';

import { getOfflineUUID } from '../../utils/uuid';

const LoginModal = ({ isOpen, onClose, onAddAccount, isAutoRefreshing, accounts }) => {
    const { t } = useTranslation();
    const [activeMethod, setActiveMethod] = useState('selection'); // selection | offline | nortix
    const [tosAgreed, setTosAgreed] = useState(false);
    const [offlineName, setOfflineName] = useState('');
    const [validationMsg, setValidationMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginType, setLoginType] = useState(null); // microsoft | offline | nortix
    const [errorMsg, setErrorMsg] = useState(null);
    const [detectedAccounts, setDetectedAccounts] = useState([]);

    const [nortixCreds, setNortixCreds] = useState({ email: '', password: '' });

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setOfflineName('');
            setValidationMsg('');
            setNortixCreds({ email: '', password: '' });
            setErrorMsg(null);
            setTosAgreed(false);
            setLoginType(null);
            // activeMethod reset handled on open now
        } else {
            // ALWAYS reset to selection when opening
            setActiveMethod('selection');

            // Scan for local accounts
            const scan = async () => {
                if (window.electronAPI?.detectLocalAccounts) {
                    const res = await window.electronAPI.detectLocalAccounts();
                    if (res.success) {
                        setDetectedAccounts(res.accounts);
                    }
                }
            };
            scan();
        }
    }, [isOpen]);

    // Auto-clear error after 5s
    React.useEffect(() => {
        if (errorMsg) {
            const timer = setTimeout(() => setErrorMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMsg]);

    if (!isOpen) return null;

    const handleMicrosoftLogin = async () => {
        // Show widget instead of alert
        setErrorMsg("Coming soon, we're waiting approval from mojang");
        //

        console.log('[LoginModal] Starting Microsoft Login...');
        setIsLoading(true);
        setLoginType('microsoft');
        setErrorMsg(null);
        try {
            if (window.electronAPI) {
                const consent = {
                    type: 'TOS_AND_PRIVACY',
                    version: '2026-1-18'
                };
                const result = await window.electronAPI.microsoftLogin(consent);
                if (result.success) {
                    console.log(`[LoginModal] Microsoft Auth Success: ${result.account.name}`);
                    console.log(`[LoginModal] Nortix Token: ${result.data.accessToken ? 'RECEIVED' : 'MISSING'}`);

                    onAddAccount({
                        ...result.account,
                        // Override/Set specific tokens
                        minecraftAccessToken: result.account.accessToken,
                        minecraftRefreshToken: result.account.refreshToken,
                        accessToken: result.data.accessToken, // The "Ticket"
                        refreshToken: result.data.refreshToken, // The "VIP Pass"
                        avatarColor: 'bg-emerald-600',
                    });
                    onClose();
                } else {
                    console.error("Login failed:", result.error);

                    // Map error codes to translation keys
                    let key = 'auth_err_unknown';
                    const err = result.error;

                    if (typeof err === 'string') {
                        if (err.includes('AUTH_MS_TOKEN_FAILED')) key = 'auth_err_ms_token';
                        else if (err.includes('AUTH_XBOX_LIVE_FAILED')) key = 'auth_err_xbox_live';
                        else if (err.includes('AUTH_NO_XBOX_ACCOUNT')) key = 'auth_err_no_xbox';
                        else if (err.includes('AUTH_CHILD_ACCOUNT')) key = 'auth_err_child';
                        else if (err.includes('AUTH_XSTS_FAILED')) key = 'auth_err_xsts';
                        else if (err.includes('AUTH_MC_LOGIN_FAILED')) key = 'auth_err_mc_login';
                        else if (err.includes('AUTH_NO_MINECRAFT')) key = 'auth_err_no_mc';
                        else if (err.includes('AUTH_PROFILE_FAILED')) key = 'auth_err_profile';
                        else if (err.includes('AUTH_INVALID_APP_CONFIG')) key = 'auth_err_invalid_app_config';
                        else if (err.includes('ENOTFOUND')) key = 'auth_err_network';
                    }

                    setErrorMsg(t(key));
                    setIsLoading(false);
                    telemetry.track('AUTH_FAILURE', { error: err, type: key });
                }
            } else {
                console.error("Electron API not available");
                setErrorMsg("Electron API not available");
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Login error:", e);
            if (e.message && e.message.includes('AUTH_CANCELLED_BY_USER')) {
                setIsLoading(false);
                return;
            }
            setErrorMsg(e.message || t('auth_err_unknown'));
            setIsLoading(false);
            telemetry.track('AUTH_FAILURE', { error: e.message || 'Unknown', type: 'exception' });
        }

    };

    const handleNortixLogin = async (e) => {
        e.preventDefault();
        if (!nortixCreds.email || !nortixCreds.password) return;

        console.log('[LoginModal] Starting Nortix Login...');
        setIsLoading(true);
        setLoginType('nortix');
        setErrorMsg(null);

        try {
            if (window.electronAPI?.login) {
                // Determine username vs email? Backend usually handles "email" field.
                const res = await window.electronAPI.login({
                    email: nortixCreds.email,
                    password: nortixCreds.password
                });

                if (res.success) {
                    // Start session - but we need a "Game Profile" to be fully active usually?
                    // If login returns a user, we might need to fetch their associated Minecraft profile or Promp to Create one?
                    // Based on current architecture, `onAddAccount` expects a structure with specific fields.

                    // Actually, if we login to Nortix, we get a master account. 
                    // But the launcher primarily needs a "Game Identity" (UUID) to launch instances.
                    // If the Nortix account has a linked MC profile, we should use that?
                    // Or is this just for the "Nortix Account" slot in the previous modal?

                    // The prompt implies "Add Account" -> so we are adding an identity.
                    // Let's assume for now we treat it as an authenticated session that CAN launch if it has a profile.
                    // If strictly Nortix auth (no MC), it might be just for the master account.
                    // BUT `onAddAccount` adds to the list of playable accounts.

                    // Let's try to see if the login response gives us what we need.
                    // The `authService.js` `login` returns user data.

                    console.log('[LoginModal] Nortix Login Success', res);

                    // We'll close for now, assuming the auth state update in the background spreads to the UI via `useAccounts` hook or similar if integrated.
                    // However, `onAddAccount` is passed from `useAccounts`. 
                    // If we just logged in to the backend, we might want to refresh the profile modal?
                    // But here we want to ADD an identity.

                    // IF this is replacing offline login, we might want to construct a "Nortix" type account object.
                    onAddAccount({
                        id: res.data.user.id,
                        name: res.data.user.username || res.data.user.email,
                        type: 'Nortix', // New type
                        accessToken: res.data.accessToken,
                        refreshToken: res.data.refreshToken,
                        uuid: res.data.user.id, // Use User ID as UUID for now?
                        avatarColor: 'bg-purple-600'
                    });

                    onClose();
                } else {
                    setErrorMsg(res.error || "Login failed");
                }
            }
        } catch (e) {
            console.error("Nortix Login error:", e);
            setErrorMsg(e.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOfflineLogin = async () => {
        if (!offlineName.trim()) return;
        console.log(`[LoginModal] Starting Offline Login: ${offlineName}`);
        setIsLoading(true);
        setLoginType('offline');
        setErrorMsg(null);

        // Generate valid Offline UUID
        const uuid = getOfflineUUID(offlineName);
        const profile = {
            uuid: uuid,
            name: offlineName,
            authType: 'CRACKED'
        };

        // Consent should be passed if we want to be strict, matching microsoftLogin logic
        const consent = {
            type: 'TOS_AND_PRIVACY',
            version: '2026-1-18'
        };

        try {
            if (window.electronAPI?.linkProfile) {
                console.log('[LoginModal] Linking Offline Profile with consent:', profile, consent);
                // We use linkProfile for offline accounts too, to register them with the backend user
                const result = await window.electronAPI.linkProfile({
                    profile,
                    consent
                });

                if (!result.success) {
                    throw new Error(result.error?.message || result.error || "Failed to register offline profile");
                }
                console.log('[LoginModal] Offline Profile Linked Successfully');
            }

            console.log('[LoginModal] Adding account to local state:', offlineName);
            // Proceed to add account to local state
            onAddAccount({
                name: offlineName,
                type: 'Offline',
                avatarColor: 'bg-slate-600',
                uuid: uuid
            });
            setOfflineName('');
            setActiveMethod('selection');
            onClose();
        } catch (e) {
            console.error("Offline Login error:", e);
            setErrorMsg(e.message || "Failed to add offline account");
            telemetry.track('AUTH_OFFLINE_FAILURE', { error: e.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-6 relative overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150" />
                            <Gamepad2 size={24} className="text-emerald-500 relative z-10" />
                        </div>
                        {activeMethod === 'nortix'
                            ? (loginType === 'nortix_register' ? "Register Nortix Account" : "Login to Nortix")
                            : "Login to Continue"
                        }
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {((isLoading && loginType !== 'offline') || isAutoRefreshing) ? (
                        <div className="h-48 flex flex-col items-center justify-center text-center">
                            <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                            <h4 className="text-lg font-bold text-white mb-1">
                                {isAutoRefreshing ? t('auth_refreshing_session', { defaultValue: 'Verifying Session...' }) : t('auth_authenticating')}
                            </h4>
                            <p className="text-sm text-slate-500">
                                {isAutoRefreshing
                                    ? t('auth_refreshing_detail', { defaultValue: 'Checking your credentials...' })
                                    : (loginType === 'offline' ? t('auth_authenticating') : t('auth_browser_instruction'))}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {errorMsg && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-start gap-2">
                                    <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {detectedAccounts.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-px bg-slate-800 flex-1" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-2">Detected Accounts</span>
                                        <div className="h-px bg-slate-800 flex-1" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {detectedAccounts.map((acc, idx) => (
                                            <button
                                                key={idx}
                                                onClick={handleMicrosoftLogin}
                                                disabled={!tosAgreed}
                                                className={`w-full p-4 rounded-xl flex items-center justify-between group/btn transition-all ${tosAgreed ? 'bg-slate-800/50 hover:bg-slate-700/60 border-slate-700 text-white' : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800/10 pointer-events-none'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="absolute -inset-1 bg-emerald-500/20 blur-sm rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden relative">
                                                            <img
                                                                src={`https://mc-heads.net/avatar/${acc.uuid}/64`}
                                                                alt={acc.name}
                                                                className="w-full h-full rendering-pixelated"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-bold text-sm">{acc.name}</div>
                                                        <div className="text-[10px] text-slate-500 uppercase tracking-tight">System Detected Profile</div>
                                                    </div>
                                                </div>
                                                {tosAgreed && <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover/btn:opacity-100 transition-all translate-x-2 group-hover/btn:translate-x-0">CONNECT</div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeMethod === 'selection' && (
                                <div className="space-y-3">
                                    {/* Nortix Button (Primary) - Only show if NO Nortix account exists */}
                                    {!accounts?.some(acc => acc.type === 'Nortix') && (
                                        <>
                                            <div className="relative group w-full">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                                <button
                                                    onClick={() => setActiveMethod('nortix')}
                                                    disabled={!tosAgreed}
                                                    className={`relative w-full p-4 rounded-xl flex items-center justify-between group/btn transition-all shadow-xl ${tosAgreed ? 'bg-[#1a1c2e] hover:bg-[#25283d] text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 pointer-events-none'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 shadow-inner">
                                                            <ShieldCheck size={20} />
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="font-black text-[15px] tracking-tight leading-none mb-1">Continue with Nortix Account</div>
                                                            <div className="text-[10px] text-white/60 font-medium uppercase tracking-widest leading-tight">
                                                                Automatically save and find your Minecraft accounts
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={18} className={`transition-all duration-300 ${tosAgreed ? 'opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-1' : 'opacity-0'}`} />
                                                </button>
                                            </div>

                                            {/* Divider */}
                                            <div className="relative py-2">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-slate-700/50"></div>
                                                </div>
                                                <div className="relative flex justify-center text-[10px] font-bold">
                                                    <span className="bg-slate-900 px-2 text-slate-500 uppercase tracking-widest">{t('auth_or')}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Microsoft Button (Secondary or Primary if Nortix exists) */}
                                    <div className="relative group w-full">
                                        <button
                                            onClick={handleMicrosoftLogin}
                                            disabled={!tosAgreed}
                                            className={`relative w-full p-4 rounded-xl flex items-center justify-between group/btn transition-all shadow-lg border ${tosAgreed ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-900 text-slate-600 cursor-not-allowed border-slate-800 pointer-events-none'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="bg-[#0078D4]/10 p-2 rounded-lg text-[#0078D4]">
                                                    <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                                                        <div className="bg-[#f25022]"></div>
                                                        <div className="bg-[#7fba00]"></div>
                                                        <div className="bg-[#00a4ef]"></div>
                                                        <div className="bg-[#ffb900]"></div>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-[14px] tracking-tight leading-none mb-1">Microsoft Account</div>
                                                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-tight">
                                                        Skip loggining to a Nortix Account and login to your game account directly
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className={`transition-all duration-300 ${tosAgreed ? 'opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-1' : 'opacity-0'}`} />
                                        </button>
                                    </div>

                                    {/* Offline Mode Button - Only if Nortix Exists */}
                                    {accounts?.some(acc => acc.type === 'Nortix') && (
                                        <div className={`pt-2 flex justify-center transition-opacity ${tosAgreed ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                                            <button
                                                onClick={() => setActiveMethod('offline')}
                                                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500"
                                            >
                                                <WifiOff size={14} />
                                                <span>Continue in Offline Mode</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* ToS Reminder */}
                                    {!tosAgreed && (
                                        <div className="text-center text-[10px] text-slate-600 uppercase tracking-widest mt-2">
                                            Accept ToS to continue
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeMethod === 'nortix' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <button
                                        onClick={() => setActiveMethod('selection')}
                                        className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 mb-2 transition-colors"
                                    >
                                        <ArrowLeft size={12} /> Back
                                    </button>

                                    {/* Sub-method Toggle: Login vs Register */}
                                    <div className="flex bg-slate-950 p-1 rounded-xl mb-4">
                                        <button
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${!loginType || loginType === 'nortix' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-400'}`}
                                            onClick={(e) => { e.preventDefault(); setLoginType('nortix'); }}
                                        >
                                            Login
                                        </button>
                                        <button
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${loginType === 'nortix_register' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-400'}`}
                                            onClick={(e) => { e.preventDefault(); setLoginType('nortix_register'); }}
                                        >
                                            Register
                                        </button>
                                    </div>

                                    {loginType === 'nortix_register' ? (
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            if (!nortixCreds.email || !nortixCreds.password || !nortixCreds.username) return;
                                            setIsLoading(true);
                                            setErrorMsg(null);
                                            try {
                                                if (window.electronAPI?.register) {
                                                    const res = await window.electronAPI.register({
                                                        email: nortixCreds.email,
                                                        password: nortixCreds.password,
                                                        username: nortixCreds.username
                                                    });
                                                    if (res.success) {
                                                        // Auto login after register? Or prompt to login?
                                                        // Let's try to auto-login
                                                        const loginRes = await window.electronAPI.login({
                                                            email: nortixCreds.email,
                                                            password: nortixCreds.password
                                                        });

                                                        if (loginRes.success) {
                                                            onAddAccount({
                                                                id: loginRes.data.user.id,
                                                                name: loginRes.data.user.username || loginRes.data.user.email,
                                                                type: 'Nortix',
                                                                accessToken: loginRes.data.accessToken,
                                                                refreshToken: loginRes.data.refreshToken,
                                                                uuid: loginRes.data.user.id,
                                                                avatarColor: 'bg-purple-600'
                                                            });
                                                            onClose();
                                                        } else {
                                                            setLoginType('nortix'); // Switch to login
                                                            setErrorMsg("Registration successful! Please log in.");
                                                        }
                                                    } else {
                                                        setErrorMsg(res.error || "Registration failed");
                                                    }
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                setErrorMsg(err.message || "Registration failed");
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }} className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-500">Username</label>
                                                <div className="relative">
                                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        type="text"
                                                        value={nortixCreds.username || ''}
                                                        onChange={e => setNortixCreds({ ...nortixCreds, username: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-700"
                                                        placeholder="AgentSmith"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-500">Email Address</label>
                                                <div className="relative">
                                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        type="email"
                                                        value={nortixCreds.email}
                                                        onChange={e => setNortixCreds({ ...nortixCreds, email: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-700"
                                                        placeholder="name@example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-500">Password</label>
                                                <div className="relative">
                                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        type="password"
                                                        value={nortixCreds.password}
                                                        onChange={e => setNortixCreds({ ...nortixCreds, password: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-700"
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4 shadow-lg shadow-purple-900/20"
                                            >
                                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <div className="flex items-center gap-2"><span>Create Account</span></div>}
                                            </button>
                                        </form>
                                    ) : (
                                        /* Login Form */
                                        <form onSubmit={handleNortixLogin} className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-500">Email Address</label>
                                                <div className="relative">
                                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        type="email"
                                                        value={nortixCreds.email}
                                                        onChange={e => setNortixCreds({ ...nortixCreds, email: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-700"
                                                        placeholder="name@example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-500">Password</label>
                                                <div className="relative">
                                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        type="password"
                                                        value={nortixCreds.password}
                                                        onChange={e => setNortixCreds({ ...nortixCreds, password: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-700"
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4 shadow-lg shadow-purple-900/20"
                                            >
                                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                                                <span>Login to Account</span>
                                            </button>
                                        </form>
                                    )}

                                    {/* OAuth Option for Nortix */}
                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-800"></div>
                                        </div>
                                        <div className="relative flex justify-center text-[10px] font-bold">
                                            <span className="bg-slate-900 px-2 text-slate-500 uppercase tracking-widest">{t('auth_or')}</span>
                                        </div>
                                    </div>

                                    {/* Microsoft as a Nortix Auth Provider */}
                                    {/* Reusing handleMicrosoftLogin as it also logs into Nortix backend */}
                                    {/* OAuth Grid */}
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {/* Microsoft Button */}
                                        <button
                                            type="button"
                                            onClick={handleMicrosoftLogin}
                                            disabled={isLoading}
                                            className="col-span-2 py-3 bg-[#0078D4]/10 hover:bg-[#0078D4]/20 text-[#0078D4] border border-[#0078D4]/30 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <div className="bg-[#0078D4] p-1 rounded-md text-white group-hover:scale-110 transition-transform">
                                                <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                                                    <div className="bg-[#f25022]"></div>
                                                    <div className="bg-[#7fba00]"></div>
                                                    <div className="bg-[#00a4ef]"></div>
                                                    <div className="bg-[#ffb900]"></div>
                                                </div>
                                            </div>
                                            <span>Continue with Microsoft</span>
                                        </button>

                                        {/* Google Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const handleOAuth = async (provider) => {
                                                    setIsLoading(true);
                                                    setErrorMsg(null);
                                                    try {
                                                        if (window.electronAPI?.oauthLogin) {
                                                            const res = await window.electronAPI.oauthLogin(provider);
                                                            if (res.success && res.data) {
                                                                onAddAccount({
                                                                    id: res.data.user.id || res.data.user._id,
                                                                    name: res.data.user.username || res.data.user.email,
                                                                    type: 'Nortix',
                                                                    accessToken: res.data.accessToken,
                                                                    refreshToken: res.data.refreshToken,
                                                                    uuid: res.data.user.id || res.data.user._id,
                                                                    avatarColor: 'bg-indigo-600'
                                                                });
                                                                onClose();
                                                            } else {
                                                                setErrorMsg(res.error || "Login failed");
                                                            }
                                                        } else {
                                                            setErrorMsg("Feature not available");
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                        setErrorMsg(e.message || "Login failed");
                                                    } finally {
                                                        setIsLoading(false);
                                                    }
                                                };
                                                handleOAuth('google');
                                            }}
                                            disabled={isLoading}
                                            className="py-3 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group shadow-lg shadow-white/5"
                                        >
                                            <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                <path d="M1 1h22v22H1z" fill="none" />
                                            </svg>
                                            <span className="text-sm">Google</span>
                                        </button>

                                        {/* Discord Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const handleOAuth = async (provider) => {
                                                    setIsLoading(true);
                                                    setErrorMsg(null);
                                                    try {
                                                        if (window.electronAPI?.oauthLogin) {
                                                            const res = await window.electronAPI.oauthLogin(provider);
                                                            if (res.success && res.data) {
                                                                if (res.data.data) res.data = res.data.data; // Unpack if nested

                                                                onAddAccount({
                                                                    id: res.data.user.id || res.data.user._id,
                                                                    name: res.data.user.username || res.data.user.email,
                                                                    type: 'Nortix',
                                                                    accessToken: res.data.accessToken,
                                                                    refreshToken: res.data.refreshToken,
                                                                    uuid: res.data.user.id || res.data.user._id,
                                                                    avatarColor: 'bg-indigo-600'
                                                                });
                                                                onClose();
                                                            } else {
                                                                setErrorMsg(res.error || "Login failed");
                                                            }
                                                        } else {
                                                            setErrorMsg("Feature not available");
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                        setErrorMsg(e.message || "Login failed");
                                                    } finally {
                                                        setIsLoading(false);
                                                    }
                                                };
                                                handleOAuth('discord');
                                            }}
                                            disabled={isLoading}
                                            className="py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[#5865F2]/20"
                                        >
                                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2761-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.5328-9.7413-3.4683-13.6356a.064.064 0 00-.031-.0279zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                                            </svg>
                                            <span className="text-sm">Discord</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeMethod === 'offline' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <button
                                        onClick={() => setActiveMethod('selection')}
                                        className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 mb-2 transition-colors"
                                    >
                                        <ArrowLeft size={12} /> Back
                                    </button>

                                    <div className="bg-slate-950/30 rounded-xl p-3 border border-white/5 relative opacity-100 transition-opacity duration-500">
                                        <div className="absolute top-1.5 right-1.5 z-10 group/info">
                                            <Info size={14} className="text-slate-700 hover:text-slate-500 cursor-help transition-colors" />
                                            <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-black text-[10px] text-slate-400 rounded border border-slate-800 shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 pointer-events-none z-50">
                                                {t('auth_offline_warning')}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-slate-900 p-1.5 rounded-lg text-slate-600">
                                                <WifiOff size={16} />
                                            </div>
                                            <div className="text-left flex-1">
                                                <div className="font-bold text-xs text-slate-500">{t('auth_offline')}</div>
                                                <div className="text-[10px] text-slate-600 font-medium">{t('auth_singleplayer_only')}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder={t('auth_input_placeholder')}
                                                    value={offlineName}
                                                    maxLength={16}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        let msg = '';
                                                        if (/[^a-zA-Z0-9_]/.test(raw)) {
                                                            msg = t('auth_err_invalid_char');
                                                        } else if (raw.length > 0 && raw.length < 3) {
                                                            msg = t('auth_err_min_length');
                                                        }
                                                        setValidationMsg(msg);
                                                        const val = raw.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16);
                                                        setOfflineName(val);
                                                    }}
                                                    className={`flex-1 bg-slate-900/50 border rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none placeholder:text-slate-700 transition-all ${validationMsg ? 'border-red-500/30 focus:border-red-500' : 'border-slate-800 focus:border-white/10'}`}
                                                    onKeyDown={(e) => e.key === 'Enter' && offlineName.length >= 3 && handleOfflineLogin()}
                                                />
                                                <button
                                                    onClick={handleOfflineLogin}
                                                    disabled={offlineName.length < 3 || (isLoading && loginType === 'offline')}
                                                    className={`bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5`}
                                                >
                                                    {isLoading && loginType === 'offline' ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : t('auth_btn_add')}
                                                </button>
                                            </div>
                                            {validationMsg && (
                                                <span className="text-xs text-red-400 pl-1 animate-in fade-in slide-in-from-top-1">
                                                    {validationMsg}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="w-full border-t border-slate-800/50 my-2" />

                            <div
                                className="flex items-center gap-3 px-1 cursor-pointer group select-none"
                                onClick={() => setTosAgreed(!tosAgreed)}
                            >
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${tosAgreed ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-950 border-slate-700 group-hover:border-slate-500'}`}>
                                    <Check size={14} strokeWidth={3} className={`transition-all duration-200 ${tosAgreed ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
                                </div>
                                <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                                    <Trans
                                        i18nKey="auth_tos_agreement"
                                        components={{
                                            1: <a href="https://nortixlabs.com/legal/terms" target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 hover:underline transition-colors font-medium decoration-emerald-500/30" onClick={(e) => e.stopPropagation()}>ToS</a>,
                                            2: <a href="https://nortixlabs.com/legal/privacy" target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 hover:underline transition-colors font-medium decoration-emerald-500/30" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </div>
        </div >
    );
};

export default LoginModal;
