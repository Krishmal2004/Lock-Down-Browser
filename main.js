const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// 1. Handle Custom Protocol (lockdown://)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('lockdown', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('lockdown');
}

function createLockdownWindow(quizUrl = 'https://crowdquiz.vercel.app/') {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    // Locks the PC screen
    kiosk: true,      
    // Stays above all windows        
    alwaysOnTop: true,       
    // Hides from taskbar 
    skipTaskbar: true,        
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(quizUrl, { userAgent: 'SECURE_LOCKDOWN_v1' });

  // Disable Developer Tools
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });
}

// 2. Block Keyboard Shortcuts 
app.on('ready', () => {
  createLockdownWindow();

  globalShortcut.register('Alt+Tab', () => { return false; });
  globalShortcut.register('CommandOrControl+R', () => { return false; });
  globalShortcut.register('Alt+F4', () => { return false; });
});

ipcMain.on('close-app', () => {
  app.quit();
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      
      const url = commandLine.pop();
      console.log("Opening Quiz:", url);
    }
  });
}