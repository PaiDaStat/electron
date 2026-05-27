import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  root: join(__dirname, 'src/renderer'),
  resolve: {
    alias: {
      '@renderer': join(__dirname, 'src/renderer/src'),
      'device-sdk': join(__dirname, '../device-sdk/src/index.web.js')
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
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },

  base: './',
  build: {
    outDir: join(__dirname, 'dist/web'),
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
})
