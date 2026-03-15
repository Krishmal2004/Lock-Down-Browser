# Lock-Down-Browser

A simple Electron-based “lockdown” browser for online examinations.

## What this does
- Launches an Electron window in **fullscreen + kiosk** mode
- Tries to block common escape shortcuts (Alt+Tab, Alt+F4, Ctrl/Cmd+R)
- Loads a quiz website with a custom **User Agent**: `SECURE_LOCKDOWN_v1`
- Lets the quiz page request the app to close via an IPC message (`close-app`)

> Note: This is a student project / prototype. A real secure lockdown environment requires much stronger OS-level controls.

---

## Requirements
- Node.js + npm installed
- Windows/macOS/Linux supported for development
- Building a Windows installer works best on Windows

---


## Build a downloadable `.exe` (Windows installer) using Electron Forge

To give this to students as a downloadable `.exe`, you use **Electron Forge**.

### 1) Install Forge
```bash
npm install --save-dev @electron-forge/cli
```

### 2) Import Forge (only if you haven't already)
```bash
npx electron-forge import
```

### 3) Make the installer
```bash
npm run make
```

This generates an `out/` folder containing an installer you can host on your website.

---

## Where to find the installer output (Windows)

Navigate to the following folder on your computer (example path if you cloned/downloaded into Downloads):

`C:\Users\User\Downloads\Lock-Down-Browser\out\make`

Inside, you will see a folder (often named something like `squirrel.windows`). In there you’ll find:

- `secure-lockdown-browser-1.0.0-full.nupkg`  
  You can ignore this; it's mainly for updates.

- `Setup.exe` (or a similarly named setup executable)  
  This is the installer you give to your students.

---

## How to test it (Windows)

1. Run the setup  
   Double-click the `Setup.exe` in the `out/make/...` folder.

2. Observe the “lockdown” behavior  
   The app should take over the entire screen. Try pressing **Windows key** or **Alt+Tab**—they should be blocked (or at least reduced, depending on OS settings).

3. Exiting the exam  
   Your quiz UI should include a “Finish & Exit Exam” button that triggers the `close-app` command, which quits the app and returns to the normal desktop.

---

## Connect it to your real quiz website

### 1) Upload the `.exe`
Put the generated installer (`Setup.exe`) on your website (or LMS) so students can download it.

### 2) Update the quiz URL in `main.js`
In `main.js`, change the default URL:

```js
function createLockdownWindow(quizUrl = 'https://your-quiz-site.com') {
  // ...
  mainWindow.loadURL(quizUrl, { userAgent: 'SECURE_LOCKDOWN_v1' });
}
```

Set it to your production quiz URL (example):
```js
createLockdownWindow('https://your-site.com/quiz');
```

### 3) Security check on your backend (recommended)
On your website backend, verify the **User Agent**. This app sets it to:

- `SECURE_LOCKDOWN_v1`

If a student tries to open the quiz in Chrome/Firefox, your website should deny access, e.g.:

> Access Denied: Please use the Lockdown Browser to take this exam.

---

## Repo structure (key files)
- `main.js` – Electron main process: kiosk window, shortcuts, custom User Agent
- `preload.js` – preload bridge for secure IPC
- `index.html` – local UI (if used)
- `forge.config.js` – Electron Forge makers/plugins configuration
- `package.json` – scripts:
  - `npm run start`
  - `npm run package`
  - `npm run make`

---
