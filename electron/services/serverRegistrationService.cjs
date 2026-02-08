const log = require('electron-log');
const authService = require('./authService.cjs');

const API_BASE = 'https://api.nortixlabs.com';

class ServerRegistrationService {
    async getMyServers() {
        log.info('[ServerRegistration] Fetching my servers...');
        const res = await authService.fetchAuthenticated(`${API_BASE}/servers/registration/my-servers`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || err.error || `Fetch Servers failed: ${res.status}`);
        }
        return await res.json();
    }

    async registerServer(payload) {
        log.info('[ServerRegistration] Registering server...');
        const res = await authService.fetchAuthenticated(`${API_BASE}/servers/registration/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || err.error || `Register Server failed: ${res.status}`);
        }
        return await res.json();
    }

    async getServerRegistrationToken(serverId) {
        log.info(`[ServerRegistration] Getting token for server ${serverId}...`);
        const res = await authService.fetchAuthenticated(`${API_BASE}/servers/registration/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverId })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || err.error || `Get Token failed: ${res.status}`);
        }
        return await res.json();
    }

    async verifyServer(payload) {
        log.info('[ServerRegistration] Verifying server...');
        const res = await authService.fetchAuthenticated(`${API_BASE}/servers/registration/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || err.error || `Verification failed: ${res.status}`);
        }
        return await res.json();
    }

    async getServerRegistrationStatus(serverId) {
        log.info(`[ServerRegistration] Getting status for server ${serverId}...`);
        const res = await authService.fetchAuthenticated(`${API_BASE}/servers/registration/${serverId}/status`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || err.error || `Get Status failed: ${res.status}`);
        }
        return await res.json();
    }

    async getServerDetails(serverId) {
        log.info(`[ServerRegistration] Getting details for server ${serverId}...`);
        const res = await authService.fetchAuthenticated(`${API_BASE}/servers/registration/my-servers/${serverId}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || err.error || `Get Details failed: ${res.status}`);
        }
        return await res.json();
    }
}

module.exports = new ServerRegistrationService();
