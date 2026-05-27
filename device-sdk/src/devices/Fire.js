import { stores } from '../utils/Stores'
import { parseKeyIds, flattenArray, matchByFirstAndThird } from '../utils/Utils'
import { keyboardMap } from '../utils/KeyMap'
import { hidTransfer } from '../utils/hidCore'


//火力键操作
export const FireSetting = core => {
    // 公共：根据 defaulCode 拿到 groupIdx
    const getGroupIdx = defaulCode => {
        const defaultdata = stores.getDefaultKeyMatrixdata();
        const idx = parseKeyIds(defaultdata, keyboardMap).indexOf(defaulCode);
        if (idx === 0) throw new Error(`defaultCode ${defaulCode} 未在矩阵中找到`);
        return idx;
    };

    // 公共：下发矩阵并刷新缓存
    const flushMatrix = async currentdata => {
        const result = await hidTransfer('09', stores.getMatrixSize(), currentdata, stores.getProfileNumber());
        const newData = await flattenArray(result);
        stores.setCurrentKeyMatrixdata(newData);
    };

    return {
        // 获取火力键设置
        getFireSetting: async defaulCode => {
            try {
                const currentdata = stores.getCurrentKeyMatrixdata();
                const groupIdx = getGroupIdx(defaulCode);
                const [head, mid, tail] = currentdata.slice(groupIdx * 3, groupIdx * 3 + 3);

                if (head !== '14') throw new Error(`defaultCode ${defaulCode} 未设置为火力键`);

                return {
                    data: { interval: parseInt(mid, 16), quantity: parseInt(tail, 16) },
                    status: 'success'
                };
            } catch (error) {
                throw new Error(`getFireSetting 失败: ${error.message}`);
            }
        },

        // 火力键设置
        setFireSetting: async ({ interval, quantity, defaulCode }) => {
            try {
                const currentdata = stores.getCurrentKeyMatrixdata();
                const groupIdx = getGroupIdx(defaulCode);

                const fireKey = [
                    '14',
                    interval.toString(16).toUpperCase().padStart(2, '0'),
                    quantity.toString(16).toUpperCase().padStart(2, '0')
                ];

                currentdata.splice(groupIdx * 3, 3, ...fireKey);
                await flushMatrix(currentdata);

                return { status: 'success' };
            } catch (error) {
                throw new Error(`setFireSetting 失败: ${error.message}`);
            }
        },

        // 获取组合键
        getCombinationKey: async defaulCode => {
            try {
                const currentdata = stores.getCurrentKeyMatrixdata();
                const groupIdx = getGroupIdx(defaulCode);
                const [head, mid, tail] = currentdata.slice(groupIdx * 3, groupIdx * 3 + 3);

                const validMid = ['10', '20', '40', '80', '01', '02', '04', '08'];
                if (head !== '20' || !validMid.includes(mid)) {
                    throw new Error(`defaultCode ${defaulCode} 未设置为组合键`);
                }

                const systemKey = ['10', '01'].includes(mid) ? 0
                    : ['20', '02'].includes(mid) ? 1
                        : ['40', '04'].includes(mid) ? 2
                            : ['80', '08'].includes(mid) ? 3 : 0;

                return {
                    data: { systemKey, bindingKey: matchByFirstAndThird(tail, keyboardMap) },
                    status: 'success'
                };
            } catch (error) {
                throw new Error(`getCombinationKey 失败: ${error.message}`);
            }
        },

        // 组合键设置
        setCombinationKey: async ({ systemKey, bindingKey, defaulCode }) => {
            try {
                const currentdata = stores.getCurrentKeyMatrixdata();
                const groupIdx = getGroupIdx(defaulCode);

                const midMap = ['10', '20', '40', '80'];
                const mid = midMap[systemKey] || '00';
                const tail = keyboardMap[bindingKey]?.KeyCode?.split(' ')[2] || '00';

                const combinationKey = ['20', mid, tail];
                currentdata.splice(groupIdx * 3, 3, ...combinationKey);
                await flushMatrix(currentdata);

                return { status: 'success' };
            } catch (error) {
                throw new Error(`setCombinationKey 失败: ${error.message}`);
            }
        }
    };
};
