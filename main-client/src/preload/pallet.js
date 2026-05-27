import { ipcRenderer } from 'electron'

export const windowApi = {
    // 最小化窗口
    minimize: () => ipcRenderer.send('window-minimize'),
    // 最大化/还原窗口
    maximize: () => ipcRenderer.send('window-maximize'),
    // 关闭窗口
    close: () => ipcRenderer.send('window-close'),
    // 获取应用配置
    getAppConfig: () => ipcRenderer.invoke('get-app-config'),
    // 设置开机自启
    setAutoStart: (enable) => ipcRenderer.invoke('set-auto-start', enable),
    // 设置最小化到托盘
    setMinimizeToTray: (enable) => ipcRenderer.invoke('set-minimize-to-tray', enable),
    // 监听窗口最大化状态变化
    onMaximizeChange: (callback) => ipcRenderer.on('window-maximized-state', (event, value) => callback(value)),
    // 获取窗口是否最大化
    isMaximized: () => ipcRenderer.invoke('window-is-maximized')
}
