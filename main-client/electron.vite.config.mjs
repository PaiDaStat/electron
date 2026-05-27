import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  main: {
    resolve: {
      alias: [
        {
          find: 'device-sdk',
          replacement: resolve('../device-sdk/src/index.node.js')
        },
        {
          // 匹配所有引用 hidCore 的地方，忽略 src 前缀差异
          find: /.*utils\/hidCore(\.js)?$/,
          replacement: resolve('../device-sdk/src/utils/hidCore.node.js')
        }
      ]
    },
    build: {
      rollupOptions: {
        external: ['node-hid', 'koffi']
      }
    },
    plugins: [externalizeDepsPlugin({ exclude: ['device-sdk'] })]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        'device-sdk': resolve('../device-sdk/src/index.web.js')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false // css in js
          }),
          ElementPlusResolver()
        ]
      })
    ]
  }
})
