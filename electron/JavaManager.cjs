const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { DownloaderHelper } = require('node-downloader-helper');
const AdmZip = require('adm-zip');
const log = require('electron-log');

class JavaManager {
    constructor() {
        this.baseRuntimeDir = path.join(app.getPath('userData'), 'runtime', 'java');
        this.dl = null;

        this.versions = {
            8: {
                url: "https://api.adoptium.net/v3/binary/latest/8/ga/windows/x64/jdk/hotspot/normal/eclipse",
                dirName: "java-8"
            },
            17: {
                url: "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse",
                dirName: "java-17"
            },
            21: {
                url: "https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse",
                dirName: "java-21"
            }
        };
    }

    getInstallDir(version) {
        const v = this.versions[version] ? version : 17; // Default 17
        return path.join(this.baseRuntimeDir, this.versions[v].dirName);
    }

    async checkJava(version = 17) {
        const targetDir = this.getInstallDir(version);

        // 1. Check our managed directory
        const managed = this.findJavaW(targetDir);
        if (managed) return managed;

        // 2. Check system paths
        const systemJava = await this.checkSystemJava(version);
        if (systemJava) {
            log.info(`[JavaManager] Found system Java ${version} at: ${systemJava}`);
            return systemJava;
        }

        return null;
    }

    findJavaW(dir) {
        if (!fs.existsSync(dir)) return null;

        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    const found = this.findJavaW(fullPath);
                    if (found) return found;
                } else if (file === 'javaw.exe') {
                    return fullPath;
                }
            }
        } catch (e) {
            // Permission denied or other error
        }
        return null;
    }

    async scanForJavas() {
        const found = [];
        const commonPaths = [
            `C:\\Program Files\\Java`,
            `C:\\Program Files (x86)\\Java`,
            path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Common', 'Eclipse', 'Adoptium'),
            path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Eclipse Adoptium'),
            // Add managed dir
            this.baseRuntimeDir
        ];

        for (const root of commonPaths) {
            if (fs.existsSync(root)) {
                try {
                    const subdirs = fs.readdirSync(root);
                    for (const sub of subdirs) {
                        const fullPath = path.join(root, sub);
                        // Case 1: sub is version dir (classic Java)
                        if (fs.statSync(fullPath).isDirectory()) {
                            const binJava = path.join(fullPath, 'bin', 'javaw.exe');
                            if (fs.existsSync(binJava)) {
                                found.push({
                                    path: binJava,
                                    version: this.guessVersionFromPath(sub),
                                    name: sub
                                });
                                continue;
                            }

                            // Case 2: sub might be a group dir (like java-17 in managed)
                            // Check sub-sub dirs? 
                            // For managed: runtime/java/java-17/jdk-17.../bin/javaw.exe
                            try {
                                const subFiles = fs.readdirSync(fullPath);
                                for (const nested of subFiles) {
                                    const nestedPath = path.join(fullPath, nested);
                                    if (fs.statSync(nestedPath).isDirectory()) {
                                        const nestedBin = path.join(nestedPath, 'bin', 'javaw.exe');
                                        if (fs.existsSync(nestedBin)) {
                                            found.push({
                                                path: nestedBin,
                                                version: this.guessVersionFromPath(nested),
                                                name: nested
                                            });
                                        }
                                    }
                                }
                            } catch (e) { }
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
        }

        // Remove duplicates by path
        const unique = [];
        const seen = new Set();
        for (const j of found) {
            if (!seen.has(j.path)) {
                seen.add(j.path);
                unique.push(j);
            }
        }
        return unique;
    }

    guessVersionFromPath(pathName) {
        if (pathName.match(/^jdk-?(\d+)/i)) return parseInt(pathName.match(/^jdk-?(\d+)/i)[1]);
        if (pathName.match(/^jre-?(\d+)/i)) return parseInt(pathName.match(/^jre-?(\d+)/i)[1]);
        if (pathName.match(/^(\d+)\./)) return parseInt(pathName.match(/^(\d+)\./)[1]);
        if (pathName.match(/1\.(\d+)\./)) return parseInt(pathName.match(/1\.(\d+)\./)[1]);
        if (pathName.includes('java-8')) return 8;
        if (pathName.includes('java-17')) return 17;
        if (pathName.includes('java-21')) return 21;
        return 0; // Unknown
    }

    async checkSystemJava(targetVersion) {
        const commonPaths = [
            `C:\\Program Files\\Java`,
            `C:\\Program Files (x86)\\Java`,
            path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Common', 'Eclipse', 'Adoptium'),
            path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Eclipse Adoptium'),
        ];

        for (const root of commonPaths) {
            if (fs.existsSync(root)) {
                try {
                    const subdirs = fs.readdirSync(root);
                    // Sort to pick latest compatible? Or just first found?
                    // Let's sort descending to pick highest version if multiple exist
                    subdirs.sort().reverse();

                    for (const sub of subdirs) {
                        // Extract version number from folder name
                        // e.g. jdk-17.0.1, jdk-21, jre1.8.0, jdk8u...
                        let detectedVer = null;

                        if (sub.match(/^jdk-?(\d+)/i)) {
                            // "jdk-17...", "jdk21"
                            const match = sub.match(/^jdk-?(\d+)/i);
                            detectedVer = parseInt(match[1]);
                        } else if (sub.match(/^jre-?(\d+)/i)) {
                            const match = sub.match(/^jre-?(\d+)/i);
                            detectedVer = parseInt(match[1]);
                        } else if (sub.match(/^(\d+)\./)) {
                            // "17.0.1"
                            const match = sub.match(/^(\d+)\./);
                            detectedVer = parseInt(match[1]);
                        } else if (sub.match(/1\.(\d+)\./)) {
                            // "1.8.0" -> 8
                            const match = sub.match(/1\.(\d+)\./);
                            detectedVer = parseInt(match[1]);
                        }

                        if (detectedVer !== null) {
                            // Logic:
                            // If target is 8, we stick to 8 (compatibility issues with 16+)
                            // If target is 17, we accept >= 17 (21 works for 1.18 usually)
                            // If target is 21, we accept >= 21

                            let isCompatible = false;
                            if (targetVersion === 8) {
                                isCompatible = (detectedVer === 8);
                            } else {
                                // For 17 or 21, allow newer versions
                                isCompatible = (detectedVer >= targetVersion);
                            }

                            if (isCompatible) {
                                const fullPath = path.join(root, sub);
                                if (fs.statSync(fullPath).isDirectory()) {
                                    const binJava = path.join(fullPath, 'bin', 'javaw.exe');
                                    if (fs.existsSync(binJava)) return binJava;
                                }
                            }
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
        }
        return null;
    }

    async downloadAndInstall(version, onProgress) {
        // Validation
        const vConfig = this.versions[version];
        if (!vConfig) {
            throw new Error(`Unsupported Java version: ${version}`);
        }

        const installDir = this.getInstallDir(version);

        if (this.dl) {
            if (this.dl.getStats().state === 'DOWNLOADING') {
                return Promise.reject(new Error("Download already in progress"));
            }
        }

        if (fs.existsSync(installDir)) {
            // fs.rmSync(installDir, { recursive: true, force: true });
        }
        fs.mkdirSync(installDir, { recursive: true });

        log.info(`[JavaManager] Downloading Java ${version} from ${vConfig.url}`);

        this.dl = new DownloaderHelper(vConfig.url, installDir, {
            fileName: 'java-runtime.zip',
            override: true
        });

        return new Promise((resolve, reject) => {
            this.dl.on('progress', (stats) => {
                if (onProgress) onProgress(stats);
            });

            this.dl.on('end', async () => {
                log.info('[JavaManager] Download complete. Extracting...');
                this.dl = null;
                try {
                    const zipPath = path.join(installDir, 'java-runtime.zip');
                    const zip = new AdmZip(zipPath);
                    zip.extractAllTo(installDir, true);

                    log.info('[JavaManager] Extraction complete.');
                    fs.unlinkSync(zipPath);

                    const javaPath = await this.checkJava(version);
                    if (javaPath) {
                        log.info(`[JavaManager] Java ${version} installed at: ${javaPath}`);
                        resolve(javaPath);
                    } else {
                        reject(new Error("Java executable not found after extraction."));
                    }
                } catch (e) {
                    reject(e);
                }
            });

            this.dl.on('error', (err) => {
                this.dl = null;
                reject(err);
            });

            this.dl.on('stop', () => {
                log.info('[JavaManager] Download stopped/cancelled.');
            });

            this.dl.start().catch(err => {
                if (this.dl && this.dl.getStats().state === 'STOPPED') {
                } else {
                    reject(err);
                }
                this.dl = null;
            });
        });
    }

    pauseDownload() {
        if (this.dl) {
            this.dl.pause();
            log.info('[JavaManager] Download paused');
            return true;
        }
        return false;
    }

    resumeDownload() {
        if (this.dl) {
            this.dl.resume();
            log.info('[JavaManager] Download resumed');
            return true;
        }
        return false;
    }

    cancelDownload() {
        if (this.dl) {
            this.dl.stop();
            this.dl = null;
            log.info('[JavaManager] Download cancelled by user');
            return true;
        }
        return false;
    }
}

module.exports = new JavaManager();
