// ============================================================
//  Aria — Main Process (src/main.js)
// ============================================================

const {
  app, BrowserWindow, globalShortcut, ipcMain,
  screen, Tray, Menu, nativeImage, shell
} = require('electron');
const path = require('path');
const fs   = require('fs');

// Required to enable microphone in Electron
app.commandLine.appendSwitch('enable-speech-dispatcher');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
app.commandLine.appendSwitch('enable-usermedia-screen-capturing');
app.commandLine.appendSwitch('allow-http-screen-capture');

const CONFIG_PATH  = path.join(app.getPath('userData'), 'aria-config.json');
const PRELOAD_PATH = path.join(__dirname, 'preload.js');
const HISTORY_PATH = path.join(app.getPath('userData'), 'aria-history.json');

let mainWin     = null;
let settingsWin = null;
let historyWin  = null;
let tray        = null;
let isVisible   = false;

// ── config ────────────────────────────────────────────────
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH))
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (_) {}
  return { apiKey: '', hotkey: 'Alt+Space' };
}

function saveConfig(cfg) {
  try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2)); }
  catch (_) {}
}

// ── history ───────────────────────────────────────────────
function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_PATH))
      return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
  } catch (_) {}
  return [];
}

function saveHistory(history) {
  try { fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2)); }
  catch (_) {}
}

// ── window position ───────────────────────────────────────
function positionNearCursor(win, w, h) {
  const cursor  = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const { bounds } = display;
  let x = cursor.x + 24;
  let y = cursor.y + 24;
  if (x + w > bounds.x + bounds.width)  x = cursor.x - w - 12;
  if (y + h > bounds.y + bounds.height) y = cursor.y - h - 12;
  if (x < bounds.x) x = bounds.x + 10;
  if (y < bounds.y) y = bounds.y + 10;
  win.setPosition(Math.round(x), Math.round(y));
}

// ── windows ───────────────────────────────────────────────
function createMainWindow() {
  mainWin = new BrowserWindow({
    width: 400, height: 580,
    minWidth: 360, minHeight: 480,
    frame: false, transparent: true,
    alwaysOnTop: true, skipTaskbar: false,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    resizable: true, show: false,
    webPreferences: {
      nodeIntegration:             false,
      contextIsolation:            true,
      preload:                     PRELOAD_PATH,
      webSecurity:                 false,
      allowRunningInsecureContent: true,
      experimentalFeatures:        true
    }
  });

  // Grant microphone permission automatically
  mainWin.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(permission === 'media' || permission === 'microphone' || permission === 'audioCapture');
  });

  mainWin.loadFile(path.join(__dirname, 'index.html'));
  mainWin.on('blur', () => {
    if (isVisible && !settingsWin && !historyWin) hideWindow();
  });
  mainWin.on('closed', () => { mainWin = null; });
}

function createSettingsWindow() {
  if (settingsWin) { settingsWin.focus(); return; }
  settingsWin = new BrowserWindow({
    width: 480, height: 460,
    frame: false, transparent: true,
    alwaysOnTop: true, resizable: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true, preload: PRELOAD_PATH }
  });
  settingsWin.loadFile(path.join(__dirname, 'settings.html'));
  settingsWin.on('closed', () => { settingsWin = null; });
}

function createHistoryWindow() {
  if (historyWin) { historyWin.focus(); return; }
  historyWin = new BrowserWindow({
    width: 500, height: 600,
    frame: false, transparent: true,
    alwaysOnTop: true, resizable: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true, preload: PRELOAD_PATH }
  });
  historyWin.loadFile(path.join(__dirname, 'history.html'));
  historyWin.on('closed', () => { historyWin = null; });
}

function showWindow() {
  if (!mainWin) return;
  positionNearCursor(mainWin, 400, 580);
  mainWin.show();
  mainWin.focus();
  isVisible = true;
}

function hideWindow() {
  if (!mainWin) return;
  mainWin.hide();
  isVisible = false;
}

function toggleWindow() { isVisible ? hideWindow() : showWindow(); }

// ── screenshot + instant ask (Alt+Q) ─────────────────────
async function screenshotAndAsk() {
  if (!mainWin) return;
  showWindow();
  setTimeout(() => { mainWin.webContents.send('trigger-screenshot-ask'); }, 300);
}

// ── tray ──────────────────────────────────────────────────
function createTray() {
  const trayIconPath = path.join(__dirname, 'assets', 'tray.png');
  const icon = fs.existsSync(trayIconPath)
    ? nativeImage.createFromPath(trayIconPath).resize({ width: 16, height: 16 })
    : nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Aria — AI Screen Assistant');
  const menu = Menu.buildFromTemplate([
    { label: 'Show / Hide  (Alt+Space)', click: toggleWindow },
    { label: 'Quick Capture  (Alt+Q)',   click: screenshotAndAsk },
    { label: 'Chat History',             click: createHistoryWindow },
    { label: 'Settings',                 click: createSettingsWindow },
    { type: 'separator' },
    { label: 'Get Free API Key', click: () => shell.openExternal('https://aistudio.google.com/app/apikey') },
    { type: 'separator' },
    { label: 'Quit Aria', click: () => app.quit() }
  ]);
  tray.setContextMenu(menu);
  tray.on('click', toggleWindow);
}

// ── app lifecycle ─────────────────────────────────────────
app.whenReady().then(() => {
  createMainWindow();
  createTray();
  globalShortcut.register('Alt+Space', toggleWindow);
  globalShortcut.register('Alt+Q', screenshotAndAsk);

  // If launched at startup (login), stay hidden in tray — don't pop up
  const launchedAtStartup = process.argv.includes('--hidden') ||
    app.getLoginItemSettings().wasOpenedAtLogin;

  if (!launchedAtStartup) {
    // Normal launch — show window after short delay
    setTimeout(() => showWindow(), 500);
  }
  // If startup launch — just sit in tray silently, wait for Alt+Space
});

app.on('window-all-closed', (e) => e.preventDefault());
app.on('will-quit', () => globalShortcut.unregisterAll());

// ── IPC ───────────────────────────────────────────────────
ipcMain.handle('get-config',     ()       => loadConfig());
ipcMain.handle('get-startup',    ()       => app.getLoginItemSettings().openAtLogin);
ipcMain.handle('set-startup',    (_, on)  => {
  app.setLoginItemSettings({
    openAtLogin: on,
    name: 'Aria AI Assistant',
    args: on ? ['--hidden'] : []
  });
  return true;
});
ipcMain.handle('save-config',    (_, cfg) => { saveConfig(cfg); return true; });
ipcMain.handle('hide-window',    ()       => hideWindow());
ipcMain.handle('open-settings',  ()       => createSettingsWindow());
ipcMain.handle('close-settings', ()       => { if (settingsWin) settingsWin.close(); });
ipcMain.handle('open-history',   ()       => createHistoryWindow());
ipcMain.handle('close-history',  ()       => { if (historyWin) historyWin.close(); });
ipcMain.handle('load-history',   ()       => loadHistory());
ipcMain.handle('save-history',   (_, h)   => { saveHistory(h); return true; });
ipcMain.handle('clear-history',  ()       => { saveHistory([]); return true; });

ipcMain.handle('take-screenshot', async () => {
  const wasVisible = isVisible;
  try {
    mainWin.hide();
    await new Promise(r => setTimeout(r, 350));

    let dataUrl = null;

    // ── Method 1: Electron desktopCapturer (built into Electron, zero dependencies) ──
    try {
      const { desktopCapturer } = require('electron');
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width:  screen.getPrimaryDisplay().workAreaSize.width,
          height: screen.getPrimaryDisplay().workAreaSize.height
        }
      });
      if (sources && sources.length > 0) {
        const thumbnail = sources[0].thumbnail;
        const png = thumbnail.toPNG();
        if (png && png.length > 1000) {
          dataUrl = 'data:image/png;base64,' + png.toString('base64');
          console.log('Screenshot via Electron desktopCapturer ✓');
        }
      }
    } catch (e1) {
      console.warn('desktopCapturer failed:', e1.message);
    }

    // ── Method 2: PowerShell (built into every Windows 10/11, no install needed) ──
    if (!dataUrl) {
      try {
        const { execSync } = require('child_process');
        const tmpPath = path.join(app.getPath('temp'), 'aria_cap.png');
        const w = screen.getPrimaryDisplay().workAreaSize.width;
        const h = screen.getPrimaryDisplay().workAreaSize.height;

        const ps = [
          'Add-Type -AssemblyName System.Windows.Forms',
          'Add-Type -AssemblyName System.Drawing',
          `$b = New-Object System.Drawing.Bitmap(${w},${h})`,
          '$g = [System.Drawing.Graphics]::FromImage($b)',
          `$g.CopyFromScreen(0,0,0,0,[System.Drawing.Size]::new(${w},${h}))`,
          '$g.Dispose()',
          `$b.Save('${tmpPath.replace(/\\/g, '\\\\')}')`,
          '$b.Dispose()'
        ].join('; ');

        execSync(`powershell -WindowStyle Hidden -NonInteractive -Command "${ps}"`, {
          timeout: 15000, windowsHide: true
        });

        if (fs.existsSync(tmpPath)) {
          const buf = fs.readFileSync(tmpPath);
          if (buf.length > 1000) {
            dataUrl = 'data:image/png;base64,' + buf.toString('base64');
            console.log('Screenshot via PowerShell ✓');
          }
          fs.unlinkSync(tmpPath);
        }
      } catch (e2) {
        console.warn('PowerShell failed:', e2.message);
      }
    }

    // ── Method 3: screenshot-desktop (needs VC++ but try anyway as last resort) ──
    if (!dataUrl) {
      try {
        const screenshot = require('screenshot-desktop');
        const buf = await screenshot({ format: 'png' });
        if (buf && buf.length > 1000) {
          dataUrl = 'data:image/png;base64,' + buf.toString('base64');
          console.log('Screenshot via screenshot-desktop ✓');
        }
      } catch (e3) {
        console.warn('screenshot-desktop failed:', e3.message);
      }
    }

    if (wasVisible) { mainWin.show(); mainWin.focus(); }
    return dataUrl || null;

  } catch (e) {
    console.error('All screenshot methods failed:', e.message);
    try { if (wasVisible) { mainWin.show(); mainWin.focus(); } } catch (_) {}
    return null;
  }
});