// 判断是否在 Electron 环境 (通过检查 window.api 是否存在)
const isElectron = typeof window !== 'undefined' && !!window.api;


export default isElectron;
