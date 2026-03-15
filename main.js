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

function createLockdownWindow(quizUrl = 'https://your-quiz-site.com') {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    kiosk: true,              // Locks the PC screen
    alwaysOnTop: true,        // Stays above all windows
    skipTaskbar: true,        // Hides from taskbar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Set a Custom User Agent so your website knows it's the secure app
  mainWindow.loadURL(quizUrl, { userAgent: 'SECURE_LOCKDOWN_v1' });

  // Disable Developer Tools
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });
}

// 2. Block Keyboard Shortcuts (Alt+Tab, Ctrl+Esc, etc.)
app.on('ready', () => {
  createLockdownWindow();

  // Register shortcuts to block common exit/switch keys
  globalShortcut.register('Alt+Tab', () => { return false; });
  globalShortcut.register('CommandOrControl+R', () => { return false; });
  globalShortcut.register('Alt+F4', () => { return false; });
});

// 3. Listen for "Exit" signal from the Website
ipcMain.on('close-app', () => {
  app.quit();
});

// Ensure only one instance runs
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      
      // Extract URL from deep link: lockdown://start?url=...
      const url = commandLine.pop();
      console.log("Opening Quiz:", url);
    }
  });
}