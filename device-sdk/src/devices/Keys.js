import { stores } from '../utils/Stores'
import { parseKeyIds, flattenArray } from '../utils/Utils'
import { keyboardMap } from '../utils/KeyMap'
import { fetchHidData, hidTransfer } from '../utils/hidCore'

//改键方面
export const Changekey = core => {
    // 统一处理矩阵数据获取的函数
    const getMatrixData = async (command) => {
        try {
            const matrixSize = stores.getMatrixSize();
            const matrixData = await fetchHidData(command, matrixSize);
            const matrixIndexData = parseKeyIds(matrixData, keyboardMap);
            return {
                matrixData,
                matrixIndexData,
                status: 'success'
            };
        } catch (error) {
            throw new Error(`读取失败: ${error.message}`);
        }
    };

    // 统一处理数据写入的函数
    const writeMatrixData = async (data) => {
        try {
            const matrixSize = stores.getMatrixSize();
            const profileNumber = stores.getProfileNumber();
            const result = await hidTransfer('09', matrixSize, data, profileNumber);
            const newData = await flattenArray(result);
            stores.setCurrentKeyMatrixdata(newData);
            return { status: 'success' };
        } catch (error) {
            throw new Error(`写入失败: ${error.message}`);
        }
    };

    return {
        //获取默认按键矩阵
        async getDefaultKeyLayout() {
            const result = await getMatrixData('07');
            if (result.status === 'success') {
                stores.setDefaultKeyMatrixdata(result.matrixData);
            }
            return {
                data: result.matrixIndexData,
                status: result.status
            };
        },

        //获取当前按键矩阵
        async getKeyLayout() {
            const result = await getMatrixData('08');
            if (result.status === 'success') {
                stores.setCurrentKeyMatrixdata(result.matrixData);
            }
            return {
                data: result.matrixIndexData,
                status: result.status
            };
        },

        //设置普通按键操作
        async setKeyCode(params) {
            try {
                const { currentCode, defaulCode } = params;
                if (currentCode >= 10000 || defaulCode >= 10000) {
                    throw new Error(`不支持Fn按键相关操作`);
                }
                const currentdata = stores.getCurrentKeyMatrixdata();
                const defaultdata = stores.getDefaultKeyMatrixdata();
                const keyIdArr = parseKeyIds(defaultdata, keyboardMap);
                const groupIdx = keyIdArr.indexOf(defaulCode);

                if (groupIdx === 0) {
                    throw new Error(`defaultCode ${defaulCode} 未在矩阵中找到`);
                }

                const keyCodeToSet = keyboardMap[currentCode]?.KeyCode;
                if (!keyCodeToSet) {
                    throw new Error(`currentCode ${currentCode} 在键盘映射表中未找到`);
                }

                const keyCodes = keyCodeToSet.split(' ');
                const startIndex = groupIdx * 3;

                // 使用数组解构赋值优化赋值操作
                [
                    currentdata[startIndex],
                    currentdata[startIndex + 1],
                    currentdata[startIndex + 2]
                ] = keyCodes;

                return await writeMatrixData(currentdata);
            } catch (error) {
                throw new Error(`setKeyCode 失败: ${error.message}`);
            }
        },

        //恢复默认按键
        async restoreKeyCode() {
            const defaultdata = stores.getDefaultKeyMatrixdata();
            return await writeMatrixData(defaultdata);
        }
    };
};
