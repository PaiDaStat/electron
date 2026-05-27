<!-- 滑杆组件 -->
<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
    sliderValue: {
        type: Number,
        default: 0
    },
    sliderMin: {
        type: Number,
        default: 0
    },
    sliderMax: {
        type: Number,
        default: 10
    },
    sliderStep: {
        type: Number,
        default: 1
    },
    sliderShowTooltip: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ''
    },
    unit: {
        type: String,
        default: '%'
    }
})

const emit = defineEmits(['update:sliderValue', 'change'])

const sliderRef = ref(null)
const runwayRef = ref(null)
const isDragging = ref(false)
const tooltipVisible = ref(false)

const percentage = computed(() => {
    if (props.sliderMax === props.sliderMin) return 0
    const val = (props.sliderValue - props.sliderMin) / (props.sliderMax - props.sliderMin) * 100
    return Math.max(0, Math.min(100, val))
})

const getClientX = (event) => {
    if (event instanceof MouseEvent) {
        return event.clientX
    } else if (event instanceof TouchEvent) {
        return event.touches[0].clientX
    }
    return 0
}

const updateValue = (clientX) => {
    if (!runwayRef.value) return

    const rect = runwayRef.value.getBoundingClientRect()
    let percent = (clientX - rect.left) / rect.width
    percent = Math.max(0, Math.min(1, percent))

    let newValue = props.sliderMin + percent * (props.sliderMax - props.sliderMin)

    if (props.sliderStep > 0) {
        const step = props.sliderStep
        const steps = Math.round((newValue - props.sliderMin) / step)
        newValue = props.sliderMin + steps * step
    }

    // Handle floating point precision
    const stepString = String(props.sliderStep)
    if (stepString.includes('.')) {
        const precision = stepString.split('.')[1].length
        newValue = Number(newValue.toFixed(precision))
    }

    newValue = Math.max(props.sliderMin, Math.min(props.sliderMax, newValue))

    return newValue
}

const handleInput = (val) => {
    emit('update:sliderValue', val)
}

const handleChange = (val) => {
    emit('update:sliderValue', val)
    emit('change', val)
    console.log('change', val);
}

const onMouseDown = (event) => {
    if (event.type === 'mousedown' && event.button !== 0) return

    isDragging.value = true
    tooltipVisible.value = true

    const clientX = getClientX(event)
    const newValue = updateValue(clientX)
    handleInput(newValue)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onMouseMove, { passive: false })
    window.addEventListener('touchend', onMouseUp)
}

const onMouseMove = (event) => {
    if (!isDragging.value) return
    if (event.type === 'touchmove') event.preventDefault() // Prevent scrolling while dragging

    const clientX = getClientX(event)
    const newValue = updateValue(clientX)
    handleInput(newValue)
}

const onMouseUp = (event) => {
    if (!isDragging.value) return

    const clientX = event.type.startsWith('touch') ? event.changedTouches[0].clientX : event.clientX
    const newValue = updateValue(clientX)
    handleChange(newValue)

    isDragging.value = false
    // Keep tooltip visible if hovering, otherwise hide
    if (!isHovering.value) {
        tooltipVisible.value = false
    }

    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('touchmove', onMouseMove)
    window.removeEventListener('touchend', onMouseUp)
}

const isHovering = ref(false)

const onMouseEnter = () => {
    isHovering.value = true
    if (props.sliderShowTooltip) {
        tooltipVisible.value = true
    }
}

const onMouseLeave = () => {
    isHovering.value = false
    if (!isDragging.value) {
        tooltipVisible.value = false
    }
}

onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('touchmove', onMouseMove)
    window.removeEventListener('touchend', onMouseUp)
})
</script>

<template>
    <div class="slider-container">
        <div v-if="title" class="slider-header">
            <div>{{ title }}</div>
            <div>{{ sliderValue }}{{ unit }}</div>
        </div>
        <div class="custom-slider" ref="sliderRef" @mousedown="onMouseDown" @touchstart.passive="onMouseDown"
            @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
            <div class="slider-runway" ref="runwayRef">
                <div class="slider-bar" :style="{ width: percentage + '%' }"></div>
                <div class="slider-button-wrapper" :style="{ left: percentage + '%' }" @click.stop>
                    <div class="slider-button"></div>
                    <div v-if="sliderShowTooltip && tooltipVisible" class="slider-tooltip">
                        {{ sliderValue }}
                        <div class="tooltip-arrow"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.slider-container {
    width: 100%;
    margin: 0;
    display: flex;
    flex-direction: column;
}

.slider-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--theme-font-color);
    margin-bottom: 4px;
}

.custom-slider {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    user-select: none;
    touch-action: none;
}

.slider-runway {
    flex: 1;
    width: auto;
    height: 5px;
    background-color: var(--theme-fun-select-bgcolor);
    border-radius: 3px;
    position: relative;
    margin: 0 8px;
}

.slider-bar {
    height: 5px;
    background-color: var(--el-color-primary);
    border-radius: 3px;
    position: absolute;
    left: 0;
    // top: -0.5px;
}

.slider-button-wrapper {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    display: flex;
    justify-content: center;
}

.slider-button {
    width: 12px;
    height: 12px;
    background-color: #fff;
    border: none;
    border-radius: 50%;
    box-shadow: 0 0 0 3px var(--el-color-primary);
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.1);
    }
}

.slider-tooltip {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #303133;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;

    .tooltip-arrow {
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 4px 4px 0;
        border-style: solid;
        border-color: #303133 transparent transparent transparent;
    }
}
</style>
