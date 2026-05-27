<!-- 颜色选择器 -->
<template>
    <div class="color-picker">
        <div ref="svPanel" class="sv-panel" @mousedown="startSVDrag">
            <div ref="svCursor" class="sv-cursor" :style="cursorSVStyle" @mousedown.stop="startSVDrag"></div>
        </div>

        <div ref="hueBar" class="hue-bar" @mousedown="startHueDrag">
            <div ref="hueCursor" class="hue-cursor" :style="cursorHueStyle" @mousedown.stop="startHueDrag"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { px2rem } from '../../utils/px2rem.js'

// props
const props = defineProps({
    modelValue: { type: String, default: '#ff0000' }
})

// emit
const emit = defineEmits(['update:modelValue', 'change'])

const hue = ref(0)
const saturation = ref(100)
const value = ref(100)

const svPanel = ref(null)
const hueBar = ref(null)

// cursor style
const cursorSVStyle = computed(() => ({
    left: `calc(${px2rem(7)}rem + (100% - ${px2rem(14)}rem) * ${saturation.value} / 100)`,
    top: `calc(${px2rem(7)}rem + (100% - ${px2rem(14)}rem) * (100 - ${value.value}) / 100)`
}))

const cursorHueStyle = computed(() => ({
    top: `calc(${px2rem(6)}rem + (100% - ${px2rem(12)}rem) * ${hue.value} / 360)`
}))

function hsvToRgb(h, s, v) {
    s /= 100
    v /= 100
    let k = (n) => (n + h / 60) % 6
    let f = (n) => v - v * s * Math.max(Math.min(k(n), 4 - k(n), 1), 0)
    return {
        r: Math.round(f(5) * 255),
        g: Math.round(f(3) * 255),
        b: Math.round(f(1) * 255)
    }
}

function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    let s = max === 0 ? 0 : d / max
    let v = max

    if (d !== 0) {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break
            case g: h = ((b - r) / d + 2) * 60; break
            case b: h = ((r - g) / d + 4) * 60; break
        }
    }

    return { h, s: s * 100, v: v * 100 }
}

function updateEmit(isFinal = false) {
    const rgb = hsvToRgb(hue.value, saturation.value, value.value)
    const hex = `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b)
        .toString(16)
        .slice(1)}`.toUpperCase()

    emit('update:modelValue', hex)

    // 只有在操作结束（isFinal=true）时才触发 change 事件
    if (isFinal) {
        emit('change', hex)
    }
}

function setHue(e, isFinal = false) {
    const rect = hueBar.value.getBoundingClientRect()
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height)
    hue.value = Math.round((y / rect.height) * 360)
    updateSVBackground()
    updateEmit(isFinal)
}

function setSV(e, isFinal = false) {
    const rect = svPanel.value.getBoundingClientRect()
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width)
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height)
    saturation.value = Math.round((x / rect.width) * 100)
    value.value = Math.round(100 - (y / rect.height) * 100)
    updateEmit(isFinal)
}

function startHueDrag(e) {
    setHue(e, false) // 拖拽开始，只更新 modelValue
    window.addEventListener('mousemove', onHueMouseMove)
    window.addEventListener('mouseup', stopHueDrag)
}

function onHueMouseMove(e) {
    setHue(e, false) // 拖拽中，只更新 modelValue
}

function stopHueDrag(e) {
    setHue(e, true) // 拖拽结束，触发 change
    window.removeEventListener('mousemove', onHueMouseMove)
    window.removeEventListener('mouseup', stopHueDrag)
}

function startSVDrag(e) {
    setSV(e, false) // 拖拽开始，只更新 modelValue
    window.addEventListener('mousemove', onSVMouseMove)
    window.addEventListener('mouseup', stopSVDrag)
}

function onSVMouseMove(e) {
    setSV(e, false) // 拖拽中，只更新 modelValue
}

function stopSVDrag(e) {
    setSV(e, true) // 拖拽结束，触发 change
    window.removeEventListener('mousemove', onSVMouseMove)
    window.removeEventListener('mouseup', stopSVDrag)
}

function updateSVBackground() {
    const rgb = hsvToRgb(hue.value, 100, 100)
    svPanel.value.style.background = `linear-gradient(to right, white, rgb(${rgb.r},${rgb.g},${rgb.b})), linear-gradient(to top, black, transparent)`
    svPanel.value.style.backgroundBlendMode = 'multiply'
}

// 初始化颜色
onMounted(() => {
    updateColorFromModelValue()
})

// 监听外部 modelValue 变化
watch(() => props.modelValue, () => {
    updateColorFromModelValue()
})

function updateColorFromModelValue() {
    const hex = props.modelValue.replace('#', '')
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return

    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    // 计算当前内部状态对应的 RGB，避免精度误差导致的循环更新
    const currentRgb = hsvToRgb(hue.value, saturation.value, value.value)
    if (currentRgb.r === r && currentRgb.g === g && currentRgb.b === b) return

    const hsv = rgbToHsv(r, g, b)
    hue.value = hsv.h
    saturation.value = hsv.s
    value.value = hsv.v

    updateSVBackground()
}
</script>

<style scoped>
.color-picker {
    display: flex;
    gap: 12px;
}

.sv-panel {
    /* min-width: 200px; */
    /* width: 100%; */
    width: 100%;
    min-height: 120px;
    height: 100%;
    border-radius: 8px;
    border-radius: var(--globalRadius);
    border: 1px solid #aaa;
    position: relative;
    background: white;
    background: linear-gradient(to right, white, rgb(255, 0, 0)), linear-gradient(to top, black, transparent);
    background-blend-mode: multiply;
    cursor: pointer;
}

.sv-cursor {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 2px #000;
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: auto;
    cursor: pointer;
}

.hue-bar {
    width: 25px;
    height: 120px;
    /* border-radius: 8px; */
    border: 1px solid #aaa;
    background: linear-gradient(to bottom,
            red,
            yellow,
            lime,
            cyan,
            blue,
            magenta,
            red);
    position: relative;
    border-radius: var(--globalRadius);
}

.hue-cursor {
    width: 20px;
    height: 12px;
    border-radius: 8px;
    background: white;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 3px #000;
    pointer-events: auto;
    cursor: pointer;
}

</style>
