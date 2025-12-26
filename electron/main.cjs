const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const log = require('electron-log');

// Configure logging
log.transports.file.level = 'info';
log.transports.console.format = '[{h}:{i}:{s} {level}] {text}';
console.log = log.log; // Redirect console usage to electron-log handling
Object.assign(console, log.functions);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//     app.quit();
// }

let mainWindow;

const preloadPath = path.join(__dirname, 'preload.cjs');
console.log('Loading preload from:', preloadPath);

function createWindow() {
    const iconPath = process.env.NODE_ENV === 'development'
        ? path.join(__dirname, '../public/icon.png')
        : path.join(__dirname, '../dist/icon.png');

    mainWindow = new BrowserWindow({
        icon: iconPath,
        width: 1200,
        height: 800,
        minWidth: 940,
        minHeight: 600,
        frame: false, // Custom frame
        transparent: true,
        backgroundColor: '#00000000', // Truly transparent for the rounded corners effect if css has it
        webPreferences: {
            preload: preloadPath,
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, // Required for contextBridge to reliably expose APIs in some environments
            nodeIntegration: false,
        },
    });

    const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        // mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        mainWindow.loadURL(startUrl);
        // mainWindow.webContents.openDevTools(); // Uncomment if needed for prod debug
    }
}

app.whenReady().then(() => {
    createWindow();

    // IPC Handlers
    ipcMain.on('window-minimize', () => mainWindow?.minimize());
    ipcMain.on('window-maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });
    ipcMain.on('window-close', () => mainWindow?.close());
    ipcMain.on('window-hide', () => mainWindow?.hide());
    ipcMain.on('window-show', () => mainWindow?.show());

    const { authenticateMicrosoft } = require('./microsoftAuth.cjs');
    ipcMain.handle('microsoft-login', async () => {
        try {
            const account = await authenticateMicrosoft(mainWindow);
            return { success: true, account };
        } catch (error) {
            console.error('Login Failed:', error);
            return { success: false, error: error.message || error };
        }
    });

    ipcMain.handle('select-file', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [{ name: 'Executables', extensions: ['exe'] }]
        });
        return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.on('renderer-log', (event, { level, message }) => {
        if (log[level]) {
            log[level](`[Renderer] ${message}`);
        } else {
            log.info(`[Renderer] ${message}`);
        }
    });

    ipcMain.handle('open-logs-folder', async () => {
        const logPath = log.transports.file.getFile().path;
        return shell.showItemInFolder(logPath);
    });

    const JavaManager = require('./JavaManager.cjs');

    ipcMain.handle('install-java', async (event, version = 17) => {
        try {
            // First check if we already have it
            const existing = await JavaManager.checkJava(version);
            if (existing) return existing;

            // If not, download
            await JavaManager.downloadAndInstall(version, (stats) => {
                mainWindow?.webContents.send('java-progress', stats);
            });

            // Return valid path
            return await JavaManager.checkJava(version);
        } catch (error) {
            // Don't log as error if it was just cancelled?
            log.error(`[JavaManager] Installation failed or checks: ${error}`);
            throw error;
        }
    });

    ipcMain.handle('cancel-java-install', () => JavaManager.cancelDownload());
    ipcMain.handle('pause-java-install', () => JavaManager.pauseDownload());
    ipcMain.handle('resume-java-install', async () => {
        return JavaManager.resumeDownload();
    });

    ipcMain.handle('get-available-javas', async () => {
        return JavaManager.scanForJavas();
    });
    // Game Launcher Integration
    const GameLauncher = require('./GameLauncher.cjs');
    const launcher = new GameLauncher();

    launcher.on('log', (data) => {
        const { type, message } = data;
        // Log to file
        if (type === 'ERROR') log.error(`[MCLC] ${message}`);
        else if (type === 'WARN') log.warn(`[MCLC] ${message}`);
        else log.info(`[MCLC] ${message}`);

        // Forward to frontend
        mainWindow?.webContents.send('game-log', data);
    });

    launcher.on('progress', (data) => {
        mainWindow?.webContents.send('game-progress', data);
    });

    launcher.on('exit', (code) => {
        mainWindow?.webContents.send('game-exit', code);
    });

    ipcMain.on('launch-game', (event, options) => {
        // Here you would normally resolve paths to libraries/assets based on the version
        // For now, we pass the raw options or defaults
        launcher.launch(options);
    });

    ipcMain.on('stop-game', () => {
        launcher.kill();
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
