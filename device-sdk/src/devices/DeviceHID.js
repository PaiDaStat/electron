import { ConfigLoader } from '../utils/ConfigLoader';
import { stores } from '../utils/Stores';
import { filtersList } from '../utils/FiltersList.js';
import { communicateWithDevice } from '../utils/hidCore.js';

export function HIDDeviceManager(config = {}) {
    const file = new ConfigLoader();
    let device = null;
    const eventListeners = {
        usbChange: [],
        usbListener: []
    };

    // 处理设备连接事件
    const handleDeviceConnect = async (event) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (event.device.collections.some(collection =>
            collection.usagePage === 0xff1c &&
            collection.usage === 0x92
        )) {
            emit('usbChange', { type: 'connect', device: event.device });
        }
    };

    // 处理设备断开连接事件
    const handleDeviceDisconnect = async (event) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        // 检查设备是否匹配指定的 usagePage 和 usage
        if (event.device.collections.some(collection =>
            collection.usagePage === 0xff1c &&
            collection.usage === 0x92
        )) {
            if (device && device.serialNumber === event.device.serialNumber) {
                device = null;
            }
            emit('usbChange', { type: 'disconnect', device: event.device });
        }
    };

    //处理同步码事件
    const handleDeviceInputreport = async (event) => {
        const { reportId, data } = event;
        const actualSize = data.byteLength;
        // 提取常用数据
        const firstByte = data.getUint8(0);
        const secondByte = data.getUint8(1);
        // console.log("监听用户是否切换 profile:", reportId, data, firstByte, secondByte);
        const isProfileSwitch = firstByte === 1 && secondByte === 4 && actualSize === 2 && reportId === 3;
        const isConnectionError = firstByte === 255 && secondByte === 255 && actualSize === 2 && reportId === 3;
        const resetCode = firstByte === 2 && secondByte === 4 && actualSize === 2 && reportId === 3;
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
        // console.log(type, status);

        // 确保 type 有值才 emit
        if (type !== undefined) {
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

    // 动态绑定/解绑 inputreport 监听器
    const attachInputReportListener = (dev) => {
        if (dev) {
            dev.addEventListener('inputreport', handleDeviceInputreport);
        }
    };
    const detachInputReportListener = (dev) => {
        if (dev) {
            dev.removeEventListener('inputreport', handleDeviceInputreport);
        }
    };

    // 监听系统事件
    navigator.hid.addEventListener('connect', handleDeviceConnect);
    navigator.hid.addEventListener('disconnect', handleDeviceDisconnect);


    // 返回公开的API
    return {
        //添加事件监听器
        on(eventName, callback) {
            if (eventListeners[eventName]) {
                eventListeners[eventName].push(callback);
            }
        },
        //移除事件监听器
        off(eventName, callback) {
            if (eventListeners[eventName]) {
                eventListeners[eventName] = eventListeners[eventName].filter(
                    cb => cb !== callback
                );
            }
        },
        //选择连接设备
        async requestDevice() {
            try {
                const devices = await navigator.hid.requestDevice({
                    filters: [
                        {
                            usagePage: 0xff1c,
                            usage: 0x92
                        }
                    ]
                });
                if (devices.length > 0) {
                    device = devices[0];
                }
                if (!device.opened) {
                    await device.open();
                }
                // 从filtersList中获取匹配的设备id
                const matchingFilter = filtersList.find(filter =>
                    filter.vendorId === device.vendorId &&
                    filter.productId === device.productId
                );
                device.deviceId = matchingFilter.deviceId;
                device.name = matchingFilter.name || device.productName;
                device.deviceType = matchingFilter.deviceType;
                device.connectionType = matchingFilter.connectionType;
                return device;
            } catch (error) {
                throw new Error(`requestDevice 失败: ${error.message}`);
            }
        },
        //获取授权设备
        async getDevices() {
            try {
                const devices = await navigator.hid.getDevices();
                const validDevices = devices.filter(device => {
                    const matchingFilter = filtersList.find(filter => {
                        // 首先匹配设备ID
                        const isDeviceMatch = device.productId === filter.productId &&
                            device.vendorId === filter.vendorId;
                        // 如果设备ID匹配，则检查collections
                        if (isDeviceMatch) {
                            return device.collections.some(collection =>
                                collection.usagePage === filter.usagePage &&
                                collection.usage === filter.usage
                            );
                        }
                        return false;
                    });

                    if (matchingFilter) {

                        device.deviceId = matchingFilter.deviceId;
                        device.name = matchingFilter.name || device.productName;
                        device.deviceType = matchingFilter.deviceType;
                        device.connectionType = matchingFilter.connectionType;
                        return true;
                    }
                    return false;
                });
                return validDevices;
            } catch (error) {
                throw new Error(`getDevices 失败: ${error.message}`);
            }
        },
        //选中连接设备open
        async init(id) {
            try {
                // 获取所有授权设备
                const devices = await this.getDevices();
                // 根据id查找对应设备
                const targetDevice = devices.find(dev => dev.deviceId === id);

                if (!targetDevice) {
                    throw new Error('未找到指定设备');
                }
                if (!targetDevice.opened) {
                    await targetDevice.open();
                }

                // 先解绑旧设备监听
                detachInputReportListener(device);
                device = targetDevice;
                attachInputReportListener(device);

                stores.setDevice(device);
                // 获取设备配置信息
                const match = file.getConfigByVidPid(device.vendorId, device.productId);
                if (!match) throw new Error('不支持该设备');

                stores.setConfigurationFile(match);
                console.log(stores.getDevice(),match,'配置文件');
                

                // 从filtersList中获取匹配的设备id
                const matchingFilter = filtersList.find(filter =>
                    filter.vendorId === device.vendorId &&
                    filter.productId === device.productId
                );
                device.deviceId = matchingFilter.deviceId;
                device.name = matchingFilter.name || device.productName;
                device.deviceType = matchingFilter.deviceType;
                device.connectionType = matchingFilter.connectionType;
                
                await this.getFuncInformation();

                return device;
            } catch (error) {
                throw new Error(`init 失败: ${error.message}`);
            }
        },
        //恢复出厂设置
        async factoryDataReset() {
            try {
                await communicateWithDevice(0x0d);
                return { status: 'success' };
            } catch (error) {
                throw new Error(`factoryDataReset 失败: ${error.message}`);
            }
        }
    };
}
