const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, 'version.json');

// Default version data if file doesn't exist
const defaultVersionData = {
  version: '3.0.0',
  buildNumber: 0,
  buildDate: ''
};

let versionData;

// Read the current version file or create it if it doesn't exist
try {
  if (fs.existsSync(versionFilePath)) {
    versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
  } else {
    console.log('⚠️  version.json not found, creating with default values...');
    versionData = { ...defaultVersionData };
  }
} catch (error) {
  console.error('⚠️  Error reading version.json, using defaults:', error.message);
  versionData = { ...defaultVersionData };
}

// Increment build number
versionData.buildNumber += 1;

// Update build date
versionData.buildDate = new Date().toISOString();

// Write back to version.json
fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));

// Ensure src/assets directory exists
const assetsDir = path.join(__dirname, 'src', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Copy to src/assets for runtime access
const assetsVersionPath = path.join(assetsDir, 'version.json');
fs.writeFileSync(assetsVersionPath, JSON.stringify(versionData, null, 2));

console.log(`✅ Version updated: v${versionData.version} (Build #${versionData.buildNumber})`);
console.log(`📅 Build Date: ${versionData.buildDate}`);
