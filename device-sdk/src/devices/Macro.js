import { stores } from '../utils/Stores'
import { parseKeyIds, flattenArray, to7BitBinary, splitHex } from '../utils/Utils'
import { keyboardMap } from '../utils/KeyMap'
import { hidTransfer } from '../utils/hidCore'


//设置宏操作
export const MacroSetting = core => {
    //转译宏数据
    const parseKeyCode = async (macroData) => {
        // 将宏数据转换为带有KeyCode的格式
        const convertedMacroData = macroData.map(item => {
            // 从keyboardMap中获取对应的KeyCode
            const keyMapItem = keyboardMap[item.keyCode];
            if (!keyMapItem) {
                throw new Error(`未找到keyCode ${item.keyCode} 对应的键盘映射`);
            }

            // 根据keyCode范围判断类型
            let type;
            let code;
            const keyCodeNum = parseInt(item.keyCode);
            if (keyCodeNum >= 10000 && keyCodeNum <= 19999) {
                type = "keyboard";
                // 从KeyCode中提取第三位作为code
                code = keyMapItem.KeyCode.split(' ')[2];
            } else if (keyCodeNum >= 20000 && keyCodeNum <= 29999) {
                type = "mouse";
                // 从KeyCode中提取中间位作为code
                code = keyMapItem.KeyCode.split(' ')[1];
            }

            // 返回新的数据结构，包含status、delay、KeyCode、type和code
            return {
                status: item.status,
                delay: item.delay,
                KeyCode: keyMapItem.KeyCode,
                type: type,
                code: code
            };
        });
        // console.log(convertedMacroData, '转译后的数据');

        // 添加错误处理和验证
        if (!Array.isArray(convertedMacroData) || convertedMacroData.length === 0) {
            return [];
        }

        //热键
        const hotKey = ['20 08 00', '20 80 00', '20 02 00', '20 20 00', '20 01 00', '20 10 00', '20 04 00', '20 40 00'];

        // 存储最终结果的数组
        let result = [];

        try {
            // 遍历处理每个宏数据
            convertedMacroData.forEach((data, index) => {
                // 验证必要的数据字段
                if (!data || !data.delay || !data.type || !data.code) {
                    throw new Error(`第 ${index} 个宏数据缺少必要字段`);
                }

                // 处理延迟时间
                const { highBits, lowBits } = splitHex(data.delay);

                // 确定基础字节值
                let baseThirdByte;
                if (data.type === "keyboard") {
                    // 检查KeyCode的前两部分是否匹配热键
                    const keyCodePrefix = data.KeyCode.split(' ').slice(0, 2).join(' ');
                    const isHotKey = hotKey.some(hk => hk.startsWith(keyCodePrefix));
                    baseThirdByte = isHotKey ? 9 : 10;
                } else if (data.type === "mouse") {
                    baseThirdByte = 1;
                } else {
                    throw new Error(`未知的设备类型: ${data.type}`);
                }

                // 转换为7位二进制
                const binaryBase = to7BitBinary(baseThirdByte);

                // 添加状态位 (1表示按下↓, 0表示抬起↑)
                const statusBit = data.status;
                const fullBinary = statusBit + binaryBase;

                // 转换回16进制
                const thirdByte = parseInt(fullBinary, 2).toString(16).toUpperCase().padStart(2, "0");

                // 添加四个字节到结果数组
                result.push(
                    lowBits,
                    highBits,
                    thirdByte,
                    data.code
                );
            });
            return result;

        } catch (error) {
            console.error('处理宏数据时出错:', error.message);
            return [];
        }
    }
    //转译宏指针等
    const editMacro = async (data) => {
        /* 1. 固定头 */
        const macroHeader = [
            'aa', '55', '82', '00', '05', '00', ...Array(10).fill('00')
        ];

        /* 2. 预计算 5 个指针（一定 5 个）*/
        const pointers = [];
        let offset = 16 + 5 * 2;          // 固定头 + 5*2 字节指针区
        const sizeList = data.map(item => (item.macros.length + 1) * 4);
        for (let i = 0; i < 5; i++) {
            pointers.push([offset.toString(16).padStart(2, '0'), '00']);
            offset += sizeList[i];
        }

        /* 3. 头 + 指针 */
        let allMacroData = [...macroHeader, ...pointers.flat()];

        /* 4. 5 个宏全部走一遍 */
        for (let i = 0; i < 5; i++) {
            const len = data[i].macros.length;
            const actionCount = splitHex(len);
            const header = [actionCount.lowBits, actionCount.highBits, '00', '00'];
            allMacroData.push(...header);

            if (len > 0) {
                const cmdData = await parseKeyCode(data[i].macros);
                allMacroData.push(...cmdData);
            }
            // len === 0 时，后面不再追加任何字节
        }

        return allMacroData;
    };

    return {
        //获取宏模式
        async getMacroMode(mId) {
            try {
                // 参数校验：范围 7000-7005
                if (!Number.isInteger(mId) || mId < 70000 || mId > 70010) {
                    throw new Error(`宏按键 macroId 错误，当前ID：${mId}`);
                }

                const macroIndex = keyboardMap[mId]?.KeyCode;
                if (!macroIndex) throw new Error('未找到该宏macroId');

                const currentdata = stores.getCurrentKeyMatrixdata();

                // 一次循环定位 3 字节组，减少重复计算
                let matchedKey = null;
                for (let i = 0, len = currentdata.length; i + 2 < len; i += 3) {
                    const [head, mid, tail] = currentdata.slice(i, i + 3);
                    if ((head === '70' || head === '71') && mid === macroIndex) {
                        matchedKey = { head, tail };
                        break;
                    }
                }

                if (!matchedKey) {
                    return { data: '未找到', status: 'error' };
                }

                // 统一解析逻辑
                const isRepeatMode = matchedKey.head === '71';
                return {
                    status: 'success',
                    data: {
                        macroId: mId,
                        mode: isRepeatMode ? 4 : parseInt(matchedKey.tail, 16),
                        repNum: isRepeatMode ? parseInt(matchedKey.tail, 16) : 1
                    }
                };
            } catch (error) {
                throw new Error(`getMacroMode 失败: ${error.message}`);
            }
        },
        //设置宏模式
        async setMacroMode(params) {
            try {
                const { macroId, mode, repNum, defaulCode } = params;
                // 参数校验：一次性检查所有字段是否为数字
                if (![macroId, mode, repNum, defaulCode].every(v => typeof v === 'number')) {
                    throw new Error('参数不能少且必须为数字');
                }

                const macroIndex = keyboardMap[macroId]?.KeyCode;
                if (!macroIndex) throw new Error('keyboardMap 未找到该宏macroId');

                // 根据 mode 生成 3 字节 KeyCode
                const headData = mode === 4 ? '71' : '70';
                const tailByte = mode === 4
                    ? repNum.toString(16).padStart(2, '0')
                    : mode.toString(16).padStart(2, '0');
                const KeyCode = [headData, macroIndex, tailByte];

                // console.log(KeyCode, '最后的转化数据');

                // 定位并替换矩阵数据
                const currentdata = stores.getCurrentKeyMatrixdata();
                const defaultdata = stores.getDefaultKeyMatrixdata();
                const groupIdx = parseKeyIds(defaultdata, keyboardMap).indexOf(defaulCode);
                if (groupIdx === 0) {
                    throw new Error(`defaultCode ${defaulCode} 未在矩阵中找到`);
                }
                currentdata.splice(groupIdx * 3, 3, ...KeyCode);

                // 下发并更新缓存
                const result = await hidTransfer('09', stores.getMatrixSize(), currentdata, stores.getProfileNumber());
                const newData = await flattenArray(result);
                stores.setCurrentKeyMatrixdata(newData);
                // console.log(newData, '最后的新数据');

                return { status: 'success' };
            } catch (error) {
                throw new Error(`setMacroMode 失败: ${error.message}`);
            }
        },
        //获取宏数据
        async getMacroData() {
            return {
                status: 'Not supported'
            }
        },
        //设置宏数据
        async setMacroData(data) {
            try {
                // 校验输入为数组且长度必须为5
                if (!Array.isArray(data) || data.length !== 5) {
                    throw new Error('data必须是包含5个宏对象的数组');
                }
                // 先生成完整的宏数据模板
                const macroData = await editMacro(data);
                // console.log(macroData, '完整的宏数据模板');

                const result2 = await hidTransfer('15', macroData.length, macroData);
                const newData1 = await flattenArray(result2);
                // console.log(newData1, '编译宏');
                return {
                    status: 'success'
                };
            } catch (error) {
                throw new Error(`setMacroData 失败: ${error.message}`);
            }
        }
    }
}