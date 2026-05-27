import { defineStore } from "pinia";

// 键盘设备仓库
export const useKeyBoardStore = defineStore("useKeyBoardStore", {
    state: () => ({
        interactionType: 1, //交互类型 1：改键 2：灯效 3：无功能
    }),
    getters: {

    },
    actions: {

    },
});