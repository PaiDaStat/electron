import { BrowserWindow, ipcMain } from 'electron'

let driver;
let actionLock = Promise.resolve();

// 获取或初始化驱动
async function getDriver() {
  if (!driver) {
    console.log('[Main] Initializing driver...');
    // 使用 import 动态导入 device-sdk
    // 在 electron.vite.config.mjs 中我们配置了 alias
    // 'device-sdk' -> '../device-sdk/src/index.node.js'
    try {
      const sdk = await import('device-sdk');
      console.log('[Main] device-sdk imported successfully');
      driver = sdk.default || sdk;
    } catch (e) {
      console.error('[Main] Failed to import device-sdk:', e);
      throw e;
    }

    // 注册数据监听，转发给渲染进程
    if (driver.onReceive) {
      driver.onReceive((data) => {
        // 广播给所有窗口
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send('device:data', data);
        });
      });
    }

    // 注册设备插拔监听，转发给渲染进程
    if (driver.on) {
      driver.on('usbChange', (event) => {
        const deviceName = event.device ? (event.device.productName || event.device.name || 'Unknown Device') : 'Unknown Device';
        console.log('[Main] usbChange:', event.type, deviceName);
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send('device:usb-change', event);
        });
      });
    }


  }
  return driver;
}

// 处理设备动作
const handleDeviceAction = async (action, ...args) => {
  const execute = actionLock
    .catch(() => undefined)
    .then(async () => {
      console.log(`[Main] Handling device action: ${action}`, args);
      try {
        const drv = await getDriver();

        if (action === 'getDevices' || action === 'requestDevice') {
          // 连接前先断开旧连接
          if (drv.device) drv.close();
          const candidates = await drv[action](); // 调用 SDK 对应方法
          return {
            success: true,
            data: Array.isArray(candidates)
              ? candidates.map(d => ({
                path: d.path,
                vendorId: d.vendorId,
                productId: d.productId,
                usagePage: d.usagePage,
                usage: d.usage,
                interface: d.interface,
                product: d.product,
                manufacturer: d.manufacturer,
                serialNumber: d.serialNumber,
                // 透传 SDK 补充的字段
                name: d.name,
                deviceType: d.deviceType,
                connectionType: d.connectionType,
                deviceId: d.deviceId,
                electricity: d.electricity,
                deviceImage: '',
              }))
              : [],
          };
        } else if (action === 'close') {
          drv.close();
          return { success: true };
        } else {
          // 其他方法直接透传
          if (typeof drv[action] === 'function') {
            const result = await drv[action](...args);
            return { success: true, data: result };
          } else {
            throw new Error(`Method ${action} not found in driver`);
          }
        }
      } catch (error) {
        console.error(`[Main] Action ${action} failed:`, error);
        return { success: false, message: error.message };
      }
    });

  actionLock = execute.catch(() => undefined);
  return execute;
};

export function setupHidHandlers() {
  // 监听渲染进程的测试请求
  ipcMain.handle('test-node-hid', async () => {
    console.log('[Main] Received test-node-hid request');
    try {
      const drv = await getDriver();

      // 如果之前已经连接，先关闭，防止独占冲突
      if (drv.device) {
        console.log('[Main] Closing existing connection...');
        drv.close();
      }

      await drv.connect();
      // 随便发个数据测试，或者复用 reset
      await drv.reset();
      return { success: true, message: 'Node-HID test completed' };
    } catch (error) {
      console.error('[Main] Node-HID test failed:', error);
      if (error.message.includes('cannot open device')) {
        return { success: false, message: '设备被占用，请断开其他连接（如WebHID）' };
      }
      return { success: false, message: error.message };
    }
  });

  // 通用 IPC 接口
  ipcMain.handle('device:requestDevice', () => handleDeviceAction('requestDevice')); // 对应 SDK 的 requestDevice
  ipcMain.handle('device:getDeviceList', () => handleDeviceAction('getDevices')); // 对应 SDK 的 getDevices
  ipcMain.handle('device:close', () => handleDeviceAction('close'));
  ipcMain.handle('device:reset', () => handleDeviceAction('reset'));
  ipcMain.handle('device:setRGB', (_, ...args) => handleDeviceAction('setRGB', ...args));
  ipcMain.handle('device:remapKey', (_, ...args) => handleDeviceAction('remapKey', ...args));
  // 通用发送接口，允许渲染进程直接调用 driver._send
  ipcMain.handle('device:send', (_, ...args) => handleDeviceAction('_send', ...args));
  // 设备初始化接口
  ipcMain.handle('device:init', (_, ...args) => handleDeviceAction('init', ...args));
  ipcMain.handle('device:getFuncInformation', (_, ...args) => handleDeviceAction('getFuncInformation', ...args));
  // 获取灯光效果列表
  ipcMain.handle('device:getLightingEffectList', (_, ...args) => handleDeviceAction('getLightingEffectList', ...args));
  // 兼容旧接口
  ipcMain.handle('device:selectDeviceInit', (_, ...args) => handleDeviceAction('init', ...args));
  // 查询当前灯光信息
  ipcMain.handle('device:getLightingInfo', (_, ...args) => handleDeviceAction('getLightingInfo', ...args));
  // 设置普通灯光效果
  ipcMain.handle('device:setLightingEffect', (_, ...args) => handleDeviceAction('setLightingEffect', ...args));
  // 获取默认按键矩阵
  ipcMain.handle('device:getDefaultKeyLayout', (_, ...args) => handleDeviceAction('getDefaultKeyLayout', ...args));
  // 获取当前按键矩阵
  ipcMain.handle('device:getKeyLayout', (_, ...args) => handleDeviceAction('getKeyLayout', ...args));
  // 初始化按键自定义颜色信息
  ipcMain.handle('device:getCustomizeButtonColor', (_, ...args) => handleDeviceAction('getCustomizeButtonColor', ...args));
  // 自定义灯效设置
  ipcMain.handle('device:setCustomizeButtonColor', (_, ...args) => handleDeviceAction('setCustomizeButtonColor', ...args));
} 
