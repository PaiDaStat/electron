<!-- 性能设置组件 -->
<script setup>
import { onMounted, toRefs, ref, computed } from 'vue'

// 回报率数组
const returnRateList = ref([
    {
        label: '125Hz',
        value: 0
    },
    {
        label: '250Hz',
        value: 1
    },
    {
        label: '500Hz',
        value: 2
    },
    {
        label: '1000Hz',
        value: 3
    },
    {
        label: '8000Hz',
        value: 4
    }
])
// 当前选中的回报率
const selectedReturnRate = ref(0)


// 休眠时间
const sleepTimeList = ref([
    {
        label: '30s',
        value: 0
    },
    {
        label: '1min',
        value: 1
    },
    {
        label: '2min',
        value: 2
    },
    {
        label: '3min',
        value: 3
    },
    {
        label: '5min',
        value: 4
    },
    {
        label: '10min',
        value: 5
    },
    {
        label: '30min',
        value: 6
    }
])
// 当前选中的休眠时间
const selectedSleepTime = ref(0)


// 按键去抖
const debounceTimeList = ref([
    {
        label: '0ms',
        value: 0
    },
    {
        label: '1ms',
        value: 1
    },
    {
        label: '2ms',
        value: 2
    },
    {
        label: '4ms',
        value: 3
    },
    {
        label: '8ms',
        value: 4
    },
    {
        label: '15ms',
        value: 5
    },
    {
        label: '20ms',
        value: 6
    },
])
// 当前选中的按键去抖时间
const selectedDebounceTime = ref(0)



//  Lod静默高度
const lodSilentHeight = ref(0.5)

</script>

<template>
    <div class="scroll-container">
        <div class="performance-settings">
            <div class="setting-lr">
                <div>
                    <div>固件电竞模式</div>
                    <div>开启后，鼠标将以电竞模式运行，适合高响应需求场景</div>
                </div>
                <div>
                    <a-switch />
                </div>
            </div>
            <div class="setting-lr">
                <div>
                    <div>波纹控制</div>
                    <div>修正直线移动鼠标时的偏移抖动，变成绝对直线移动，适用于设计绘图</div>
                </div>
                <div>
                    <a-switch />
                </div>
            </div>
            <div class="setting-lr">
                <div>
                    <div>移动同步</div>
                    <div>对鼠标移动进行圆滑算法修正,移动轨迹更准确，增加微小延迟</div>
                </div>
                <div>
                    <a-switch />
                </div>
            </div>
            <div class="setting-lr">
                <div>
                    <div>直线修正</div>
                    <div>鼠标在移动的时候会进行直线修正</div>
                </div>
                <div>
                    <a-switch />
                </div>
            </div>
            <div class="setting-rd">
                <div>
                    <div>休眠设置(分钟)</div>
                    <div>在2.4G和蓝牙模式下，设备空闲指定时间后会自动进入休眠状态</div>
                </div>
                <div class="setting-rd-item">
                    <el-segmented v-model="selectedSleepTime" :options="sleepTimeList" />
                </div>
            </div>
            <div class="setting-rd">
                <div>
                    <div>回报率设置(Hz)</div>
                    <div>较高的键盘回报率，可以减少输入延迟的影响</div>
                </div>
                <div class="setting-rd-item">
                    <el-segmented v-model="selectedReturnRate" :options="returnRateList" />
                </div>
            </div>
            <div class="setting-rd">
                <div>
                    <div>按键去抖</div>
                    <div>降低按键按下去的抖动效果</div>
                </div>
                <div class="setting-rd-item">
                    <el-segmented v-model="selectedDebounceTime" :options="debounceTimeList" />
                </div>
            </div>
            <div class="setting-rd">
                <div>
                    <div>LOD静默高度</div>
                    <div>鼠标离开桌面停止运动的距离</div>
                </div>
                <div class="silent-height">
                    <div>
                        <div>
                            <a-slider v-model:value="lodSilentHeight" :min="0" :max="1" :step="0.01" />
                        </div>
                        <div>
                            <a-input-number v-model:value="lodSilentHeight" :min="0" :max="1" :step="0.01" />
                        </div>
                    </div>
                    <div>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" height="26" viewBox="0 0 72 36">
                                <path fill="currentColor"
                                    d="M40.02.051c10.57-.49 22.318 2 29.422 10.403 3.715 3.932 3.183 9.605-.968 13.41-2.183 1.587-4.318 1.938-7.344 1.938a6501 6501 0 0 1-51.501 0c-4.089-.599-8.313-3.273-9.535-7.393q-.464-2.38 1.377-3.926a90 90 0 0 1 7.852-5.457q.625-2.586 2.856-4.028c2.054-1.45 4.921-2.122 7.292-1.07C25.882 1.184 33.131.516 40.02.051m4.487 10.046a72.2 72.2 0 0 0-19.989 2.14A708 708 0 0 0 1.674 18.46c1.466 3.047 3.984 4.927 7.14 5.66 9.176-.034 39.397-.09 52.49-.1 2.257-.002 4.676-.106 6.352-1.619 1.786-1.61 2.795-4.06 2.857-6.541-8.952 0-17.077-5.106-26.006-5.762M25.54 3.519q-1.468.406-2.958.866a77.8 77.8 0 0 0-19.479 10.81 6.8 6.8 0 0 0-1.53 1.582l.102.101a574 574 0 0 1 23.457-6.424q.56-3.45.816-6.935zm32.023.56a46.8 46.8 0 0 0-18.97-2.345q-5.55.366-11.015 1.376-.397 3.47-.816 6.935c10.084-1.778 18.34-2.728 28.351.56q4.017 1.357 8.057 2.653c2.251.582 4.201 1.127 6.773 1.127C67.37 9.243 63.026 6.121 57.562 4.08m-40.488.766q-3.417.408-5.712 3.008a232 232 0 0 1 5.814-2.856q.185-.169-.102-.152" />
                            </svg>
                        </div>
                        <div class="line-shape" :style="{ height: lodSilentHeight * 10 + 'px' }"></div>
                        <div></div>
                    </div>
                </div>
            </div>
            <div class="setting-rd">
                <div>
                    <div>传感器旋转</div>
                    <div>通过调整传感器角度与握持方式匹配，实现更精准的移动控制</div>
                </div>
                <div class="rotation-angle">
                    <div>
                        <div>-</div>
                        <div>
                            <div>
                                <img src="../../../assets/icon/angle.svg" alt="">
                            </div>
                        </div>
                        <div>+</div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style lang="scss" scoped>
.scroll-container {
    width: 100%;
    height: calc(100vh - 62px);
    overflow-y: auto;
    box-sizing: border-box;
}

.performance-settings {
    width: 100%;
    box-sizing: border-box;
    column-count: 2;
    column-gap: 12px;


    >div {
        padding: 24px;
        box-sizing: border-box;
        width: 100%;
        border-radius: var(--globalRadius);
        color: var(--theme-font-color);
        background: var(--theme-fun-bgcolor);
        backdrop-filter: blur(var(--funAreaRadius));
        border: 1px solid var(--theme-border-color);
        animation: bounce-in 0.5s;
        margin-bottom: 12px;
        break-inside: avoid;

        /* 防止内容被拆分到两列 */
        >div:nth-of-type(1) {
            display: flex;
            flex-direction: column;
            gap: 4px;

            >div:nth-of-type(1) {
                font-size: 16px;
                color: var(--theme-font-color);
                font-weight: 500;
            }

            >div:nth-of-type(2) {
                font-size: 13px;
                color: var(--theme-font-color-small);
            }
        }
    }

    .setting-rd {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .setting-lr {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
    }

}

.setting-rd-item {
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

.silent-height {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;

    >div:nth-of-type(1) {
        width: 100%;
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;

        >div:nth-of-type(1) {
            width: 100%;
        }

        >div:nth-of-type(2) {
            width: 100px;
        }
    }

    div:nth-of-type(2) {
        width: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;

        >div:nth-of-type(1) {
            width: 100%;
            // height: 80px;
            position: relative;
            z-index: 9;
            display: flex;
            justify-content: center;
            align-items: flex-end;
        }

        >div:nth-of-type(2) {
            width: 2px;
            height: 30px;
            background: #000;
            position: relative;
            margin: -7px auto 0;
            transition: height 0.3s;

            &::before {
                content: "";
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 10px;
                height: 2px;
                background: #000;
            }

            &::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 10px;
                height: 2px;
                background: #000;
            }
        }

        >div:nth-of-type(3) {
            width: 100%;
            border-bottom: 1px dotted #000;
        }
    }
}

.rotation-angle {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    >div {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
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