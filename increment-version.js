const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, 'version.json');

// Read the current version file
const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));

// Increment build number
versionData.buildNumber += 1;

// Update build date
versionData.buildDate = new Date().toISOString();

// Write back to version.json
fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));

// Also copy to src/assets for runtime access
const assetsVersionPath = path.join(__dirname, 'src', 'assets', 'version.json');
fs.writeFileSync(assetsVersionPath, JSON.stringify(versionData, null, 2));

console.log(`✅ Version updated: v${versionData.version} (Build #${versionData.buildNumber})`);
console.log(`📅 Build Date: ${versionData.buildDate}`);
