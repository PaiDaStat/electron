import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { hidApi } from './hid'
import { windowApi } from './pallet'
import { profileApi } from './profile'

// Custom APIs for renderer
  const api = {
    ...hidApi,
    ...windowApi,
    ...profileApi,
    getDeviceList: hidApi.getDeviceList, // 显式暴露
    disconnectDevice: hidApi.close, // 重命名设备断开方法，避免与窗口关闭冲突
    reset: hidApi.reset,
    setRGB: hidApi.setRGB,
    remapKey: hidApi.remapKey,
    onReceive: hidApi.onReceive,
    onUsbChange: hidApi.onUsbChange,
    offUsbChange: hidApi.offUsbChange,

  }

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
