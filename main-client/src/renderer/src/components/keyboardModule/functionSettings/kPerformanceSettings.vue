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


</script>

<template>
    <div class="performance-settings">
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
        <div class="setting-lr">
            <div>
                <div>超低延迟模式</div>
                <div>开启低延迟模式，对轴体有一定要求。(如按键
                    出现双击，建议关闭超低延迟模式)</div>
            </div>
            <div>
                <a-switch />
            </div>
        </div>
        <div class="setting-lr">
            <div>
                <div>交换WASD</div>
                <div>交换WASD开启后，将切换WASD按和方向键</div>
            </div>
            <div>
                <a-switch />
            </div>
        </div>
        <div class="setting-lr">
            <div>
                <div>全键无冲突</div>
                <div>全键无冲突，操作零延迟，按键精准响应</div>
            </div>
            <div>
                <a-switch />
            </div>
        </div>
        <div class="setting-lr">
            <div>
                <div>切换Mac操作模式</div>
                <div>开启后将切换成Mac操作模式，Mac模式下按键设置将失效</div>
            </div>
            <div>
                <a-switch />
            </div>
        </div>
        <div class="setting-lr">
            <div>
                <div>Win键锁定</div>
                <div>开启后Win键将被锁定，防止误触</div>
            </div>
            <div>
                <a-switch />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.performance-settings {
    width: 100%;
    height: calc(100vh - 62px);
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
        animation: bounce-in 0.5s;
        margin-bottom: 12px;
        break-inside: avoid;
        border: 1px solid var(--theme-border-color);

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
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .setting-lr {
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
</style>