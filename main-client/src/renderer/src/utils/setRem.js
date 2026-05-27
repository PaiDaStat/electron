import isElectron from './event'

const baseWidth = 1920   // 设计稿宽度
const baseSize = 16     // 设计稿中 1 rem 对应的 px

function setRem() {
    // 如果是 Electron 环境，保持基准大小，不进行响应式缩放
    if (isElectron) {
        document.documentElement.style.fontSize = baseSize + 'px'
        return
    }

    // 任何时候都按当前视口宽度线性缩放
    const scale = innerWidth / baseWidth
    document.documentElement.style.fontSize = baseSize * scale + 'px'
}
setRem()
// 60 fps 刷新，肉眼流畅
if (!isElectron) {
    addEventListener('resize', () => requestAnimationFrame(setRem))
}