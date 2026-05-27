import { ipcRenderer } from 'electron'

export const hidApi = {
  // 原有的测试方法
  testNodeHid: () => ipcRenderer.invoke('test-node-hid'),
  testNodeHidTest: () => ipcRenderer.invoke('test-node-hid-test'),

  // 新增的通用设备控制方法 (Service Layer 使用)
  requestDevice: () => ipcRenderer.invoke('device:requestDevice'),
  getDevices: () => ipcRenderer.invoke('device:getDeviceList'), // getDeviceList 对应主进程的 getDevices
  close: () => ipcRenderer.invoke('device:close'),
  reset: () => ipcRenderer.invoke('device:reset'),
  setRGB: (r, g, b) => ipcRenderer.invoke('device:setRGB', r, g, b),
  remapKey: (src, dst) => ipcRenderer.invoke('device:remapKey', src, dst),
  send: (cmd, len, data) => ipcRenderer.invoke('device:send', cmd, len, data),
  init: (id) => ipcRenderer.invoke('device:init', id),
  getFuncInformation: () => ipcRenderer.invoke('device:getFuncInformation'),
  getLightingEffectList: () => ipcRenderer.invoke('device:getLightingEffectList'),
  // 查询当前灯光信息
  getLightingInfo: () => ipcRenderer.invoke('device:getLightingInfo'),
  // 获取默认按键矩阵
  getDefaultKeyLayout: () => ipcRenderer.invoke('device:getDefaultKeyLayout'),
  // 获取默认按键矩阵
  getKeyLayout: () => ipcRenderer.invoke('device:getKeyLayout'),
  // 初始化按键自定义颜色信息
  getCustomizeButtonColor: () => ipcRenderer.invoke('device:getCustomizeButtonColor'),
  // 自定义灯效设置
  setCustomizeButtonColor: (colors) => ipcRenderer.invoke('device:setCustomizeButtonColor', colors),
  // 设置普通灯光效果
  setLightingEffect: (ledIndex, effect) => ipcRenderer.invoke('device:setLightingEffect', ledIndex, effect),
  // Deprecated
  selectDeviceInit: (device) => ipcRenderer.invoke('device:init', device.deviceId),

  // 数据监听 (单向: Main -> Renderer)
  onReceive: (callback) => {
    // 移除之前的监听器以防止重复添加（虽然通常只会调用一次，但为了保险）
    ipcRenderer.removeAllListeners('device:data');
    ipcRenderer.on('device:data', (_event, data) => callback(data));
  },

  // 设备插拔监听
  onUsbChange: (callback) => {
    // 允许监听多个 usbChange，因此不 removeAllListeners
    // 但要注意调用者需要自己管理清理，或者我们返回一个 disposer
    ipcRenderer.on('device:usb-change', (_event, data) => callback(data));
  },

  // 移除设备插拔监听 (可选)
  offUsbChange: () => {
    ipcRenderer.removeAllListeners('device:usb-change');
  }


}
