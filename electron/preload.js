const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Execute any JARVIS tool by name with args.
   * Returns the result from the main process handler.
   */
  executeTool: (tool, args) => ipcRenderer.invoke('execute-tool', { tool, args }),

  /** Get current clipboard text */
  getClipboard: () => ipcRenderer.invoke('get-clipboard'),

  /** Listen for async results pushed from main */
  onToolResult: (callback) => ipcRenderer.on('tool-result', (_, data) => callback(data)),

  /** App window controls */
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow:    () => ipcRenderer.invoke('window-close'),
})
