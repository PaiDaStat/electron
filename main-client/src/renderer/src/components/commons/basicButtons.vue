<!-- 基本案件的功能组件 -->
<script setup>
import { computed, toRefs } from 'vue'
import { px2rem, px2remUnit } from '../../utils/px2rem.js'
import { keyboardKeyArray } from '../../utils/keyboardKeyArray'
import { useStore } from '../../stores/index.js'
import { useAppTheme } from '../../utils/useAppTheme.js'

const defineStore = useStore()
const { bgSettings } = toRefs(defineStore)
const { store } = useAppTheme()

const popoverStyle = computed(() => {
  const vars = {
    '--globalRadius': px2remUnit(bgSettings.value.bgRadius),
    '--funAreaRadius': px2remUnit(bgSettings.value.bgArea),
  }
  if (bgSettings.value.customFontColor) {
    const color = bgSettings.value.customFontColor[store.value]
    if (color) {
      vars['--theme-font-color'] = color
    }
  }
  return vars
})
</script>

<template>
  <div class="basics-key-container">
    <div class="basics-key">
      <div v-for="item in keyboardKeyArray()[0].keys" :key="item.keyName"
        :style="{ position: 'absolute', width: px2rem(item.width) + 'rem', height: px2rem(item.height) + 'rem', top: px2rem(item.top) + 'rem', left: px2rem(item.left) + 'rem' }">
        <a-popover placement="top" trigger="hover" :arrow="true" :overlayClassName="'key-settings-popover'"
          :overlayInnerStyle="{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0' }">
          <div class="key-content-wrapper">
            <div class="key-visual-content">
              {{ item.keyName.replace(/——/g, ' ') }}
            </div>
          </div>
          <template #content>
            <div class="tooltip-popover-content" :style="popoverStyle">
              {{ item.tips }}
            </div>
          </template>
        </a-popover>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.basics-key-container {
  width: 100%;
}

.basics-key {
  min-width: 1200px;
  position: relative;
  height: 280px;
  /* display: flex; */
  /* flex-wrap: wrap; */


}

.key-content-wrapper {
  width: 100%;
  height: 100%;

  &:hover .key-visual-content {
    border: 1px solid var(--el-color-primary);
    background: var(--el-color-primary-hover);
    transition: all 0.3s ease-in-out;
    transform: translateY(-2px);
  }
}

.key-visual-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // border: 1px solid var(--theme-border-color);
  border: 1px solid var(--keyboard-key-border-color);
  border-radius: var(--globalRadius);
  transition: all 0.3s ease-in-out;
  // background: var(--theme-fun-bgcolor);
  background: var(--keyboard-key-bg-color);
  backdrop-filter: blur(var(--funAreaRadius));
  color: var(--theme-icon-color);
  font-size: 12px;
  line-height: 14px;
  cursor: pointer;
  text-align: center;
}

.tooltip-popover-content {
  pointer-events: none;
  user-select: none;
  background-color: var(--el-color-primary);
  border-radius: var(--globalRadius);
  padding: 8px 12px;
  box-sizing: border-box;
  color: #fff;
  border: 1px solid var(--el-color-primary);
  animation: fadeIn 0.3s linear;
  font-size: 12px;
  line-height: 14px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  text-align: center;
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

<style lang="scss">
.key-settings-popover {
  .ant-popover-arrow {
    &::before {
      background-color: var(--el-color-primary) !important;
    }

    &::after {
      background-color: var(--el-color-primary) !important;
    }
  }
}
</style>