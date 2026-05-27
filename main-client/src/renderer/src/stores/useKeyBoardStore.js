import { defineStore } from "pinia";

// 键盘设备仓库
export const useKeyBoardStore = defineStore("useKeyBoardStore", {
    state: () => ({
        interactionType: 1, //交互类型 1：改键 2：灯效 3：无功能
        keyLayout: [], //按键布局
        defaultKeyMatrixInformation: [], //初始默认按键矩阵信息07
        basicDeviceInfo: [], //初始当前按键矩阵信息08（win默认层）
        currentLayer: 0, //当前层级 0:默认层 1:Mac层 2:Fn层 3:Fn2层
        macMatrixInformation: [], //初始mac层按键矩阵信息08（mac层）
        fn1MatrixInformation: [], //初始fn1层按键矩阵信息26（fn1层）
        fn2MatrixInformation: [], //初始fn2层按键矩阵信息26（fn2层）
        keyColorInformation: [], //初始化按键自定义颜色信息0A
        currentLightMatrix: [], //当前灯光效果矩阵
        customBol: false, //是否是自定义颜色
        currentPickColor: '#ff7200', //当前选中的颜色(用于自定义灯光模式绘制)
    }),
    getters: {
        // 获取当前层级的矩阵信息
        currentMatrixInfo: (state) => {
            switch (state.currentLayer) {
                case 0:
                    return state.basicDeviceInfo;
                case 1:
                    return state.macMatrixInformation;
                case 2:
                    return state.fn1MatrixInformation;
                case 3:
                    return state.fn2MatrixInformation;
                default:
                    return state.basicDeviceInfo;
            }
        }
    },
    actions: {

    },
});