import { stores } from '../utils/Stores'
import { parseKeyIds, flattenArray, to7BitBinary, splitHex } from '../utils/Utils'
import { keyboardMap } from '../utils/KeyMap'
import { hidTransfer, communicateWithDevice } from '../utils/hidCore'


//性能区操作
export const PerformanceSettings = core => {

    return {
        //获取功能区
        async getFuncInformation() {
            try {
                const profileSize = stores.getProfileSize()
                const result = await hidTransfer(0x05, profileSize)
                const newData = await flattenArray(result);
                stores.setFuncInformationInfo(newData)

                return { status: 'success', data: newData };
            } catch (error) {
                throw new Error(`getFuncInformation 失败: ${error.message}`);
            }
        },
        //获取配对设备
        async getPairedDevices() {
            try {
                let device = null;
                const devices = await navigator.hid.requestDevice({
                    filters: [
                        {
                            usagePage: 0xff1c,
                            usage: 0x92,
                            productId: 8864,
                            vendorId: 12815,
                        },
                        {
                            usagePage: 0xff1c,
                            usage: 0x92,
                            productId: 8890,
                            vendorId: 12815,
                        },
                    ]
                });
                if (devices.length > 0) {
                    device = devices[0];
                }
                if (!device) {
                    throw new Error('未找到配对设备');
                }
                return { status: 'success', device: device };
            } catch (error) {
                throw new Error(`getPairedDevices 失败: ${error.message}`);
            }
        },
        //一键配对
        async oneClickPairing(device) {
            try {
                if (!device) {
                    throw new Error('未找到配对设备');
                }
                if (!device.opened) {
                    await device.open();
                }
                await communicateWithDevice(0xb2, 3, device)

                return { status: 'success', message: '配对中' };
            } catch (error) {
                throw new Error(`oneClickPairing 失败: ${error.message}`);
            }
        },
        //设置传感器旋转
        async setSensorRotation(rotation) {
            try {
                const profileNumber = stores.getProfileNumber();
                const funcInfo = stores.getFuncInformationInfo()
                const profileSize = stores.getProfileSize()
                if (rotation < -30 || rotation > 30) {
                    throw new Error('rotation 值必须在 -30 到 30 之间');
                }
                // 根据规则转换rotation值：0→0，正数保持原值，负数→255+value+1
                if (rotation < 0) {
                    rotation = 255 + rotation + 1;
                }
                // 将十进制的rotation值转换为十六进制
                rotation = rotation.toString(16);
                funcInfo[74] = rotation.padStart(2, '0');
                const result = await hidTransfer(0x06, profileSize, funcInfo, profileNumber)
                const newData = await flattenArray(result);
                stores.setFuncInformationInfo(newData)
                return { status: 'success', data: newData };
            } catch (error) {
                throw new Error(`setSensorRotation 失败: ${error.message}`);
            }
        },
        //获取传感器旋转
        async getSensorRotation() {
            try {
                const profileSize = stores.getProfileSize()
                const result = await hidTransfer(0x05, profileSize)
                const newData = await flattenArray(result);
                stores.setFuncInformationInfo(newData)

                let rotation = parseInt(newData[74], 16);

                if (rotation > 127) {
                    rotation = rotation - 256;
                }
                return { status: 'success', rotation: rotation };
            } catch (error) {
                throw new Error(`getSensorRotation 失败: ${error.message}`);
            }
        },
    }
}