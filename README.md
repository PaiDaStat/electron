# 通用外设驱动项目 (Universal Device Driver)

本项目是一个基于 Monorepo 架构的跨平台外设驱动解决方案，旨在通过一套代码同时支持 Web (Chrome/Edge) 和 Desktop (Electron/Node.js) 环境下的 HID 设备通信。

## 🌟 核心特性

*   **一次编写，到处运行**：核心业务逻辑 (`device-sdk`) 与环境解耦。
*   **WebHID 支持**：直接在浏览器中控制设备，无需安装任何插件或驱动。
*   **NodeHID 支持**：在 Electron 主进程或纯 Node.js 环境中控制设备，支持更底层的操作。
*   **自动适配**：SDK 自动检测运行环境并切换底层驱动（WebHID 或 node-hid）。
*   **Windows 兼容性**：针对 Windows HID 的复杂性（Report ID、Padding、Interface 独占）进行了深度优化。

---

## 📂 目录结构

本项目采用 Monorepo 架构，所有代码集中管理：

```
universal-device-driver/
├── device-sdk/           # [核心] 通信 SDK 包
│   ├── src/
│   │   ├── protocol.cjs  # 协议层 (纯数据处理)
│   │   └── core.cjs      # 业务层 (通用 API)
│   ├── index.mjs         # Web 适配层 (WebHID)
│   └── index.cjs         # Node 适配层 (node-hid)
├── main-client/          # [应用] Electron + Vite 客户端
│   ├── src/main/         # Electron 主进程 (使用 NodeHID)
│   ├── src/renderer/     # Vue 3 界面 (使用 WebHID)
│   └── src/preload/      # 预加载脚本 (IPC 桥接)
├── device-docs/          # [文档] VitePress 文档站点
└── package.json          # 根配置
```

---

## 🚀 快速上手

### 1. 环境准备

*   **Node.js**: v16+ (推荐 v18/v20)
*   **编译工具**: 由于依赖 `node-hid` (C++ 原生模块)，Windows 用户可能需要安装构建工具。
    *   如果安装失败，尝试以管理员运行: `npm install --global --production windows-build-tools`

### 2. 安装依赖

在根目录运行：

```bash
npm install
```

### 3. 运行开发环境

**启动 Electron 客户端 (桌面模式)**：
这是最常用的开发模式，可以同时调试渲染进程 UI 和主进程 Node 逻辑。

```bash
npm run dev:e
```

**启动纯 Web 模式**：
在浏览器中调试 WebHID 功能。

```bash
npm run dev:w
```

### 4. 打包

**打包 Windows 桌面端**：

```bash
npm run build:em
```

**打包 Mac 桌面端**：

```bash
npm run build:mac
```

**打包 Web 端**：

```bash
npm run build:ew
```

## 🔧 实用工具

### 环境检测

本项目在 `main-client/src/renderer/src/util/event.js` 中提供了一个环境检测工具：

```javascript
import isElectron from './util/event';

if (isElectron) {
  console.log('当前运行在 Electron 渲染进程中');
} else {
  console.log('当前运行在 Web 浏览器中');
}
```

**原理说明**：该工具通过检测 `window.api` 是否存在来判断是否处于 Electron 环境。`window.api` 是我们在 Preload 脚本中注入的全局对象，仅在 Electron 环境下可用。这比直接检测 `window.process` 或 `userAgent` 更加稳健可靠。

---

## 📦 使用 device-sdk

如果你想在自己的项目中使用这个 SDK：

### 安装

```bash
npm install device-sdk  # 假设已发布或本地链接
```

### 使用示例

```javascript
import driver from 'device-sdk';

// 1. 连接设备
// Web环境: 弹出浏览器选择框
// Node环境: 自动查找 VID/PID 匹配的设备
await driver.connect();

// 2. 发送命令
await driver.setRGB(255, 0, 0); // 设置红色
await driver.reset();           // 重置设备

// 3. 监听数据
driver.onReceive((data) => {
  console.log('收到数据:', data);
});
```

---

## 🛠️ 常见问题 (FAQ)

### Q1: 在 Windows 上 NodeHID 报错 "Cannot write to hid device"？
**原因**：通常是因为连接到了错误的 Interface（例如被系统独占的键盘/鼠标接口）。
**解决**：确保 `device-sdk/index.cjs` 中使用了正确的 `usagePage` 和 `usage` 进行过滤。对于本项目的示例设备，必须过滤 `usagePage: 0xFF1C` (65308)。

### Q2: 为什么 Web 端连接成功但无法发送命令？
**原因**：同样可能是选错了 Interface。
**解决**：浏览器弹出的选择框中可能列出了多个同名设备。请确保代码中 (`index.mjs`) 添加了 `filters` 限制 `usagePage`，这样浏览器只会显示正确的那个 Interface。

### Q3: 如何在 Electron 渲染进程中使用？
*   **推荐**：使用 WebHID (通过 `navigator.hid`)。这是最简单的方式，代码与 Web 端完全共用。
*   **替代**：如果需要 NodeHID 能力（如后台运行），请通过 IPC (`ipcRenderer.invoke`) 调用主进程的方法。SDK 已经完美支持在主进程中运行。

---

## 如何安装新的依赖

在项目根目录运行：

vue-router 是 Vue 3 官方的路由库，用于管理应用的导航。
main-client 是 Electron 客户端的目录，包含 Vue 3 界面代码。

```bash
npm install vue-router --workspace=main-client
```

---


## 🤝 贡献代码

请阅读 [device-sdk/CONTRIBUTING.md](./device-sdk/CONTRIBUTING.md) 获取详细的开发指南。
