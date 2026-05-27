<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { px2remTransformer } from 'ant-design-vue'
import { useAppTheme } from './utils/useAppTheme.js'
const { system, store } = useAppTheme()



const px2rem = px2remTransformer({ rootValue: 16 })



</script>

<template>
  <div id="app">
    <a-config-provider :theme="{
      token: {
        colorPrimary: '#ee751a',
      }
    }">
      <a-style-provider :transformers="[px2rem]">
        <a-app>
          <RouterView />
        </a-app>
      </a-style-provider>
    </a-config-provider>
  </div>
</template>

<style lang="scss" scoped>
html,
body {
  margin: 0;
  overflow: hidden;
  background-color: transparent;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
  box-sizing: border-box;
  user-select: none;
}
</style>