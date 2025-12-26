import React, { useState, useEffect, useCallback } from 'react';

export const useGameLaunch = (selectedInstance, ram, activeAccount, updateLastPlayed, hideOnLaunch, javaPath) => {
    const [launchStatus, setLaunchStatus] = useState('idle'); // idle, launching, running
    const [launchProgress, setLaunchProgress] = useState(0);
    const [launchStep, setLaunchStep] = useState('Initializing...');
    const [launchFeedback, setLaunchFeedback] = useState(null); // null | 'cancelled' | 'error'
    const [showConsole, setShowConsole] = useState(false);
    const [logs, setLogs] = useState([]);

    // Use ref to track status inside callbacks safely without dependency issues
    const launchStatusRef = React.useRef(launchStatus);

    useEffect(() => {
        launchStatusRef.current = launchStatus;
    }, [launchStatus]);

    const handlePlay = useCallback(() => {
        if (launchStatus !== 'idle') return;

        setLaunchStatus('launching');
        launchStatusRef.current = 'launching'; // Sync ref
        setLaunchProgress(0);
        setLaunchStep("Initializing...");
        setLaunchFeedback(null);
        setShowConsole(false);
        setLogs([]);

        if (window.electronAPI && window.electronAPI.log) {
            window.electronAPI.log('info', `[UI] User clicked Play for instance: ${selectedInstance?.name} (Version: ${selectedInstance?.version})`);
        } else {
            console.log('[UI] User clicked Play');
        }

        if (window.electronAPI) {
            window.electronAPI.removeLogListeners();
            window.electronAPI.log('info', '[UI] Registering game event listeners...');

            window.electronAPI.onGameLog((log) => {
                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                setLogs(prev => [...prev, { ...log, time: timeStr }]);

                if (log.message.includes('Downloading assets')) {
                    // Handled by progress event
                } else if (log.message.includes('Starting MCLC')) {
                    setLaunchStep("Preparing version manifest...");
                } else if (log.message.includes('Game process started')) {
                    setLaunchStep("Game started!");
                    setLaunchProgress(100);

                    if (updateLastPlayed) {
                        updateLastPlayed();
                    }

                    if (hideOnLaunch && window.electronAPI) {
                        window.electronAPI.hide();
                    }

                    setTimeout(() => {
                        setLaunchStatus('running');
                        // ref update handled by effect
                    }, 500);
                } else {
                    if (log.message && log.message.length < 50 && !log.message.includes('DEBUG')) {
                        setLaunchStep(log.message);
                    }
                }
            });

            window.electronAPI.onGameProgress((data) => {
                setLaunchProgress(data.percent);
                setLaunchStep(`Downloading ${data.type} (${data.percent}%)`);
                // Optional: log milestone progress to file to avoid spamming
                if (data.percent % 25 === 0 && window.electronAPI.log) {
                    window.electronAPI.log('info', `[UI] Download Progress - ${data.type}: ${data.percent}%`);
                }
            });

            window.electronAPI.onGameExit((code) => {
                setLaunchStatus('idle');
                setLaunchStep("Game exited.");
                const exitMsg = `Process exited with code ${code}`;
                setLogs(prev => [...prev, { time: "Now", type: "INFO", message: exitMsg }]);

                if (window.electronAPI.log) {
                    window.electronAPI.log('info', `[UI] Game exited. Code: ${code}`);
                }

                if (window.electronAPI) {
                    window.electronAPI.show();
                }

                // If it exited immediately/prematurely during launch, we might want to flag it?
                // But usually this means user closed game or it crashed.

                // If we were still in 'launching' state (haven't reached 'running' aka game window open for real)
                // AND code != 0, it's likely a launch crash/failure.
                if (launchStatusRef.current === 'launching' && code !== 0 && code !== -1) {
                    setLaunchFeedback('error');
                    setLaunchStep("Game launch failed.");
                    setShowConsole(true);
                }
            });

            window.electronAPI.launchGame({
                version: selectedInstance.version,
                maxMem: ram * 1024,
                username: activeAccount.name,
                uuid: activeAccount.uuid,
                accessToken: activeAccount.accessToken,
                userType: activeAccount.type, // 'Microsoft' or 'Offline'
                useDefaultPath: true,
                server: selectedInstance.autoConnect ? selectedInstance.serverAddress : null,
                javaPath: javaPath
            });

            if (window.electronAPI.log) {
                window.electronAPI.log('info', `[UI] Launch command sent to backend. RAM: ${ram}GB, User: ${activeAccount?.name}, Java: ${javaPath}`);
            }
        } else {
            setLogs([{ time: "Now", type: "ERROR", message: "Electron API not found. Cannot launch native process." }]);
        }
    }, [launchStatus, selectedInstance, ram, activeAccount, updateLastPlayed, hideOnLaunch, javaPath]);

    const handleStop = useCallback(() => {
        if (launchStatus === 'launching') {
            setLaunchFeedback('cancelled');
            setTimeout(() => setLaunchFeedback(null), 1500);
        }

        if (window.electronAPI) {
            if (window.electronAPI.log) {
                window.electronAPI.log('warn', `[UI] User requested Launch STOP.`);
            }
            window.electronAPI.stopGame();
        }
        setLaunchStatus('idle');
    }, [launchStatus]);

    return {
        launchStatus,
        launchProgress,
        launchStep,
        launchFeedback,
        showConsole,
        setShowConsole,
        logs,
        handlePlay,
        handleStop
    };
};
