<!-- 皮肤设置 -->
<script setup>
import { onMounted, reactive, toRefs, ref, watch, computed } from 'vue'
import { ArrowLeftOutlined, CheckOutlined, PictureOutlined } from '@ant-design/icons-vue';
import { useStore } from '../stores/index.js'
const defineStore = useStore()
const { deviceStatus, previousDeviceStatus, bgSettings: globalBgSettings } = toRefs(defineStore)
import { useAppTheme } from '../utils/useAppTheme.js'
const theme = useAppTheme()
const { store } = theme
import bgImageData from '../utils/wallpaperData.js'
import defaultWallpaper from '@renderer/assets/icon.png'
import isElectron from "../utils/event";
import { ArrowDownBold } from '@element-plus/icons-vue'
import vueColorPicker from '../components/commons/vueColorPicker.vue'
import slider from '../components/commons/slider.vue'


let fileList = reactive([]);// 上传文件列表-主屏图片
const selectedFiles = ref([]); // 用户选择的文件列表-主屏图片


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


// 背景设置相关数据
const bgSettings = ref({
    brightness: Math.round(globalBgSettings.value.bgBrightness * 100),
    fuzziness: globalBgSettings.value.bgFuzziness,
    opacity: Math.round(globalBgSettings.value.bgOpacity * 100),
    radius: Math.round(globalBgSettings.value.bgRadius),
    bgArea: globalBgSettings.value.bgArea,
})



// 保存设置到本地存储
const saveSystemStyle = () => {
    // 过滤掉 auto 键，只保留 light 和 dark
    const { auto, ...validCustomFontColor } = globalBgSettings.value.customFontColor

    const settings = {
        bgBrightness: globalBgSettings.value.bgBrightness,
        bgFuzziness: globalBgSettings.value.bgFuzziness,
        bgOpacity: globalBgSettings.value.bgOpacity,
        bgRadius: globalBgSettings.value.bgRadius,
        bgImages: globalBgSettings.value.bgImages,
        bgArea: globalBgSettings.value.bgArea,
        customFontColor: validCustomFontColor,
    }
    localStorage.setItem('systemStyle', JSON.stringify(settings))
}

// 恢复默认字体颜色
const restoreDefaultColor = () => {
    const key = selectKeyType.value === 'auto' ? theme.value : selectKeyType.value
    if (key === 'light') {
        globalBgSettings.value.customFontColor.light = '#000000'
    } else if (key === 'dark') {
        globalBgSettings.value.customFontColor.dark = '#FFFFFF'
    }
    saveSystemStyle()
}

// 统一处理背景设置的函数
const updateBgSettings = (type, val) => {
    // 根据类型处理不同的值
    const processedVal = type === 'area' || type === 'fuzziness' || type === 'radius' ? val : val / 100

    // 使用对象映射简化更新逻辑
    const keyMap = {
        brightness: 'bgBrightness',
        fuzziness: 'bgFuzziness',
        opacity: 'bgOpacity',
        radius: 'bgRadius',
        area: 'bgArea'
    }
    globalBgSettings.value[keyMap[type]] = processedVal

    // 保存设置
    saveSystemStyle()
}



// 背景亮度按钮
const bgBrightnessBtn = (val) => {
    updateBgSettings('brightness', val)
}

// 背景模糊度按钮
const bgFuzzinessBtn = (val) => {
    updateBgSettings('fuzziness', val)
}

// 背景透明度按钮
const bgOpacityBtn = (val) => {
    updateBgSettings('opacity', val)
}

// 背景圆角按钮
const bgRadiusBtn = (val) => {
    updateBgSettings('radius', val)
}

// 背景面积按钮
const bgAreaBtn = (val) => {
    updateBgSettings('area', val)
}



// 切换返回
const changeBack = () => {
    deviceStatus.value = previousDeviceStatus.value
}

// 选择壁纸按钮
const selectWallpaperBtn = (item) => {
    if (item) {
        // 点击了具体的壁纸
        console.log('点击了具体的壁纸:', item)
        globalBgSettings.value.bgImages = {
            id: item.id,
            bgImageUrl: item.imageUrl
        }
    } else {
        // 点击了默认壁纸
        console.log('点击了默认壁纸')
        globalBgSettings.value.bgImages = {
            id: 0,
            bgImageUrl: ''
        }
    }
    saveSystemStyle()
}



// 字体颜色预设
const colorPresets = ref([
    {
        color: '#FFFFFF'
    },
    {
        color: '#000000'
    },
    {
        color: '#FF0000'
    },
    {
        color: '#FF7200'
    },
    {
        color: '#FFFF00'
    },
    {
        color: '#00FF00'
    },
    {
        color: '#EE00F1'
    },
    {
        color: '#FF008A'
    },
    {
        color: '#0000FF'
    },
])

// RGB颜色值
const rVal = ref(255);
const gVal = ref(255);
const bVal = ref(255);
const HexColorVal = ref('#000000');

// 颜色选择器下拉控制
const showColorDropdown = ref(false)
const isColorInteracting = ref(false)
// 颜色选择器下拉控制事件
const handleColorOpenChange = (val) => {
    if (!val && isColorInteracting.value) {
        return
    }
    showColorDropdown.value = val
}
// 颜色选择器鼠标抬起事件
const onColorMouseUp = () => {
    setTimeout(() => {
        isColorInteracting.value = false
    }, 100)
}
// 颜色选择器点击事件
const onColorMouseDown = () => {
    isColorInteracting.value = true
    window.addEventListener('mouseup', onColorMouseUp, { once: true })
}
// 颜色选择器颜色改变事件
const handleColorPickerChange = (val) => {
    const key = selectKeyType.value === 'auto' ? theme.value : selectKeyType.value
    globalBgSettings.value.customFontColor[key] = val
    saveSystemStyle()
}
// 字体颜色按钮
const fontColorBtn = (item) => {
    const key = selectKeyType.value === 'auto' ? theme.value : selectKeyType.value
    globalBgSettings.value.customFontColor[key] = item.color
    saveSystemStyle()
}

//校验数字
const validateNumberColor = (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
        return 255;
    }
    return value;
};

// Hex转RGB
const hexToRgb = (hex) => {
    let c = hex.substring(1).split('');
    if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return {
        r: (c >> 16) & 255,
        g: (c >> 8) & 255,
        b: c & 255
    };
}

// RGB转Hex
const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// 获取当前激活的颜色Key
const activeColorKey = computed(() => selectKeyType.value === 'auto' ? theme.value : selectKeyType.value)

// 监听全局颜色设置变化，同步到本地输入框
watch(() => globalBgSettings.value.customFontColor?.[activeColorKey.value], (newVal) => {
    if (!newVal) return;

    // 更新Hex
    if (HexColorVal.value !== newVal) {
        HexColorVal.value = newVal;
    }

    // 更新RGB
    if (newVal.startsWith('#')) {
        const rgb = hexToRgb(newVal);
        if (rVal.value !== rgb.r) rVal.value = rgb.r;
        if (gVal.value !== rgb.g) gVal.value = rgb.g;
        if (bVal.value !== rgb.b) bVal.value = rgb.b;
    }
}, { immediate: true, deep: true });

// 校验并同步Hex到全局
const validateHexColor = () => {
    const hex = HexColorVal.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        globalBgSettings.value.customFontColor[activeColorKey.value] = hex;
        saveSystemStyle();
    } else if (/^#[0-9A-F]{3}$/i.test(hex)) {
        const expanded = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        HexColorVal.value = expanded;
        globalBgSettings.value.customFontColor[activeColorKey.value] = expanded;
        saveSystemStyle();
    } else {
        HexColorVal.value = globalBgSettings.value.customFontColor[activeColorKey.value];
    }
}

// 监听RGB变化，同步到全局
watch([rVal, gVal, bVal], ([nR, nG, nB]) => {
    if (
        typeof nR !== 'number' || isNaN(nR) ||
        typeof nG !== 'number' || isNaN(nG) ||
        typeof nB !== 'number' || isNaN(nB)
    ) {
        return;
    }
    const newHex = rgbToHex(nR, nG, nB);
    if (newHex !== globalBgSettings.value.customFontColor?.[activeColorKey.value]) {
        globalBgSettings.value.customFontColor[activeColorKey.value] = newHex;
        saveSystemStyle();
    }
})


// 文件处理逻辑
const handleBeforeUpload = async (file) => {
    console.log(file);

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/avif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        console.log("文件格式不正确");
        return false;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        console.log("文件大于2M");
        return false;
    }
    // 读取文件并生成预览地址
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const obj = {
            type: 2,
            imageData: reader.result
        }
        // const data = await addOtherWallpaperData(obj, 3)
        // selectedFiles.value = data?.wallpaperData;
    };
    console.log(fileList, selectedFiles.value);

    // 返回 false 阻止默认上传行为
    return false;
};


</script>

<template>
    <div class="skin-container">
        <div class="skin-back">
            <div @click="changeBack">
                <ArrowLeftOutlined />
                <div>返回</div>
            </div>
        </div>
        <div class="skin-content">
            <div>
                <div>
                    <div class="skin-item">
                        <div class="theme-style">
                            <div>
                                <div class="title">主题</div>
                                <div>
                                    <div class="theme-select">
                                        <el-segmented v-model="selectKeyType" :options="options" @change="themeBtn" />
                                    </div>
                                </div>
                            </div>
                            <div class="base-color">
                                <div>
                                    <div class="title">自定义字体颜色</div>
                                    <div @click="restoreDefaultColor">恢复默认</div>
                                </div>
                                <div>
                                    <a-dropdown :trigger="['click']" :destroyPopupOnHide="true" placement="bottomLeft"
                                        :open="showColorDropdown" @openChange="handleColorOpenChange">
                                        <div>
                                            <div
                                                :style="{ backgroundColor: globalBgSettings.customFontColor?.[selectKeyType === 'auto' ? theme : selectKeyType] || '#000000' }">
                                            </div>
                                            <div>
                                                <el-icon>
                                                    <ArrowDownBold />
                                                </el-icon>
                                            </div>
                                            <div>{{ globalBgSettings.customFontColor?.[selectKeyType === 'auto' ?
                                                theme : selectKeyType] || '#000000'
                                                }}</div>
                                        </div>
                                        <template #overlay>
                                            <div class="color-selection" @click.stop @mousedown.stop="onColorMouseDown">
                                                <div>
                                                    <vueColorPicker
                                                        v-model="globalBgSettings.customFontColor[selectKeyType === 'auto' ? theme : selectKeyType]"
                                                        @change="handleColorPickerChange" />
                                                </div>
                                                <div>
                                                    <div>
                                                        <div>Hex</div>
                                                        <div>
                                                            <input type="text" v-model="HexColorVal"
                                                                @blur="validateHexColor" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div>RGB</div>
                                                        <div>
                                                            <a-input-number v-model:value="rVal" :bordered="false"
                                                                :min="0" :max="255"
                                                                @blur="rVal = validateNumberColor(rVal)" />
                                                            <a-input-number v-model:value="gVal" :bordered="false"
                                                                :min="0" :max="255"
                                                                @blur="gVal = validateNumberColor(gVal)" />
                                                            <a-input-number v-model:value="bVal" :bordered="false"
                                                                :min="0" :max="255"
                                                                @blur="bVal = validateNumberColor(bVal)" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </a-dropdown>
                                    <div>
                                        <div v-for="item in colorPresets" :key="item.color"
                                            :style="{ backgroundColor: item.color }" @click="fontColorBtn(item)">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="skin-item">
                        <div class="title">系统自定义</div>
                        <div class="custom-content">
                            <div>
                                <slider title="UI全局圆角" v-model:sliderValue="bgSettings.radius" :sliderMax="20"
                                    :sliderMin="0" :sliderStep="1" :sliderShowTooltip="false"
                                    @update:sliderValue="bgRadiusBtn" />
                            </div>
                            <div>
                                <slider title="毛玻璃效果" v-model:sliderValue="bgSettings.bgArea" :sliderMax="40"
                                    :sliderMin="0" :sliderStep="1" :sliderShowTooltip="false"
                                    @update:sliderValue="bgAreaBtn" />
                            </div>
                            <div v-if="isElectron">
                                <slider title="系统透明度" v-model:sliderValue="bgSettings.opacity" :sliderMax="100"
                                    :sliderMin="40" :sliderStep="5" :sliderShowTooltip="false"
                                    @update:sliderValue="bgOpacityBtn" />
                            </div>
                        </div>
                    </div>
                    <div class="skin-item">
                        <div class="title">壁纸自定义</div>
                        <div class="custom-content">
                            <div>
                                <slider title="背景模糊度" v-model:sliderValue="bgSettings.fuzziness" :sliderMax="20"
                                    :sliderMin="0" :sliderStep="0.5" :sliderShowTooltip="false"
                                    @update:sliderValue="bgFuzzinessBtn" />
                            </div>
                            <div>
                                <slider title="背景亮度" v-model:sliderValue="bgSettings.brightness" :sliderMax="150"
                                    :sliderMin="10" :sliderStep="5" :sliderShowTooltip="false"
                                    @update:sliderValue="bgBrightnessBtn" />
                            </div>
                        </div>
                    </div>
                    <div class="skin-item">
                        <div class="title">背景自定义</div>
                        <div class="background-wallpaper">
                            <div>
                                <div @click="selectWallpaperBtn('')">
                                    <div class="default-wallpaper"
                                        :class="{ 'is-selected': globalBgSettings.bgImages.id === 0 }">
                                        <img :src="defaultWallpaper" alt="">
                                        <div class="select-the-style" v-if="globalBgSettings.bgImages.id === 0">
                                            <CheckOutlined />
                                        </div>
                                    </div>
                                    <div>默认</div>
                                </div>
                                <div v-for="item in bgImageData" :key="item.id" @click="selectWallpaperBtn(item)">
                                    <div :class="{ 'is-selected': globalBgSettings.bgImages.id === item.id }">
                                        <img :src="item.imageUrl" alt="">
                                        <div class="select-the-style" v-if="globalBgSettings.bgImages.id === item.id">
                                            <CheckOutlined />
                                        </div>
                                    </div>
                                    <div>{{ item.title }}</div>
                                </div>
                                <div>
                                    <div class="default-wallpaper"
                                        :class="{ 'is-selected': globalBgSettings.bgImages.id === 10 }">
                                        <el-upload class="upload-demo" drag v-model:file-list="fileList"
                                            :show-file-list="true" :before-upload="handleBeforeUpload"
                                            accept=".jpg,.jpeg,.png,.avif,.webp,.bmp">
                                            <div class="upload-icon">
                                                <PictureOutlined />
                                            </div>
                                        </el-upload>
                                        <div class="select-the-style" v-if="globalBgSettings.bgImages.id === 10">
                                            <CheckOutlined />
                                        </div>
                                    </div>
                                    <div>自定义</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.skin-container {
    width: 100%;
    height: calc(100vh - 50px);
    padding: 24px;
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    position: relative;
    background: transparent;

    .skin-back {
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

    .skin-content {
        flex: 1 1 auto;
        height: 100%;

        >div {
            width: 100%;
            height: 100%;
            overflow: auto;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            align-content: flex-start;
            flex-direction: column;

            >div:nth-of-type(1) {
                width: 100%;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                align-content: flex-start;
                justify-content: center;

                .skin-item {
                    width: clamp(700px, 64%, 1200px);
                    padding: 24px;
                    box-sizing: border-box;
                    background: var(--theme-fun-bgcolor);
                    backdrop-filter: blur(var(--funAreaRadius));
                    border-radius: var(--globalRadius);
                    border: 1px solid var(--theme-border-color);
                    animation: bounce-in 0.5s;
                    overflow: hidden;

                    .title {
                        font-size: 15px;
                        font-weight: 600;
                        color: var(--theme-font-color);
                        margin-bottom: 12px;
                    }

                    >div:not(.title, .background-wallpaper) {
                        display: flex;
                        // justify-content: space-between;
                        align-items: center;
                        font-size: 14px;
                        color: var(--theme-font-color);
                        // padding: 8px 0;
                    }

                    :deep(.ant-switch-checked) {
                        background-color: var(--el-color-primary);
                    }
                }
            }
        }
    }
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
        top: 1px;
    }
}

.custom-content {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 70px;
    flex-wrap: wrap;
    align-content: flex-start;

    >div {
        width: 200px;

        >div:nth-of-type(1) {
            /* display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: var(--theme-font-color);
            margin-bottom: 4px; */
        }

        >div:nth-of-type(2) {
            /* :deep(.slider-button) {
                width: 14px;
                height: 14px;
            } */

            /* :deep(.slider-bar) {
                height: 6px;
                background: var(--el-color-primary);
            }

            :deep(.slider-runway) {
                height: 5px;
            } */
        }
    }
}

.background-wallpaper {
    width: 100%;
    max-height: 500px;
    overflow: auto;

    >div {
        width: 100%;
        display: grid;
        gap: 12px 24px;
        grid-template-columns: repeat(4, 1fr);

        >div {

            >div:nth-of-type(1):not(.default-wallpaper) {
                container-type: inline-size;
                width: 100%;
                aspect-ratio: 16 / 9;
                overflow: hidden;
                border-radius: var(--globalRadius);
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.25s ease-in-out;
                position: relative;

                &:hover {
                    border: 2px solid var(--theme-fun-hover-bgcolor);
                    background-color: var(--theme-fun-hover-bgcolor);
                    transition: all 0.25s ease-in-out;

                    img {
                        opacity: 0.5;
                        transition: all 0.25s ease-in-out;
                    }
                }

                &.is-selected {
                    border: 2px solid var(--theme-fun-hover-bgcolor);
                }

                >img {
                    width: 100%;
                    height: 100%;
                    transition: all 0.25s ease-in-out;
                }

                .select-the-style {
                    position: absolute;
                    bottom: 6px;
                    right: 6px;
                    width: 10cqw;
                    height: 10cqw;
                    font-size: 5cqw;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: var(--globalRadius);
                    color: var(--theme-font-color);
                    background-color: var(--theme-fun-select-bgcolor);
                    overflow: hidden;
                }
            }

            .default-wallpaper {
                container-type: inline-size;
                background-color: var(--theme-fun-bgcolor);
                width: 100%;
                aspect-ratio: 16 / 9;
                overflow: hidden;
                border-radius: var(--globalRadius);
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                border: 2px solid transparent;
                transition: all 0.25s ease-in-out;
                position: relative;

                &:hover {
                    border: 2px solid var(--theme-fun-hover-bgcolor);
                    background-color: var(--theme-fun-hover-bgcolor);
                    transition: all 0.25s ease-in-out;

                    img {
                        opacity: 0.5;
                        transition: all 0.25s ease-in-out;
                    }
                }

                &.is-selected {
                    border: 2px solid var(--theme-fun-hover-bgcolor);
                }


                >img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    transition: all 0.25s ease-in-out;
                }

                .select-the-style {
                    position: absolute;
                    bottom: 6px;
                    right: 6px;
                    width: 10cqw;
                    height: 10cqw;
                    font-size: 5cqw;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: var(--globalRadius);
                    color: var(--theme-font-color);
                    background-color: var(--theme-fun-select-bgcolor);
                    overflow: hidden;
                }

            }

            >div:nth-of-type(2) {
                padding: 8px 0;
                box-sizing: border-box;
                font-size: 14px;
                color: var(--theme-font-color);
                text-align: center;
            }
        }
    }
}

.theme-style {
    width: 100%;
    display: flex;
    gap: 70px;

    .base-color {


        >div:nth-of-type(1) {
            display: flex;
            justify-content: space-between;
            align-items: center;

            >div:nth-of-type(2) {
                font-size: 12px;
                color: var(--theme-font-color);
                background-color: var(--theme-fun-select-bgcolor);
                padding: 4px 10px;
                margin-bottom: 12px;
                border-radius: var(--globalRadius);
                cursor: pointer;
            }
        }

        >div:nth-of-type(2) {
            display: flex;
            flex-direction: column;
            gap: 12px;

            >div:nth-of-type(1) {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;

                >div:nth-of-type(1) {
                    width: 20px;
                    height: 20px;
                    border-radius: var(--globalRadius);
                }
            }

            >div:nth-of-type(2) {
                display: flex;
                align-items: center;
                gap: 12px;

                >div {
                    width: 20px;
                    height: 20px;
                    border-radius: var(--globalRadius);
                    cursor: pointer;
                }
            }
        }
    }
}

.color-selection {
    padding: 12px;
    border-radius: var(--globalRadius);
    box-sizing: border-box;
    will-change: backdrop-filter;
    backdrop-filter: blur(10px);
    // background-color: var(--theme-fun-bgcolor);
    background-color: var(--theme-fun-popup-bgcolor);
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: bounce-in 0.3s;
    border: 2px solid var(--theme-fun-bgcolor);

    >div:nth-of-type(2) {
        display: flex;
        flex-direction: column;
        gap: 12px;

        >div:nth-of-type(1) {

            display: flex;
            align-items: center;
            gap: 20px;

            >div:nth-of-type(1) {
                font-size: 14px;
                color: var(--theme-font-color);
            }

            >div:nth-of-type(2) {
                width: 100%;

                >input {
                    width: 100%;
                    height: 30px;
                    border-radius: 4px 4px 4px 4px;
                    border: 1px solid var(--theme-border-color);
                    color: var(--theme-font-color);
                    font-size: 14px;
                    text-align: center;
                    background-color: transparent;
                    border-radius: var(--globalRadius);
                }

                :focus {
                    outline: none;
                }
            }
        }

        >div:nth-of-type(2) {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 20px;

            >div:nth-of-type(1) {
                font-size: 14px;
                color: var(--theme-font-color);
            }

            >div:nth-of-type(2) {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            :deep(.ant-input-number-handler-wrap) {
                width: 32px !important;
                display: none;
            }


            :deep(.ant-input-number-input) {
                width: 60px;
                height: 30px;
                border-radius: 4px;
                border: 1px solid var(--theme-border-color);
                color: var(--theme-font-color);
                font-size: 14px;
                text-align: center;
                border-radius: var(--globalRadius);
            }

        }
    }
}

.upload-demo {
    width: 100%;
    height: 100%;

    :deep(.el-upload.is-drag) {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :deep(.el-upload-dragger) {
        border-radius: 0;
        border: none;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
    }

    .upload-icon {
        font-size: 50px;
        color: var(--theme-font-color);
    }
}

:deep(:where(.css-dev-only-do-not-override-209ftt).ant-input-number) {
    width: 60px !important;
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