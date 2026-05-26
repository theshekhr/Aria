const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aria', {
  getConfig:       ()    => ipcRenderer.invoke('get-config'),
  saveConfig:      (cfg) => ipcRenderer.invoke('save-config', cfg),
  hideWindow:      ()    => ipcRenderer.invoke('hide-window'),
  openSettings:    ()    => ipcRenderer.invoke('open-settings'),
  closeSettings:   ()    => ipcRenderer.invoke('close-settings'),
  openHistory:     ()    => ipcRenderer.invoke('open-history'),
  closeHistory:    ()    => ipcRenderer.invoke('close-history'),
  loadHistory:     ()    => ipcRenderer.invoke('load-history'),
  saveHistory:     (h)   => ipcRenderer.invoke('save-history', h),
  clearHistory:    ()    => ipcRenderer.invoke('clear-history'),
  takeScreenshot:  ()    => ipcRenderer.invoke('take-screenshot'),
  getStartup:      ()    => ipcRenderer.invoke('get-startup'),
  setStartup:      (on)  => ipcRenderer.invoke('set-startup', on),
  onTriggerScreenshotAsk: (cb) => ipcRenderer.on('trigger-screenshot-ask', cb),
});