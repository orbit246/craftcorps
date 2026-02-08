const { ipcMain } = require('electron');
const serverRegistrationService = require('../services/serverRegistrationService.cjs');

function setupServerRegistrationHandlers() {
    ipcMain.handle('get-my-servers', async () => {
        try {
            return await serverRegistrationService.getMyServers();
        } catch (error) {
            console.error('[ServerRegistration] Get My Servers failed:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('register-server', async (_, payload) => {
        try {
            return await serverRegistrationService.registerServer(payload);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-server-token', async (_, serverId) => {
        try {
            return await serverRegistrationService.getServerRegistrationToken(serverId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('verify-server-registration', async (_, payload) => {
        try {
            return await serverRegistrationService.verifyServer(payload);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-server-registration-status', async (_, serverId) => {
        try {
            return await serverRegistrationService.getServerRegistrationStatus(serverId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-server-details', async (_, serverId) => {
        try {
            return await serverRegistrationService.getServerDetails(serverId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('ping-server', async (_, serverIp) => {
        try {
            const { pingServer } = require('../services/smartJoinService.cjs');
            const result = await pingServer(serverIp);
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = { setupServerRegistrationHandlers };
