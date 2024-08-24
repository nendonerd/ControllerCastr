const fs = require('fs');
const path = require('path');

// copy SDL2 to node_modules/ps5controller/
// write a package.json into node_modules/ps5controller/ that specify the main to be ps5controller.node

const sdlSourcePath = path.join(__dirname, 'deps', 'SDL2', 'lib', 'SDL2.dll');
const sdlDestPath = path.join(__dirname, 'ps5controller/', 'SDL2.dll');

console.log('Copying SDL2.dll...');
console.log('From:', sdlSourcePath);
console.log('To:', sdlDestPath);

try {
  fs.copyFileSync(sdlSourcePath, sdlDestPath);
  console.log('SDL2.dll copied successfully.');
} catch (error) {
  console.error('Error copying SDL2.dll:', error.message);
  process.exit(1);
}

// const packageJsonPath = path.join(__dirname, 'node_modules/ps5controller/', 'package.json')
// const packageJsonContent = `
// {
//   "name": "ps5controller",
//   "version": "1.0.0",
//   "main": "ps5controller.node"
// }
// `

// try {
//   fs.writeFileSync(packageJsonPath, packageJsonContent);
//   console.log('package.json written successfully.');
// } catch (error) {
//   console.error('Error writing package.json:', error.message);
//   process.exit(1);
// }