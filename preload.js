const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lockdownSystem', {
    finishQuiz: () => ipcRenderer.send('close-app')
});