const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onControllerState: (callback) => ipcRenderer.on('controller-state', (event, value) => callback(value)),
  send: (channel, data) => ipcRenderer.send(channel, data),
});