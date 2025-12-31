const fs = require('fs');
const path = require('path');
const os = require('os');

const appData = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + "/.local/share");
const mcDir = path.join(appData, '.minecraft');
const versionDir = path.join(mcDir, 'versions', '1.20.1-forge-47.4.10');
const jsonPath = path.join(versionDir, '1.20.1-forge-47.4.10.json');

console.log('Checking file:', jsonPath);

if (fs.existsSync(jsonPath)) {
    try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log('File read successfully.');
        if (data.arguments && data.arguments.game) {
            console.log('arguments.game found. Length:', data.arguments.game.length);
            const hasAccess = data.arguments.game.includes('--accessToken');
            const hasVersion = data.arguments.game.includes('--version');
            console.log('Has --accessToken:', hasAccess);
            console.log('Has --version:', hasVersion);
            console.log('Full args sample:', data.arguments.game.filter(d => typeof d === 'string'));
        } else {
            console.log('arguments.game NOT found.');
            if (data.minecraftArguments) {
                console.log('Has minecraftArguments string:', data.minecraftArguments);
            }
        }
    } catch (e) {
        console.error('Error parsing JSON:', e);
    }
} else {
    console.log('File does not exist.');
}
