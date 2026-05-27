
let device = null;// 设备实例
let connectionType = 1;//设备模式 1 有线 2 2.4G
let deviceType = 1;//设备类型 1 键盘 2 鼠标
let agreement = 2;//协议
let profileSize = 128;//一个profile的大小
let matrixSize = 384;//一个按键矩阵的大小
let profileTotalNumber = 1;//当前设备有几个profile
let profileNumber = 0;//当前设备处于第一个profile
let currentKeyMatrixdata = [];//当前按键矩阵
let defaultKeyMatrixdata = [];//默认按键矩阵
let funcInformationInfo = [];//功能区设置
let commandTable = {};//命令表配置
let LightingEffectList = [];//灯光效果列表数据


export const stores = Object.freeze({
    //设置实例
    setDevice(d) { device = d; },
    //获取实例
    getDevice() { return device; },
    //获取当前设备模式
    getConnectionType() { return connectionType },
    //设置当前设备模式
    setConnectionType(d) { connectionType = d; },
    //获取profile的大小
    getProfileSize() { return profileSize },
    //获取按键矩阵的大小
    getMatrixSize() { return matrixSize },
    //获取当前设备有几个profile
    getProfileTotalNumber() { return profileTotalNumber },
    //获取当前设备处于第一个profile
    getProfileNumber() { return profileNumber },
    //设置相关基本信息
    setConfigurationFile(match) {
        connectionType = match.connectionType;
        profileSize = match.config.profileSize;
        matrixSize = match.config.matrixSize;
        profileTotalNumber = match.config.profileTotalNumber;
        deviceType = match.config.deviceType;
        LightingEffectList = match.config.LightingEffectList;
        commandTable = match.config.commandTable || {};
    },
    //获取命令表配置
    getCommandTable() { return commandTable },
    //获取当前按键矩阵数据
    getCurrentKeyMatrixdata() { return currentKeyMatrixdata },
    //设置当前按键矩阵数据
    setCurrentKeyMatrixdata(data) { currentKeyMatrixdata = data },
    //获取当前按键矩阵数据
    getDefaultKeyMatrixdata() { return defaultKeyMatrixdata },
    //设置默认按键矩阵数据
    setDefaultKeyMatrixdata(data) { defaultKeyMatrixdata = data },
    //获取当前功能区设置
    getFuncInformationInfo() { return funcInformationInfo },
    //设置当前功能区设置
    setFuncInformationInfo(data) { funcInformationInfo = data },
    //获取当前灯光效果列表数据
    getLightingEffectList() { return LightingEffectList },
})                                                                                  
