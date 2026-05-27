import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "维盛 Omni-SDK 文档",
  lastUpdated: true,
  description: "The SDK methods for the keyboard and mouse.",
  head: [
    ['link', { rel: 'icon', href: '/icon.png' }]
  ],
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        search: {
          provider: 'local',
          options: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '清除查询',
                backButtonTitle: '返回',
                noResultsText: '无相关结果',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    }
  },
  themeConfig: {
    search: {
      provider: 'local'
    },
    outline: {
      label: '目录'
    },
    logo: '/icon.png',
    nav: [
      { text: '首页', link: '/' },
      {
        text: 'SDK 文档',
        items: [
          { text: '键盘 SDK-v1', link: '/K-OmniSDK-v1/start' },
          { text: '鼠标 SDK-v1', link: '/M-OmniSDK-v1/start' }
        ]
      }
    ],
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    lastUpdated: {
      text: '最后更新时间'
    },
    sidebar: {
      '/K-OmniSDK-v1/': [
        {
          text: '键盘 SDK-v1',
          icon: '/icon.png',
          items: [
            { text: '快速开始', link: '/K-OmniSDK-v1/start' },
            { text: '键值码表', link: '/K-OmniSDK-v1/key-value-code' }
          ]
        }
      ],
      '/M-OmniSDK-v1/': [
        {
          text: '鼠标 SDK-v1',
          icon: '/icon.png',
          items: [
            { text: '快速开始', link: '/M-OmniSDK-v1/start' },
            { text: '键值码表', link: '/M-OmniSDK-v1/key-value-code' }
          ]
        }
      ]
    }
  },
})

