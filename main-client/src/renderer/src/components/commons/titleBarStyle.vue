<!-- 标题栏样式 -->
<script setup>
import { toRefs, ref, onMounted, computed } from 'vue'
import { CloseOutlined, TranslationOutlined, BorderOutlined, MinusOutlined, SettingOutlined, SkinOutlined, PlaySquareOutlined, GlobalOutlined } from '@ant-design/icons-vue';
import isElectron from "../../utils/event";
import { useStore } from '../../stores/index.js'
const defineStore = useStore()
const { deviceStatus, bgSettings, isDemoMode } = toRefs(defineStore)
import { px2rem, px2remUnit } from '../../utils/px2rem.js'
import { useAppTheme } from '../../utils/useAppTheme.js'
const { store } = useAppTheme()

const isMaximized = ref(false)

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
})


// 最小化
const minimize = () => {
    window.api.minimize()
}

// 最大化
const maximize = () => {
    window.api.maximize()
}

// 关闭
const close = () => {
    window.api.close()
}


// 切换设置
const changeSetting = () => {
    if (deviceStatus.value !== 3 && deviceStatus.value !== 4) {
        defineStore.previousDeviceStatus = deviceStatus.value
    }
    deviceStatus.value = 3
}

// 切换换肤
const changeSkin = () => {
    if (deviceStatus.value !== 3 && deviceStatus.value !== 4) {
        defineStore.previousDeviceStatus = deviceStatus.value
    }
    deviceStatus.value = 4
}

// 切换演示模式
const changeDemoMode = () => {
    isDemoMode.value = !isDemoMode.value
    console.log('当前是什么模式', isDemoMode.value);
    if (deviceStatus.value !== 3 && deviceStatus.value !== 4) {
        deviceStatus.value = 1
    }

}



// 语言选择
const currentLanguage = ref('简体中文')
const languageVisible = ref(false)
const languageData = [
    { value: '简体中文', label: '简体中文' },
    { value: 'English', label: 'English' },
    { value: '日本語', label: '日本語' },
    { value: '한국어', label: '한국어' },
    { value: 'Français', label: 'Français' },
]

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

// 切换logo
const logoBtn = () => {
    deviceStatus.value = 1
}

</script>

<template>
    <div class="title-bar" :class="{ 'is-maximized': isMaximized }">
        <div class="title-bar-left">
            <div @click="logoBtn">
                <img src="../../assets/icon.png" alt="">
            </div>
            <div></div>
        </div>
        <div class="title-bar-right">
            <div>
                <a-popover placement="bottom" trigger="hover" :arrow="true" :overlayClassName="'custom-popover'"
                    :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                    <div @click="changeDemoMode" v-if="!isDemoMode">
                        <PlaySquareOutlined />
                    </div>
                    <div v-else class="exit-presentation" @click="changeDemoMode">
                        <div>
                            <PlaySquareOutlined />
                        </div>
                        <div>退出演示</div>
                    </div>
                    <template #content>
                        <div class="tooltip-popover-content" :style="popoverStyle">
                            演示模式
                        </div>
                    </template>
                </a-popover>
                <a-popover placement="bottom" trigger="hover" :arrow="true" :overlayClassName="'custom-popover'"
                    :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                    <div @click="changeSkin">
                        <SkinOutlined />
                    </div>
                    <template #content>
                        <div class="tooltip-popover-content" :style="popoverStyle">
                            换肤
                        </div>
                    </template>
                </a-popover>
                <a-popover v-model:open="languageVisible" placement="bottom" trigger="hover" :arrow="true"
                    :overlayClassName="'custom-popover'"
                    :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                    <div>
                        <TranslationOutlined />
                    </div>
                    <template #content>
                        <div class="language-popover-list" :style="[{ width: px2rem(120) }, popoverStyle]">
                            <div v-for="item in languageData" :key="item.value" @click="selectLanguage(item.value)"
                                :class="{ 'active': currentLanguage === item.value }">
                                {{ item.label }}
                            </div>
                        </div>
                    </template>
                </a-popover>
                <a-popover placement="bottom" trigger="hover" :arrow="true" :overlayClassName="'custom-popover'"
                    :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                    <div @click="changeSetting">
                        <SettingOutlined />
                    </div>
                    <template #content>
                        <div class="tooltip-popover-content" :style="popoverStyle">
                            系统设置
                        </div>
                    </template>
                </a-popover>
            </div>
            <div v-if="isElectron">
                <a-popover placement="bottom" trigger="hover" :arrow="true" :overlayClassName="'custom-popover'"
                    :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                    <div @click="minimize">
                        <MinusOutlined />
                    </div>
                    <template #content>
                        <div class="tooltip-popover-content" :style="popoverStyle">
                            最小化
                        </div>
                    </template>
                </a-popover>
                <a-popover placement="bottom" trigger="hover" :arrow="true" :overlayClassName="'custom-popover'"
                    :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                    <div @click="maximize">
                        <BorderOutlined />
                    </div>
                    <template #content>
                        <div class="tooltip-popover-content" :style="popoverStyle">
                            {{ isMaximized ? '向下还原' : '最大化' }}
                        </div>
                    </template>
                </a-popover>
                <a-popover placement="bottom" trigger="hover" :arrow="true" :overlayClassName="'custom-popover'"
                    :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                    <div @click="close">
                        <CloseOutlined />
                    </div>
                    <template #content>
                        <div class="tooltip-popover-content" :style="popoverStyle">
                            关闭
                        </div>
                    </template>
                </a-popover>
            </div>

        </div>
    </div>
</template>

<style lang="scss" scoped>
.title-bar {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    box-sizing: border-box;
    -webkit-app-region: drag; // 可拖拽
    z-index: 100;
    // background-color: var(--el-color-primary-light-9);

    &.is-maximized {
        -webkit-app-region: no-drag;
    }

    .title-bar-left {
        display: flex;
        align-items: center;
        gap: 24px;

        >div:nth-of-type(1) {
            width: 32px;
            -webkit-app-region: no-drag; // 禁止拖拽

            >img {
                width: 100%;
                height: 100%;
                cursor: pointer;
            }
        }
    }

    .title-bar-right {
        display: flex;
        align-items: center;
        gap: 24px;
        -webkit-app-region: no-drag; // 禁止拖拽

        >div:nth-of-type(1) {
            display: flex;
            align-items: center;
            gap: 24px;

            >div {
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--theme-font-color);
                transition: all 0.3s ease-in-out;
                font-size: 20px !important;

                &:hover {
                    color: var(--el-color-primary);
                    transition: all 0.3s ease-in-out;
                }
            }
        }

        >div:nth-of-type(2) {
            display: flex;
            align-items: center;
            gap: 24px;

            >div {
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--theme-font-color);
                transition: all 0.3s ease-in-out;
                font-size: 20px !important;

                &:hover {
                    color: var(--el-color-primary);
                    transition: all 0.3s ease-in-out;
                }
            }

            >div:nth-of-type(2) {
                font-size: 18px !important;
            }
        }



    }
}

.language-popover-list {
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
    border: 1px solid var(--theme-fun-bgcolor);
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
            font-weight: 500;
            color: var(--el-color-primary);
            background: var(--theme-fun-bgcolor);
        }
    }
}

.exit-presentation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    background-color: rgb(235, 21, 21);
    border-radius: var(--globalRadius);
    padding: 0 8px;
    height: 32px;
    color: #fff !important;

    &:hover {
        color: #fff !important;
    }

    >div:nth-of-type(1) {
        font-size: 20px !important;
    }

    >div:nth-of-type(2) {
        font-size: 12px;
    }
}


.tooltip-popover-content {
    user-select: none;
    backdrop-filter: blur(var(--funAreaRadius));
    background-color: var(--theme-fun-popup-bgcolor);
    border-radius: var(--globalRadius);
    padding: 8px 12px;
    box-sizing: border-box;
    color: var(--theme-font-color);
    border: 1px solid var(--theme-fun-bgcolor);
    animation: fadeIn 0.3s linear;
    font-size: 12px;
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

<style lang="scss">
.custom-popover {
    .ant-popover-arrow {
        &::before {
            background-color: var(--theme-fun-popup-bgcolor) !important;
        }

        &::after {
            background-color: var(--theme-fun-popup-bgcolor) !important;
        }
    }
}
</style>