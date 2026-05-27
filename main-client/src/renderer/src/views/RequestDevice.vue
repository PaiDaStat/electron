<script setup>
import { ref, onMounted, toRefs, computed, onUnmounted } from "vue";
import isElectron from '../utils/event';
import { useStore } from '../stores/index.js'
const defineStore = useStore()
const { deviceStatus, operationLoading, deviceConfig, deviceHID, deviceType, allDeviceList, isDemoMode, currentDeviceId } = toRefs(defineStore)
import { useKeyBoardStore } from '../stores/useKeyBoardStore.js'
const keyBoardStore = useKeyBoardStore()
const { defaultKeyMatrixInformation, basicDeviceInfo, keyColorInformation } = toRefs(keyBoardStore)

// 使用新的 Service Layer，不再直接引用 device-sdk
import { DeviceService } from '../services/DeviceService';
// 演示模式数据
import { getMockDeviceList } from '../utils/demonstrationData.js'
import { loadConfig } from '../utils/useDeviceConfig'

import keyboardImage from '../assets/deviceImg/GK8.webp'
import keyboardImage2 from '../assets/deviceImg/a7pro.png'
import keyboardImage1 from '../assets/deviceImg/00.webp'
import wiredIcon from '../assets/icons/wired-icon.svg'
import wifiIcon from '../assets/icons/2.4G-icon.svg'
import chargeIcon from '../assets/icons/charge-icon.svg'

// 环境变量
const environment = ref(null);
const isMaximized = ref(true);

// 最终展示的设备列表（计算属性：自动处理演示模式）
const finalDeviceList = computed(() => {
    if (isDemoMode.value) {
        console.log('演示模式下，使用模拟数据');
        return getMockDeviceList();
    }
    return allDeviceList.value;
});

// 计算缩放比例
const listScale = computed(() => {
    // 如果不是 Electron 环境，或者是最大化状态，不缩放
    if (!isElectron || isMaximized.value) {
        return 1.0;
    }

    const count = finalDeviceList.value.length;
    if (count <= 3) {
        return 1.0;
    } else if (count === 4) {
        return 0.8;
    } else {
        // 5个及以上
        return 0.7;
    }
});


const connectDevice = async () => {
    try {
        const info = await DeviceService.requestDevice()
        // deviceStatus.value = 2
        console.log('已连接:', info)
        await defineStore.getDeviceList();
    } catch (e) {
        console.log('连接失败:', e)
    }
}

// 请求设备
const requestDevice = async (device) => {
    try {
        operationLoading.value = true
        // 调用 SDK 初始化 (加载配置、发送初始化命令)
        // 统一使用 deviceId 进行初始化，兼容 Web 和 Node 环境
        const id = device.deviceId;
        if (!id) {
            throw new Error('设备ID不存在');
        }

        if (!isDemoMode.value) {
            // 初始化
            await DeviceService.initDevice(id);
            // 获取默认按键矩阵
            const defaultKeyLayout = await DeviceService.getDefaultKeyLayout()
            defaultKeyMatrixInformation.value = defaultKeyLayout.data
            console.log(defaultKeyMatrixInformation.value, '获取默认按键矩阵');
            // 获取当前按键矩阵
            const keyLayout = await DeviceService.getKeyLayout()
            basicDeviceInfo.value = keyLayout.data
            console.log(basicDeviceInfo.value, '获取当前按键矩阵');
            // 初始化按键自定义颜色信息
            const customizedLighting = await DeviceService.getCustomizeButtonColor()
            keyColorInformation.value = customizedLighting.data
            console.log(customizedLighting, '初始化按键自定义颜色信息');
        }
        const config = await loadConfig(device.vendorId, device.productId);

        if (!config) throw new Error('未找到设备配置');

        console.log(config, '是否拿到配置文件');
        deviceConfig.value = config
        // 保存设备实例
        deviceHID.value = device

        currentDeviceId.value = id;
        // 操作加载中
        operationLoading.value = false
        deviceType.value = device.deviceType
        deviceStatus.value = 2
    } catch (e) {
        console.error('设备初始化失败:', e);
        // 这里可以添加错误提示，比如 ElMessage.error('设备初始化失败')
    } finally {
        operationLoading.value = false
    }
}


onMounted(async () => {
    // 获取环境
    environment.value = DeviceService.getEnvironment();

    // 监听窗口最大化状态
    if (isElectron && window.api) {
        // 初始化状态
        isMaximized.value = await window.api.isMaximized();
        // 监听变化
        window.api.onMaximizeChange((val) => {
            isMaximized.value = val;
        });
    }

    // 注册数据接收回调
    DeviceService.onReceive((data) => {
        console.log(
            `收到数据: ${Array.from(data)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join(" ")}`
        );
    });

    // 初始化时获取设备列表
    await defineStore.getDeviceList();
});

</script>

<template>
    <div class="request-device">
        <div v-if="finalDeviceList.length > 0">
            <div class="request-device-btn" v-if="!isElectron" @click="connectDevice">添加新设备</div>
            <div class="request-device-list" :style="{ transform: `scale(${listScale})` }">
                <div v-for="(item, index) in finalDeviceList" :key="index" @click="requestDevice(item)">
                    <div>{{ item.name }}</div>
                    <div><img :src="item.deviceImage" alt=""></div>
                    <!-- <div>个性化</div> -->
                    <div v-if="item.electricity >= 0" class="connect-content-item">
                        <div class="wireless">
                            <div class="icon-mask"
                                :style="{ maskImage: `url(${item.connectionType === 1 ? wiredIcon : wifiIcon})`, WebkitMaskImage: `url(${item.connectionType === 1 ? wiredIcon : wifiIcon})` }">
                            </div>
                        </div>
                        <div>
                            <div class="charge" v-if="item.connectionType === 1">
                                <div>
                                    <div class="icon-mask"
                                        :style="{ maskImage: `url(${chargeIcon})`, WebkitMaskImage: `url(${chargeIcon})` }">
                                    </div>
                                </div>
                                <div>充电中</div>
                            </div>
                            <div class="battery" v-else>
                                <div>
                                    <div class="battery-power">
                                        <div class="battery-level" :class="{ 'low-battery': item.electricity < 20 }"
                                            :style="{ width: `${item.electricity}%` }"></div>
                                    </div>
                                </div>
                                <div>{{ item.electricity }}%</div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="connect-content-item-disconnect">
                        <div v-if="item.deviceType === 1">设备休眠或断开连接，请点击按键或检查设备</div>
                        <div v-else>设备休眠或断开连接，请移动或检查设备</div>
                    </div>
                </div>
            </div>
            <div class="request-device-tips">
                驱动无法识别蓝牙模式连接，请使用2.4G接收器或连接线
            </div>
        </div>
        <div v-else>
            <div class="request-device-animation">
                <div>
                    <img :src="keyboardImage1" alt="">
                </div>
                <div>
                    <img :src="keyboardImage" alt="">
                </div>
                <div class="request-device-btn" v-if="!isElectron" @click="connectDevice">添加新设备</div>
            </div>
            <div class="request-device-animation-tips">
                <div>请先连接设备</div>
                <div>驱动无法识别蓝牙模式连接，请使用2.4G接收器或连接线</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.request-device {
    width: 100%;
    height: calc(100vh - 50px);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    >div {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        gap: 40px;
        position: relative;

        .request-device-btn {
            padding: 8px 20px;
            border-radius: var(--globalRadius);
            background: var(--el-color-primary);
            color: #fff;
            font-size: 14px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease-in-out;

            &:hover {
                transition: all 0.3s ease-in-out;
                box-shadow: 0 0 12px 2px var(--el-color-primary);
            }
        }

        .request-device-list {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 24px;
            transform: scale(1.0);

            >div {
                width: 320px;
                cursor: pointer;
                height: 400px;
                padding: 32px 24px 10px;
                animation: bounce-in 0.5s;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                transition: all 0.3s ease-in-out;
                position: relative;
                background: var(--theme-fun-bgcolor);
                backdrop-filter: blur(var(--funAreaRadius));
                border-radius: var(--globalRadius);
                border: 2px solid var(--theme-fun-bgcolor);

                &:hover {
                    border: 2px solid var(--el-color-primary);
                    box-sizing: border-box;
                    box-shadow: 0 0 10px var(--el-color-primary);
                    transition: all 0.3s ease-in-out;

                    >div:nth-of-type(2) {
                        animation: bounce-drop 1.5s both;

                        >img {
                            transition: all 0.3s ease-in-out;
                            // transform: scale(1.1);
                        }
                    }
                }

                >div:nth-of-type(1) {
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--theme-font-color);
                    text-align: center;
                    margin-bottom: 12px;
                }

                >div:nth-of-type(2) {
                    flex: 1;
                    width: 100%;
                    padding: 12px;
                    box-sizing: border-box;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    transition: transform 0.2s ease-out;
                    // animation: rotate-cycle 5s linear infinite;

                    >img {
                        max-width: 100%;
                        max-height: 80%;
                        width: auto;
                        height: auto;
                        object-fit: contain;
                        transition: all 0.3s ease-in-out;
                    }
                }

                // >div:nth-of-type(3) {
                //     font-size: 16px;
                //     font-weight: bold;
                //     color: var(--theme-font-color);
                //     text-align: center;
                // }

                // >div:nth-of-type(4) {
                //     padding: 24px;
                //     font-size: 16px;
                //     font-weight: bold;
                //     color: var(--theme-font-color);
                //     text-align: center;
                // }
            }
        }
    }

    .request-device-tips {
        position: absolute;
        bottom: 40px;
        font-size: 14px;
        font-weight: bold;
        color: var(--theme-font-color);
        text-align: center;
        animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
        0% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-10px);
        }

        100% {
            transform: translateY(0);
        }
    }

    @keyframes bounce-drop {
        0% {
            transform: translateY(-50px);
            animation-timing-function: ease-in;
            opacity: 0;
        }

        20% {
            transform: translateY(0);
            animation-timing-function: ease-out;
            opacity: 1;
        }

        35% {
            transform: translateY(-40px);
            animation-timing-function: ease-in;
        }

        50% {
            transform: translateY(0);
            animation-timing-function: ease-out;
        }

        65% {
            transform: translateY(-20px);
            animation-timing-function: ease-in;
        }

        80% {
            transform: translateY(0);
            animation-timing-function: ease-out;
        }

        90% {
            transform: translateY(-10px);
            animation-timing-function: ease-in;
        }

        100% {
            transform: translateY(0);
            animation-timing-function: ease-out;
        }
    }
}

.request-device-animation {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    >div:nth-of-type(1) {
        position: absolute;
        width: 100px;
        height: 300px;
        top: -400px;
        animation: rotate-cycle 5s linear infinite;
        z-index: -10;

        >img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }

    >div:nth-of-type(2) {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        justify-content: flex-start;

        >img {
            max-width: 90%;
            max-height: 80%;
            width: auto;
            height: auto;
            object-fit: contain;
        }
    }

    @keyframes rotate-cycle {
        0% {
            top: -400px;
        }

        45% {
            top: -270px;
        }

        55% {
            top: -270px;
        }

        100% {
            top: -400px;
        }
    }

}

.request-device-animation-tips {
    position: absolute;
    bottom: 40px;
    color: var(--theme-font-color);
    text-align: center;

    >div:nth-of-type(1) {
        font-size: 24px;
        font-weight: 500;
        margin-bottom: 12px;
    }

    >div:nth-of-type(1) {
        font-size: 20px;
    }
}

.connect-content-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    // position: absolute;
    // bottom: 14px;
    padding: 24px;

    >div:nth-of-type(2) {
        .charge {
            display: flex;
            align-items: center;
            gap: 2px;

            >div:nth-of-type(1) {
                width: 30px;
                height: 30px;

                .icon-mask {
                    width: 100%;
                    height: 100%;
                    background-color: var(--theme-icon-color);
                    -webkit-mask-size: contain;
                    -webkit-mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                    mask-size: contain;
                    mask-repeat: no-repeat;
                    mask-position: center;
                }
            }

            >div:nth-of-type(2) {
                font-size: 14px;
                font-weight: 500;
                color: var(--theme-icon-color);
            }
        }
    }

    .battery {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        >div:nth-of-type(1) {
            display: flex;
            align-items: center;
            justify-content: center;

            .battery-power {
                width: 28px;
                height: 16px;
                border: 2px solid var(--theme-icon-color);
                border-radius: 4px;
                position: relative;
                box-sizing: border-box;
                padding: 1px;
                box-sizing: border-box;
            }

            .battery-power::after {
                content: '';
                position: absolute;
                right: -4px;
                top: 2px;
                width: 3px;
                height: 8px;
                background: var(--theme-icon-color);
                border-radius: 0 2px 2px 0;
            }

            .battery-level {
                height: 100%;
                background: #0cf32b;
                border-radius: 2px;
                transition: width 0.3s ease;
                border: 1px solid #0cf32b;
                box-sizing: border-box;

                &.low-battery {
                    background: #ff0000;
                    border-color: #ff0000;
                }
            }
        }

        >div:nth-of-type(2) {
            font-size: 14px;
            font-weight: 500;
            color: var(--theme-icon-color);
        }
    }

    .wireless {
        width: 30px;
        height: 30px;

        .icon-mask {
            width: 100%;
            height: 100%;
            background-color: var(--theme-icon-color);
            -webkit-mask-size: contain;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
            mask-size: contain;
            mask-repeat: no-repeat;
            mask-position: center;
        }
    }
}

.connect-content-item-disconnect {
    width: 100%;
    // position: absolute;
    // bottom: 0px;
    padding: 24px 0;

    >div {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;
        width: 100%;
        font-size: 12px;
        text-align: center;
        color: #f00;
        border-radius: var(--globalRadius);
        background-color: rgba(255, 0, 0, 0.2);
    }
}
</style>