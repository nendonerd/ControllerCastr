const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
// const isPackaged = require('electron').app.isPackaged
// const ps5controllerPath = isPackaged ? path.join(__dirname, '../../ps5controller/ps5controller.node') : path.join(__dirname, 'ps5controller/ps5controller.node')
const ps5controller = require('./ps5controller/ps5controller.node')

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 360,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    // focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // mainWindow.webContents.openDevTools();

  ps5controller.startControllerMonitoring((state) => {
    mainWindow.webContents.send('controller-state', state);
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  ps5controller.stopControllerMonitoring();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

ipcMain.on('resize-window', (event, direction) => {
  const currentSize = mainWindow.getSize();
  if (direction === 'increase') {
    mainWindow.setSize(currentSize[0] + 22, currentSize[1] + 18);
  } else if (direction === 'decrease') {
    mainWindow.setSize(currentSize[0] - 22, currentSize[1] - 18);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulExit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulExit();
});

function gracefulExit() {
  // Perform cleanup if needed
  console.log('Cleaning up before exit...');

  // Close any open windows, servers, or other resources
  if (mainWindow) {
    mainWindow.close();
  }

  // Allow time for any cleanup operations
  setTimeout(() => {
    app.quit();
    process.exit(1);
  }, 1000); // 1 second delay to allow cleanup
}
