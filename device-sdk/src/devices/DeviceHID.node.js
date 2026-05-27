import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { HID, devices: getHIDDevices } = require('node-hid');

import { ConfigLoader } from '../utils/ConfigLoader.js';
import { stores } from '../utils/Stores.js';
import { filtersList } from '../utils/FiltersList.js';
import { communicateWithDevice, resetHidCoreState } from '../utils/hidCore.node.js';

import { Changekey } from './Keys.js';
import { MacroSetting } from './Macro.js'
import { FireSetting } from './Fire.js'
import { PerformanceSettings } from './Performance.js'
import { LightSettings } from './Light.js'
import { ImportAndExport } from './ImportAndExport.js'

const plugins = [Changekey, MacroSetting, FireSetting, PerformanceSettings, LightSettings, ImportAndExport];

function buildAPI(core) {
    const addons = plugins.map(p => p(core));
    return Object.assign(Object.create(null), core, ...addons);
}

export function HIDDeviceManager(config = {}) {
    const file = new ConfigLoader();
    let deviceHandle = null; // The actual HID object
    let deviceInfo = null;   // The device info object
    let deviceErrorHandler = null;
    const eventListeners = {
        usbChange: [],
        usbListener: []
    };

    // Poll for device changes (simulating usbChange)
    let lastDevicePaths = new Set();
    const pollInterval = setInterval(() => {
        try {
            const currentDevices = getHIDDevices();
            const currentPaths = new Set(currentDevices.map(d => d.path));
            
            // Check for connections
            for (const dev of currentDevices) {
                if (!lastDevicePaths.has(dev.path)) {
                     // Check if it matches our filters
                     if (isTargetDevice(dev)) {
                         emit('usbChange', { type: 'connect', device: enrichDevice(dev) });
                     }
                }
            }

            // Check for disconnections
            for (const path of lastDevicePaths) {
                if (!currentPaths.has(path)) {
                    // We don't have the full device obj here easily unless we cached it, 
                    // but we can emit a disconnect event with just path or minimal info if needed.
                    // For now, let's just emit if we can.
                    // Ideally we should cache previous devices list.
                    emit('usbChange', { type: 'disconnect', device: { path } });
                }
            }
            
            lastDevicePaths = currentPaths;
        } catch (e) {
            console.error("Polling error", e);
        }
    }, 1000); // 1 second poll

    const isTargetDevice = (dev) => {
         // Check usage page/usage if available (OS dependent) or VID/PID
         return filtersList.some(f => 
            f.vendorId === dev.vendorId && 
            f.productId === dev.productId &&
            (dev.usagePage === undefined || dev.usagePage === f.usagePage) &&
            (dev.usage === undefined || dev.usage === f.usage)
         );
    };

    const enrichDevice = (dev) => {
        const matchingFilter = filtersList.find(filter =>
            filter.vendorId === dev.vendorId &&
            filter.productId === dev.productId &&
            (dev.usagePage === undefined || dev.usagePage === filter.usagePage) &&
            (dev.usage === undefined || dev.usage === filter.usage)
        );
        if (matchingFilter) {
            dev.deviceId = matchingFilter.deviceId;
            dev.name = matchingFilter.name || dev.product;
            dev.deviceType = matchingFilter.deviceType;
            dev.connectionType = matchingFilter.connectionType; // This might be static in filter?
        }
        return dev;
    };


    //处理同步码事件
    const handleDeviceInputreport = (data) => {
        // data is Buffer
        const reportId = 0; // Node-HID usually strips it or it's in data[0] if configured. 
        // Assuming data is payload.
        // We need to match the logic in DeviceHID.js
        // const { reportId, data } = event;
        // In WebHID, reportId comes from event.
        // In NodeHID, we assume the report ID 4 was requested/sent.
        
        // Logic from DeviceHID.js:
        // const firstByte = data.getUint8(0);
        // ...
        
        const bytes = new Uint8Array(data);
        const actualSize = bytes.length;
        const firstByte = bytes[0];
        const secondByte = bytes[1];

        // Assuming reportId 3 logic from DeviceHID.js?
        // Wait, DeviceHID.js checks `reportId === 3`.
        // Does Node-HID emit data for reportId 3?
        // If the device sends report 3, Node-HID will emit it.
        // If the first byte IS the report ID (on some systems), then bytes[0] is 3.
        // If report ID is stripped, we don't know easily.
        // But usually `node-hid` without `prependSetReport` (for write) 
        // reads whatever the OS gives.
        
        // Let's assume standard behavior:
        // If data[0] is report ID, then:
        let rId = 0;
        let payload = bytes;
        
        // Heuristic: if bytes[0] is 3 or 4, treat as report ID?
        // But `bytes[0]` could be data.
        // However, `DeviceHID.js` logic: `isProfileSwitch = firstByte === 1 && secondByte === 4`.
        // If bytes includes reportID, then bytes[0] is ID, bytes[1] is firstByte.
        
        // Let's assume data IS the payload (no report ID).
        // BUT `DeviceHID.js` checks `reportId === 3`.
        // How do we know it is report 3?
        // Maybe we just check the content pattern.
        
        const isProfileSwitch = firstByte === 1 && secondByte === 4 && actualSize === 2; // && reportId === 3
        const isConnectionError = firstByte === 255 && secondByte === 255 && actualSize === 2; // && reportId === 3
        const resetCode = firstByte === 2 && secondByte === 4 && actualSize === 2; // && reportId === 3
        
        let type = '';
        let status = 'error';
        if (isProfileSwitch) {
            type = 'syncCode';
            status = 'success';
        } else if (isConnectionError) {
            type = 'errorCode';
            status = 'success';
        } else if (resetCode) {
            type = 'resetCode';
            status = 'success';
        }

        if (type) {
            emit('usbListener', { type: type, status: status });
        }
    };

    // 私有方法：触发事件
    const emit = (eventName, data) => {
        if (eventListeners[eventName]) {
            eventListeners[eventName].forEach(callback => {
                callback(data);
            });
        }
    };

    const cleanupCurrentDevice = () => {
        if (!deviceHandle) return;

        resetHidCoreState(deviceHandle);
        deviceHandle.removeListener('data', handleDeviceInputreport);

        if (deviceErrorHandler) {
            deviceHandle.removeListener('error', deviceErrorHandler);
        }

        try {
            deviceHandle.close();
        } catch { }

        deviceHandle = null;
        stores.setDevice(null);
    };

    // 统一暴露给主进程调用的入口
    return {
        // ... 原有方法保持不变
        on(eventName, callback) {
            if (eventListeners[eventName]) {
                eventListeners[eventName].push(callback);
            }
        },
        off(eventName, callback) {
            if (eventListeners[eventName]) {
                eventListeners[eventName] = eventListeners[eventName].filter(
                    cb => cb !== callback
                );
            }
        },
        async requestDevice() {
             return this.getDevices();
        },
        async getDevices() {
            try {
                const devices = getHIDDevices();
                const validDevices = devices.filter(dev => isTargetDevice(dev)).map(enrichDevice);
                return validDevices;
            } catch (error) {
                throw new Error(`getDevices 失败: ${error.message}`);
            }
        },
        // 添加别名以兼容 getDeviceList 调用
        async getDeviceList() {
            return this.getDevices();
        },
        
        // Select Device Init (Matches DeviceService call)
        async selectDeviceInit(device) {
             // device object comes from renderer.
             // It should have 'id' or 'path'.
             // We prefer 'path' for Node-HID if available, but 'id' for logic.
             // Since getDevices() returns 'path', the device obj from renderer should have it.
             
             if (!device.path && !device.deviceId) throw new Error("Invalid device object");
             
             // If we have id, we can find it again to get fresh path?
             // Or just use path if valid.
             
             // Let's use init(id) logic if possible, but we need to find the device first.
             // init(id) expects id.
             
             if (device.deviceId) {
                 return this.init(device.deviceId);
             } else {
                 // Try to match by VID/PID/Path
                 const devs = await this.getDevices();
                 const target = devs.find(d => d.path === device.path) || devs.find(d => 
                    d.vendorId === device.vendorId && 
                    d.productId === device.productId &&
                    (device.usagePage === undefined || d.usagePage === device.usagePage) &&
                    (device.usage === undefined || d.usage === device.usage)
                 );
                 if (target && target.deviceId) {
                     return this.init(target.deviceId);
                 }
                 throw new Error("Device not found or not supported");
             }
        },

        //选中连接设备open
        async init(id) {
            try {
                // 获取所有授权设备
                const devices = await this.getDevices();
                // 根据id查找对应设备
                // Note: id in filtersList is unique per model, but there could be multiple devices of same model.
                // We pick the first one for now or match by path if we had it.
                // WebHID logic picks first one too? "devices.find(dev => dev.id === id)"
                
                const targetDevice = devices.find(dev => dev.deviceId === id);

                if (!targetDevice) {
                    throw new Error('未找到指定设备');
                }
                
                // Close previous
                if (deviceHandle) {
                    cleanupCurrentDevice();
                }
                
                // Open new
                try {
                    deviceHandle = new HID(targetDevice.path);
                } catch (e) {
                     // Try to find another one if multiple?
                     throw new Error(`无法打开设备: ${e.message}`);
                }

                // Add listeners
                deviceHandle.on('data', handleDeviceInputreport);
                deviceErrorHandler = (err) => {
                    if (err.message && err.message.includes('could not read from HID device')) {
                        console.log("[SDK] Device disconnected (read error)");
                        // Close handle to prevent further errors
                        if (deviceHandle) {
                            cleanupCurrentDevice();
                        }
                        // Emit disconnect event
                        if (deviceInfo) {
                            emit('usbChange', { type: 'disconnect', device: deviceInfo });
                        }
                    } else {
                        console.error("Device error:", err);
                        emit('usbChange', { type: 'error', error: err });
                    }
                };
                deviceHandle.on('error', deviceErrorHandler);

                stores.setDevice(deviceHandle);
                
                // Update device info
                deviceInfo = targetDevice;
                deviceInfo.opened = true; // Mark as opened

                // 获取设备配置信息
                const match = file.getConfigByVidPid(targetDevice.vendorId, targetDevice.productId);
                if (!match) throw new Error('不支持该设备')

                stores.setConfigurationFile(match);

                await this.getFuncInformation();

                return deviceInfo;
            } catch (error) {
                throw new Error(`init 失败: ${error.message}`);
            }
        },
        
        // 连接新的设备（仅web环境支持? Node uses init/getDevices）
        async connectDevice() {
            // No-op or scan?
            return await this.getDevices();
        },

        // 断开连接
        async close() {
             cleanupCurrentDevice();
             return { success: true };
        },

        //恢复出厂设置
        async factoryDataReset() {
            try {
                await communicateWithDevice(0x0d)
                return { status: 'success' };
            } catch (error) {
                throw new Error(`factoryDataReset 失败: ${error.message}`);
            }
        }
    };
}

export function DeviceHID(config = {}) {
    const core = HIDDeviceManager(config);
    const api = buildAPI(core);

    function dev() { }                       // 空壳

    Object.keys(api).forEach(k => {         // 暗挂方法
        if (typeof api[k] === 'function')
            Object.defineProperty(dev, k, {
                value: api[k].bind(api),
                enumerable: false
            });
    });

    return dev;
}
