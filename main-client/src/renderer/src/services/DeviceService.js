import driver from "device-sdk";
import isElectron from "../utils/event";

console.log(
  `[DeviceService] 环境: ${isElectron ? "Electron 渲染进程" : "Web 浏览器"}`, driver
);

export const DeviceService = {
  // 初始化设备
  async initDevice(deviceId) {
    console.log('[DeviceService] 初始化设备:', deviceId);
    if (isElectron) {
      // Electron 环境：调用主进程的 init
      const res = await window.api.init(deviceId);
      if (!res.success) throw new Error(res.message);
      return res.data;
    } else {
      // Web 环境：直接调用 SDK 实例的方法
      return await driver.init(deviceId);
    }
  },

  // 获取当前环境标识
  getEnvironment() {
    return isElectron ? "Electron 渲染进程" : "Web 浏览器";
  },

  // 监听数据接收
  onReceive(callback) {
    if (isElectron) {
      // Electron 环境：监听主进程发来的数据
      if (window.api.onReceive) {
        window.api.onReceive(callback);
      } else {
        console.error("[DeviceService] window.api.onReceive 未定义");
      }
    } else {
      // Web 环境：直接监听 SDK
      if (driver.onReceive) {
        driver.onReceive(callback);
      }
    }
  },

  // 监听设备插拔事件 (usbChange)
  on(event, callback) {
    if (event !== 'usbChange') return;

    if (isElectron) {
      if (window.api.onUsbChange) {
        window.api.onUsbChange(callback);
      }
    } else {
      // Web: 直接监听 SDK
      if (driver.on) {
        driver.on('usbChange', callback);
      }
    }
  },

  // 移除监听
  off(event, callback) {
    if (event !== 'usbChange') return;

    if (isElectron) {
      if (window.api.offUsbChange) {
        window.api.offUsbChange();
      }
    } else {
      if (driver.off) {
        driver.off('usbChange', callback);
      }
    }
  },

  // 获取当前已连接切支持的设备列表
  async getDeviceList() {
    if (isElectron) {
      const result = await window.api.getDevices();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } else {
      return await driver.getDevices();
    }
  },

  // 连接新的设备 (Web: 弹窗, Electron: 扫描)
  async requestDevice() {
    if (isElectron) {
      const result = await window.api.requestDevice();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } else {
      return await driver.requestDevice();
    }
  },

  // 获取功能
  async getFuncInformation() {
    if (isElectron) {
      console.log("[DeviceService] 正在调用主进程获取功能...");
      const result = await window.api.getFuncInformation();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } else {
      console.log("[DeviceService] 正在调用 WebHID 获取功能...");
      return await driver.getFuncInformation();
    }
  },
  // 获取灯光效果列表
  async getLightingEffectList() {
    if (isElectron) {
      console.log("[DeviceService] 正在调用主进程获取灯光效果列表...");
      const result = await window.api.getLightingEffectList();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } else {
      console.log("[DeviceService] 正在调用 WebHID 获取灯光效果列表...");
      return await driver.getLightingEffectList();
    }
  },
  // 查询当前灯光信息
  async getLightingInfo() {
    if (isElectron) {
      console.log("[DeviceService] 正在调用主进程查询当前灯光信息...");
      const result = await window.api.getLightingInfo();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } else {
      console.log("[DeviceService] 正在调用 WebHID 查询当前灯光信息...");
      return await driver.getLightingInfo();
    }
  },

  // 设置普通灯光效果
  async setLightingEffect(ledIndex, effect) {
    if (isElectron) {
      console.log("[DeviceService] 正在调用主进程设置普通灯光效果...");
      const result = await window.api.setLightingEffect(ledIndex, effect);
      if (!result.success) throw new Error(result.message);
      return result.data;
    } else {
      console.log("[DeviceService] 正在调用 WebHID 设置普通灯光效果...");
      return await driver.setLightingEffect(ledIndex, effect);
    }
  },

  // 获取默认按键矩阵
  async getDefaultKeyLayout() {
    if (isElectron) {
      console.log("[DeviceService] 正在调用主进程获取默认按键矩阵...");
      const result = await window.api.getDefaultKeyLayout();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } else {
      console.log("[DeviceService] 正在调用 WebHID 获取默认按键矩阵...");
      return await driver.getDefaultKeyLayout();
    }
  },
  // 获取当前按键矩阵
  async getKeyLayout() {
    if (isElectron) {
      console.log("[DeviceService] 正在调用主进程获取当前按键矩阵...");
      const result = await window.api.getKeyLayout();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } else {
      console.log("[DeviceService] 正在调用 WebHID 获取当前按键矩阵...");
      return await driver.getKeyLayout();
    }
  },
  // 初始化按键自定义颜色信息
  async getCustomizeButtonColor() {
    if (isElectron) {
      console.log("[DeviceService] 正在调用主进程获取按键自定义颜色信息...");
      const result = await window.api.getCustomizeButtonColor();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } else {
      console.log("[DeviceService] 正在调用 WebHID 获取按键自定义颜色信息...");
      return await driver.getCustomizeButtonColor();
    }
  },
  // 自定义灯效设置
  async setCustomizeButtonColor(colorArray) {
    if (isElectron) {
      console.log("[DeviceService] 正在调用主进程修改按键自定义颜色信息...");
      const result = await window.api.setCustomizeButtonColor(colorArray);
      if (!result.success) throw new Error(result.message);
      return result.data;
    } else {
      console.log("[DeviceService] 正在调用 WebHID 修改按键自定义颜色信息...");
      return await driver.setCustomizeButtonColor(colorArray);
    }
  },

  // 断开连接
  async close() {
    if (isElectron) {
      console.log("[DeviceService] 正在调用主进程关闭设备...");
      return await window.api.close();
    } else {
      console.log("[DeviceService] 正在调用 WebHID 关闭设备...");
      return driver.close();
    }
  },
};
