import { stores } from '../utils/Stores'
import { parseKeyIds, flattenArray, to7BitBinary, splitHex } from '../utils/Utils'
import { keyboardMap } from '../utils/KeyMap'
import { hidTransfer } from '../utils/hidCore'
import { exportFileData, decrypt } from '../utils/fileSaver.js'


//导入导出配置文件
export const ImportAndExport = core => {
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
    // 从上传文件中获取 File 对象
    const getFile = (payload) => {
        // 如果 payload 本身已经是 File，直接返回
        if (payload instanceof File) return payload
        // 如果是 el-upload 的格式，取 raw
        if (payload?.raw instanceof File) return payload.raw
        // 其它情况一律当无效处理
        return null
    }
    return {
        //配置文件导出
        async exportConfigFile(macroData) {
            try {
                // 校验输入为数组且长度必须为5
                if (!Array.isArray(macroData) || macroData.length !== 5) {
                    throw new Error('data必须是包含5个宏对象的数组');
                }
                //当前按键矩阵
                const currentdata = stores.getCurrentKeyMatrixdata();
                //功能区
                const funcInfo = stores.getFuncInformationInfo()
                // 先生成完整的宏数据模板
                const macro = await editMacro(macroData);

                const data = {
                    // id: stores.getDeviceId(),
                    currentdata,
                    funcInfo,
                    macro,
                    macroData
                }
                console.log(data, '完整的配置数据');
                const name = 'AULA' + '-Profile'
                await exportFileData(data, name)

                return {
                    status: 'success',
                    message: '配置文件导出成功'
                }

            } catch (error) {
                throw new Error(`exportConfig 失败: ${error.message}`);
            }
        },
        //配置文件导入
        importConfigFile(payload) {
            return new Promise((resolve, reject) => {
                try {
                    const file = getFile(payload)
                    if (!file) {
                        return reject(new Error('无效的文件上传'))
                    }

                    const reader = new FileReader()
                    reader.readAsDataURL(file)

                    reader.onload = async () => {
                        try {
                            const base64String = reader.result.split(',')[1]
                            const decodedContent = atob(base64String)
                            const decryptData = await decrypt(decodedContent)

                            if (!decryptData) {
                                throw new Error('文件解析失败或文件格式损坏')
                            }

                            const isValidConfig = decryptData.currentdata.length === 33 && decryptData.funcInfo.length === 128

                            if (!isValidConfig) {
                                throw new Error("配置文件数据不匹配");
                            }
                            //把数据向设备中写入

                            resolve({
                                status: 'success',
                                message: '配置文件导入成功',
                                macroData: decryptData?.macroData || []
                            })
                        } catch (err) {
                            reject(new Error(`importConfig 失败: ${err.message}`))
                        }
                    }

                    reader.onerror = () => {
                        reject(new Error('文件读取失败'))
                    }
                } catch (err) {
                    reject(new Error(`exportConfig 失败: ${err.message}`))
                }
            })
        },
    }
}