<script setup>
import { onMounted, watchEffect, toRefs, computed, ref, onUnmounted } from 'vue'
import titleBarStyle from '../components/commons/titleBarStyle.vue'
import { useStore } from '../stores/index.js'
import LoadComp from '../components/commons/loadComp.vue';
import isElectron from "../utils/event";
import { DeviceService } from '../services/DeviceService';

const defineStore = useStore()
const { deviceStatus, bgSettings, operationLoading, currentDeviceId } = toRefs(defineStore)
//驱动操作组件
import Driver from './Driver.vue'
//请求设备组件
import RequsetDevice from './RequestDevice.vue'
//设置组件
import Setting from './Setting.vue'
//换肤组件
import Skin from './Skin.vue'
// px2rem.js
import { px2remUnit } from '../utils/px2rem.js'
import { useAppTheme } from '../utils/useAppTheme.js'

const theme = useAppTheme()

const isMaximized = ref(false)

const themeVars = computed(() => {
    const vars = {}
    // 设置字体颜色
    if (bgSettings.value.customFontColor) {
        const color = bgSettings.value.customFontColor[theme.value]
        if (color) {
            vars['--theme-font-color'] = color
            const mixPercentage = theme.value === 'dark' ? '50%' : '60%'
            vars['--theme-font-color-small'] = `color-mix(in srgb, var(--theme-font-color) ${mixPercentage}, transparent)`
        }
    }

    const img = bgSettings.value.bgImages.bgImageUrl

    if (!img) {
        // 当使用默认背景色时设置固定的默认值
        vars['--bgBrightness'] = '1'
        vars['--bgFuzziness'] = '0px'
        vars['--bgOpacity'] = bgSettings.value.bgOpacity.toString()
        vars['--bgImage'] = 'none'
    } else {
        // 使用自定义背景图片时使用用户设置的值
        vars['--bgBrightness'] = bgSettings.value.bgBrightness.toString()
        vars['--bgFuzziness'] = px2remUnit(bgSettings.value.bgFuzziness)
        vars['--bgOpacity'] = bgSettings.value.bgOpacity.toString()
        vars['--bgImage'] = `url(${img})`
    }
    vars['--globalRadius'] = px2remUnit(bgSettings.value.bgRadius)
    vars['--window-border-radius'] = (isElectron && !isMaximized.value) ? vars['--globalRadius'] : '0px'
    vars['--funAreaRadius'] = px2remUnit(bgSettings.value.bgArea)

    return vars
})

const handleUSBChange = async (event) => {
    console.log('USB设备变化:', event.type, event.device);
    const deviceList = await defineStore.getDeviceList();

    if (deviceStatus.value === 2) {
        const currentId = currentDeviceId.value;
        // 检查当前设备是否还在列表中
        const exists = deviceList.some(d => d.deviceId === currentId);
        
        if (!exists) {
            console.log('当前设备已断开，返回设备列表页');
            deviceStatus.value = 1;
            currentDeviceId.value = null;
        }
    }
};

onMounted(async () => {
    if (isElectron && window.api) {
        if (window.api.isMaximized) {
            isMaximized.value = await window.api.isMaximized()
        }
        if (window.api.onMaximizeChange) {
            window.api.onMaximizeChange((value) => {
                isMaximized.value = value
            })
        }
    }

    const savedSettings = localStorage.getItem('systemStyle')
    if (savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings)
            bgSettings.value = {
                ...bgSettings.value,
                ...parsedSettings
            }
        } catch (error) {
            console.error('Failed to load system style:', error)
        }
    }

    // 监听设备插拔
    DeviceService.on('usbChange', handleUSBChange);
    // 初始化时获取设备列表
    await defineStore.getDeviceList();
})

onUnmounted(() => {
    DeviceService.off('usbChange', handleUSBChange);
})

</script>

<template>
    <div style="position: relative;background-color: transparent;" :style="themeVars" class="drive-gather">
        <LoadComp v-if="operationLoading" />
        <div>
            <titleBarStyle />
            <component
                :is="deviceStatus === 1 ? RequsetDevice : deviceStatus === 2 ? Driver : deviceStatus === 3 ? Setting : deviceStatus === 4 ? Skin : null" />
        </div>
    </div>
</template>

<style lang="scss">
.drive-gather {
    width: 100vw;
    height: 100vh;
    // background-color: var(--theme-bg-color);
    // background: url('../assets/wallpaper/3.png') no-repeat center center / cover;
    overflow: hidden;
    background: transparent;
    box-sizing: border-box;
    border-radius: var(--window-border-radius);
}


.drive-gather::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: var(--theme-bg-color);
    background-image: var(--bgImage);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    filter: blur(var(--bgFuzziness)) brightness(var(--bgBrightness)) opacity(var(--bgOpacity));
    opacity: var(--bgOpacity);
    z-index: 0;
    overflow: hidden;
    transform: scale(1.1);
    transition: all 0.3s ease-in-out;
}

.drive-gather>* {
    position: relative;
    z-index: 1;
}
</style>
