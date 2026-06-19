const { app, BrowserWindow, ipcMain, shell, clipboard, Tray, Menu, nativeImage } = require('electron')
const { exec } = require('child_process')
const path = require('path')
const os   = require('os')
const fs   = require('fs')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let mainWindow
let tray

// ─── Window ───────────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    frame: false,           // Frameless for custom HUD look
    transparent: true,
    backgroundColor: '#060912',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'))
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

// ─── System Tray ─────────────────────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png')
  const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty()

  tray = new Tray(icon)
  tray.setToolTip('JARVIS AI')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open JARVIS', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit',        click: () => app.quit() },
  ]))
  tray.on('double-click', () => mainWindow?.show())
}

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  const { session } = require('electron')
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true)
    } else {
      callback(false)
    }
  })

  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ─── Window Controls IPC ──────────────────────────────────────────────────────
ipcMain.handle('window-minimize', () => mainWindow?.minimize())
ipcMain.handle('window-maximize', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize())
ipcMain.handle('window-close',    () => mainWindow?.hide()) // Hide to tray instead of close

// ─── Clipboard IPC ────────────────────────────────────────────────────────────
ipcMain.handle('get-clipboard', () => clipboard.readText())

// ─── Tool Execution IPC ───────────────────────────────────────────────────────
ipcMain.handle('execute-tool', async (_, { tool, args = {} }) => {
  try {
    return await dispatchTool(tool, args)
  } catch (err) {
    console.error(`[JARVIS] Tool error [${tool}]:`, err.message)
    return { success: false, error: err.message }
  }
})

// ─── Tool Dispatcher ─────────────────────────────────────────────────────────
async function dispatchTool(tool, args) {
  switch (tool) {

    // ── Browser Tools ──
    case 'browser.open_youtube':
      shell.openExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(args.query || '')}`)
      return { success: true }

    case 'browser.google_search':
      shell.openExternal(`https://www.google.com/search?q=${encodeURIComponent(args.query || '')}`)
      return { success: true }

    case 'browser.open_website': {
      let url = args.url || ''
      if (!url.startsWith('http')) url = 'https://' + url
      shell.openExternal(url)
      return { success: true }
    }

    case 'browser.open_new_tab': {
      const url = args.url || 'https://www.google.com'
      shell.openExternal(url)
      return { success: true }
    }

    // ── Media Tools ──
    case 'media.play_youtube':
      shell.openExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(args.query || '')}`)
      return { success: true }

    case 'media.pause_media':
      runPS(`$obj = New-Object -ComObject WScript.Shell; $obj.SendKeys([char]179)`)
      return { success: true }

    // ── System Tools ──
    case 'system.take_screenshot':
      shell.openExternal('ms-screenclip:')
      return { success: true }

    case 'system.open_camera':
      shell.openExternal('microsoft.windows.camera:')
      return { success: true }

    case 'system.open_app': {
      const appName = (args.app_name || '').toLowerCase()
      const appMap = {
        'chrome': 'start chrome', 'google chrome': 'start chrome',
        'notepad': 'start notepad', 'calculator': 'start calc',
        'paint': 'start mspaint', 'word': 'start winword',
        'excel': 'start excel', 'powerpoint': 'start powerpnt',
        'vs code': 'start code', 'vscode': 'start code',
        'explorer': 'start explorer', 'file explorer': 'start explorer',
        'task manager': 'start taskmgr', 'settings': 'start ms-settings:',
      }
      const cmd = appMap[appName] || `start "" "${appName}"`
      runShell(cmd)
      return { success: true }
    }

    case 'system.minimize_window':
      mainWindow?.minimize()
      return { success: true }

    case 'system.maximize_window':
      mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
      return { success: true }

    case 'system.volume_up':
      runPS(`$obj = New-Object -ComObject WScript.Shell; for($i=0;$i -lt ${args.amount || 5};$i++){$obj.SendKeys([char]175)}`)
      return { success: true }

    case 'system.volume_down':
      runPS(`$obj = New-Object -ComObject WScript.Shell; for($i=0;$i -lt ${args.amount || 5};$i++){$obj.SendKeys([char]174)}`)
      return { success: true }

    case 'system.mute':
      runPS(`$obj = New-Object -ComObject WScript.Shell; $obj.SendKeys([char]173)`)
      return { success: true }

    case 'system.shutdown':
      runShell('shutdown /s /t 10')
      return { success: true }

    case 'system.restart':
      runShell('shutdown /r /t 10')
      return { success: true }

    // ── Clipboard Tools ──
    case 'clipboard.read': {
      const text = clipboard.readText()
      return { success: true, data: text }
    }

    case 'clipboard.clear':
      clipboard.clear()
      return { success: true }

    // ── File Tools ──
    case 'file.open_downloads':
      shell.openPath(path.join(os.homedir(), 'Downloads'))
      return { success: true }

    case 'file.open_documents':
      shell.openPath(path.join(os.homedir(), 'Documents'))
      return { success: true }

    case 'file.open_desktop':
      shell.openPath(path.join(os.homedir(), 'Desktop'))
      return { success: true }

    case 'file.create_folder': {
      const folderName = args.name || 'New Folder'
      const location   = args.location || path.join(os.homedir(), 'Desktop')
      const folderPath = path.join(location, folderName)
      fs.mkdirSync(folderPath, { recursive: true })
      shell.openPath(location)
      return { success: true }
    }

    // ── Notes & AI ── (handled by backend, nothing to do on desktop)
    case 'notes.create':
    case 'notes.list':
    case 'ai.answer_question':
    case 'ai.generate_email':
    case 'ai.explain_topic':
    case 'ai.summarize_text':
    case 'weather.get':
      return { success: true } // response already in backend result

    default:
      console.warn(`[JARVIS] Unknown tool: ${tool}`)
      return { success: false, error: `Unknown tool: ${tool}` }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function runShell(cmd) {
  exec(cmd, (err) => { if (err) console.error('[JARVIS] Shell error:', err.message) })
}

function runPS(script) {
  exec(`powershell -Command "${script}"`, (err) => {
    if (err) console.error('[JARVIS] PowerShell error:', err.message)
  })
}
