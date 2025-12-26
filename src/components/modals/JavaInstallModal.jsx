import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, CheckCircle, Download } from 'lucide-react';

const JavaInstallModal = ({ isOpen, onClose, onInstallComplete, version = 17 }) => {
    const [status, setStatus] = useState('idle'); // idle (consent), downloading, paused, installing, done, error
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!isOpen) {
            // Reset state when closed
            setStatus('idle');
            setProgress(0);
            setErrorMsg('');
        }
    }, [isOpen]);

    const startInstall = async () => {
        try {
            setStatus('downloading');
            setProgress(0);

            if (window.electronAPI) {
                // Listen for progress
                window.electronAPI.onJavaProgress((stats) => {
                    // stats object from node-downloader-helper: { progress: 50, ... }
                    if (stats && stats.progress) {
                        setProgress(Math.round(stats.progress));
                    }
                });

                const newPath = await window.electronAPI.installJava(version);

                setStatus('done');
                setTimeout(() => {
                    onInstallComplete(newPath);
                }, 1500);

            } else {
                throw new Error("Electron API unavailable");
            }
        } catch (err) {
            console.error(err);
            // If cancelled, it might throw "Cancelled" or similar ??
            // But usually it just stops.
            // If manual cancel, we handle state elsewhere.
            if (status !== 'idle') {
                setStatus('error');
                setErrorMsg(err.message || "Failed to download Java.");
            }
        }
    };

    const handlePause = async () => {
        if (window.electronAPI) {
            await window.electronAPI.pauseJavaInstall();
            setStatus('paused');
        }
    };

    const handleResume = async () => {
        if (window.electronAPI) {
            await window.electronAPI.resumeJavaInstall();
            setStatus('downloading');
        }
    };

    const handleCancel = async () => {
        if (window.electronAPI) {
            await window.electronAPI.cancelJavaInstall();
        }
        setStatus('idle');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col items-center text-center">

                {status === 'idle' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                            <AlertTriangle size={32} className="text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Java {version} Runtime Missing</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            To launch this game, we need to download and configure a compatible Java Runtime (Java {version}).
                            <br /><span className="text-slate-500 text-xs mt-2 block">Source: Adoptium (Eclipse Temurin)</span>
                        </p>

                        <div className="flex w-full gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={startInstall}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={18} /> Download & Install
                            </button>
                        </div>
                    </>
                )}

                {(status === 'downloading' || status === 'paused' || status === 'installing') && (
                    <>
                        <div className={`w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 ${status === 'downloading' ? 'animate-pulse' : ''}`}>
                            <Download size={32} className="text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {status === 'paused' ? 'Download Paused' : 'Installing Java Runtime'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            {status === 'paused' ? 'Waiting to resume...' : 'Downloading required components...'}
                        </p>

                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                            <div
                                className={`h-full bg-emerald-500 transition-all duration-300 ease-out ${status === 'paused' ? 'opacity-50' : ''}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between w-full text-xs text-slate-500 font-mono mb-6">
                            <span>{progress}%</span>
                            <span>{status === 'paused' ? 'Paused' : 'Downloading...'}</span>
                        </div>

                        <div className="flex w-full gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>

                            {status === 'paused' ? (
                                <button
                                    onClick={handleResume}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-medium transition-colors"
                                >
                                    Resume
                                </button>
                            ) : (
                                <button
                                    onClick={handlePause}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-colors"
                                >
                                    Pause
                                </button>
                            )}
                        </div>
                    </>
                )}

                {status === 'done' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                            <CheckCircle size={32} className="text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Ready to Play!</h3>
                        <p className="text-slate-400 text-sm mb-6">Java has been successfully configured.</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Installation Failed</h3>
                        <p className="text-red-400 text-sm mb-6">{errorMsg}</p>
                        <button
                            onClick={onClose}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default JavaInstallModal;
