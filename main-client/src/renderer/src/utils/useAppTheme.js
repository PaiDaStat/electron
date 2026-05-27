import { useColorMode } from '@vueuse/core'

export const useAppTheme = () => {
    return useColorMode({
        initialValue: 'dark',
        storageKey: 'evisionhub-theme', // 自定义 localStorage 中存储的键名
        // 可以添加其他配置，例如 modes
        // modes: {
        //   dim: 'dim',
        //   cafe: 'cafe',
        // },
    })
}
