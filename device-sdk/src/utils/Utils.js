
// 数组扁平化方法
export function flattenArray(input) {
    // 检查是否是嵌套数组，如果是，展平为一维数组
    return Array.isArray(input[0]) ? input.flat() : input;
}


/**
 * 将原始按键码数组按 3 字节分组，在 keyboardMap 中反向查出对应 keyId，
 * 返回 keyId 数组。未匹配返回 -1。
 *
 * 新增规则：
 * 如果一组 3 字节是 70/71 开头，则**只拿中间字节**去匹配 keyboardMap 里
 * KeyCode 为 "00"、"01" … 的 7000+ 条目；
 * 如果一组 3 字节是 14 开头，则**只拿首字节**去匹配 keyboardMap 里
 * KeyCode 为 "14" 的 8000 条目；其余情况保持原有逻辑。
 *
 * @param {string[]} rawData   例：['20','00','29','70','00','00', …]
 * @param {Object} keyboardMap 例：{ 1001:{KeyCode:'20 00 04'}, 7000:{KeyCode:'00'}, 8000:{KeyCode:'14'}, … }
 * @returns {number[]}         例：[1001, 0, 7000, 8000, …]
 */
export function parseKeyIds(rawData, keyboardMap) {
    if (!Array.isArray(rawData) || !rawData.length) return [];

    /* 1. 建立反向索引，完全保留旧逻辑 */
    const codeToId = {};
    Object.keys(keyboardMap).forEach(idStr => {
        const keyId = Number(idStr);
        const code = keyboardMap[keyId].KeyCode.replace(/\s+/g, '').toUpperCase();
        codeToId[code] = keyId;
    });

    /* 2. 额外给 7000+ 系列按“中间字节”建索引，方便 70/71 分支快速查找 */
    const midByteToId = {};               // "00" -> 7000, "01" -> 7001 …
    for (let id = 70000; id <= 70999; id++) {
        if (keyboardMap[id]) {
            const mid = keyboardMap[id].KeyCode.replace(/\s+/g, '').toUpperCase();
            midByteToId[mid] = id;
        }
    }

    /* 3. 额外给 8000 系列按“首字节”建索引，方便 14 分支快速查找 */
    const firstByteToId = {};             // "14" -> 8000
    if (keyboardMap[80000]) {
        const first = keyboardMap[80000].KeyCode.replace(/\s+/g, '').toUpperCase();
        firstByteToId[first] = 80000;
    }

    /* 4. 按 3 字节循环，逻辑与以前完全一致，仅 70/71/14 开头时走特殊分支 */
    const result = [];
    for (let i = 0; i + 2 < rawData.length; i += 3) {
        const g = rawData.slice(i, i + 3).map(v => v.padStart(2, '0').toUpperCase());
        const first = g[0];           // 第 1 字节
        const mid = g[1];           // 第 2 字节（70/71 时用）
        const third = g[2];          // 第 3 字节（14 时用）

        /* 70xx 或 71xx 特殊处理 */
        if (first === '70' || first === '71') {
            result.push(midByteToId[mid] ?? 0);
            continue;
        }

        /* 14xx 特殊处理 */
        if (first === '14') {
            result.push(firstByteToId[first] ?? 0);
            continue;
        }

        /* 组合键特殊处理：首字节为 20 且第二字节为 10/20/40/80 之一且第三字节不为 00 则返回 9000 */
        if (first === '20' && ['10', '20', '40', '80'].includes(mid) && third !== '00') {
            result.push(90000);
            continue;
        }

        /* 原有逻辑：整 3 字节当 key */
        const key = g.join('');
        result.push(codeToId[key] ?? 0);
    }

    return result;
}


/**
 * 根据传入的尾字节，去 keyboardMap 里匹配 KeyCode，
 * 要求 KeyCode 必须以 "20" 开头，忽略中间字节，返回匹配到的 keyId；未匹配返回 0。
 *
 * @param {string} thirdByte 例：'04'
 * @param {Object} keyboardMap 例：{ 1001:{KeyCode:'20 00 04'}, … }
 * @returns {number} 例：1001
 */
export function matchByFirstAndThird(thirdByte, keyboardMap) {
    if (typeof thirdByte !== 'string') return 0;

    const targetThird = thirdByte.padStart(2, '0').toUpperCase();

    for (const [idStr, item] of Object.entries(keyboardMap)) {
        const codes = item.KeyCode.replace(/\s+/g, ' ').trim().split(' ');
        if (codes.length === 3) {
            const mapFirst = codes[0].padStart(2, '0').toUpperCase();
            const mapThird = codes[2].padStart(2, '0').toUpperCase();
            if (mapFirst === '20' && mapThird === targetThird) {
                return Number(idStr);
            }
        }
    }
    return 0;
}


/**
 * 转为7位数2进制数据函数
 *
 * @param {any} decimalValue 当前值 10进制
 * @returns
 */
export function to7BitBinary(decimalValue) {
    // 将十进制数转换为二进制字符串
    const binaryString = Number(decimalValue).toString(2);

    // 使用 padStart 补充前导零，确保是7位
    const paddedBinaryString = binaryString.padStart(7, "0");

    return paddedBinaryString;
}


/*
 * 转换高低位
 *
 * @param {number} value 16进制数字
 * @returns  高低位
 *
 * */
export function splitHex(value) {
    // 如果没有传入值,返回默认值
    if (!value && value !== 0) {
        return { highBits: "00", lowBits: "00" };
    }

    try {
        // 确保value是数字类型
        const decimalValue = Number(value);

        // 如果不是有效数字,返回默认值
        if (isNaN(decimalValue)) {
            return { highBits: "00", lowBits: "00" };
        }

        // 转换为16进制字符串
        const hexValue = decimalValue.toString(16);

        // 转换回整数以便进行位运算
        const intValue = parseInt(hexValue, 16);

        // 获取低字节
        const lowByte = intValue & 0xff;

        // 如果数值小于等于255(0xFF),只返回低位,高位为"00"
        if (intValue <= 0xFF) {
            return {
                highBits: "00",
                lowBits: lowByte.toString(16).padStart(2, "0").toUpperCase()
            };
        }

        // 数值大于255时,获取高字节
        const highByte = (intValue >> 8) & 0xff;

        // 将高低字节转为两位的16进制字符串
        const highBits = highByte.toString(16).padStart(2, "0").toUpperCase();
        const lowBits = lowByte.toString(16).padStart(2, "0").toUpperCase();

        return { highBits, lowBits };
    } catch (error) {
        // 发生错误时返回默认值
        return { highBits: "00", lowBits: "00" };
    }
}