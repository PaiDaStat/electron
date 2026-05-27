<!-- 按键切换设置组件 -->
<script setup>
import { ref, computed, toRefs } from 'vue'
import { Search } from '@element-plus/icons-vue'
import basicButtons from '../../commons/basicButtons.vue'
import { keyboardKeyArray } from '../../../utils/keyboardKeyArray'
import { useStore } from '../../../stores/index.js'
import { px2remUnit } from '../../../utils/px2rem.js'
import { useAppTheme } from '../../../utils/useAppTheme.js'
import interaction from '../../commons/interaction.vue'
import hierarchical from '../../commons/hierarchical.vue'
import GK8Img from '../../../assets/deviceImg/GK8.webp'

const defineStore = useStore()
const { bgSettings } = toRefs(defineStore)
const { store } = useAppTheme()

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


// 按键分类
const keyTypeList = ref([
    {
        label: '基础',
        value: 0
    },
    {
        label: '鼠标',
        value: 1
    },
    {
        label: '扩展',
        value: 2
    },
    {
        label: '宏',
        value: 3
    }
])
// 按键类型
const keyType = ref(0)


// 搜索框
const keyboardSearch = ref('')

const searchResultKeys = computed(() => {
    if (!keyboardSearch.value) return []
    const search = keyboardSearch.value.toLowerCase()
    const allKeys = []

    // Basic
    const basic = keyboardKeyArray()[0].keys.map(k => ({ ...k, category: 'basic' }))
    allKeys.push(...basic)

    // Mouse
    const mouse = keyboardKeyArray()[1].keys.map(k => ({ ...k, category: 'mouse' }))
    allKeys.push(...mouse)

    // Extended
    const extended = keyboardKeyArray()[2].keys.map(k => ({ ...k, category: 'extended' }))
    allKeys.push(...extended)

    return allKeys.filter(k =>
        (k.keyName && k.keyName.toLowerCase().includes(search)) ||
        (k.name && k.name.toLowerCase().includes(search)) ||
        (k.tips && k.tips.toLowerCase().includes(search))
    )
})

</script>

<template>
    <div class="change-key">
        <div>
            <div>
                <div>
                    <interaction />
                    <hierarchical />
                </div>
            </div>
            <div>
                <div>
                    <div>
                        <div>
                            <Transition name="fade-slide">
                                <el-segmented v-model="keyType" :options="keyTypeList" v-if="!keyboardSearch" />
                            </Transition>
                        </div>
                        <div>
                            <el-input v-model="keyboardSearch" class="search-input" placeholder="搜索" clearable
                                :prefix-icon="Search" />
                        </div>
                    </div>
                    <div class="hint">
                        拖拽或点击指令至目标按键以进行修改操作
                    </div>
                    <!-- 搜索结果 -->
                    <Transition name="fade-slide" mode="out-in">
                        <div v-if="keyboardSearch" class="picture-presentation search-results">
                            <div v-for="item in searchResultKeys" :key="item.keyName + item.category">
                                <a-popover placement="top" trigger="hover" :arrow="true"
                                    :overlayClassName="'key-settings-popover'"
                                    :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                                    <div class="key-item-wrapper">
                                        <div class="key-item-content">
                                            <div v-if="item.icon" class="icon-mask"
                                                :style="{ maskImage: `url(${item.icon})`, WebkitMaskImage: `url(${item.icon})` }">
                                            </div>
                                            <span v-else class="key-text">{{ item.keyName.replace(/——/g, ' ') }}</span>
                                        </div>
                                    </div>
                                    <template #content>
                                        <div class="tooltip-popover-content" :style="popoverStyle">
                                            {{ item.tips }}
                                        </div>
                                    </template>
                                </a-popover>
                            </div>
                        </div>

                        <!-- 基础按键 -->
                        <div v-else-if="keyType == 0" class="basics-buttons">
                            <basicButtons />
                        </div>
                        <!-- 鼠标按键 -->
                        <div v-else-if="keyType == 1" class="picture-presentation">
                            <div v-for="item in keyboardKeyArray()[1].keys" :key="item.keyName">
                                <a-popover placement="top" trigger="hover" :arrow="true"
                                    :overlayClassName="'key-settings-popover'"
                                    :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                                    <div class="key-item-wrapper">
                                        <div class="key-item-content">
                                            <div class="icon-mask"
                                                :style="{ maskImage: `url(${item.icon})`, WebkitMaskImage: `url(${item.icon})` }">
                                            </div>
                                        </div>
                                    </div>
                                    <template #content>
                                        <div class="tooltip-popover-content" :style="popoverStyle">
                                            {{ item.keyName }}
                                        </div>
                                    </template>
                                </a-popover>
                            </div>
                        </div>
                        <!-- 扩展按键 -->
                        <div v-else-if="keyType == 2" class="picture-presentation">
                            <div v-for="item in keyboardKeyArray()[2].keys" :key="item.keyName">
                                <a-popover placement="top" trigger="hover" :arrow="true"
                                    :overlayClassName="'key-settings-popover'"
                                    :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                                    <div class="key-item-wrapper">
                                        <div class="key-item-content">
                                            <div class="icon-mask"
                                                :style="{ maskImage: `url(${item.icon})`, WebkitMaskImage: `url(${item.icon})` }">
                                            </div>
                                        </div>
                                    </div>
                                    <template #content>
                                        <div class="tooltip-popover-content" :style="popoverStyle">
                                            {{ item.keyName }}
                                        </div>
                                    </template>
                                </a-popover>
                            </div>
                        </div>
                        <!-- 宏按键 -->
                        <div v-else-if="keyType == 3" class="text-display">
                            <div v-for="(item, index) in 20" :key="index">
                                <div class="key-item-content">
                                    {{ 'M' + (index + 1) }}
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.change-key {
    width: 100%;
    height: calc(100vh - 62px);
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    >div {
        width: 100%;
        height: calc(100vh - 62px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;


        >div:nth-of-type(1) {
            flex: 5;
            border-radius: var(--globalRadius);
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            min-height: 0;

            >div {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 48px;
            }
        }

        >div:nth-of-type(2) {
            border-radius: var(--globalRadius);
            width: 100%;
            height: 100%;
            overflow: hidden;
            min-height: 0;
            flex: 5;
            display: flex;
            background: var(--theme-fun-bgcolor);
            backdrop-filter: blur(var(--funAreaRadius));
            border: 1px solid var(--theme-border-color);
            animation: bounce-in 0.5s;

            >div {
                width: 100%;
                height: 100%;
                padding: 24px 24px 12px 24px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                gap: 12px;

                >div:nth-of-type(1) {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    align-items: flex-start;

                    >div:nth-of-type(1) {
                        width: 40%;
                        transition: all 0.3s ease-in-out;

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

                    >div:nth-of-type(2) {
                        width: 300px;

                        .search-input {
                            width: 100%;
                            border-radius: var(--globalRadius) !important;
                        }
                    }
                }

                .hint {
                    font-size: 13px;
                    color: var(--theme-font-color-small);
                }

                .basics-buttons {
                    transform: scale(0.85);
                    transform-origin: left top;

                    @media (min-width: 1300px) {
                        transform: scale(0.85);
                    }

                    @media (min-width: 1600px) {
                        transform: scale(1.0);
                    }
                }

                .picture-presentation {
                    max-width: 1029px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;

                    >div {
                        .key-item-wrapper {
                            width: 40px;
                            height: 40px;
                            cursor: pointer;

                            .key-item-content {
                                width: 100%;
                                height: 100%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                // border: 1px solid var(--theme-border-color);
                                border: 1px solid var(--keyboard-key-border-color);
                                border-radius: var(--globalRadius);
                                transition: all 0.3s ease-in-out;
                                // background: var(--theme-fun-bgcolor);
                                background: var(--keyboard-key-bg-color);
                                backdrop-filter: blur(var(--funAreaRadius));

                                .icon-mask {
                                    width: 24px;
                                    height: 24px;
                                    background-color: var(--theme-icon-color);
                                    -webkit-mask-size: contain;
                                    -webkit-mask-repeat: no-repeat;
                                    -webkit-mask-position: center;
                                    mask-size: contain;
                                    mask-repeat: no-repeat;
                                    mask-position: center;
                                }

                                .key-text {
                                    font-size: 12px;
                                    color: var(--theme-font-color);
                                    line-height: 14px;
                                    text-align: center;
                                }
                            }

                            &:hover .key-item-content {
                                border: 1px solid var(--el-color-primary);
                                background: var(--el-color-primary-hover);
                                transition: all 0.3s ease-in-out;
                                transform: translateY(-2px);
                            }
                        }
                    }
                }

                .text-display {
                    max-width: 1029px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;

                    >div {
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        // border: 1px solid var(--theme-border-color);
                        border: 1px solid var(--keyboard-key-border-color);
                        border-radius: var(--globalRadius);
                        transition: all 0.3s ease-in-out;
                        // background: var(--theme-fun-bgcolor);
                        background: var(--keyboard-key-bg-color);
                        backdrop-filter: blur(var(--funAreaRadius));
                        color: var(--theme-font-color);
                        font-size: 12px;
                        cursor: pointer;

                        &:hover {
                            border: 1px solid var(--el-color-primary);
                            background: var(--el-color-primary-hover);
                            transition: all 0.3s ease-in-out;
                            transform: translateY(-4px);
                        }
                    }
                }
            }
        }
    }
}

.tooltip-popover-content {
    pointer-events: none;
    user-select: none;
    background-color: var(--el-color-primary);
    border-radius: var(--globalRadius);
    padding: 8px 12px;
    box-sizing: border-box;
    color:#fff;
    border: 1px solid var(--el-color-primary);
    animation: fadeIn 0.3s linear;
    font-size: 12px;
    line-height: 14px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
    text-align: center;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}
</style>

<style lang="scss">
.key-settings-popover {
    .ant-popover-arrow {
        &::before {
            background-color: var(--el-color-primary) !important;
        }

        &::after {
            background-color: var(--el-color-primary) !important;
        }
    }
}
</style>