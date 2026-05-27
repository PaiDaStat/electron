<!-- 键盘灯光设置组件 -->
<script setup>
import { ref, onMounted, toRefs, computed } from 'vue'
import { useStore } from '../../../stores/index.js'
const defineStore = useStore()
const { isDemoMode } = toRefs(defineStore)
import slider from '../../commons/slider.vue'
import vueColorPicker from '../../commons/vueColorPicker.vue'
import { DeviceService } from '../../../services/DeviceService';
// 演示模式数据
import { mouseLightList } from '../../../utils/demonstrationData.js'
import GK8Img from '../../../assets/deviceImg/a7pro.png'




// Hex转RGB
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

// RGB转Hex
const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// RGB颜色值
const HexColorVal = ref('#000000');

const rVal = computed({
    get() {
        return hexToRgb(HexColorVal.value).r;
    },
    set(val) {
        const { g, b } = hexToRgb(HexColorVal.value);
        HexColorVal.value = rgbToHex(val, g, b);
    }
});

const gVal = computed({
    get() {
        return hexToRgb(HexColorVal.value).g;
    },
    set(val) {
        const { r, b } = hexToRgb(HexColorVal.value);
        HexColorVal.value = rgbToHex(r, val, b);
    }
});

const bVal = computed({
    get() {
        return hexToRgb(HexColorVal.value).b;
    },
    set(val) {
        const { r, g } = hexToRgb(HexColorVal.value);
        HexColorVal.value = rgbToHex(r, g, val);
    }
});

// 颜色预设
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

// 灯效方向数据
const lightingDirectionData = ref([
    {
        label: '模式一',
        value: 0
    },
    {
        label: '模式二',
        value: 1
    },
])

// 灯效方向
const lightingDirection = ref(0);

// 特殊模式数据
const specialModeData = ref([
    {
        label: '模式一',
        value: 0
    },
    {
        label: '模式二',
        value: 1
    },
    {
        label: '模式三',
        value: 2
    },
    {
        label: '模式四',
        value: 3
    },
])

// 特殊模式
const specialMode = ref(0);



// 灯效设置改变事件
const onLightingSettingChange = async () => {
    try {
        if (!isDemoMode.value) {
            const { r, g, b } = hexToRgb(HexColorVal.value);
            const effect = {
                brightness: lightingBrightness.value,
                speed: lightingSpeed.value,
                direction: lightingDirection.value,
                specialLighting: specialMode.value,
                isColorful: isColorful.value,
                colorR: r,
                colorG: g,
                colorB: b
            };
            const result = await DeviceService.setLightingEffect(lightingMode.value, effect);
            console.log(`成功设置灯光参数`, result);
        }
    } catch (error) {
        console.error(`设置灯光参数失败:`, error);
    }
}

// 校验并同步Hex到全局
const validateHexColor = () => {
    const hex = HexColorVal.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        onLightingSettingChange(); // 触发设置改变
    } else if (/^#[0-9A-F]{3}$/i.test(hex)) {
        const expanded = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        HexColorVal.value = expanded;
        onLightingSettingChange(); // 触发设置改变
    }
}

//校验数字
const validateNumberColor = (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
        return 255;
    }
    return value;
};



//当前是彩色数据
const isColorfulData = ref([

    {
        label: '单色',
        value: 0
    },
    {
        label: '彩色',
        value: 1
    },
]);

// 当前是否是彩色状态
const isColorful = ref(0);


// 灯光亮度
const lightingBrightness = ref(5);

// 灯光速度值
const lightingSpeed = ref(5);


// 灯光模式
const lightingMode = ref(1);
// 灯光模式选项
const lightingModeOptions = ref([]);

// 当前选中的灯光模式
const currentLightingMode = computed(() => {
    return lightingModeOptions.value.find(item => item.ledIndex === lightingMode.value) || {};
});


// 设置普通灯光效果
const setLightingEffect = async (item) => {
    try {
        if (!isDemoMode.value) {
            const result = await DeviceService.setLightingEffect(item.ledIndex);
            console.log(`成功设置灯光效果为 ${item.ledIndex}`, result);
        }
        lightingMode.value = item.ledIndex;
    } catch (error) {
        console.error(`设置灯光效果 ${item.ledIndex} 失败:`, error);
    }
}



onMounted(async () => {
    console.log('灯光效果列表1');
    try {
        if (isDemoMode.value) {
            console.log('演示模式下，使用模拟数据');
            lightingModeOptions.value = mouseLightList();
            console.log(lightingModeOptions.value, '灯光效果列表');
        } else {
            lightingModeOptions.value = await DeviceService.getLightingEffectList();
            console.log(lightingModeOptions.value, '灯光效果列表');
            // 查询当前灯光信息
            const lightingInfo = await DeviceService.getLightingInfo();
            console.log(lightingInfo, '当前灯光信息');
            if (lightingInfo.data) {
                const { brightness, speed, ledIndex, isColorful: isColorfulVal, specialLighting, direction, colorR, colorG, colorB } = lightingInfo.data;
                lightingBrightness.value = brightness;
                lightingSpeed.value = speed;
                lightingMode.value = ledIndex;
                isColorful.value = isColorfulVal;
                specialMode.value = specialLighting;
                lightingDirection.value = direction;
                HexColorVal.value = rgbToHex(colorR, colorG, colorB);
            }
        }
    } catch (error) {
        console.error(error);
    }
})

</script>

<template>
    <div class="change-key">
        <div>
            <div>
                <div>
                    <img :src="GK8Img" alt="">
                </div>
            </div>
            <div>
                <div>
                    <div class="title">灯光效果</div>
                    <div>
                        <div v-for="item in lightingModeOptions" :key="item.name"
                            :class="{ active: lightingMode === item.ledIndex }" @click="setLightingEffect(item)">
                            <div>
                                <img src="" alt="">
                            </div>
                            <div>{{ item.name }}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="title">灯效设置</div>
                    <div>
                        <div :class="{ 'disabled': !currentLightingMode.brightnessBol }">
                            <slider title="亮度" :sliderValue="lightingBrightness"
                                @update:sliderValue="lightingBrightness = $event" @change="onLightingSettingChange"
                                :sliderMin="0" :sliderMax="5" :sliderStep="1" unit="级"></slider>
                        </div>
                        <div :class="{ 'disabled': !currentLightingMode.speedBol }">
                            <slider title="速度" :sliderValue="lightingSpeed" @update:sliderValue="lightingSpeed = $event"
                                @change="onLightingSettingChange" :sliderMin="0" :sliderMax="5" :sliderStep="1"
                                unit="级"></slider>
                        </div>
                        <div
                            :class="['direction-and-Mode', 'direction', { 'disabled': !currentLightingMode.directionBol }]">
                            <div>方向</div>
                            <div> <el-segmented v-model="lightingDirection" :options="lightingDirectionData"
                                    @change="onLightingSettingChange" /></div>
                        </div>
                        <div v-if="currentLightingMode.specialModeBol" class="direction-and-Mode">
                            <div>模式</div>
                            <div> <el-segmented v-model="specialMode" :options="specialModeData"
                                    @change="onLightingSettingChange" /></div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="title">调色板</div>
                    <div>
                        <div>
                            <div
                                :class="{ 'disabled': currentLightingMode.customBol || !currentLightingMode.colourfulBol }">
                                <el-segmented v-model="isColorful" :options="isColorfulData"
                                    @change="onLightingSettingChange" />
                            </div>
                            <div
                                :class="{ 'disabled': !currentLightingMode.customBol && (isColorful || !currentLightingMode.colourfulBol) }">
                                <div v-for="item in colorPresets" :key="item.color"
                                    :style="{ backgroundColor: item.color }"
                                    @click="() => { HexColorVal = item.color; onLightingSettingChange() }"></div>
                            </div>
                            <div
                                :class="{ 'disabled': !currentLightingMode.customBol && (isColorful || !currentLightingMode.colourfulBol) }">
                                <vueColorPicker v-model="HexColorVal" @change="onLightingSettingChange" />
                            </div>
                            <div
                                :class="{ 'disabled': !currentLightingMode.customBol && (isColorful || !currentLightingMode.colourfulBol) }">
                                <div>
                                    <div>Hex</div>
                                    <div>
                                        <input type="text" v-model="HexColorVal" @blur="validateHexColor" />
                                    </div>
                                </div>
                                <div>
                                    <div>RGB</div>
                                    <div>
                                        <a-input-number v-model:value="rVal" :bordered="false" :min="0" :max="255"
                                            @blur="() => { rVal = validateNumberColor(rVal); onLightingSettingChange() }" />
                                        <a-input-number v-model:value="gVal" :bordered="false" :min="0" :max="255"
                                            @blur="() => { gVal = validateNumberColor(gVal); onLightingSettingChange() }" />
                                        <a-input-number v-model:value="bVal" :bordered="false" :min="0" :max="255"
                                            @blur="() => { bVal = validateNumberColor(bVal); onLightingSettingChange() }" />
                                    </div>
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
.change-key {
    width: 100%;
    height: calc(100vh - 62px);
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    >div {
        width: 100%;
        height: calc(100vh - 62px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        >div {
            border-radius: var(--globalRadius);
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            min-height: 0;
        }

        >div:nth-of-type(1) {
            flex: 5;
            // background: var(--theme-fun-bgcolor);

            >div {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;


            }
        }

        >div:nth-of-type(2) {
            flex: 5;
            display: flex;
            gap: 12px;

            >div {
                width: 0;
                min-width: 0;
                overflow: hidden;
                height: 100%;
                border-radius: var(--globalRadius);
                background: var(--theme-fun-bgcolor);
                backdrop-filter: blur(var(--funAreaRadius));
                border: 1px solid var(--theme-border-color);
                animation: bounce-in 0.5s;
                padding: 12px 24px;
                box-sizing: border-box;

                .title {
                    font-size: 16px;
                    line-height: 16px;
                    padding: 12px 0;
                    box-sizing: border-box;
                    font-weight: 500;
                    color: var(--theme-font-color);
                }
            }

            >div:nth-of-type(1) {
                flex: 4 4 0%;

                >div:nth-of-type(2) {
                    height: calc(100% - 48px);
                    padding: 12px 0;
                    box-sizing: border-box;
                    width: 100%;
                    display: flex;
                    flex-wrap: wrap;
                    align-content: flex-start;
                    gap: 12px;
                    color: var(--theme-font-color);
                    overflow: auto;

                    >div {
                        min-width: 100px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-radius: var(--globalRadius);
                        border: 1px solid var(--theme-border-color);
                        background-color: var(--theme-fun-bgcolor);
                        backdrop-filter: blur(var(--funAreaRadius));
                        padding: 8px 12px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.3s;
                        transition: all 0.3s ease-in-out;
                        box-sizing: border-box;

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

            >div:nth-of-type(2) {
                flex: 3 3 0%;

                >div:nth-of-type(2) {
                    padding: 12px 0;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;

                    .direction-and-Mode {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;

                        >div:nth-of-type(1) {
                            font-size: 12px;
                            color: var(--theme-font-color);
                        }

                        >div:nth-of-type(2) {

                            :deep(.el-segmented) {
                                width: 100%;
                                font-size: 12px !important;
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

                    .direction {
                        >div:nth-of-type(2) {
                            width: 50%;
                        }
                    }
                }


            }

            >div:nth-of-type(3) {
                flex: 3 3 0%;

                >div:nth-of-type(2) {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    width: 100%;
                    height: 100%;

                    >div:nth-of-type(1) {
                        // width: 100%;
                        // max-width: 300px;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        transition: transform 0.3s ease;
                        transform-origin: top center;

                        @media (min-width: 1200px) {
                            transform: scale(0.8);
                        }

                        @media (min-width: 1400px) {
                            transform: scale(0.9);
                        }

                        @media (min-width: 1600px) {
                            transform: scale(1.0);
                        }

                        @media (min-width: 1920px) {
                            transform: scale(1.1);
                        }

                        >div:nth-of-type(1) {
                            width: 50%;
                            display: flex;
                            align-items: center;
                            color: var(--theme-font-color);

                            :deep(.el-segmented) {
                                width: 100%;
                                font-size: 12px !important;
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

                        >div:nth-of-type(2) {
                            display: flex;
                            align-items: center;
                            gap: 12px;

                            >div {
                                width: 22px;
                                height: 22px;
                                border-radius: var(--globalRadius);
                                cursor: pointer;
                            }
                        }

                        >div:nth-of-type(4) {
                            display: flex;
                            flex-direction: column;
                            gap: 12px;

                            >div:nth-of-type(1) {

                                display: flex;
                                align-items: center;
                                gap: 20px;

                                >div:nth-of-type(1) {
                                    font-size: 14px;
                                    font-weight: 500;
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
                                    font-weight: 500;
                                    color: var(--theme-font-color);
                                }

                                >div:nth-of-type(2) {
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                }

                                :deep(.ant-input-number-handler-wrap) {
                                    width: 32px !important;
                                    display: none;
                                }

                                :deep(.ant-input-number) {
                                    width: auto;
                                }


                                :deep(.ant-input-number-input) {
                                    width: 80px;
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
                }
            }
        }
    }
}

.disabled {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;

    :deep(*) {
        pointer-events: none !important;
    }
}
</style>
