import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/logo.png?asset'

// ============================================================
// 1. 模块导入
// ============================================================
// 引入托盘管理模块
import { setupTray } from './pallet'
// 引入 HID 设备通信模块
import { setupHidHandlers } from './hid'
// 引入应用配置识别（Profile）模块
import { setupProfileHandlers } from './profile'

// 初始化底层服务
setupHidHandlers()      // 启动 HID 监听和通信接口
setupProfileHandlers()  // 启动前台应用识别和轮询

let mainWindow = null

// ============================================================
// 2. IPC 监听：窗口控制逻辑
// ============================================================

// 最小化窗口
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) win.minimize()
})

// 最大化/还原窗口
ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

// 关闭窗口
ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) win.close()
})

// 获取窗口当前是否处于最大化状态
ipcMain.handle('window-is-maximized', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  return win ? win.isMaximized() : false
})

// ============================================================
// 3. 核心窗口创建逻辑
// ============================================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 750,
    minWidth: 1300,
    minHeight: 750,
    show: false,
    autoHideMenuBar: true, // 自动隐藏菜单栏
    frame: false,          // 无边框窗口 (自定义标题栏)
    transparent: true,     // 透明窗口
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // 预加载脚本
      sandbox: false,          // 禁用沙盒模式
      nodeIntegration: false,  // 渲染进程禁用直接使用 Node.js
      contextIsolation: false, // 禁用上下文隔离 (演示环境)
      experimentalFeatures: false
    }
  })

  // 窗口准备好后显示
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 处理外部链接打开请求
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // ============================================================
  // 4. WebHID 与 权限处理
  // ============================================================

  // 处理渲染进程发起的 WebHID 设备请求
  mainWindow.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault()
    if (details.deviceList && details.deviceList.length > 0) {
      // 默认选择第一个找到的设备
      callback(details.deviceList[0].deviceId)
    }
  })

  // 权限检查处理器 (HID 和 媒体设备)
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (permission === 'hid' || permission === 'media') {
      return true
    }
    return false
  })

  // 设备访问权限处理器
  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === 'hid') {
      return true
    }
    return false
  })

  // 加载页面逻辑
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 监听窗口最大化/还原事件，实时通知前端 UI 更新状态
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized-state', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized-state', false)
  })

  // 初始化系统托盘图标
  setupTray(mainWindow)
}

// ============================================================
// 5. 应用生命周期与单例控制
// ============================================================

// 获取单例锁，防止启动多个应用实例
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  // 当尝试启动第二个实例时，唤醒并聚焦现有窗口
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }

      if (!mainWindow.isVisible()) {
        mainWindow.setOpacity(0)
        mainWindow.show()
        setTimeout(() => {
          if (!mainWindow.isDestroyed()) {
            mainWindow.setOpacity(1)
          }
        }, 200)
      }

      mainWindow.focus()
    }
  })

  // Electron 初始化完成
  app.whenReady().then(() => {
    // 设置 App ID (用于通知等)
    electronApp.setAppUserModelId('com.electron')

    // 默认打开窗口的快捷键监听
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    // macOS 重新激活应用时创建窗口
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

// 退出逻辑
app.on('window-all-closed', () => {
  // 非 macOS 平台在所有窗口关闭后直接退出
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
