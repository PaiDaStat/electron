<script setup>
import { toRefs, ref, shallowRef, computed } from 'vue'
import { useStore } from '../stores/index.js'
const defineStore = useStore()
const { deviceStatus, previousDeviceStatus, operationLoading, bgSettings, deviceHID, deviceType } = toRefs(defineStore)
import LoadComp from '../components/commons/loadComp.vue';
import { MoreOutlined, WifiOutlined, ThunderboltOutlined, DeploymentUnitOutlined, EllipsisOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';
import { ArrowRightBold, ArrowDownBold } from '@element-plus/icons-vue'
import { px2rem, px2remUnit } from '../utils/px2rem.js'
import { useAppTheme } from '../utils/useAppTheme.js'
const theme = useAppTheme()
import { useKeyBoardStore } from '../stores/useKeyBoardStore.js'
const keyBoardStore = useKeyBoardStore()
let { interactionType } = toRefs(keyBoardStore)
import wiredIcon from '../assets/icons/wired-icon.svg'
import wifiIcon from '../assets/icons/2.4G-icon.svg'
import chargeIcon from '../assets/icons/charge-icon.svg'
//键盘组件
import keyboardModule from '../components/keyboardModule/index.vue'
//鼠标组件
import mouseModule from '../components/mouseMoudule/index.vue'
//键盘-自定义按键
import keyboardChangeKeySettings from '../components/keyboardModule/functionSettings/kChangeKeySettings.vue';
// 键盘-灯光设置
import keyboardLightingSettings from '../components/keyboardModule/functionSettings/kLightingSettings.vue';
// 键盘-其他设置
import keyboardOtherSettings from '../components/keyboardModule/functionSettings/kOtherSettings.vue';
// 键盘-性能设置
import keyboardPerformanceSettings from '../components/keyboardModule/functionSettings/kPerformanceSettings.vue';
// 键盘-触发键设置
import keyboardTriggerSettings from '../components/keyboardModule/functionSettings/kTriggerSettings.vue';
// 键盘-高级键设置
import keyboardAdvancedKeySettings from '../components/keyboardModule/functionSettings/kAdvancedKeySettings.vue';
// 键盘-磁轴校准
import keyboardMagneticAxisCalibration from '../components/keyboardModule/functionSettings/kMagneticAxisCalibration.vue';



//鼠标-改键设置组件
import mouseChangeKeySettings from '../components/mouseMoudule/functionSettings/mChangeKeySettings.vue';
//鼠标-灯光设置组件
import mouseLightingSettings from '../components/mouseMoudule/functionSettings/mLightingSettings.vue';
//鼠标-其他设置组件
import mouseOtherSettings from '../components/mouseMoudule/functionSettings/mOtherSettings.vue';
//鼠标-性能设置组件
import mousePerformanceSettings from '../components/mouseMoudule/functionSettings/mPerformanceSettings.vue';
// 宏设置组件
import macroSettings from '../components/commons/macroSettings.vue';
//鼠标-DPI设置组件
import mouseDPISettings from '../components/mouseMoudule/functionSettings/mDPISettings.vue';



// 当前选中
const activeKey = ref('changekey');

// 功能组件映射
const functionComponentMap = {
    1: {
        lighting: keyboardLightingSettings,
        changekey: keyboardChangeKeySettings,
        other: keyboardOtherSettings,
        performance: keyboardPerformanceSettings,
        macro: macroSettings,
        trigger: keyboardTriggerSettings,
        advanced: keyboardAdvancedKeySettings,
        magneticAxisCalibration: keyboardMagneticAxisCalibration,
    },
    2: {
        changekey: mouseChangeKeySettings,
        lighting: mouseLightingSettings,
        other: mouseOtherSettings,
        performance: mousePerformanceSettings,
        macro: macroSettings,
        mDPI: mouseDPISettings,
    },
}


// 动态计算当前功能组件
const currentFunctionComponent = computed(() => {
    const type = deviceType.value
    // const type = 1
    const key = activeKey.value
    // 键盘组件操作功能权限
    if (type === 1) {
        const keyToInteraction = {
            changekey: 1,
            lighting: 2,
        };
        if (key in keyToInteraction) {
            interactionType.value = keyToInteraction[key];
        }
    } else if (type === 2) {
        const keyToInteraction = {
            changekey: 1,
        };
        if (key in keyToInteraction) {
            interactionType.value = keyToInteraction[key];
        }
    }

    return functionComponentMap[type]?.[key] || null
})



// 组件切换数据
const componentList = shallowRef([
    {
        title: '键盘组件',
        component: keyboardModule
    },
    {
        title: '鼠标组件',
        component: mouseModule
    },
])
// 根据设备类型获取对应组件
const getCurrentComponent = (type, property) => {
    const index = type - 1
    return index >= 0 && index < componentList.value.length
        ? componentList.value[index][property]
        : null
}

// 当前设备类型组件
const currentComponent = computed(() =>
    getCurrentComponent(deviceType.value, 'component')
    // getCurrentComponent(1, 'component')
)



// 设备信息弹框
const deviceInfoVisible = ref(false)
//配置文件弹框
const configInfoVisible = ref(false)

const popoverStyle = computed(() => {
    const vars = {
        '--globalRadius': px2remUnit(bgSettings.value.bgRadius),
        '--funAreaRadius': px2remUnit(bgSettings.value.bgArea),
    }

    if (bgSettings.value.customFontColor) {
        const color = bgSettings.value.customFontColor[theme.value]
        if (color) {
            vars['--theme-font-color'] = color
        }
    }
    return vars
})

import a7proImg from '../assets/deviceImg/a7pro.png'
import GK8Img from '../assets/deviceImg/GK8.webp'

//设备列表
const devicesList = ref([
    {
        id: 1,
        name: 'MX 8.3',
        type: '有线',
        status: '已连接',
        deviceImg: a7proImg,
        deviceType: 2,
    },
    {
        id: 1,
        name: 'GK 8',
        type: '2.4G',
        status: '已连接',
        deviceImg: GK8Img,
        deviceType: 1,
    },
]);

//默认板载列表
const defaultBoardList = ref([
    {
        id: 1,
        name: '默认板载 1',
    },
    {
        id: 2,
        name: '默认板载 2',
    },
    {
        id: 3,
        name: '默认板载 3',
    },
])

//自定义板载列表
const customBoardList = ref([
    {
        id: 1,
        name: '东方航空说的话就分开了大师傅似的是东方航空是的',
    },
    {
        id: 2,
        name: '我的三角洲',
    },
    {
        id: 3,
        name: 'dhfskfdsk',
    },
    {
        id: 4,
        name: '12432432452',
    },
    {
        id: 4,
        name: '12432432452',
    },
    {
        id: 4,
        name: '12432432452',
    },
])

// 请求设备列表
const requestDevice = () => {
    console.log('请求设备列表')
    deviceStatus.value = 1
}

// 选择设备
const choiceDevice = (item) => {
    console.log(item)
    deviceInfoVisible.value = false
    deviceType.value = item.deviceType
    activeKey.value = 'changekey'
}

</script>

<template>
    <div style="position: relative;">
        <LoadComp v-if="operationLoading" />
        <div class="driver">
            <el-container>
                <el-aside>
                    <a-popover v-model:open="deviceInfoVisible" placement="rightTop" trigger="click" :arrow="false"
                        :align="{ offset: [0, 0] }"
                        :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                        <div class="aside-info">
                            <div class="aside-title">设备信息</div>
                            <div>
                                <div>
                                    <div>
                                        <div>
                                            <img :src="deviceHID.connectionType === 1 ? wiredIcon : wifiIcon" alt="">
                                        </div>
                                        <template v-if="deviceHID.connectionType === 1">
                                            <div>
                                                <img :src="chargeIcon" alt="">
                                            </div>
                                            <div>充电中</div>
                                        </template>
                                        <div class="battery" v-else>
                                            <div>
                                                <div class="battery-power">
                                                    <div class="battery-level"
                                                        :class="{ 'low-battery': deviceHID.electricity < 20 }"
                                                        :style="{ width: `${deviceHID.electricity}%` }"></div>
                                                </div>
                                            </div>
                                            <div>{{ deviceHID.electricity }}%</div>
                                        </div>
                                    </div>
                                    <div>{{ deviceHID.name }}</div>
                                </div>
                                <div v-if="!deviceInfoVisible">
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
                        </div>
                        <template #content>
                            <div class="aside-popover-info" :style="popoverStyle">
                                <div>选择设备</div>
                                <div>
                                    <div v-for="item in devicesList" :key="item.id" @click="choiceDevice(item)">
                                        <div>
                                            <img :src="item.deviceImg" alt="">
                                        </div>
                                        <div>
                                            <div>{{ item.type }}</div>
                                            <div>{{ item.name }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div @click="requestDevice">
                                        前往设备列表
                                    </div>
                                </div>
                            </div>
                        </template>
                    </a-popover>
                    <a-popover v-model:open="configInfoVisible" placement="rightTop" trigger="click" :arrow="false"
                        :align="{ offset: [0, 0] }"
                        :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
                        <div class="aside-config">
                            <div class="aside-title">配置文件</div>
                            <div>
                                <div>
                                    板载配置1
                                </div>
                                <div v-if="!configInfoVisible">
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
                        </div>
                        <template #content>
                            <div class="aside-popover-config" :style="popoverStyle">
                                <div>配置操作</div>
                                <div>
                                    <div>新建配置</div>
                                    <div>导入配置</div>
                                </div>
                                <div>板载配置
                                    <a-tooltip placement="top">
                                        <template #title>
                                            <span
                                                class="tooltip-tips">板载配置储存在键盘上，可在任意设备访问。若要加载配置到板载里，请拖拽/移动配置费盖要替换的板载配置。</span>
                                        </template>
                                        <QuestionCircleOutlined />
                                    </a-tooltip>
                                </div>
                                <div>
                                    <div v-for="item in defaultBoardList" :key="item.id">
                                        <div> {{ item.name }}</div>
                                        <div>
                                            <DeploymentUnitOutlined />
                                        </div>
                                    </div>
                                </div>
                                <div>自定义配置
                                    <a-tooltip placement="top">
                                        <template #title>
                                            <span class="tooltip-tips">将配置拖放到您的板载配置中，即可将其加载到设备上。</span>
                                        </template>
                                        <QuestionCircleOutlined />
                                    </a-tooltip>
                                </div>
                                <div>将以下配置拖至上方应用生效</div>
                                <div>
                                    <div v-for="item in customBoardList" :key="item.id">
                                        <div> {{ item.name }}</div>
                                        <div>
                                            <EllipsisOutlined />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </a-popover>
                    <div class="aside-item">
                        <div class="aside-title">键盘配置</div>
                        <div>
                            <component :is="currentComponent" :selectedKey="activeKey" @select="activeKey = $event"
                                v-if="currentComponent">
                            </component>
                        </div>
                    </div>
                </el-aside>
                <el-main>
                    <component :is="currentFunctionComponent" v-if="currentFunctionComponent">
                    </component>
                </el-main>
            </el-container>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.driver {
    width: 100%;
    height: calc(100vh - 50px);
    position: relative;
    padding: 0 12px 12px;
    box-sizing: border-box;

    .el-container {
        width: 100%;
        height: 100%;
        display: flex;
        gap: 12px;

        .el-aside {
            width: 220px;
            height: 100%;
            display: flex;
            gap: 12px;
            flex-direction: column;

            .aside-title {
                font-size: 12px;
                line-height: 12px;
                color: var(--theme-font-color-small);
            }

            .aside-info {
                padding: 12px 16px;
                box-sizing: border-box;
                backdrop-filter: blur(var(--funAreaRadius));
                background-color: var(--theme-fun-bgcolor);
                border-radius: var(--globalRadius);
                border: 1px solid var(--theme-border-color);
                cursor: pointer;
                display: flex;
                gap: 6px;
                flex-direction: column;


                >div:nth-of-type(2) {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--theme-font-color);

                    >div:nth-of-type(1) {
                        display: flex;
                        gap: 8px;
                        flex-direction: column;

                        >div:nth-of-type(1) {
                            width: 100%;
                            display: flex;
                            align-items: center;
                            gap: 8px;

                            >div:nth-of-type(1),
                            >div:nth-of-type(2):not(.battery) {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 20px;
                                height: 20px;

                                >img {
                                    width: 100%;
                                    height: 100%;
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
                                        width: 24px;
                                        height: 14px;
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
                                        top: 1px;
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
                                    font-size: 12px;
                                    line-height: 12px;
                                    color: var(--theme-font-color);
                                }
                            }

                            >div:nth-of-type(3) {
                                font-size: 12px;
                                line-height: 12px;
                                color: var(--theme-font-color);
                            }
                        }

                        >div:nth-of-type(2) {
                            font-size: 14px;
                            line-height: 14px;
                            color: var(--theme-font-color);
                            font-weight: 500;
                        }
                    }

                    >div:nth-of-type(2) {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 16px;


                        .el-icon {
                            transition: all 0.25s ease-in-out;
                        }
                    }
                }

            }


            .aside-config {
                padding: 12px 16px;
                box-sizing: border-box;
                backdrop-filter: blur(var(--funAreaRadius));
                background-color: var(--theme-fun-bgcolor);
                border-radius: var(--globalRadius);
                border: 1px solid var(--theme-border-color);
                display: flex;
                gap: 6px;
                flex-direction: column;

                >div:nth-of-type(2) {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--theme-font-color);
                }
            }

            .aside-item {
                height: 100%;
                background-color: var(--theme-fun-bgcolor);
                border-radius: var(--globalRadius);
                backdrop-filter: blur(var(--funAreaRadius));
                border: 1px solid var(--theme-border-color);

                >div:nth-of-type(1) {
                    padding: 12px 16px;
                    box-sizing: border-box;
                }
            }
        }

        .el-main {
            width: 100%;
            height: calc(100vh - 62px);
            padding: 0;
            // background-color: var(--theme-fun-bgcolor);
            border-radius: var(--globalRadius);
        }
    }
}

.aside-popover-info {
    user-select: none;
    backdrop-filter: blur(var(--funAreaRadius));
    background-color: var(--theme-fun-popup-bgcolor);
    border-radius: var(--globalRadius);
    margin-left: 2px;
    width: 350px;
    height: 500px;
    animation: fadeIn 0.5s linear;
    color: var(--theme-font-color);
    position: relative;
    border: 2px solid var(--theme-fun-bgcolor);

    >div:nth-of-type(1) {
        padding: 16px 16px 12px;
        box-sizing: border-box;
        font-size: 14px;
        line-height: 14px;
        box-sizing: border-box;
    }

    >div:nth-of-type(2) {
        width: 100%;
        padding: 0 12px 12px;
        box-sizing: border-box;
        display: flex;
        gap: 12px;
        flex-direction: column;
        overflow: auto;
        max-height: 380px;

        >div {
            width: 100%;
            height: 80px;
            display: flex;
            align-items: center;
            padding: 12px;
            box-sizing: border-box;
            gap: 12px;
            background: var(--theme-fun-bgcolor);
            backdrop-filter: blur(var(--funAreaRadius));
            border-radius: var(--globalRadius);
            cursor: pointer;
            border: 1px solid var(--theme-fun-bgcolor);

            >div:nth-of-type(1) {
                width: 80px;
                height: 60px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--theme-fun-bgcolor);
                backdrop-filter: blur(var(--funAreaRadius));
                border-radius: var(--globalRadius);
                padding: 8px;
                box-sizing: border-box;

                >img {
                    max-width: 100%;
                    max-height: 100%;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                }
            }
        }
    }

    >div:nth-of-type(3) {
        width: 100%;
        padding: 16px;
        box-sizing: border-box;
        position: absolute;
        left: 0;
        bottom: 0;

        >div {
            width: 100%;
            font-size: 14px;
            padding: 10px 16px;
            box-sizing: border-box;
            background: var(--el-color-primary);
            border-radius: var(--globalRadius);
            text-align: center;
            cursor: pointer;
            color: #FFFFFF;
        }
    }
}

.aside-popover-config {
    user-select: none;
    backdrop-filter: blur(var(--funAreaRadius));
    background-color: var(--theme-fun-popup-bgcolor);
    border-radius: var(--globalRadius);
    margin-left: 2px;
    width: 350px;
    min-height: 500px;
    animation: fadeIn 0.5s linear;
    color: var(--theme-font-color);
    position: relative;
    border: 2px solid var(--theme-fun-bgcolor);
    padding-bottom: 12px;
    box-sizing: border-box;



    >div:nth-of-type(1),
    >div:nth-of-type(3),
    >div:nth-of-type(5) {
        padding: 16px;
        box-sizing: border-box;
        font-size: 14px;
        line-height: 14px;
        box-sizing: border-box;
    }

    >div:nth-of-type(2) {
        width: 100%;
        padding: 0px 16px 0;
        box-sizing: border-box;
        display: flex;
        gap: 12px;
        align-items: center;

        >div {
            width: 100%;
            font-size: 14px;
            padding: 8px;
            box-sizing: border-box;
            border-radius: var(--globalRadius);
            text-align: center;
            cursor: pointer;
            color: #FFFFFF;
            border: 1px solid var(--el-color-primary);
            color: var(--el-color-primary);
        }

        >div:nth-of-type(1) {
            background: var(--el-color-primary);
            color: #FFFFFF;
        }
    }

    >div:nth-of-type(4),
    >div:nth-of-type(7) {
        width: 100%;
        padding: 0 12px 0px;
        box-sizing: border-box;
        display: flex;
        gap: 12px;
        flex-direction: column;

        >div {
            width: 100%;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px;
            box-sizing: border-box;
            gap: 12px;
            background: var(--theme-fun-bgcolor);
            backdrop-filter: blur(var(--funAreaRadius));
            border-radius: var(--globalRadius);
            cursor: pointer;
            border: 1px solid var(--theme-fun-bgcolor);

            >div:nth-of-type(1) {
                font-size: 14px;
                line-height: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            >div:nth-of-type(2) {
                font-size: 16px;
                line-height: 16px;
            }
        }
    }

    >div:nth-of-type(5) {
        padding: 16px 16px 0px 16px;
        box-sizing: border-box;
    }

    >div:nth-of-type(6) {
        font-size: 11px;
        line-height: 11px;
        padding: 8px 16px 16px 16px;
    }

    >div:nth-of-type(7) {
        height: 200px;
        overflow: auto;
    }
}

.tooltip-tips {
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