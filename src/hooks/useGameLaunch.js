import React, { useState, useEffect, useCallback } from 'react';

export const useGameLaunch = (selectedInstance, ram, activeAccount, updateLastPlayed, hideOnLaunch, javaPath, setJavaPath) => {
    const [launchStatus, setLaunchStatus] = useState('idle'); // idle, launching, running
    const [launchProgress, setLaunchProgress] = useState(0);
    const [launchStep, setLaunchStep] = useState('Initializing...');
    const [launchFeedback, setLaunchFeedback] = useState(null); // null | 'cancelled' | 'error'
    const [showConsole, setShowConsole] = useState(false);
    const [logs, setLogs] = useState([]);

    const [requiredJavaVersion, setRequiredJavaVersion] = useState(17);
    const [showJavaModal, setShowJavaModal] = useState(false);

    // Determine Java Version based on selected instance
    useEffect(() => {
        if (selectedInstance?.version) {
            // Simple heuristic: < 1.17 -> 8, >= 1.17 -> 17
            // "1.20.4"
            const parts = selectedInstance.version.split('.');
            if (parts.length >= 2) {
                // < 1.17 -> Java 8
                // 1.17 - 1.20.4 -> Java 17
                // >= 1.20.5 -> Java 21

                const minor = parseInt(parts[1]);
                let patch = 0;
                if (parts.length > 2) {
                    patch = parseInt(parts[2]); // e.g. 1.20.4 -> 4
                }

                if (minor >= 21) {
                    // 1.21+ -> Java 21
                    setRequiredJavaVersion(21);
                } else if (minor === 20) {
                    // 1.20.5+ -> Java 21
                    if (patch >= 5) {
                        setRequiredJavaVersion(21);
                    } else {
                        setRequiredJavaVersion(17);
                    }
                } else if (minor >= 17) {
                    // 1.17 - 1.19 -> Java 17
                    setRequiredJavaVersion(17);
                } else {
                    // < 1.17 -> Java 8
                    setRequiredJavaVersion(8);
                }
            } else {
                setRequiredJavaVersion(17); // Default
            }
        }
    }, [selectedInstance]);

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
                } else if (log.message.includes('No process returned') || log.message.includes('verify your Java path')) {
                    // Detected the specific error we added in Step 125
                    setLaunchFeedback('error');
                    setShowConsole(false); // Don't show console, show modal
                    setShowJavaModal(true);
                    setTimeout(() => setLaunchFeedback(null), 3000);
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
                    if (window.electronAPI.log) {
                        window.electronAPI.log('error', `[UI] Detected launch failure. Code: ${code}`);
                    }

                    // Specific check: logs usually contain "No process returned" or "verify your Java path" if we caught it in main
                    // But we can't easily read those logs here synchronously. 
                    // Ideally, backend should send a specific error event.
                    // For now, if code is 1 and it was fast, we can TRY to show the Java fix logic or just error.
                    // However, let's look for a patterns or assume if user wants us to fix it.

                    // Actually, let's rely on a specific message we can detect? 
                    // Since we can't easily see the last log message here without state delay, 
                    // Let's implement a listener for "java-missing" if we added it?
                    // We didn't. But we can check if the REASON is java.

                    // Check last log entry?
                    // Logs might be updated async.

                    // Let's trigger the Java modal ONLY if we see the specific error pattern in logs state?
                    // But `logs` state update might tag along.

                    // Let's modify logic: If code=1, we show error. 
                    // AND if we think it's Java... 
                    // Actually, let's just trigger the modal safely if we detect the indicator.
                }

                if (launchStatusRef.current === 'launching' && code === 1) {
                    // Check if backend logged the specific error
                    // Since we can't read files easily, we might have to rely on the user manually fixing it OR 
                    // we can check if the Java Path looked suspicious?
                }

                if (launchStatusRef.current === 'launching' && code !== 0 && code !== -1) {
                    setLaunchFeedback('error');
                    setLaunchStep("Launch Failed.");

                    // User requested NOT to show console on code 1
                    if (code !== 1) {
                        setShowConsole(true);
                    }

                    setTimeout(() => setLaunchFeedback(null), 3000);
                }
            });

            // Listen for specific Java error from backend?
            // We didn't implement a specific event for that yet in GameLauncher.
            // Let's rely on parsing log messages in real-time if possible?

            // Allow manual trigger for now or basic detection
            if (window.electronAPI.log) {
                // ...
            }

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

    const handleJavaInstallComplete = (newPath) => {
        if (setJavaPath) {
            setJavaPath(newPath);
            setShowJavaModal(false);
            // Auto retry?
            // handlePlay(); // Careful with loops
            setLaunchStatus('idle'); // Reset to allow retry
            setLaunchFeedback(null);
        }
    };

    return {
        launchStatus,
        launchProgress,
        launchStep,
        launchFeedback,
        showConsole,
        setShowConsole,
        logs,
        handlePlay,
        handleStop,
        showJavaModal,
        setShowJavaModal,
        handleJavaInstallComplete,
        requiredJavaVersion
    };
};
