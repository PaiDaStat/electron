import { defineStore } from "pinia";
import { DeviceService } from '../services/DeviceService';
import { filtersList } from '../utils/webhid.js';

//创建默认的store
export const useStore = defineStore("useStore", {
    state: () => ({
        isDemoMode: false,// 当前驱动是否是演示模式
        bgSettings: {
            bgBrightness: 1,//背景亮度
            bgFuzziness: 0,//背景模糊度
            bgOpacity: 1,//背景透明度
            bgRadius: 10,//背景圆角
            bgArea: 10,//功能块背景区域
            bgImages: {
                id: 0,
                bgImageUrl: '',//背景图片
            },
            customFontColor: {
                light: '#000000',//自定义字体颜色-亮色
                dark: '#FFFFFF',//自定义字体颜色-暗色
            },//自定义字体颜色
        },
        deviceStatus: 1,//设备状态 1未连接 2连接中 3设置中 4换皮肤
        currentDeviceId: null,//当前连接的设备ID
        deviceType: 1,// 设备类型 1 键盘 2 鼠标
        previousDeviceStatus: 1,//上一个设备状态
        operationLoading: false, //操作加载中
        allDeviceList: [],// 所有设备列表
        deviceHID: null,// 当前连接的设备实例
        deviceConfig: null,// 当前连接的设备配置
    }),
    actions: {
        // 获取设备列表
        async getDeviceList() {
            // 获取设备列表
            const deviceList = await DeviceService.getDeviceList() || [];

            // 增强设备信息
            if (deviceList.length > 0) {
                deviceList.forEach(device => {
                    const matched = filtersList.find(item =>
                        item.vendorId === device.vendorId &&
                        item.productId === device.productId
                    );
                    if (matched) {
                        device.deviceImage = matched.deviceImage;
                    }
                });
            }

            // 稍微延迟以平滑 UI 变化
            if (deviceList.length > 0) {
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            // 更新真实设备列表
            this.allDeviceList = deviceList;
            console.log('当前已连接且支持的设备列表:', deviceList);
            return deviceList;
        }
    },
});
