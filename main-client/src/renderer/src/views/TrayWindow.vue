<!-- 托盘样式 -->
<script setup>
import { ref, onMounted, toRefs, computed, onUnmounted } from "vue";
import { useStore } from '../stores/index.js'
import { DeviceService } from '../services/DeviceService';

const defineStore = useStore()
const { allDeviceList, deviceType, deviceStatus } = toRefs(defineStore)

// 获取设备图标
const getDeviceIcon = (type) => {
  // 1: 键盘, 2: 鼠标
  return type === 1 ? '⌨️' : '🖱️';
}

// 获取设备列表
const getDeviceList = async () => {
  try {
    const deviceList = await DeviceService.getDeviceList() || [];
    // console.log('TrayWindow getDeviceList:', deviceList);
    // 更新 store
    allDeviceList.value = deviceList;
  } catch (error) {
    console.error('Failed to get device list in tray window:', error);
  }
};

// 监听设备变化
const handleUSBChange = (event) => {
  getDeviceList();
};

// 发送命令到主进程
const sendToMain = (channel, data) => {
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.send(channel, data)
  }
}

const openMain = () => {
  sendToMain('tray-window-open')
}

const quitApp = () => {
  sendToMain('tray-window-quit')
}

const containerRef = ref(null)
let resizeObserver = null

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // 使用 offsetHeight 获取包含内边距的完整高度
        const height = entry.target.offsetHeight
        const width = entry.target.offsetWidth
        sendToMain('tray-window-resize', { width, height })
      }
    })
    resizeObserver.observe(containerRef.value)
  }

  // 初始化设备列表
  getDeviceList();
  // 监听设备插拔
  DeviceService.on('usbChange', handleUSBChange);

  // 监听窗口显示事件，强制更新一次高度
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.on('tray-window-shown', () => {
      // 触发一次 ResizeObserver 的回调或者手动获取高度
      if (containerRef.value) {
        const height = containerRef.value.offsetHeight
        const width = containerRef.value.offsetWidth
        sendToMain('tray-window-resize', { width, height })
      }
    })
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  // 移除设备插拔监听
  DeviceService.off('usbChange', handleUSBChange);

  // 移除监听
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.removeAllListeners('tray-window-shown')
  }
})


// 请求设备
const requestDevice = (type) => {
  console.log(type, '托盘');
  openMain()
  deviceType.value = type
  deviceStatus.value = 2
}
</script>

<template>
  <div class="tray-container" ref="containerRef">
    <!-- 设备状态区域 -->
    <div class="device-card" v-for="(item, index) in allDeviceList" :key="index"
      @click="requestDevice(item.deviceType)">
      <div class="device-info">
        <span class="device-icon">{{ getDeviceIcon(item.deviceType) }}</span>
        <span class="device-name">{{ item.name }}</span>
      </div>
      <div class="battery-info">
        <div class="battery-icon-wrapper">
          <span class="battery-icon">⚡</span>
          <div class="battery-level" :style="{ width: item.electricity || '0%' }"></div>
        </div>
        <span class="battery-text">{{ item.electricity || '0%' }}</span>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-footer">
      <div class="action-btn" @click="openMain">打开 Evision HUB</div>
      <div class="action-btn" @click="quitApp">退出</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tray-container {
  width: 100%;
  height: auto;
  border-radius: var(--globalRadius);
  background: var(--theme-bg-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  user-select: none;
  color: var(--theme-font-color);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  padding: 12px;

  .device-card {
    padding: 6px 12px;
    background: var(--theme-fun-bgcolor);
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    &:hover {
      background: var(--el-color-primary);
      color: #fff;
    }

    .device-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .device-icon {
        width: 20px;
        font-size: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .device-name {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }
    }

    .battery-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .battery-icon-wrapper {
        position: relative;
        width: 32px;
        height: 16px;
        border: 1.5px solid #2ea043; // 电池框绿色
        border-radius: 3px;
        display: flex;
        align-items: center;
        padding: 1px;

        &::after {
          content: '';
          position: absolute;
          right: -4px;
          top: 4px;
          width: 2px;
          height: 5px;
          background: #2ea043;
          border-radius: 0 1px 1px 0;
        }

        .battery-icon {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          z-index: 2;
          color: var(--theme-font-color);
        }

        .battery-level {
          height: 100%;
          background: rgba(46, 160, 67, 0.4); // 电池内部填充
          border-radius: 1px;
        }
      }

      .battery-text {
        font-size: 13px;
        color: #2ea043;
        font-weight: 500;
      }
    }
  }


  .action-footer {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 4px;

    >div {
      height: 30px;
      line-height: 30px;
      font-size: 12px;
      cursor: pointer;
      color: var(--theme-font-color);
      width: 100%;
      padding: 0 12px;
      border-radius: 8px;

      &:hover {
        background: var(--theme-fun-bgcolor);
      }
    }
  }
}
</style>
