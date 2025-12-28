const fs = require('fs');
const path = require('path');
const os = require('os');
const { app } = require('electron');
const { DownloaderHelper } = require('node-downloader-helper');
const AdmZip = require('adm-zip');
const log = require('electron-log');
const { execSync, spawnSync } = require('child_process');

class JavaManager {
    constructor() {
        this.baseRuntimeDir = path.join(app.getPath('userData'), 'runtime', 'java');
        this.platform = process.platform; // 'win32', 'darwin', 'linux'
        this.arch = process.arch; // 'x64', 'arm64'
        this.dl = null;

        this.execName = this.platform === 'win32' ? 'java.exe' : 'java';

        // URL Generators based on OS/Arch
        this.getDownloadUrl = (version) => {
            let osType = 'windows';
            let archType = 'x64';
            let ext = 'zip';

            // OS Mapping
            if (this.platform === 'darwin') {
                osType = 'mac';
                ext = 'tar.gz'; // Adoptium usually provides tar.gz for mac/linux
            } else if (this.platform === 'linux') {
                osType = 'linux';
                ext = 'tar.gz';
            }

            // Architecture Mapping
            if (this.arch === 'arm64') {
                archType = 'aarch64';
            }

            // e.g. https://api.adoptium.net/v3/binary/latest/17/ga/mac/aarch64/jdk/hotspot/normal/eclipse
            return `https://api.adoptium.net/v3/binary/latest/${version}/ga/${osType}/${archType}/jdk/hotspot/normal/eclipse`;
        };
    }

    getInstallDir(version) {
        return path.join(this.baseRuntimeDir, `java-${version}`);
    }

    async checkJava(version = 17) {
        const targetDir = this.getInstallDir(version);

        // 1. Check our managed directory first (Best match)
        const managed = await this.findJavaBinary(targetDir);
        if (managed) {
            // Verify it really is the version we think
            const v = this.getVersionFromBinary(managed);
            if (v >= version) return managed;
        }

        // 2. Check system paths (PATH env)
        const systemJava = await this.checkSystemJava(version);
        if (systemJava) {
            log.info(`[JavaManager] Found system Java ${version} at: ${systemJava}`);
            return systemJava;
        }

        // 3. Scan common directories if specific managed one was missing/wrong
        if (!managed) {
            const all = await this.scanForJavas();
            const valid = all.filter(j => j.version >= version).sort((a, b) => a.version - b.version);
            if (valid.length > 0) return valid[0].path;
        }

        return null;
    }

    findJavaBinary(dir) {
        if (!fs.existsSync(dir)) return null;

        try {
            // BFS/DFS to find bin/java or bin/javaw.exe
            // Since extraction structure varies (jdk-17.0.1/bin/java), we scan recursively but limit depth
            const queue = [dir];
            let depth = 0;
            const maxDepth = 4; // Don't go too deep

            while (queue.length > 0) {
                const current = queue.shift();
                if (!current) continue;

                // Check dependencies (Contents/Home/bin for macOS .app bundles if extracted that way, 
                // but usually binary download is a simple folder structure)

                // Directly check if bin/java exists here
                const binCandidate = path.join(current, 'bin', this.execName);
                if (fs.existsSync(binCandidate)) {
                    // On macOS, sometimes it's Contents/Home/bin/java inside the extracted folder
                    return binCandidate;
                }

                // macOS specific: valid JDK root might be inside Contents/Home
                const macHomeCandidate = path.join(current, 'Contents', 'Home', 'bin', this.execName);
                if (fs.existsSync(macHomeCandidate)) {
                    return macHomeCandidate;
                }

                try {
                    const children = fs.readdirSync(current);
                    for (const child of children) {
                        const childPath = path.join(current, child);
                        if (fs.statSync(childPath).isDirectory()) {
                            // Heuristic: only dive if name looks like a java folder or 'bin' isn't here
                            // Avoid scanning massive node_modules or similar if user pointed incorrectly
                            // But this is our managed dir, so it should be clean.
                            // Prevent loops?
                            if (!childPath.includes('jre') && !childPath.includes('lib') && queue.length < 50) {
                                queue.push(childPath);
                            }
                            // Actually, simple structure:
                            // extracted/jdk-17.0.2+8/bin/java
                            // So we just need to see if child is the JDK root
                        }
                    }
                } catch (e) { }
            }
        } catch (e) { }
        return null;
    }

    async scanForJavas() {
        // Platform specific paths
        let searchPaths = [];

        if (this.platform === 'win32') {
            searchPaths = [
                `C:\\Program Files\\Java`,
                `C:\\Program Files (x86)\\Java`,
                `C:\\Program Files\\Eclipse Adoptium`,
                `C:\\Program Files\\BellSoft`,
                `C:\\Program Files\\Amazon Corretto`,
                `C:\\Program Files\\Azul\\zulu`,
                `C:\\Program Files\\Microsoft\\jdk`,
                path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Common', 'Eclipse', 'Adoptium'),
                path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Eclipse Adoptium'),
            ];
            // Add likely user paths
            const userProfile = process.env.USERPROFILE;
            if (userProfile) {
                searchPaths.push(path.join(userProfile, '.jdks'));
                searchPaths.push(path.join(userProfile, '.sdkman', 'candidates', 'java'));
            }

        } else if (this.platform === 'darwin') {
            searchPaths = [
                '/Library/Java/JavaVirtualMachines',
                path.join(os.homedir(), 'Library/Java/JavaVirtualMachines'),
                // Homebrew
                '/opt/homebrew/opt/openjdk/bin',
                '/usr/local/opt/openjdk/bin',
                // SDKMAN
                path.join(os.homedir(), '.sdkman/candidates/java')
            ];
        } else if (this.platform === 'linux') {
            searchPaths = [
                '/usr/lib/jvm',
                '/usr/java',
                '/opt/java',
                path.join(os.homedir(), '.sdkman/candidates/java'),
                '/snap/openjdk' // Snap installs
            ];
        }

        // Always check managed store
        searchPaths.push(this.baseRuntimeDir);

        const found = [];
        const seen = new Set();

        for (const root of searchPaths) {
            if (!fs.existsSync(root)) continue;

            const candidates = await this.recursiveFindJava(root, 0, 3);
            for (const cand of candidates) {
                if (seen.has(cand)) continue;
                seen.add(cand);

                // Verify version properly
                const v = this.getVersionFromBinary(cand);
                if (v > 0) {
                    found.push({
                        path: cand,
                        version: v,
                        name: 'Java ' + v // heuristic name
                    });
                }
            }
        }

        return found;
    }

    async recursiveFindJava(dir, depth, maxDepth) {
        const results = [];
        if (depth > maxDepth) return results;

        try {
            // Check if this dir IS a java home candidate (has bin/java)
            const binJava = path.join(dir, 'bin', this.execName);
            if (fs.existsSync(binJava)) {
                results.push(binJava);
            }

            // Mac-specific: Contents/Home/bin/java
            if (this.platform === 'darwin') {
                const macBin = path.join(dir, 'Contents', 'Home', 'bin', 'java');
                if (fs.existsSync(macBin)) {
                    results.push(macBin);
                }
            }

            // Read children to recurse
            // Avoid recuring into known non-java heavy dirs if they aren't potential roots
            const entries = fs.readdirSync(dir);
            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                if (fs.statSync(fullPath).isDirectory()) {
                    // Filter out unlikely folders
                    if (entry.startsWith('.') || entry === 'node_modules' || entry === 'lib' || entry === 'conf') continue;

                    // If we found a java binary here, we typically don't need to recurse INSIDE it 
                    // (unless it's a wrapper dir, but bin/java usually terminates the JDK structure)
                    // But we checked 'dir/bin/java' above. 'dir' is the root.
                    // The children might be OTHER JDK roots (e.g. C:\Program Files\Java\jdk1; jdk2)

                    results.push(...await this.recursiveFindJava(fullPath, depth + 1, maxDepth));
                }
            }
        } catch (e) { }

        return results;
    }

    getVersionFromBinary(binPath) {
        try {
            const result = spawnSync(binPath, ['-version'], { encoding: 'utf8' });
            // spawnSync returns object. java -version output is usually in stderr.
            const output = (result.stdout || '') + '\n' + (result.stderr || '');

            // Match: version "1.8.0_202" or "17.0.1"
            // Also: openjdk version "11.0.12"
            const match = output.match(/version "([^"]+)"/i);

            if (match && match[1]) {
                const vStr = match[1];
                if (vStr.startsWith('1.')) {
                    // 1.8.0 -> 8
                    return parseInt(vStr.split('.')[1]);
                } else {
                    // 17.0.1 -> 17
                    return parseInt(vStr.split('.')[0]);
                }
            }
            // Fallback for some OpenJDK strings that might differ?
            // Usually standard enough.
            return 0;
        } catch (e) {
            return 0;
        }
    }

    guessVersionFromPath(pathName) {
        // Common patterns
        const patterns = [
            /jdk-?(\d+)/i,       // jdk-17
            /jre-?(\d+)/i,       // jre-17
            /^(\d+)\./,          // 17.0.1
            /1\.(\d+)\./,        // 1.8.0
            /java-(\d+)/i,       // java-8-openjdk
            /temurin-(\d+)/i,
        ];

        for (const p of patterns) {
            const match = pathName.match(p);
            if (match && match[1]) return parseInt(match[1]);
        }

        // Fallback names
        if (pathName.includes('java-8')) return 8;
        if (pathName.includes('java-17')) return 17;
        if (pathName.includes('java-21')) return 21;

        return 0;
    }

    async checkSystemJava(version) {
        // Quick verify: 'java -version'
        try {
            // exec checks system PATH
            // On Windows 'where java' might return multiple, but running 'java' runs the first one.
            // We want to know the version of the one in PATH.
            const v = this.getVersionFromBinary('java');
            if (v > 0) {
                // Return 'java' literal if it's usable, OR resolve it to full path?
                // MCLC prefers full path usually, but 'java' works if in path.
                // However, 'java' might be a symlink or shim (Oracle shim).
                // Safest to return 'java' if it works, or try to find where it is?

                // If it matches our requirement (e.g. 17), return it.
                // Note: if request is 17 and system is 8, we return null.
                if (v >= version) return 'java';

                // If system is newer (e.g. 21) and we asked for 17, it's usually fine too.
            }
        } catch (e) { }

        // If system java wasn't good enough or found, we scan.
        const all = await this.scanForJavas();

        if (all.length === 0) return null;

        // Filter and sort
        const valid = all.filter(j => j.version >= version).sort((a, b) => a.version - b.version);

        return valid.length > 0 ? valid[0].path : null;
    }

    // ... downloadAndInstall logic updated for non-zip ... 
    async downloadAndInstall(version, onProgress) {
        const url = this.getDownloadUrl(version);
        const installDir = this.getInstallDir(version);

        log.info(`[JavaManager] Downloading Java ${version} for ${this.platform} (${this.arch}) from ${url}`);

        if (this.dl) throw new Error("Download in progress");

        if (fs.existsSync(installDir)) {
            try { fs.rmSync(installDir, { recursive: true, force: true }); } catch (e) { }
        }
        fs.mkdirSync(installDir, { recursive: true });

        // On macOS/Linux, we likely get a .tar.gz
        const isTar = url.endsWith('.tar.gz');
        const fileName = isTar ? 'java-runtime.tar.gz' : 'java-runtime.zip';

        this.dl = new DownloaderHelper(url, installDir, {
            fileName: fileName,
            override: true
        });

        return new Promise((resolve, reject) => {
            this.dl.on('progress', stats => { if (onProgress) onProgress(stats); });

            this.dl.on('end', async () => {
                log.info('[JavaManager] Download complete. Extracting...');
                this.dl = null;
                try {
                    const filePath = path.join(installDir, fileName);

                    if (isTar) {
                        // Use tar command for reliability on unix
                        if (this.platform !== 'win32') {
                            try {
                                execSync(`tar -xzf "${filePath}" -C "${installDir}"`);
                            } catch (e) {
                                // Fallback or error
                                return reject(new Error(`Tar extraction failed: ${e.message}`));
                            }
                        } else {
                            // Windows handling of tar.gz if needed (rare for this logic but possible)
                            // We can use 'tar' on Win10+ or a library
                            // For now assume logic chose zip for win32
                        }
                    } else {
                        const zip = new AdmZip(filePath);
                        zip.extractAllTo(installDir, true);
                    }

                    log.info('[JavaManager] Extraction complete.');
                    fs.unlinkSync(filePath);

                    // Re-scan finding the binary
                    const javaBin = this.findJavaBinary(installDir);

                    if (javaBin) {
                        // Make executable on unix
                        if (this.platform !== 'win32') {
                            fs.chmodSync(javaBin, '755');
                        }

                        // Also chmod the jspawnhelper if it exists (fix for some mac/linux spawn issues)
                        try {
                            // jspawnhelper is typically in lib/jspawnhelper relative to bin/java's parent? 
                            // Just chmod -R usually safest for bin?
                            execSync(`chmod -R +x "${installDir}"`);
                        } catch (e) { }

                        log.info(`[JavaManager] Java installed to: ${javaBin}`);
                        resolve(javaBin);
                    } else {
                        reject(new Error("Java executable not found after extraction."));
                    }
                } catch (e) {
                    reject(e);
                }
            });

            this.dl.on('error', err => { this.dl = null; reject(err); });
            this.dl.start().catch(err => reject(err));
        });
    }

    // ... pause/resume/cancel (Keep as is) ...
    pauseDownload() { if (this.dl) { this.dl.pause(); return true; } return false; }
    resumeDownload() { if (this.dl) { this.dl.resume(); return true; } return false; }
    cancelDownload() { if (this.dl) { this.dl.stop(); this.dl = null; return true; } return false; }
}

module.exports = new JavaManager();
