const builder = require('electron-builder');
const fs = require('fs');
const path = require('path');

// Read package.json
const packageJson = require('./package.json');
console.log(`Building ${packageJson.productName} v${packageJson.version}`);

// Ensure assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('Created assets directory');
}

// Run the build process
builder.build({
  config: {
    appId: packageJson.build.appId,
    productName: packageJson.build.productName,
    directories: packageJson.build.directories,
    files: packageJson.build.files,
    win: packageJson.build.win,
    mac: packageJson.build.mac,
    linux: packageJson.build.linux,
    nsis: packageJson.build.nsis
  }
})
.then(() => {
  console.log('Build completed successfully!');
})
.catch((error) => {
  console.error('Build failed:', error);
});
