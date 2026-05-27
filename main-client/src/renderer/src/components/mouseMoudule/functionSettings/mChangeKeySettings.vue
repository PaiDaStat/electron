<!-- 鼠标按键切换设置组件 -->
<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import GK8Img from '../../../assets/deviceImg/a7pro.png'


// 按键分类
const keyTypeList = ref([
    {
        label: '系统',
        value: 0
    },
    {
        label: '键盘',
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

</script>

<template>
    <div class="change-key-settings">
        <div>
            <div>
                <el-input v-model="keyboardSearch" style="width: 100%" placeholder="搜索" clearable
                    :prefix-icon="Search" />
            </div>
            <div class="key-type-segmented">
                <el-segmented v-model="keyType" :options="keyTypeList" />
            </div>
            <div></div>
        </div>
        <div>
            <div>
                <img :src="GK8Img" alt="">
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.change-key-settings {
    width: 100%;
    height: calc(100vh - 62px);
    box-sizing: border-box;
    display: flex;
    overflow: hidden;
    gap: 12px;

    >div:nth-of-type(1) {
        width: 100%;
        flex: 1;
        border-radius: var(--globalRadius);
        background: var(--theme-fun-bgcolor);
        backdrop-filter: blur(var(--funAreaRadius));
        border: 1px solid var(--theme-border-color);
        animation: bounce-in 0.5s;
        padding: 24px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 12px;

        >div:nth-of-type(1) {
            padding: 0 24px;
            box-sizing: border-box;
        }

        .key-type-segmented {
            padding: 0 24px;
            box-sizing: border-box;

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
    }

    >div:nth-of-type(2) {
        width: 100%;
        flex: 2;

        >div {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;

            >img {
                max-width: 80%;
                max-height: 50%;
                width: auto;
                height: auto;
                object-fit: contain;
            }
        }
    }
}
</style>