import { execSync } from 'child_process'
import { ipcMain, BrowserWindow } from 'electron'
import process from 'process'
import { createRequire } from 'module'

// 使用 createRequire 以便在 ESM 模块中使用 CommonJS 的 require (用于加载 koffi)
const require = createRequire(import.meta.url)

/**
 * 前台窗口进程检测器 — 跨平台实现
 * 
 * 功能描述：
 * 1. 自动识别当前系统（Windows/macOS）。
 * 2. 周期性（每秒）检测当前处于最顶层的应用窗口。
 * 3. 过滤非配置列表中的进程，仅在匹配 PROCESS_MAP 时触发。
 * 4. 通过 IPC 通知渲染进程应用切换事件。
 */

// 默认的获取进程名函数（兜底方案）
let getForegroundProcessName = () => null

// ============================================================
// Windows 平台实现：使用 koffi 调用 Win32 API
// ============================================================
if (process.platform === 'win32') {
  try {
    const koffi = require('koffi')
    // 加载系统动态库
    const user32 = koffi.load('user32.dll')
    const kernel32 = koffi.load('kernel32.dll')

    // Win32 常量定义
    const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000

    // 声明 Win32 API 函数原型
    // 获取当前前台窗口句柄
    const GetForegroundWindow = user32.func('GetForegroundWindow', 'void *', [])
    // 获取窗口所属的进程 ID
    const GetWindowThreadProcessId = user32.func('GetWindowThreadProcessId', 'uint32', [
      'void *',
      koffi.out(koffi.pointer('uint32'))
    ])
    // 打开进程以获取信息
    const OpenProcess = kernel32.func('OpenProcess', 'void *', ['uint32', 'bool', 'uint32'])
    // 查询进程的完整可执行文件路径
    const QueryFullProcessImageNameW = kernel32.func('QueryFullProcessImageNameW', 'bool', [
      'void *',
      'uint32',
      'void *',
      koffi.inout(koffi.pointer('uint32'))
    ])
    // 关闭进程句柄
    const CloseHandle = kernel32.func('CloseHandle', 'bool', ['void *'])

    /**
     * Windows 下获取前台进程名的具体实现
     */
    getForegroundProcessName = () => {
      // 1. 获取前台窗口句柄 (HWND)
      const hwnd = GetForegroundWindow()
      if (!hwnd) return null

      // 2. 获取进程 PID
      const pidBuf = [0]
      GetWindowThreadProcessId(hwnd, pidBuf)
      const pid = pidBuf[0]
      if (!pid) return null

      // 3. 打开进程句柄 (Handle)
      const hProcess = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid)
      if (!hProcess) return null

      try {
        // 4. 获取进程完整路径
        const exeNameBuf = Buffer.alloc(260 * 2) // MAX_PATH * sizeof(WCHAR)
        const sizeBuf = [260]

        const success = QueryFullProcessImageNameW(hProcess, 0, exeNameBuf, sizeBuf)
        if (!success) return null

        const actualLength = sizeBuf[0]
        const exePath = exeNameBuf.toString('utf16le', 0, actualLength * 2)
        // 5. 从路径中提取 exe 文件名
        const exeName = exePath.split('\\').pop()
        return exeName || null
      } finally {
        // 释放句柄资源
        CloseHandle(hProcess)
      }
    }
  } catch (err) {
    console.error('[Profile] 初始化 Windows API 检测失败:', err)
  }
} 
// ============================================================
// macOS 平台实现：使用 AppleScript
// ============================================================
else if (process.platform === 'darwin') {
  /**
   * macOS 下通过执行 osascript 获取前台进程名
   */
  getForegroundProcessName = () => {
    try {
      // 执行 AppleScript 查询当前处于前台的应用进程名称
      const script =
        'tell application "System Events" to name of first application process whose frontmost is true'
      const result = execSync(`osascript -e '${script}'`, {
        encoding: 'utf8',
        timeout: 3000,
        stdio: ['pipe', 'pipe', 'pipe'] // 静默执行，不输出错误到控制台
      })
      return result.trim() || null
    } catch (err) {
      return null
    }
  }
}

/**
 * 进程名映射表 (白名单模式)
 * 
 * 只有在此列表中定义的进程才会被检测并触发后续逻辑。
 * key: 进程名 (Windows 为 exe 名，macOS 为应用名)
 * value: 对应的显示信息或标识
 */
const PROCESS_MAP = {
  // Windows 平台
  'WeChat.exe': 'is wechat',
  'Weixin.exe': 'is Weixin',
  'msedge.exe': 'is edge',
  // macOS 平台
  WeChat: 'is wechat',
  'Microsoft Edge': 'is edge'
}

// 内部状态维护
let lastProcessName = null // 记录上次检测到的进程名，用于去重
let intervalId = null     // 轮询定时器 ID

/**
 * 核心检测逻辑：执行轮询并比对
 */
function checkForegroundWindow() {
  const processName = getForegroundProcessName()

  // 1. 仅在进程发生切换时处理
  if (processName && processName !== lastProcessName) {
    const message = PROCESS_MAP[processName]

    // 2. 关键：仅匹配 PROCESS_MAP 中定义的白名单进程
    if (message) {
      console.log(`[Profile] 匹配成功: ${processName} -> ${message}`)

      // 3. 广播给所有渲染进程窗口
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('profile:app-changed', {
            processName,
            message
          })
        }
      })
    }
  }

  // 更新最后一次检测到的进程名
  lastProcessName = processName
}

/**
 * 初始化应用配置识别模块的 IPC 监听和轮询
 */
export function setupProfileHandlers() {
  console.log('[Profile] 正在初始化 Profile 处理器...')

  /**
   * 响应渲染进程的手动查询请求
   */
  ipcMain.handle('profile:getForegroundApp', () => {
    const processName = getForegroundProcessName()
    return {
      processName,
      message: PROCESS_MAP[processName] || null
    }
  })

  /**
   * 启动定时轮询检测 (1000ms 间隔)
   */
  if (!intervalId) {
    intervalId = setInterval(checkForegroundWindow, 1000)
    // 立即执行一次，避免等待首秒
    checkForegroundWindow()
  }
}

/**
 * 停止轮询检测逻辑
 */
export function stopProfilePolling() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
