import React from 'react';
import { Box, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AutoConnectSetting = ({ autoConnect, setAutoConnect, serverAddress, setServerAddress, errors, setErrors }) => {
    const { t } = useTranslation();
    return (
        <div className="border-t border-slate-800 pt-6">
            <div
                onClick={() => setAutoConnect(!autoConnect)}
                className="bg-slate-950/50 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between cursor-pointer group transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${autoConnect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800/50 text-slate-500'} transition-colors`}>
                        <Box size={18} />
                    </div>
                    <span className={`font-bold text-sm ${autoConnect ? 'text-slate-200' : 'text-slate-400'} transition-colors`}>
                        Auto-join server on launch
                    </span>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${autoConnect ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${autoConnect ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            </div>

            {autoConnect && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200 pl-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {t('crop_label_server')} {errors.serverAddress && <span className="text-red-500">{t('crop_required')}</span>}
                    </label>
                    <input
                        type="text"
                        value={serverAddress}
                        onChange={(e) => {
                            setServerAddress(e.target.value);
                            if (errors.serverAddress) setErrors(prev => ({ ...prev, serverAddress: false }));
                        }}
                        placeholder="play.hypixel.net"
                        className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors placeholder:text-slate-600 font-mono text-sm ${errors.serverAddress
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-slate-800 focus:border-emerald-500/50'
                            }`}
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
};

export const RamOverrideSetting = ({ ramOverride, setRamOverride, ram, setRam }) => {
    const { t } = useTranslation();
    return (
        <div className="border-t border-slate-800 pt-6">
            <div
                onClick={() => setRamOverride(!ramOverride)}
                className="bg-slate-950/50 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between cursor-pointer group transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${ramOverride ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-800/50 text-slate-500'} transition-colors`}>
                        <Zap size={18} />
                    </div>
                    <div>
                        <span className={`block font-bold text-sm ${ramOverride ? 'text-slate-200' : 'text-slate-400'} transition-colors`}>
                            Instance Memory
                        </span>
                        <span className="text-xs text-slate-500">Override global RAM settings</span>
                    </div>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${ramOverride ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${ramOverride ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            </div>

            {ramOverride && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200 pl-1 custom-range-wrapper">
                    <div className="flex justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {t('settings_ram_allocation', { defaultValue: 'Heap Size' })}
                        </label>
                        <span className="text-sm font-bold text-indigo-400">{ram} GB</span>
                    </div>
                    <div className="relative pb-6 pt-2">
                        <input
                            type="range"
                            min="2"
                            max="16"
                            step="0.5"
                            value={ram || 4}
                            onChange={(e) => setRam(e.target.value)}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 relative z-10"
                        />
                        {[2, 4, 8, 16].map((cut) => {
                            const ratio = (cut - 2) / (16 - 2);
                            return (
                                <div
                                    key={cut}
                                    className="absolute top-4 flex flex-col items-center -translate-x-1/2 pointer-events-none"
                                    style={{ left: `calc(0.5rem + (100% - 1rem) * ${ratio})` }}
                                >
                                    <div className="w-0.5 h-1.5 bg-slate-600 mb-1"></div>
                                    <span className="text-[10px] font-mono text-slate-500">{cut}G</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
