import { Tray, Menu, BrowserWindow, screen, ipcMain, app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'

let tray = null
let trayWindow = null
let isQuitting = false
let lastTrayBounds = null // 记录最后一次托盘点击的位置

/**
 * 获取配置文件路径
 */
function getConfigPath() {
  return join(app.getPath('userData'), 'app-config.json')
}

/**
 * 获取配置
 */
function getConfig() {
  try {
    const configPath = getConfigPath()
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to load config', e)
  }
  return { minimizeToTray: false }
}

/**
 * 保存配置
 */
function saveConfig(config) {
  try {
    const configPath = getConfigPath()
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  } catch (e) {
    console.error('Failed to save config', e)
  }
}

/**
 * 初始化托盘
 * @param {BrowserWindow} mainWindow 主窗口实例
 */
export function setupTray(mainWindow) {
  // 1. 创建托盘图标
  createTrayIcon(mainWindow)

  // 2. 创建托盘弹窗（自定义UI）
  createTrayWindow()

  // 3. 监听IPC事件
  setupIpcHandlers(mainWindow)

  // 4. 设置窗口关闭事件监听（用于处理最小化到托盘）
  setupWindowEvents(mainWindow)
}

/**
 * 设置窗口事件
 */
function setupWindowEvents(mainWindow) {
  mainWindow.on('close', (event) => {
    const config = getConfig()
    if (config.minimizeToTray && !isQuitting) {
      event.preventDefault()
      mainWindow.hide()
      return false
    }
  })
}

/**
 * 创建系统托盘图标及事件
 */
function createTrayIcon(mainWindow) {
  tray = new Tray(icon)
  
  // 设置托盘提示文字
  tray.setToolTip('设备驱动管理程序')

  // 监听托盘点击事件
  // 左键点击：显示主窗口
  tray.on('click', () => {
    showMainWindow(mainWindow)
  })

  // 右键点击：显示托盘菜单窗口
  tray.on('right-click', (event, bounds) => {
    toggleTrayWindow(bounds)
  })
}

/**
 * 创建自定义托盘窗口
 */
function createTrayWindow() {
  trayWindow = new BrowserWindow({
    width: 280, // 增加宽度以适应新设计
    height: 120, // 减小高度，使其更紧凑
    show: false,
    frame: false, // 无边框
    fullscreenable: false,
    resizable: false,
    transparent: true, // 透明背景（配合前端圆角）
    skipTaskbar: true, // 不在任务栏显示
    alwaysOnTop: true, // 总是置顶
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: false // 与主窗口保持一致
    }
  })

  // 加载页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    trayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/tray`)
  } else {
    trayWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'tray' })
  }

  // 失去焦点时隐藏窗口
  trayWindow.on('blur', () => {
    if (!trayWindow.webContents.isDevToolsOpened()) {
      trayWindow.hide()
    }
  })

  // 窗口显示时，通知前端重新计算高度
  trayWindow.on('show', () => {
    trayWindow.webContents.send('tray-window-shown')
  })

  // 渲染进程准备好时（可能）
  trayWindow.webContents.on('did-finish-load', () => {
    trayWindow.webContents.send('tray-window-shown')
  })
}

/**
 * 切换托盘窗口显示状态
 */
function toggleTrayWindow(bounds) {
  if (bounds) {
    lastTrayBounds = bounds
  }

  if (trayWindow.isVisible()) {
    trayWindow.hide()
  } else {
    // 1. 先设置透明度为0，避免显示瞬间的闪烁
    trayWindow.setOpacity(0)
    
    // 2. 预先设置位置（使用当前已知的大小）
    const position = getTrayWindowPosition(bounds)
    trayWindow.setPosition(position.x, position.y, false)
    
    // 3. 显示窗口（此时透明）
    trayWindow.show()
    
    // 4. 通知前端更新高度（前端更新后会触发 resize 事件）
    trayWindow.webContents.send('tray-window-shown')
    
    // 5. 短暂延迟后恢复不透明（给前端一点时间计算和重绘）
    // 或者等待 resize 事件回调后再显示（但这可能导致延迟感）
    // 这里采用一个折中的方案：稍微延迟一点点，通常足够前端响应
    setTimeout(() => {
      if (trayWindow && !trayWindow.isDestroyed() && trayWindow.isVisible()) {
        trayWindow.setOpacity(1)
        trayWindow.focus()
      }
    }, 50)
  }
}

/**
 * 计算托盘窗口位置
 * @param {Electron.Rectangle} bounds 托盘图标位置
 * @param {Object} windowSize 窗口大小 (可选，默认获取当前窗口大小)
 */
function getTrayWindowPosition(bounds, windowSize = null) {
  const windowBounds = windowSize || trayWindow.getBounds()
  const screenBounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds

  // 默认位置：托盘图标正上方（Windows通常在底部）或正下方（Mac/Linux通常在顶部）
  // 这里简化处理，根据鼠标位置判断
  let x, y
  
  // 如果bounds传进来了（Windows点击时有），使用bounds
  // 否则使用鼠标位置
  const cursorPoint = screen.getCursorScreenPoint()
  const targetBounds = bounds || { x: cursorPoint.x, y: cursorPoint.y, width: 0, height: 0 }

  // 水平居中对齐
  x = Math.round(targetBounds.x + (targetBounds.width / 2) - (windowBounds.width / 2))

  // 垂直位置判断
  // 如果任务栏在底部（通常y坐标较大），窗口显示在上方
  if (targetBounds.y > screenBounds.height / 2) {
    y = Math.round(targetBounds.y - windowBounds.height - 10)
  } else {
    // 任务栏在顶部，窗口显示在下方
    y = Math.round(targetBounds.y + targetBounds.height + 10)
  }

  return { x, y }
}

/**
 * 显示主窗口
 */
function showMainWindow(mainWindow) {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    
    if (!mainWindow.isVisible()) {
      // 延迟显示，避免闪烁
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
}

/**
 * 设置IPC监听
 */
function setupIpcHandlers(mainWindow) {
  ipcMain.on('tray-window-open', () => {
    showMainWindow(mainWindow)
    trayWindow.hide()
  })

  ipcMain.on('tray-window-quit', () => {
    isQuitting = true
    app.quit()
  })

  // 调整托盘窗口大小
  ipcMain.on('tray-window-resize', (event, { width, height }) => {
    if (trayWindow && !trayWindow.isDestroyed()) {
      const newWidth = Math.round(width)
      const newHeight = Math.round(height)

      // 使用 setContentSize 更精确地设置内容区域大小
      try {
        trayWindow.setContentSize(newWidth, newHeight)
      } catch (e) {
        // 忽略可能的错误
      }
      
      // 重新计算位置以保持相对位置正确
      if (lastTrayBounds) {
        const position = getTrayWindowPosition(lastTrayBounds, { width: newWidth, height: newHeight })
        
        if (trayWindow.isVisible()) {
          trayWindow.setPosition(position.x, position.y, false)
          
          // 调整完大小和位置后，恢复不透明度（如果之前被设置成了0）
          if (trayWindow.getOpacity() < 1) {
             // 略微延迟以等待渲染
             setTimeout(() => {
               if (trayWindow && !trayWindow.isDestroyed()) trayWindow.setOpacity(1)
             }, 10)
          }
        } else {
          // 如果窗口不可见但有位置记录，也更新位置
          trayWindow.setPosition(position.x, position.y, false)
        }
      }
    }
  })

  // 获取应用配置
  ipcMain.handle('get-app-config', () => {
    const config = getConfig()
    return {
      autoStart: app.getLoginItemSettings().openAtLogin,
      minimizeToTray: config.minimizeToTray || false
    }
  })

  // 设置开机自启
  ipcMain.handle('set-auto-start', (event, enable) => {
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: process.execPath
    })
    return app.getLoginItemSettings().openAtLogin
  })

  // 设置最小化到托盘
  ipcMain.handle('set-minimize-to-tray', (event, enable) => {
    const config = getConfig()
    config.minimizeToTray = enable
    saveConfig(config)
    return config.minimizeToTray
  })
}
