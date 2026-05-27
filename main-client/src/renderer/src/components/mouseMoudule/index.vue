<script setup>
import { onMounted, ref, toRefs, computed } from 'vue';
import { useStore } from '../../stores/index'
let defineStore = useStore()
// let { currentDeviceInfo } = toRefs(defineStore)
import { px2rem } from '../../utils/px2rem'
import changekeyIcon from '../../assets/icon.png'
import { SettingOutlined, BulbOutlined, TableOutlined, ControlOutlined ,CodeOutlined,DragOutlined} from '@ant-design/icons-vue';

// let menuAuthArr = ref(currentDeviceInfo?.value.menuAuth)
let menuAuthArr = ref([
    "changekey",
    "lighting",
    "macro",
    "mDPI",
    "performance",
    "other",
])

const props = defineProps({
    selectedKey: {
        type: String,
        default: 'lighting'
    }
})
// 键盘模块功能组件列表
const functionList = computed(() => [
    { icon: TableOutlined, title: "改键设置", key: 'changekey' },
    { icon: BulbOutlined, title: "灯光设置", key: 'lighting' },
    { icon: CodeOutlined, title: "宏设置", key: 'macro' },
    { icon: ControlOutlined, title: "性能设置", key: 'performance' },
    { icon: DragOutlined, title: "DPI设置", key: 'mDPI' },
    { icon: SettingOutlined, title: "其他设置", key: 'other' },
])

const currentFunctionList = computed(() =>
    functionList.value.filter(item => menuAuthArr.value.includes(item.key))
)

const activeIndex = computed(() => {
    return currentFunctionList.value.findIndex(item => item.key === props.selectedKey)
})

const stepRem = computed(() => px2rem(58))
const topPos = computed(() => `${activeIndex.value * stepRem.value}rem`)

const emit = defineEmits(['select'])
</script>

<template>
    <div class="moudule">
        <div class="active-bg" :style="{ top: topPos }" v-if="activeIndex !== -1">
            <div class="rely-on"></div>
        </div>
        <div class="function-list" v-for="item in currentFunctionList" @click="emit('select', item.key)"
            :class="{ 'function-list-active': selectedKey === item.key }">
            <div>
                <img v-if="typeof item.icon === 'string'" :src="item.icon" alt="">
                <component v-else :is="item.icon" />
            </div>
            <div>{{ item.title }}</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.moudule {
    width: 100%;
    padding: 0 12px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .active-bg {
        position: absolute;
        left: 12px;
        right: 12px;
        height: 46px;
        background: var(--el-color-primary);
        border-radius: var(--globalRadius);
        transition: all 0.2s ease-in-out;
        z-index: 0;

        .rely-on {
            position: absolute;
            width: 5px;
            height: 36px;
            background: var(--el-color-primary);
            border-radius: 0px 100px 100px 0px;
            border: 1px solid var(--el-color-primary);
            left: -12px;
            top: 5px;
        }
    }

    .function-list {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        height: 46px;
        border-radius: var(--globalRadius);
        padding-left: 12px;
        box-sizing: border-box;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        font-size: 14px;
        color: var(--theme-font-color);
        position: relative;
        z-index: 1;
        line-height: 16px;


        &:hover {
            transition: all 0.2s ease-in-out;
        }

        >div:nth-of-type(1) {
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;

            >img {
                width: 24px;
                height: 24px;
            }
        }
    }

    .function-list-active {
        transition: all 0.2s ease-in-out;
        color: #FFFFFF;

        >div:nth-of-type(1) {
            >img {
                filter: grayscale(100%) brightness(1000%) contrast(100%);
            }
        }
    }
}
</style>
