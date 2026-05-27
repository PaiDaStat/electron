<script setup>
import { onMounted, toRefs, ref, computed } from 'vue'
import { useStore } from '../../stores/index.js'
const defineStore = useStore()
const { bgSettings } = toRefs(defineStore)
import { px2remUnit } from '../../utils/px2rem.js'
import { useAppTheme } from '../../utils/useAppTheme.js'
const { store } = useAppTheme()
import loopTaskBarApp from '../../assets/keyIcon/loopTaskBarApp-icon.webp' // 循环任务栏应用程序


// 宏数据列表
const macroList = ref([
    {
        name: 'M1',
        value: 0,
    },
    {
        name: 'M2',
        value: 1,
    },
    {
        name: 'M3',
        value: 2,
    },
    {
        name: 'M4',
        value: 3,
    },
    {
        name: 'M5',
        value: 4,
    },
])


// 宏类型数组
const macroTypeList = ref([
    {
        name: '按住时循环',
        desc: '按下按键时会持续重复执行宏，松开停止',
        icon: loopTaskBarApp,
        value: 0,
    },
    {
        name: '循环至任意键按下',
        desc: '宏会持续重复直至按下其他按键将其关闭',
        icon: loopTaskBarApp,
        value: 1,
    },
    {
        name: '执行一次',
        desc: '按下以执行宏，按下后重复1次',
        icon: loopTaskBarApp,
        value: 2,
    },
    {
        name: '循环至任意键按下',
        desc: '宏会持续重复直至按下其他按键将其关闭',
        icon: loopTaskBarApp,
        value: 3,
    },
    {
        name: '循环至任意键按下',
        desc: '宏会持续重复直至按下其他按键将其关闭',
        icon: loopTaskBarApp,
        value: 4,
    },
])

// 选中的宏类型
const selectedMacroType = ref(0)

// 选中的宏
const selectedMacro = ref(0)

// 宏数据弹窗
const macroDataModal = ref(false)

// 选择宏按钮
const selectMacroBtn = (value) => {
    selectedMacro.value = value
    macroDataModal.value = true
}

const cssVars = computed(() => {
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






</script>

<template>
    <div class="macro-settings" v-show="!macroDataModal" :style="cssVars">
        <div>
            <div>
                <div class="title">宏列表</div>
                <div>请选择宏进行编辑</div>
            </div>
            <div>
                <div v-for="item in macroList" :key="item.name" :class="{ 'active': item.value === selectedMacro }"
                    @click="selectMacroBtn(item.value)">
                    {{ item.name }}
                </div>
            </div>
        </div>
        <div>

        </div>
    </div>
    <a-modal v-model:open="macroDataModal" :keyboard="false" :maskClosable="false" :centered="false"
        @cancel="macroDataModal = false" :footer="null" :closable="false" wrap-class-name="macro-full-modal"
        :destroyOnClose="false" :width="null" :wrap-style="{ overflow: 'hidden' }" :body-style="{ padding: 0 }"
        :maskStyle="{ backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(1px)' }"
        :style="{ position: 'absolute', bottom: 0, right: 0, padding: 0, top: 'auto' }">
        <div class="macro-data" :style="cssVars">
            <div>
                <div>
                    <div class="setting-rd">
                        <div>
                            <div>选择宏类型</div>
                            <div>宏数据的播放方式</div>
                        </div>
                        <div>
                            <div v-for="(item, index) in macroTypeList" :key="index"
                                :class="{ 'active': item.value === selectedMacroType }"
                                @click="selectedMacroType = item.value">
                                <div>
                                    <img :src="item.icon" alt="">
                                </div>
                                <div>
                                    <div>{{ item.name }}</div>
                                    <div>{{ item.desc }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="setting-lr">
                        <div>
                            <div>允许录入鼠标</div>
                            <div>开启后，宏可以录入鼠标按键操作</div>
                        </div>
                        <div>
                            <a-switch />
                        </div>
                    </div>
                    <div class="setting-lr">
                        <div>
                            <div>启用标准延迟</div>
                            <div>开启后，宏录制时时间间隔会是50ms的延迟</div>
                        </div>
                        <div>
                            <a-switch />
                        </div>
                    </div>
                </div>
                <div>
                    <div class="functional-zone">
                        <div class="title">宏录制</div>
                        <div>
                            <div>开始录制</div>
                            <div>重置</div>
                            <div>保存</div>
                            <div @click="macroDataModal = false">退出</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a-modal>
</template>

<style lang="scss">
.macro-full-modal {
    .ant-modal-content {
        padding: 0;
        background: transparent;
        box-shadow: none;
    }
}
</style>

<style lang="scss" scoped>
.macro-settings {
    width: 100%;
    height: calc(100vh - 62px);
    box-sizing: border-box;
    display: flex;
    gap: 12px;
    overflow: hidden;

    >div {
        width: 100%;
        height: 100%;
        padding: 24px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 12px;

    }

    >div:nth-child(1) {
        flex: 1;
        max-width: 500px;
        border-radius: var(--globalRadius);
        color: var(--theme-font-color);
        background: var(--theme-fun-bgcolor);
        backdrop-filter: blur(var(--funAreaRadius));
        border: 1px solid var(--theme-border-color);
        animation: bounce-in 0.5s;

        >div:nth-of-type(1) {
            display: flex;
            flex-direction: column;
            gap: 4px;

            >div:nth-of-type(2) {
                font-size: 13px;
                color: var(--theme-font-color-small);
            }
        }

        >div:nth-of-type(2) {
            height: calc(100% - 48px);
            overflow: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;

            >div {
                width: 100%;
                padding: 8px 12px;
                box-sizing: border-box;
                border-radius: var(--globalRadius);
                border: 1px solid var(--theme-border-color);
                background-color: var(--theme-fun-bgcolor);
                backdrop-filter: blur(var(--funAreaRadius));
                cursor: pointer;
                transition: all 0.3s ease-in-out;

                &.active {
                    border: 1px solid var(--el-color-primary);
                    background: var(--el-color-primary);
                    transition: all 0.3s ease-in-out;
                    color: #fff;
                }

                &:hover:not(.active) {
                    border: 1px solid var(--el-color-primary);
                    background: var(--el-color-primary-hover);
                    transition: all 0.3s ease-in-out;
                }
            }
        }
    }

    >div:nth-child(2) {
        flex: 1;
    }

}



.title {
    font-size: 16px;
    font-weight: 500;
    color: var(--theme-font-color);
}

.macro-data {
    padding: 12px;
    box-sizing: border-box;
    overflow: hidden;

    >div {
        width: calc(100vw - 256px);
        height: calc(100vh - 62px);
        display: flex;
        gap: 12px;

        >div {
            animation: fadeIn 0.5s linear;
        }

        >div:nth-of-type(1) {
            flex: 2;
            display: flex;
            flex-direction: column;
            gap: 12px;
            overflow-x: hidden;
            overflow-y: auto;
        }

        >div:nth-of-type(2) {
            flex: 3;
            backdrop-filter: blur(var(--funAreaRadius));
            border-radius: var(--globalRadius);
            color: var(--theme-font-color);
            background: var(--theme-fun-bgcolor);
            padding: 24px;
            box-sizing: border-box;

            .functional-zone {
                width: 100%;
                display: flex;
                justify-content: space-between;

                >div:nth-of-type(2) {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    >div {
                        padding: 8px 12px;
                        min-width: 60px;
                        text-align: center;
                        font-size: 14px;
                        line-height: 16px;
                        box-sizing: border-box;
                        border-radius: var(--globalRadius);
                        border: 1px solid var(--theme-border-color);
                        background-color: var(--theme-fun-bgcolor);
                        backdrop-filter: blur(var(--funAreaRadius));
                        cursor: pointer;
                        transition: all 0.3s ease-in-out;

                        &:hover {
                            border: 1px solid var(--el-color-primary);
                            background-color: var(--el-color-primary-hover);
                            transition: all 0.3s ease-in-out;
                        }
                    }

                    >div:nth-of-type(3) {
                        border: 1px solid var(--el-color-primary);
                        background: var(--el-color-primary);
                        color: #fff;
                    }
                }
            }
        }
    }
}

.setting-lr {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding: 24px;
    box-sizing: border-box;
    border-radius: var(--globalRadius);
    color: var(--theme-font-color);
    background: var(--theme-fun-bgcolor);
    backdrop-filter: blur(var(--funAreaRadius));
    animation: bounce-in 0.5s;

    /* 防止内容被拆分到两列 */
    >div:nth-of-type(1) {
        display: flex;
        flex-direction: column;
        gap: 2px;

        >div:nth-of-type(1) {
            font-size: 14px;
            color: var(--theme-font-color);
            font-weight: 500;
        }

        >div:nth-of-type(2) {
            font-size: 12px;
            color: var(--theme-font-color-small);
        }
    }
}

.setting-rd {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px;
    box-sizing: border-box;
    border-radius: var(--globalRadius);
    color: var(--theme-font-color);
    background: var(--theme-fun-bgcolor);
    backdrop-filter: blur(var(--funAreaRadius));
    animation: bounce-in 0.5s;

    /* 防止内容被拆分到两列 */
    >div:nth-of-type(1) {
        display: flex;
        flex-direction: column;
        gap: 2px;

        >div:nth-of-type(1) {
            font-size: 14px;
            color: var(--theme-font-color);
            font-weight: 500;
        }

        >div:nth-of-type(2) {
            font-size: 12px;
            color: var(--theme-font-color-small);
        }
    }

    >div:nth-of-type(2) {
        display: flex;
        flex-direction: column;
        gap: 12px;

        >div {
            display: flex;
            align-items: center;
            gap: 12px;
            border: 1px solid var(--theme-border-color);
            border-radius: var(--globalRadius);
            background-color: var(--theme-fun-bgcolor);
            backdrop-filter: blur(var(--funAreaRadius));
            padding: 12px;
            box-sizing: border-box;
            cursor: pointer;
            transition: all 0.3s ease-in-out;

            >div:nth-of-type(1) {
                display: flex;
                justify-content: center;
                align-items: center;

                >img {
                    width: 36px;
                    height: 36px;
                }
            }

            >div:nth-of-type(2) {
                display: flex;
                flex-direction: column;
                gap: 2px;

                >div:nth-of-type(1) {
                    font-size: 14px;
                    color: var(--theme-font-color);
                    font-weight: 500;
                }

                >div:nth-of-type(2) {
                    font-size: 12px;
                    color: var(--theme-font-color-small);
                }
            }

            &.active {
                border: 1px solid var(--el-color-primary);
                background: var(--el-color-primary);
                transition: all 0.3s ease-in-out;

                >div:nth-of-type(2) {

                    >div:nth-of-type(1) {
                        color: #fff;
                    }

                    >div:nth-of-type(2) {
                        color: #fff;
                    }
                }
            }

            &:hover:not(.active) {
                border: 1px solid var(--el-color-primary);
                background: var(--el-color-primary-hover);
                transition: all 0.3s ease-in-out;
            }


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

/* 整个滚动条 */
::-webkit-scrollbar {
    width: 0px;
    height: 4px;
}

/* 滚动条的滑块 */
::-webkit-scrollbar-thumb {
    /* background-color: #c9cdd4; */
    background-color: #66686b;
    border-radius: 3px;
    cursor: pointer;
}

/* 滚动条的轨道的两端按钮 */
::-webkit-scrollbar-button {
    height: 0px;
    display: none;
}
</style>