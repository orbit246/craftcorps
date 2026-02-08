const { ipcMain } = require('electron');
const { authenticateMicrosoft, refreshMicrosoftAuth } = require('../microsoftAuth.cjs');
const authService = require('../services/authService.cjs');

const DEFAULT_CONSENT = {
    type: 'TOS_AND_PRIVACY',
    version: '2026-1-18'
};



function setupAuthHandlers(getMainWindow) {
    // --- Standard Auth ---

    ipcMain.handle('register', async (event, { email, password, username }) => {
        try {
            await authService.register(email, password, username);
            return { success: true };
        } catch (error) {
            console.error('[AuthHandler] Register failed:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('login', async (event, { email, password }) => {
        try {
            const data = await authService.login(email, password);
            return { success: true, data };
        } catch (error) {
            console.error('[AuthHandler] Login failed:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('logout', async () => {
        try {
            await authService.logout();
            return { success: true };
        } catch (error) {
            console.error('[AuthHandler] Logout failed:', error);
            return { success: false, error: error.message };
        }
    });

    // --- Microsoft Auth ---

    ipcMain.handle('microsoft-login', async (event, consent) => {
        try {
            const consentToRecord = consent || DEFAULT_CONSENT;

            // 1. Authenticate with Microsoft (Get Access Token)
            console.log('[AuthHandler] Starting Microsoft authentication window...');
            const msAccount = await authenticateMicrosoft(getMainWindow());
            console.log('[AuthHandler] Microsoft auth successful. User:', msAccount.name);

            // 2. Record Consent (Optional, but good practice before login if needed)
            try {
                await authService.recordConsent(consentToRecord);
            } catch (ignore) { }

            // 3. Login with Backend using Minecraft Token (New Backend Flow)

            console.log('[AuthHandler] Exchange Minecraft token for Nortix session...');

            let data = { accessToken: null, refreshToken: null, user: { id: 'offline' } };
            let cosmetics = null;

            try {
                data = await authService.loginMicrosoft(msAccount.accessToken);
                // 4. Fetch and Cache Cosmetics (Pre-warm for UI)
                try { cosmetics = await authService.getPlayerCosmetics(); } catch (e) { }
                console.log('[AuthHandler] Backend cosmetics fetch complete:', !!cosmetics);
            } catch (err) {
                console.warn('[AuthHandler] Backend login failed (Offline Mode?):', err.message);
                // Proceed with offline data
            }

            return {
                success: true,
                data,
                account: { ...msAccount, backendAccessToken: data.accessToken, cosmetics }
            };
        } catch (error) {
            console.error('[AuthHandler] Microsoft Login Failed:', error);
            return { success: false, error: error.message || error };
        }
    });

    ipcMain.handle('link-microsoft', async (event, consent) => {
        try {
            const consentToRecord = consent || DEFAULT_CONSENT;

            // 1. Authenticate with Microsoft
            const msAccount = await authenticateMicrosoft(getMainWindow());

            // 2. Record Consent
            if (consentToRecord) {
                await authService.recordConsent(consentToRecord);
            }

            // 3. Link with Backend
            await authService.linkMicrosoft(msAccount.accessToken);

            return { success: true };
        } catch (error) {
            console.error('[AuthHandler] Microsoft Link Failed:', error);
            return { success: false, error: error.message || error };
        }
    });

    // --- Linking & Profiles ---

    ipcMain.handle('link-credentials', async (event, { email, password }) => {
        try {
            await authService.linkCredentials(email, password);
            return { success: true };
        } catch (error) {
            console.error('[AuthHandler] Link Credentials failed:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('link-profile', async (event, { profile, consent }) => {
        try {
            const consentToRecord = consent || DEFAULT_CONSENT;
            if (consentToRecord) {
                try {
                    await authService.recordConsent(consentToRecord);
                } catch (ignore) { }
            }

            try {
                const result = await authService.linkProfile(profile);
                return { success: result };
            } catch (err) {
                console.warn('[AuthHandler] Link profile failed (Backend offline?), allowing offline use:', err.message);
                return { success: true };
            }
        } catch (error) {
            console.error('[AuthHandler] Link profile failed:', error);
            return { success: false, error: error.message || error };
        }
    });

    // --- Utils ---

    ipcMain.handle('refresh-microsoft-token', async (event, refreshToken) => {
        try {
            const account = await refreshMicrosoftAuth(refreshToken);
            return { success: true, account };
        } catch (error) {
            console.error('Refresh Failed:', error);
            return { success: false, error: error.message || error };
        }
    });

    ipcMain.handle('refresh-backend-session', async () => {
        try {
            const success = await authService.refreshSession();
            return {
                success,
                accessToken: authService.token,
                refreshToken: authService.refreshToken
            };
        } catch (error) {
            console.error('[AuthHandler] Backend Refresh Failed:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-backend-token', async () => {
        return authService.token;
    });

    ipcMain.handle('detect-local-accounts', async () => {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            const os = require('os');

            let mcPath;
            if (process.platform === 'win32') {
                mcPath = path.join(process.env.APPDATA, '.minecraft');
            } else if (process.platform === 'darwin') {
                mcPath = path.join(os.homedir(), 'Library', 'Application Support', 'minecraft');
            } else {
                mcPath = path.join(os.homedir(), '.minecraft');
            }

            const accountsPath = path.join(mcPath, 'launcher_accounts.json');

            try {
                const data = await fs.readFile(accountsPath, 'utf8');
                const json = JSON.parse(data);

                if (json.accounts) {
                    const accounts = Object.values(json.accounts)
                        .filter(acc => acc.type === 'msa' && acc.minecraftProfile)
                        .map(acc => ({
                            name: acc.minecraftProfile.name,
                            uuid: acc.minecraftProfile.id,
                            type: 'microsoft'
                        }));

                    return { success: true, accounts };
                }
            } catch (e) {
                // File not found or unreadable
                return { success: false, error: 'NO_LOCAL_ACCOUNTS' };
            }

            return { success: false, error: 'NO_LOCAL_ACCOUNTS' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('check-server-status', async () => {
        return await authService.checkConnection();
    });

    // --- Advanced Profile ---

    ipcMain.handle('get-user-profile', async () => {
        try {
            const profile = await authService.getUserProfile();
            return { success: true, profile };
        } catch (error) {
            console.error('[AuthHandler] Get Profile failed:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-invite-code', async () => {
        try {
            const code = await authService.getInviteCode();
            return { success: true, code };
        } catch (error) {
            console.error('[AuthHandler] Get Invite Code failed:', error);
            // Return null code instead of erroring out to UI
            return { success: false, code: null };
        }
    });

    ipcMain.handle('oauth-login', async (event, { provider }) => {
        try {
            const { BrowserWindow } = require('electron');
            // Endpoint convention: /auth/google or /auth/discord
            const authUrl = `https://api.nortixlabs.com/auth/${provider}?client=launcher`;

            return new Promise((resolve) => {
                const authWindow = new BrowserWindow({
                    width: 500,
                    height: 800,
                    show: true,
                    parent: getMainWindow(),
                    modal: true,
                    autoHideMenuBar: true,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true
                    }
                });

                let processed = false;

                const checkUrl = (url) => {
                    if (processed) return;

                    // Check for success signals
                    // Expected URL: .../auth/success?accessToken=...&refreshToken=...
                    if (url.includes('/auth/success') || url.includes('success=true')) {
                        try {
                            const urlObj = new URL(url);
                            const accessToken = urlObj.searchParams.get('accessToken');
                            const refreshToken = urlObj.searchParams.get('refreshToken');

                            if (accessToken) {
                                processed = true;
                                authWindow.close();

                                // Update local auth service state
                                authService._handleAuthResponse({ accessToken, refreshToken });

                                // Fetch profile to return complete user object
                                authService.getUserProfile().then(user => {
                                    resolve({
                                        success: true,
                                        data: {
                                            accessToken,
                                            refreshToken,
                                            user: {
                                                id: user.id || user._id,
                                                username: user.username,
                                                email: user.email,
                                                ...user
                                            }
                                        }
                                    });
                                }).catch(err => {
                                    console.error('Failed to fetch profile after OAuth:', err);
                                    resolve({ success: false, error: 'Failed to fetch user profile' });
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing OAuth URL:', e);
                        }
                    }

                    if (url.includes('error=')) {
                        processed = true;
                        authWindow.close();
                        resolve({ success: false, error: 'Authentication failed' });
                    }
                };

                authWindow.webContents.on('will-navigate', (_, url) => checkUrl(url));
                authWindow.webContents.on('did-navigate', (_, url) => checkUrl(url));
                authWindow.webContents.on('will-redirect', (_, url) => checkUrl(url));

                authWindow.on('closed', () => {
                    if (!processed) resolve({ success: false, error: 'Cancelled by user' });
                });

                authWindow.loadURL(authUrl);
            });

        } catch (error) {
            console.error('[AuthHandler] OAuth Login failed:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('link-discord', async (event) => {
        try {
            const { BrowserWindow } = require('electron');
            const token = await authService.getToken();

            // Backend endpoint that starts the Discord OAuth flow for a logged-in user
            // We append a custom param to signal the backend to redirect to a launcher-friendly success page
            const authUrl = `https://api.nortixlabs.com/auth/link/discord?client=launcher`;

            return new Promise((resolve) => {
                const authWindow = new BrowserWindow({
                    width: 500,
                    height: 800,
                    show: true,
                    parent: getMainWindow(),
                    modal: true,
                    autoHideMenuBar: true,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true
                    }
                });

                let processed = false;

                const checkUrl = (url) => {
                    if (processed) return;

                    // Check for success signals
                    // Assuming backend redirects to .../success or returns a JSON with success
                    // Or we can check if it goes to a specific callback
                    if (url.includes('success=true') || url.includes('/link/success')) {
                        processed = true;
                        authWindow.close();
                        resolve({ success: true });
                    }
                    if (url.includes('error=')) {
                        processed = true;
                        authWindow.close();
                        resolve({ success: false, error: 'Discord interaction failed' });
                    }
                };

                // Inject Auth Header
                authWindow.webContents.on('will-navigate', (event, url) => checkUrl(url));
                authWindow.webContents.on('did-navigate', (event, url) => checkUrl(url));
                authWindow.webContents.on('will-redirect', (event, url) => checkUrl(url));

                authWindow.on('closed', () => {
                    if (!processed) resolve({ success: false, error: 'Cancelled by user' });
                });

                authWindow.loadURL(authUrl, {
                    extraHeaders: `Authorization: Bearer ${token}\n`
                });
            });

        } catch (error) {
            console.error('[AuthHandler] Link Discord failed:', error);
            return { success: false, error: error.message };
        }
    });

    // --- Cosmetics ---

    ipcMain.handle('fetch-detailed-cosmetics', async (event, uuid) => {
        try {
            return await authService.getPlayerCosmetics(uuid);
        } catch (error) {
            console.error('[AuthHandler] Fetch detailed cosmetics failed:', error);
            return null;
        }
    });

    ipcMain.handle('equip-cosmetic', async (event, { cosmeticId, playerUuid }) => {
        try {
            const url = 'https://api.nortixlabs.com/cosmetics/equip';
            const res = await authService.fetchAuthenticated(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cosmeticId: cosmeticId, playerUuid })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Equip failed: ${res.status}`);
            }
            return true;
        } catch (error) {
            console.error('[AuthHandler] Equip cosmetic failed:', error);
            throw error;
        }
    });

    ipcMain.handle('upload-cosmetic', async (event, { filePath, type, name }) => {
        try {
            const fs = require('fs');
            const fileBuffer = fs.readFileSync(filePath);
            const fileName = require('path').basename(filePath);

            // Create Blob from buffer (Node 20 supports this)
            const blob = new Blob([fileBuffer], { type: 'image/png' });

            const formData = new FormData();
            formData.append('file', blob, fileName);
            formData.append('type', type || 'CAPE');
            formData.append('name', name || fileName);

            const url = 'https://api.nortixlabs.com/cosmetics/upload';
            const res = await authService.fetchAuthenticated(url, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || err.error || `Upload failed: ${res.status}`);
            }

            return { success: true, data: await res.json() };
        } catch (error) {
            console.error('[AuthHandler] Upload cosmetic failed:', error);
            return { success: false, error: error.message };
        }
    });
}

module.exports = { setupAuthHandlers };
