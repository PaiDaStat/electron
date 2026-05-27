import { ipcRenderer } from 'electron'

export const profileApi = {
  getForegroundApp: () => ipcRenderer.invoke('profile:getForegroundApp'),
  onAppChanged: (callback) => {
    const listener = (_event, data) => callback(data)
    ipcRenderer.on('profile:app-changed', listener)
    return () => ipcRenderer.removeListener('profile:app-changed', listener)
  }
}
