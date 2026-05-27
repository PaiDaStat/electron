// 键盘的相关方法
import { keyboardKeyArray } from './keyboardKeyArray'






/**
 * 构建 keyID → keyName 的映射表（用于当前 keyName 查找）
 */
function buildKeyIdToNameMap(layoutConfig) {
    const map = {};
    layoutConfig.forEach(key => {
        if (key.keyID) {
            map[key.keyID] = key.keyName;
        }
    });
    return map;
}

/**
 * 核心方法：把当前矩阵映射到 UI 按键
 * 支持：UI 配置顺序和物理按键矩阵顺序不一致
 */
export function mapCurrentKeysToLayout(defaultMatrix, currentMatrix, layoutConfig, physicalMatrix = null) {
    // 1. 确定用于物理映射的矩阵
    // 如果传入了 physicalMatrix（通常是 defaultKeyMatrixInformation），则用它来匹配 layoutConfig 中的 keyID
    // 否则回退到使用 defaultMatrix（保持向后兼容）
    const mapMatrix = physicalMatrix || defaultMatrix;
    const mapList = mapMatrix;
    
    // 2. 将默认按键矩阵（目标层默认值）转换为 KeyCode 数组
    const defaultList = defaultMatrix;

    // 3. 将当前按键矩阵（目标层当前值）转换为 KeyCode 数组
    const currentList = currentMatrix;

    // 4. 构建物理位置映射表
    // 使用 mapList (物理布局) 来建立索引映射
    const positionList = mapList.map((mapCode, index) => ({
        mapCode,        // 用于匹配 UI layoutConfig 的 keyID
        defaultCode: defaultList[index], // 目标层的默认 KeyCode (其实是 KeyID)
        currentCode: currentList[index], // 目标层的当前 KeyCode (其实是 KeyID)
        matrixIndex: index
    }));

    // 5. 构建 KeyID 到 KeyName 的映射表，用于快速查找当前按键名称
    // 优化：构建全局 KeyID 映射表，确保能找到所有按键的名称和图标（包括非布局内的功能键）
    const globalKeyMap = {};
    // 遍历 keyArray 获取所有可能的按键定义
    keyboardKeyArray().forEach(group => {
        if (group.keys) {
            group.keys.forEach(k => {
                if (k.keyID) {
                    globalKeyMap[k.keyID] = k;
                }
            });
        }
    });
    // 同时也保留布局中的名称映射作为补充
    const layoutKeyMap = buildKeyIdToNameMap(layoutConfig);

    // 6. 遍历 UI 布局配置，将物理数据映射到 UI 组件
    // 注意：UI 布局顺序可能与物理矩阵顺序不一致，且物理矩阵可能包含空键
    // 因此必须通过 keyID 进行匹配，而不是直接使用索引
    return layoutConfig.map(key => {
        // 在物理位置映射表中查找与当前 UI 按键匹配的项
        // key.keyID 是 UI 配置文件中定义的该按键的唯一标识
        const pos = positionList.find(p => p.mapCode === key.keyID);

        const currentCode = pos ? pos.currentCode : null;
        const defaultCode = pos ? pos.defaultCode : key.keyID;

        // 查找当前按键的详细信息（名称、图标等）
        let currentName = null;
        let currentIcon = null;

        if (currentCode) {
            // 优先查全局表（包含图标信息）
            const globalKey = globalKeyMap[currentCode];
            if (globalKey) {
                currentName = globalKey.keyName;
                currentIcon = globalKey.icon;
            } else {
                // 查布局表（默认按键）
                currentName = layoutKeyMap[currentCode];
            }
        }

        return {
            ...key,

            // 默认按键信息
            defaultKeyCode: defaultCode,
            defaultKeyName: key.keyName,

            // 当前按键信息（如果未找到对应物理按键，则为空）
            currentKeyCode: currentCode,
            currentKeyName: currentName,
            currentKeyIcon: currentIcon, // 新增：当前按键图标，用于 interaction.vue 显示

            // 物理矩阵索引
            // 非常重要：用于 getKeyColor 中从 currentLightMatrix/keyColorInformation 获取颜色
            matrixIndex: pos ? pos.matrixIndex : -1,

            // 状态标记：当前按键是否被修改（与该层的默认值不同）
            changed: currentCode !== defaultCode,

            // 初始化背景色
            bgColor: 'var(--keyboard-key-bg-color)',
        };
    });
}
