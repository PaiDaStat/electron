<script setup>
import { computed, toRefs, ref, onMounted } from 'vue'
import isElectron from "../../utils/event";
import { useStore } from '../../stores/index.js'
const defineStore = useStore()
const { deviceConfig } = toRefs(defineStore)
import { useKeyBoardStore } from '../../stores/useKeyBoardStore.js'
const keyBoardStore = useKeyBoardStore()
// const { defaultKeyMatrixInformation, basicDeviceInfo, keyLayout } = toRefs(keyBoardStore)
import { DeviceService } from '../../services/DeviceService.js'
import { px2rem } from '../../utils/px2rem.js'
import { mapCurrentKeysToLayout } from '../../utils/keyboard.js'
import { keyboardKeyArray } from '../../utils/keyboardKeyArray.js'
import OPTIcon from '../../assets/keyIcon/opt-icon.webp'
import CMDIcon from '../../assets/keyIcon/cmd-icon.webp'

// Update store destructuring to include interactionType and other needed refs
// const { defaultKeyMatrixInformation, basicDeviceInfo, keyLayout } = toRefs(keyBoardStore)
const { defaultKeyMatrixInformation, basicDeviceInfo, keyLayout, interactionType, currentLayer, customBol, keyColorInformation, currentLightMatrix, currentPickColor } = toRefs(keyBoardStore)


const getKeyColor = (item, opacity = 0.7) => {
    // 1. 检查是否处于灯光反显模式 (interactionType === 2)
    if (interactionType.value === 2) {
        let sourceMatrix = null;

        // 2. 确定数据源
        // 情况A：自定义模式 (customBol === true)
        // 使用静态的 keyColorInformation 数据进行反显（通常用于显示用户选定的颜色配置）
        if (customBol.value) {
            if (keyColorInformation.value && keyColorInformation.value.length > 0) {
                sourceMatrix = keyColorInformation.value;
            }
        }
        // 情况B：实时灯光模式
        // 使用 currentLightMatrix 数据（通常是通过轮询从设备获取的实时灯光状态）
        else {
            if (currentLightMatrix.value && currentLightMatrix.value.length > 0) {
                sourceMatrix = currentLightMatrix.value;
            }
        }

        // 3. 解析颜色
        if (sourceMatrix) {
            // 必须拥有有效的 matrixIndex（物理索引）
            // 该索引由 mapCurrentKeysToLayout 通过 KeyCode 匹配计算得出
            if (item.matrixIndex !== undefined && item.matrixIndex !== -1) {
                let r, g, b;

                // 判断数据格式
                // 新格式：对象数组 [{R: 0, G: 0, B: 0}, ...] (十进制数值)
                // 旧格式：一维数组 ['00', 'FF', ...] (十六进制字符串)
                const isNewFormat = sourceMatrix.length > 0 && typeof sourceMatrix[0] === 'object';

                if (isNewFormat) {
                    if (item.matrixIndex < sourceMatrix.length) {
                        const color = sourceMatrix[item.matrixIndex];
                        if (color) {
                            r = color.R;
                            g = color.G;
                            b = color.B;
                        }
                    }
                } else {
                    // 灯光数据通常为 RGB 格式，每个按键占用 3 个字节
                    const idx = item.matrixIndex * 3;
                    // 边界检查，防止数组越界
                    if (idx + 2 < sourceMatrix.length) {
                        r = parseInt(sourceMatrix[idx], 16);
                        g = parseInt(sourceMatrix[idx + 1], 16);
                        b = parseInt(sourceMatrix[idx + 2], 16);
                    }
                }

                if (r !== undefined && g !== undefined && b !== undefined) {
                    if (r === 0 && g === 0 && b === 0) return `var(--keyboard-key-bg-color)`;
                    // 返回 RGBA 颜色，增加 0.5 透明度
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                }
            }
        }
    }
    return null;
}

// 获取按键图标
const keyIcons = keyboardKeyArray().flatMap(item => item.keys).reduce((acc, cur) => {
    if (cur.icon) {
        acc[cur.keyName] = cur.icon;
    }
    return acc;
}, {});
const getKeyIcon = (keyName) => keyIcons[keyName];

// 获取最终显示的图标（处理Mac层特殊图标）
const getFinalKeyIcon = (item) => {
    if (currentLayer.value === 1) {
        // 获取当前键值，优先使用 currentKeyCode
        const code = item?.currentKeyCode || item?.defaultKeyCode;
        if (code === '20 04 00' || code === '20 40 00') {
            return OPTIcon;
        }
        if (code === '20 08 00' || code === '20 80 00') {
            return CMDIcon;
        }
    }
    return item?.currentKeyIcon || getKeyIcon(item?.currentKeyName);
}

const pressColor = 'rgba(255, 0, 0, 0.4)'

// const keyLayout = ref(deviceConfig.value.keyLayoutArr)
//   :style="{ backgroundImage: `url(${backgroundImage})` }"



// 获取按键显示名称
const getKeyDisplayName = (item) => {
    // 检查 keyCode 是否以 70 或 71 开头 (宏)
    // 兼容数字类型的 keyID (如 70000)
    const keyCode = item?.currentKeyCode || item?.defaultKeyCode;
    if (keyCode) {
        const codeStr = String(keyCode);
        if (codeStr.startsWith('70') || codeStr.startsWith('71')) {
            return "宏"; // 后续可对接国际化 i18n
        }
    }
    return item?.currentKeyName?.replace(/——/g, ' ');
}

// 👉 新增：是否按住鼠标
const isMouseDown = ref(false)

// 👉 新增：标记颜色数据是否发生变化
const hasChanged = ref(false)

// 👉 原有点击选择功能
const handleClick = (item) => {
    // 1. 改键模式逻辑
    if (interactionType.value === 1) {
        keyLayout.value.forEach(item => item.isSelected = false)
        item.isSelected = !item.isSelected
        console.log(item);
        return;
    }

    // 2. 灯光模式逻辑
    if (interactionType.value === 2) {
        // 非自定义模式：禁止任何操作
        if (!customBol.value) return;

        // 自定义模式：应用当前选中颜色
        applyColorToKey(item);

        // 如果数据发生了变化，触发保存操作
        if (hasChanged.value) {
            handleCustomColorChange();
            hasChanged.value = false;
        }
        return;
    }

    // 3. 其他模式
    if (interactionType.value === 3) return;
}

// 👉 鼠标滑进键位（仅当按住鼠标时才生效）
const handleHover = (e, item) => {
    // 灯光模式处理
    if (interactionType.value === 2) {
        if (!customBol.value) return; // 非自定义模式禁止

        if (isMouseDown.value) {
            // 拖拽涂色
            applyColorToKey(item);
        }
        return;
    }

    if (interactionType.value === 1) {
        // 改键模式下，如果按键被修改过，显示tooltip
        if (item.currentKeyCode !== item.defaultKeyCode) {
            clearTimeout(tooltipTimer)
            const rect = e.currentTarget.getBoundingClientRect()

            // 边界检查，防止tooltip超出屏幕
            const windowWidth = window.innerWidth
            const tooltipHalfWidth = 60 // 预估半宽 + 安全边距
            let left = rect.left + rect.width / 2

            if (left < tooltipHalfWidth) left = tooltipHalfWidth
            else if (left > windowWidth - tooltipHalfWidth) left = windowWidth - tooltipHalfWidth

            tooltip.value = {
                visible: true,
                top: rect.top,
                left: left,
                item: item,
                keyWidth: rect.width
            }
        }
        return;
    }

    if (isMouseDown.value) {
        item._hoverPressed = true
    }
}

// 鼠标滑出键位，恢复正常
const handleLeave = (item) => {
    // 灯光模式下不需要恢复 _hoverPressed，因为颜色是直接应用到 keyColorInformation 的
    // 但为了保持其他模式逻辑，这里只在非灯光模式下操作
    if (interactionType.value !== 2) {
        item._hoverPressed = false
    }

    // 隐藏tooltip，增加延时以便鼠标可以移动到tooltip上
    if (interactionType.value === 1) {
        clearTimeout(tooltipTimer)
        tooltipTimer = setTimeout(() => {
            tooltip.value.visible = false
        }, 100)
    }
}

// 👉 鼠标松开处理
const handleMouseUp = () => {
    isMouseDown.value = false;

    // 如果是灯光自定义模式，松手时且数据发生变化才触发保存操作
    if (interactionType.value === 2 && customBol.value) {
        if (hasChanged.value) {
            handleCustomColorChange();
            hasChanged.value = false;
        }
    }
}

// 👉 新增：鼠标按下处理（修复拖拽起始位不着色问题）
const handleKeyMouseDown = (item) => {
    // 仅在灯光自定义模式生效
    if (interactionType.value === 2 && customBol.value) {
        isMouseDown.value = true;
        applyColorToKey(item);
    }
}



// Hex转RGB辅助函数
const hexToRgb = (hex) => {
    if (!hex) return { r: 0, g: 0, b: 0 };
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

// 辅助方法：将当前颜色应用到按键
const applyColorToKey = (item) => {
    // 确保有当前选择的颜色 (通常在 store 中维护 currentPickColor，如果不在 store 中请调整)
    const pickColor = currentPickColor.value || '#FFFFFF'; // 默认白色

    if (item.matrixIndex !== undefined && item.matrixIndex !== -1) {
        const { r, g, b } = hexToRgb(pickColor);

        // 确保 keyColorInformation 是数组
        if (!Array.isArray(keyColorInformation.value)) {
            keyColorInformation.value = [];
        }

        // 检查旧颜色和新颜色是否不同，避免不必要的更新
        const oldColor = keyColorInformation.value[item.matrixIndex];
        if (!oldColor || oldColor.R !== r || oldColor.G !== g || oldColor.B !== b) {
            // 直接更新数组中对应索引的对象
            keyColorInformation.value[item.matrixIndex] = { R: r, G: g, B: b };
            hasChanged.value = true;
        }
    }
}

// 预留方法：处理自定义颜色变更后的保存/发送逻辑
const handleCustomColorChange = async () => {
    try {
        console.log('自定义灯效保存');
        if (keyColorInformation.value && keyColorInformation.value.length > 0) {
            // 需要传递完整的数组给后端，不仅仅是被修改的部分
            // keyColorInformation.value 本身就是一个数组，其中索引对应矩阵位置
            // 由于 JavaScript 稀疏数组的问题，我们可能需要确保发送前填补空缺（如果后端需要）
            // 这里假设 DeviceService.setCustomizeButtonColor 会处理，或者直接传整个数组

            // 确保传递的是数组（Proxy对象转为普通数组）
            const colorArray = JSON.parse(JSON.stringify(keyColorInformation.value));
            console.log(colorArray, '这是什么');

            // 调用 DeviceService 的 setCustomizeButtonColor 方法下发自定义颜色
            const result = await DeviceService.setCustomizeButtonColor(colorArray);
            console.log('自定义灯效设置成功', result);
        }
    } catch (error) {
        console.error('自定义灯效设置失败:', error);
    }
}

// Tooltip 逻辑
const tooltip = ref({
    visible: false,
    top: 0,
    left: 0,
    item: null,
    keyWidth: 0
})
let tooltipTimer = null

// 👉 鼠标滑入Tooltip，立即显示
const handleTooltipEnter = () => {
    clearTimeout(tooltipTimer)
    tooltip.value.visible = true
}

// 👉 鼠标滑出Tooltip，延时隐藏
const handleTooltipLeave = () => {
    clearTimeout(tooltipTimer)
    tooltipTimer = setTimeout(() => {
        tooltip.value.visible = false
    }, 300)
}

// 👉 恢复默认按键
const restoreDefault = async (item) => {
    // 方法内部逻辑先不写，预留
}


onMounted(() => {
    let targetDefault = defaultKeyMatrixInformation.value;
    // 初始化键盘布局
    keyLayout.value = mapCurrentKeysToLayout(
        targetDefault,
        keyBoardStore.currentMatrixInfo,
        deviceConfig.value.keyLayoutArr || [],
        defaultKeyMatrixInformation.value // 物理矩阵基准（始终使用 Win 层默认矩阵来匹配 UI 坐标）
    )
    console.log(keyLayout.value, "当前匹配的按键矩阵");

})

</script>

<template>
    <div class="keyboard-container" :class="{ 'is-electron': isElectron }"
        @mousedown="interactionType !== 3 && (isMouseDown = true)" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
        <div>
            <template v-for="item in keyLayout" :key="item?.name">
                <div :style="{
                    width: px2rem(item.width) + 'rem',
                    height: px2rem(item.height) + 'rem',
                    marginTop: px2rem(item.top) + 'rem',
                    marginLeft: px2rem(item.left) + 'rem',
                    // 👉 按住并滑过时的颜色
                    backgroundColor: (interactionType === 2 && getKeyColor(item))
                        ? getKeyColor(item)
                        : item._hoverPressed
                            ? pressColor : '',
                    // 👉 边框颜色
                    border: (interactionType === 2 && getKeyColor(item))
                        ? `${px2rem(1)}rem solid var(--keyboard-key-border-color)`
                        : item._hoverPressed
                            ? `${px2rem(1)}rem solid ${pressColor}`
                            : item?.isSelected
                                ? `${px2rem(1)}rem solid var(--el-color-primary)`
                                : `${px2rem(1)}rem solid var(--keyboard-key-border-color)`,

                    // 👉 灯光反显阴影
                    boxShadow: (interactionType === 2 && getKeyColor(item))
                        ? `0 0 ${px2rem(4)}rem ${getKeyColor(item)}`
                        : 'none',

                }" :class="{ 'selected': item.isSelected }" @click="handleClick(item)"
                    @mousedown="handleKeyMouseDown(item)" @mouseenter="(e) => handleHover(e, item)"
                    @mouseleave="handleLeave(item)">
                    <div class="key-content">
                        <template v-if="interactionType === 1 || interactionType === 3">
                            <!-- 优先显示图标：检查 currentKeyIcon 或通过名称查找图标 -->
                            <div v-if="getFinalKeyIcon(item)" class="key-icon" :style="{
                                backgroundColor: (interactionType === 1 && item?.currentKeyCode !== item?.defaultKeyCode) ? '#ee751a' : '#fff',
                                maskImage: `url(${getFinalKeyIcon(item)})`,
                                webkitMaskImage: `url(${getFinalKeyIcon(item)})`,
                            }"></div>
                            <div v-else class="key-text"
                                :style="{ color: (interactionType === 1 && item?.currentKeyCode !== item?.defaultKeyCode) ? '#ee751a' : undefined }">
                                {{ getKeyDisplayName(item) }}
                            </div>
                        </template>
                        <template v-else>
                            <div class="key-text">
                                {{ item?.defaultKeyName?.replace(/——/g, ' ') }}
                            </div>
                        </template>
                    </div>
                </div>
            </template>
        </div>
    </div>
    <Teleport to="body">
        <div v-if="tooltip.visible" class="key-interaction-tooltip" :style="{
            top: tooltip.top + 'px',
            left: tooltip.left + 'px',
            '--key-width': tooltip.keyWidth + 'px'
        }" @mouseenter="handleTooltipEnter" @mouseleave="handleTooltipLeave">
            <template v-if="tooltip.item?.currentKeyIcon">
                <div class="key-name-info">
                    {{ tooltip.item?.currentKeyName }}
                </div>
                <div class="divider"></div>
            </template>
            <div class="restore-btn" @click="restoreDefault(tooltip.item)">
                恢复默认
            </div>
        </div>
    </Teleport>
</template>

<style lang="scss" scoped>
.key-interaction-tooltip {
    position: fixed;
    z-index: 9999;
    background: #ee751a;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
    transform: translate(-50%, -100%);
    margin-top: -10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
    min-width: 80px;

    /* 增加隐形桥梁，防止鼠标从按键移向tooltip时断开 */
    &::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: max(100%, var(--key-width, 0px));
        height: 20px;
        /* 覆盖margin-top的空隙 */
    }

    &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: #ee751a;
    }

    .restore-btn {
        padding: 6px 12px;
        cursor: pointer;
        white-space: nowrap;
        width: 100%;
        text-align: center;
        box-sizing: border-box;
        border-radius: 0 0 4px 4px;

        &:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
    }

    .divider {
        width: 100%;
        height: 1px;
        background-color: rgba(255, 255, 255, 0.2);
    }

    .key-name-info {
        padding: 6px 12px;
        color: #fff;
        white-space: nowrap;
        width: 100%;
        text-align: center;
        box-sizing: border-box;
    }
}

.keyboard-container {
    width: 706px;
    height: 294px;
    background-size: cover;
    padding: 20px;
    box-sizing: border-box;
    zoom: 1.2;
    // background-color: #2f3133;
    border-radius: 4px;
    background: var(--keyboard-bg-color);
    backdrop-filter: blur(var(--funAreaRadius));
    border-radius: var(--globalRadius);
    border: 1px solid var(--keyboard-key-border-color);

    &.is-electron {
        @media (min-width: 1200px) {
            zoom: 1;
        }

        @media (min-width: 1400px) {
            zoom: 1.1;
        }

        @media (min-width: 1600px) {
            zoom: 1.2;
        }

        @media (min-width: 1920px) {
            zoom: 1.3;
        }
    }

    >div {
        width: 100%;
        height: 100%;
        position: relative;
        box-sizing: border-box;

        >div {
            background-color: #000;
            background-color: var(--keyboard-key-bg-color);
            position: absolute;
            border-radius: 4px;
            cursor: pointer;
            overflow: hidden;
            box-sizing: border-box;
            // color: #fff;
            color: var(--theme-font-color);
            font-size: 10px;
            font-weight: 500;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            // border: 0.5px solid transparent;
            border: 0.5px solid var(--keyboard-key-border-color);
            // transition: all 0.15s ease-in-out; 

            &.disabled {
                color: #999;
                cursor: default;
            }

            &.selected {
                border: 0.5px solid var(--el-color-primary);
                background-color: var(--el-select-option-hover-bg-color);
            }
        }

        .key-content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .key-text {
            width: 100%;
            text-align: center;
            font-size: 10px;
            font-weight: 500;
        }

        .key-element {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

}

.key-icon {
    width: 20px;
    height: 20px;
    mask-size: contain;
    -webkit-mask-size: contain;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-position: center;
}
</style>