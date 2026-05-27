<!-- 系统设置 -->
<script setup>
import { onMounted, toRefs, ref, computed } from 'vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { useStore } from '../stores/index.js'
const defineStore = useStore()
const { deviceStatus, previousDeviceStatus, bgSettings } = toRefs(defineStore)
import { px2rem, px2remUnit } from '../utils/px2rem.js'
import { useAppTheme } from '../utils/useAppTheme.js'
const { store } = useAppTheme()
import isElectron from "../utils/event";
import { ArrowRightBold, ArrowDownBold } from '@element-plus/icons-vue'


// 开机自启动
const selfStartBol = ref(false)
// 关闭时最小化到托盘
const minimizeBol = ref(false)

// 初始化配置
onMounted(async () => {
    try {
        if (window.api && window.api.getAppConfig) {
            const config = await window.api.getAppConfig()
            selfStartBol.value = config.autoStart
            minimizeBol.value = config.minimizeToTray
        }
    } catch (e) {
        console.error('Failed to load config', e)
    }
})

// 监听变更
const changeSelfStart = (val) => {
    if (window.api && window.api.setAutoStart) {
        window.api.setAutoStart(val)
    }
}

const changeMinimize = (val) => {
    if (window.api && window.api.setMinimizeToTray) {
        window.api.setMinimizeToTray(val)
    }
}

// 主题选择
const selectKeyType = ref(store.value)
// 主题选项
const options = [
    { name: '曦白', id: 1, label: '曦白', value: 'light' },
    { name: '墨影', id: 2, label: '墨影', value: 'dark' },
    { name: '随境', id: 3, label: '随境', value: 'auto' }
]
//更改主题
const themeBtn = (val) => {
    console.log('接收到的值:', val)
    // 如果需要获取完整的 item 对象
    const currentItem = options.find(item => item.value === val)
    console.log('完整的 item 对象:', currentItem)

    // 可以在这里处理主题切换逻辑
    store.value = val
}


// 语言选择
const currentLanguage = ref('简体中文')
// 语言数据
const languageData = [
    {
        value: '简体中文',
        label: '简体中文',
    },
    {
        value: 'English',
        label: 'English',
    },
    {
        value: '日本語',
        label: '日本語',
    },
    {
        value: '한국어',
        label: '한국어',
    },
    {
        value: 'Français',
        label: 'Français',
    },
]

// 语言选择弹框
const languageVisible = ref(false)

const popoverStyle = computed(() => {
    const vars = {
        '--globalRadius': px2remUnit(bgSettings.value.bgRadius),
        '--funAreaRadius': px2remUnit(bgSettings.value.bgArea),
    }

    if (bgSettings.value.customFontColor) {
        const color = bgSettings.value.customFontColor[store.value]
        if (color) {
            vars['--theme-font-color'] = color
        }
    }
    return vars
})

const selectLanguage = (val) => {
    currentLanguage.value = val
    languageVisible.value = false
}


// 切换返回
const changeBack = () => {
    deviceStatus.value = previousDeviceStatus.value
}
</script>

<template>
    <div class="setting-container">
        <div class="setting-back">
            <div @click="changeBack">
                <ArrowLeftOutlined />
                <div>返回</div>
            </div>
        </div>
        <div class="setting-content">
            <div>
                <div class="setting-item" v-if="isElectron">
                    <div class="title">系统设置</div>
                    <div>
                        <div>开机自启动</div>
                        <div>
                            <a-switch v-model:checked="selfStartBol" @change="changeSelfStart" />
                        </div>
                    </div>
                    <div>
                        <div>关闭时最小化到托盘</div>
                        <div>
                            <a-switch v-model:checked="minimizeBol" @change="changeMinimize" />
                        </div>
                    </div>
                    <div>
                        <div>关闭提示中心通知</div>
                        <div>
                            <a-switch v-model:checked="minimizeBol" @change="changeMinimize" />
                        </div>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="title">界面设置</div>
                    <div>
                        <div>语言</div>
                        <div class="language-select">
                            <a-popover v-model:open="languageVisible" placement="bottom" trigger="click" :arrow="false"
                                :align="{ offset: [0, 5] }"
                                :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                                <div class="language-trigger" :style="{ width: px2rem(200) }">
                                    <div>{{ currentLanguage }}</div>
                                    <div v-if="!languageVisible">
                                        <el-icon>
                                            <ArrowRightBold />
                                        </el-icon>
                                    </div>
                                    <div v-else>
                                        <el-icon>
                                            <ArrowDownBold />
                                        </el-icon>
                                    </div>
                                </div>
                                <template #content>
                                    <div class="language-popover-list" :style="[{ width: px2rem(200) }, popoverStyle]">
                                        <div v-for="item in languageData" :key="item.value"
                                            @click="selectLanguage(item.value)"
                                            :class="{ 'active': currentLanguage === item.value }">
                                            {{ item.label }}
                                        </div>
                                    </div>
                                </template>
                            </a-popover>
                        </div>
                    </div>
                    <div>
                        <div>主题</div>
                        <div class="theme-select">
                            <el-segmented v-model="selectKeyType" :options="options" @change="themeBtn" />
                        </div>
                    </div>
                </div>
                <div class="setting-item">
                    <div class="title">关于 Evision HUB</div>
                    <div>
                        <div>当前版本</div>
                        <div>V1.0.0</div>
                    </div>
                    <div>
                        <div>帮助</div>
                        <div class="theme-settings-menu-btn">问题反馈</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.setting-container {
    width: 100%;
    height: calc(100vh - 50px);
    padding: 24px;
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    position: relative;
    background: transparent;

    .setting-back {
        // width: clamp(200px, 13.02vw, 250px);
        // flex: 0 0 250px;
        position: absolute;
        top: 24px;
        left: 24px;
        z-index: 1;
        display: flex;
        align-items: center;

        >div {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            color: var(--theme-font-color);
            cursor: pointer;
            transition: all 0.3s ease-in-out;
            margin-left: 24px;

            &:hover {
                transition: all 0.3s ease-in-out;
                color: var(--el-color-primary);
            }
        }
    }

    .setting-content {
        flex: 1 1 auto;
        height: 100%;

        >div {
            // width: 100%;
            height: 100%;
            overflow: auto;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            align-content: flex-start;
            flex-direction: column;
            align-content: center;

            .setting-item {
                width: clamp(700px, 64%, 1200px);
                padding: 24px;
                box-sizing: border-box;
                background: var(--theme-fun-bgcolor);
                backdrop-filter: blur(var(--funAreaRadius));
                border-radius: var(--globalRadius);
                border: 1px solid var(--theme-border-color);
                animation: bounce-in 0.5s;

                .title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--theme-font-color);
                    margin-bottom: 12px;
                }

                >div:not(.title) {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                    color: var(--theme-font-color);
                    padding: 8px 0;
                }

                :deep(.ant-switch-checked) {
                    background-color: var(--el-color-primary);
                }
            }
        }
    }
}

.language-select {
    width: 200px;
    color: var(--theme-font-color);
}

:deep(.ant-popover-inner-content) {
    width: 200px;
}

.theme-select {
    width: 300px;

    :deep(.el-segmented) {
        width: 100%;
        background: var(--theme-fun-bgcolor);
        color: var(--theme-font-color);
        border-radius: var(--globalRadius);
    }

    :deep(.el-segmented__item) {
        width: 100%;
        padding: 0 !important;

        &:hover {
            border-radius: var(--globalRadius);
            background: var(--theme-fun-bgcolor);
            color: var(--theme-font-color);
        }

        &.is-selected {
            border-radius: var(--globalRadius);
        }
    }

    :deep(.el-segmented__item-selected) {
        border-radius: var(--globalRadius) !important;
    }
}

.theme-settings-menu-btn {
    padding: 0 24px;
    line-height: 30px;
    text-align: center;
    background-color: var(--theme-fun-bgcolor);
    border: 1px solid var(--theme-border-color);
    backdrop-filter: blur(var(--funAreaRadius));
    cursor: pointer;
    padding: 0px 20px;
    border-radius: var(--globalRadius);
}

.language-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;
    height: 32px;
    background: var(--theme-fun-bgcolor);
    backdrop-filter: blur(var(--funAreaRadius));
    border-radius: var(--globalRadius);
    cursor: pointer;
    color: var(--theme-font-color);
    font-size: 14px;
    box-sizing: border-box;
    transition: all 0.3s;

    &:hover {
        opacity: 0.8;
    }
}

.language-popover-list {
    width: 200px;
    user-select: none;
    backdrop-filter: blur(var(--funAreaRadius));
    background-color: var(--theme-fun-popup-bgcolor);
    border-radius: var(--globalRadius);
    padding: 6px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: var(--theme-font-color);
    border: 2px solid var(--theme-fun-bgcolor);
    animation: fadeIn 0.3s linear;

    >div {
        padding: 8px 12px;
        cursor: pointer;
        border-radius: var(--globalRadius);
        transition: all 0.3s;
        font-size: 14px;

        &:hover {
            background: var(--theme-fun-bgcolor);
        }

        &.active {
            color: var(--el-color-primary);
            background: var(--theme-fun-bgcolor);
            font-weight: 500;
        }
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>