import { stores } from './Stores';
import { flattenArray } from './Utils'

/**
 * 与 HID 设备通讯（单函数版）
 * @param {number} commandCode 命令码
 * @param {number} [maxRetries=3] 最大重试次数
 * @returns {Promise<any>} 设备返回的数据
 */
export async function communicateWithDevice(commandCode, maxRetries = 3, device = null) {
    //常量
    const CMD_LENGTH_FAST = 0x18;
    const TIMEOUT = 2000; // 超时时间设置为2秒

    // 根据协议类型选择对应的命令模板
    const CMD_TPL = {
        1: {// Cherry协议
            0x01: [0x81, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
            0x02: [0x82, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
            0x0d: [0x0d, 0x00, 0x00, 0x00, 0x00],
            0x1c: [0x1c, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
            0xaa: [0xaa, 0x00, 0x00, 0x00, 0x00],
            0x1a: [0x1a, 0x06, 0x00, 0x00, 0x00],
            0xb2: [0xb2, 0x00, 0x00, 0x00, 0x00],
        },
        2: { // Evision协议
            0x01: [0x01, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
            0x02: [0x02, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
            0x0d: [0x0d, 0x00, 0x00, 0x00, 0x00],
            0x1c: [0x1c, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
            0xaa: [0xaa, 0x00, 0x00, 0x00, 0x00],
            0x1a: [0x1a, 0x06, 0x00, 0x00, 0x00],
            0xb2: [0xb2, 0x00, 0x00, 0x00, 0x00],
        }
    }[2] || {};

    // 单次通讯实现
    async function communicateOnce() {
        const dev = device ?? stores.getDevice();
        if (!dev) throw new Error('❌ 设备未连接');
        if (!CMD_TPL[commandCode]) throw new Error(`❌ 无效命令码 ${commandCode}`);

        // 创建发送缓冲区
        const sendBuffer = new Uint8Array(63);
        sendBuffer.set([0x00, 0x00, ...CMD_TPL[commandCode]]);

        // 创建互锁机制
        let responseReceived = false;
        let timeoutOccurred = false;

        return new Promise((resolve, reject) => {
            // 响应处理函数
            const handleResponse = ({ data }) => {
                if (timeoutOccurred) return;

                responseReceived = true;
                dev.removeEventListener('inputreport', handleResponse);
                const bytes = new Uint8Array(data.buffer);
                const result =
                    commandCode === 0x1a || commandCode === 0xaa
                        ? parseInt(bytes[7].toString(10))
                        : bytes;
                resolve(result);
            };

            // 设置超时处理
            const timeoutHandler = setTimeout(() => {
                if (responseReceived) return;

                timeoutOccurred = true;
                dev.removeEventListener('inputreport', handleResponse);
                reject(new Error('通讯超时'));
            }, TIMEOUT);

            // 注册响应监听
            dev.addEventListener('inputreport', handleResponse);

            // 发送命令
            dev.sendReport(4, sendBuffer)
                .catch(error => {
                    clearTimeout(timeoutHandler);
                    dev.removeEventListener('inputreport', handleResponse);
                    reject(new Error(`发送命令失败: ${error.message}`));
                });
        });
    }

    // 重试机制实现
    async function executeWithRetry() {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await communicateOnce();
            } catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    console.warn(`⚠️ 命令 ${commandCode} 执行失败，正在进行第 ${attempt + 1}/${maxRetries} 次重试`);
                    await new Promise(resolve => setTimeout(resolve, 100)); // 重试前短暂延迟
                }
            }
        }

        throw new Error(`❌ 命令 ${commandCode} 执行失败，已重试 ${maxRetries} 次: ${lastError.message}`);
    }

    return executeWithRetry();
}



// 添加一个新函数，用于安全地执行开始和结束通讯
export async function safeCommSession(callback) {
    try {
        // 开始通讯
        await communicateWithDevice(0x01);

        // 执行回调函数
        const result = await callback();

        // 结束通讯
        await communicateWithDevice(0x02);

        return result;
    } catch (error) {
        // 确保即使出错也会尝试结束通讯
        try {
            await communicateWithDevice(0x02);
        } catch (closeError) {
            console.error("结束通讯时出错:", closeError);
        }

        throw error; // 重新抛出原始错误
    }
}


/**
 * 统一的 HID 分段发送函数
 * @param {string}  cmd           命令字（hex，不带 0x）
 * @param {number}  len           总长度（字节）
 * @param {string[]} [dataArr]    可选：灯效数据（hex 字符串数组）
 * @param {number}  [offsetSize]  可选：灯效写入时的额外偏移（矩阵大小）
 * @returns {Promise<string[][]>} 分段返回的数据（hex 字符串二维数组）
 */
/* =========================================
 * 统一的 HID 写入函数
 * ========================================= */
export async function hidTransfer(cmd, len, dataArr = null, offsetSize = 0, quantityOffset = 0) {
    return safeCommSession(() => execHid(cmd, len, dataArr, offsetSize, quantityOffset));
}

// 内部实现
async function execHid(cmd, len, dataArr, offsetSize, quantityOffset) {
    const type = stores.getConnectionType()
    const dev = stores.getDevice();
    //1. 配置表
    const CFG = {
        1: { chunk: 56, packet: 63, lenIdx: 56 }, // connectionType = 1
        2: { chunk: 24, packet: 31, lenIdx: 24 }, // connectionType = 2
    }[type];

    if (!CFG) throw new Error(`不支持的连接类型: ${type}`);
    const { chunk, packet, lenIdx } = CFG;
  
    // 2. 工具函数 
    const hex2 = (n) => (+n).toString(16).toUpperCase().padStart(2, '0');
    const splitHex = (n) => ({
        lowBits: hex2(n & 0xff),
        highBits: hex2((n >> 8) & 0xff),
    });

    // 3. 计算分片
    const total = dataArr ? +dataArr.length : +len;
    const times = Math.ceil(total / chunk);
    const isWrite = Array.isArray(dataArr);

    let index = 0;
    const acc = [];
    let timer = null;
    // 4. Promise 封装
    return new Promise((resolve, reject) => {
        const cleanup = () => {
            clearTimeout(timer);
            dev?.removeEventListener('inputreport', onReport);
        };

        const onReport = (e) => {
            try {
                const { reportId } = e;
                if (reportId !== 4) {
                    console.log("初始化-reportId错误", reportId);
                    return; // 不满足条件，直接返回继续等待正确数据
                }
                const bytes = new Uint8Array(e.data.buffer);

                if (bytes.length < 7) return; // 不满足条件，直接返回继续等待正确数据

                // 获取第三个字节的数据
                const thirdByte = bytes[3];

                // 解析返回数据，统一两位
                const slice = [...bytes.slice(7, 7 + thirdByte)].map((b) => hex2(b));
                
                acc.push(slice);

                if (++index >= times) {
                    clearTimeout(timer);
                    cleanup();
                    resolve(acc);
                    return;
                }
                sendNext(); // 继续下一块
            } catch (err) {
                // 捕获到错误但不立即拒绝Promise，只记录错误
                console.error("onReport处理错误:", err);
                // 不调用reject，继续等待正确数据
            }
        };

        const sendNext = () => {
            const start = index * chunk;
          
            const end = Math.min(start + chunk, total);
            const size = end - start;
            

            const offset = start + (isWrite ? (quantityOffset === 0 ? offsetSize * len : quantityOffset) : 0);
            const { lowBits, highBits } = splitHex(offset);

            const lenField = index === times - 1 ? hex2(size) : hex2(lenIdx);

            const payload = isWrite
                ? dataArr.slice(start, end).join(' ')
                : '';

            const frame = [
                '00', '00', cmd, lenField, lowBits, highBits, '00', payload,
            ]
                .filter(Boolean)
                .join(' ');

            const buf = new Uint8Array(63).fill(0);
            frame.split(' ').forEach((b, i) => (buf[i] = parseInt(b, 16)));

            dev.sendReport(4, buf.buffer);

            //  index 已经指向下一个包了
            // 所以这里判断如果还有下一包才开定时器
            if (index < times) {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    cleanup();
                    reject(new Error('Timeout: no response within 2s'));
                }, 2000);
            }
        };

        //启动 
        dev.addEventListener('inputreport', onReport);
        sendNext();
    });
}


// 初始化
export async function fetchHidData(command, length, dataArr = null, offsetSize = 0) {
    try {
        await new Promise((resolve) => setTimeout(resolve, 10));

        const data = await hidTransfer(command, length, null, offsetSize);

        const flattenedData = await flattenArray(data);
        return flattenedData;
    } catch (error) {
        console.error(`初始化获取失败`, error);
        throw error; // 继续抛出错误以便后续捕获
    }
}
