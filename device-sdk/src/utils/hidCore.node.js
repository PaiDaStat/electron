// import { stores } from './Stores.js';
// import { flattenArray } from './Utils.js';

// console.log('[hidCore.node.js] Loaded');

// /**
//  * 与 HID 设备通讯（单函数版 - Node.js）
//  * @param {number} commandCode 命令码
//  * @param {number} [maxRetries=3] 最大重试次数
//  * @param {object} [device=null] 设备实例
//  * @returns {Promise<any>} 设备返回的数据
//  */
// export async function communicateWithDevice(commandCode, maxRetries = 3, device = null) {
//     //常量
//     const CMD_LENGTH_FAST = 0x18;
//     const TIMEOUT = 2000; // 超时时间设置为2秒

//     // 根据协议类型选择对应的命令模板
//     const CMD_TPL = {
//         1: {// Cherry协议
//             0x01: [0x81, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
//             0x02: [0x82, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
//             0x0d: [0x0d, 0x00, 0x00, 0x00, 0x00],
//             0x1c: [0x1c, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
//             0xaa: [0xaa, 0x00, 0x00, 0x00, 0x00],
//             0x1a: [0x1a, 0x06, 0x00, 0x00, 0x00],
//             0xb2: [0xb2, 0x00, 0x00, 0x00, 0x00],
//         },
//         2: { // Evision协议
//             0x01: [0x01, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
//             0x02: [0x02, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
//             0x0d: [0x0d, 0x00, 0x00, 0x00, 0x00],
//             0x1c: [0x1c, CMD_LENGTH_FAST, 0x00, 0x00, 0x00],
//             0xaa: [0xaa, 0x00, 0x00, 0x00, 0x00],
//             0x1a: [0x1a, 0x06, 0x00, 0x00, 0x00],
//             0xb2: [0xb2, 0x00, 0x00, 0x00, 0x00],
//         }
//     }[2] || {};

//     // 单次通讯实现
//     async function communicateOnce() {
//         const dev = device ?? stores.getDevice();
//         if (!dev) throw new Error('❌ 设备未连接');
//         if (!CMD_TPL[commandCode]) throw new Error(`❌ 无效命令码 ${commandCode}`);

//         // 创建发送缓冲区
//         // WebHID: 63 bytes payload. Report ID 4 passed separately.
//         // Node-HID: Write [ReportID, ...payload] if using write().
//         const payload = new Uint8Array(63);
//         payload.set([0x00, 0x00, ...CMD_TPL[commandCode]]);

//         // Node-HID write expects array of numbers or Buffer.
//         // Prepend Report ID 4.
//         const sendData = [0x04, ...payload];

//         // 创建互锁机制
//         let responseReceived = false;
//         let timeoutOccurred = false;

//         return new Promise((resolve, reject) => {
//             // 响应处理函数
//             const handleResponse = (data) => {
//                 if (timeoutOccurred) return;

//                 // data is Buffer.
//                 // WebHID logic checks reportId. 
//                 // Node-HID 'data' event usually contains the payload.
//                 // We need to verify if data matches expected format.
//                 // Assuming data corresponds to the input report payload.

//                 // WebHID inputreport event logic in hidCore.js just takes bytes.
//                 // But wait, hidCore.js logic:
//                 // const bytes = new Uint8Array(data.buffer);
//                 // commandCode === 0x1a || 0xaa ? bytes[7] : bytes;

//                 responseReceived = true;
//                 dev.removeListener('data', handleResponse);
//                 const bytes = new Uint8Array(data);
//                 const result =
//                     commandCode === 0x1a || commandCode === 0xaa
//                         ? parseInt(bytes[7].toString(10))
//                         : bytes;
//                 resolve(result);
//             };

//             // 设置超时处理
//             const timeoutHandler = setTimeout(() => {
//                 if (responseReceived) return;

//                 timeoutOccurred = true;
//                 dev.removeListener('data', handleResponse);
//                 reject(new Error('通讯超时'));
//             }, TIMEOUT);

//             // 注册响应监听
//             dev.on('data', handleResponse);

//             // 发送命令
//             try {
//                 dev.write(sendData);
//             } catch (error) {
//                 clearTimeout(timeoutHandler);
//                 dev.removeListener('data', handleResponse);
//                 reject(new Error(`发送命令失败: ${error.message}`));
//             }
//         });
//     }

//     // 重试机制实现
//     async function executeWithRetry() {
//         let lastError;

//         for (let attempt = 1; attempt <= maxRetries; attempt++) {
//             try {
//                 return await communicateOnce();
//             } catch (error) {
//                 lastError = error;
//                 if (attempt < maxRetries) {
//                     console.warn(`⚠️ 命令 ${commandCode} 执行失败，正在进行第 ${attempt + 1}/${maxRetries} 次重试`);
//                     await new Promise(resolve => setTimeout(resolve, 100)); // 重试前短暂延迟
//                 }
//             }
//         }

//         throw new Error(`❌ 命令 ${commandCode} 执行失败，已重试 ${maxRetries} 次: ${lastError.message}`);
//     }

//     return executeWithRetry();
// }



// // 添加一个新函数，用于安全地执行开始和结束通讯
// export async function safeCommSession(callback) {
//     try {
//         // 开始通讯
//         await communicateWithDevice(0x01);

//         // 执行回调函数
//         const result = await callback();

//         // 结束通讯
//         await communicateWithDevice(0x02);

//         return result;
//     } catch (error) {
//         // 确保即使出错也会尝试结束通讯
//         try {
//             await communicateWithDevice(0x02);
//         } catch (closeError) {
//             console.error("结束通讯时出错:", closeError);
//         }

//         throw error; // 重新抛出原始错误
//     }
// }


// /**
//  * 统一的 HID 分段发送函数 (Node.js)
//  * @param {string}  cmd           命令字（hex，不带 0x）
//  * @param {number}  len           总长度（字节）
//  * @param {string[]} [dataArr]    可选：灯效数据（hex 字符串数组）
//  * @param {number}  [offsetSize]  可选：灯效写入时的额外偏移（矩阵大小）
//  * @returns {Promise<string[][]>} 分段返回的数据（hex 字符串二维数组）
//  */
// /* =========================================
//  * 统一的 HID 写入函数
//  * ========================================= */
// export async function hidTransfer(cmd, len, dataArr = null, offsetSize = 0, quantityOffset = 0) {
//     return safeCommSession(() => execHid(cmd, len, dataArr, offsetSize, quantityOffset));
// }

// // 内部实现
// async function execHid(cmd, len, dataArr, offsetSize, quantityOffset) {

//     const type = stores.getConnectionType()
//     const dev = stores.getDevice();
//     //1. 配置表
//     const CFG = {
//         1: { chunk: 56, packet: 63, lenIdx: 56 }, // connectionType = 1
//         2: { chunk: 24, packet: 31, lenIdx: 24 }, // connectionType = 2
//     }[type];

//     if (!CFG) throw new Error(`不支持的连接类型: ${type}`);
//     const { chunk, packet, lenIdx } = CFG;

//     // 2. 工具函数 
//     const hex2 = (n) => (+n).toString(16).toUpperCase().padStart(2, '0');
//     const splitHex = (n) => ({
//         lowBits: hex2(n & 0xff),
//         highBits: hex2((n >> 8) & 0xff),
//     });

//     // 3. 计算分片
//     const total = dataArr ? +dataArr.length : +len;
//     const times = Math.ceil(total / chunk);

//     const isWrite = Array.isArray(dataArr);

//     let index = 0;
//     const acc = [];
//     let timer = null;
//     // 4. Promise 封装
//     return new Promise((resolve, reject) => {
//         const cleanup = () => {
//             clearTimeout(timer);
//             dev?.removeListener('data', onReport);
//         };

//         const onReport = (data) => {
//             try {
//                 // Node-HID data is Buffer. 
//                 // Need to verify reportId if possible.
//                 // Assuming data is the payload.
//                 // WebHID logic checks reportId !== 4.
//                 // Here we might not have reportId in data if it's stripped.
//                 // But usually first byte of data might be part of payload.
//                 // Let's assume we receive the correct report.

//                 const bytes = new Uint8Array(data);

//                 if (bytes.length < 8) return; // 不满足条件，直接返回继续等待正确数据

//                 // 获取数据长度 (Node-HID index 4 corresponds to WebHID index 3)
//                 const dataLen = bytes[4];

//                 // 解析返回数据，统一两位，去掉前8个字节，取 dataLen 长度的数据
//                 const slice = [...bytes.slice(8, 8 + dataLen)].map((b) => hex2(b));

//                 acc.push(slice);
//                 if (++index >= times) {
//                     clearTimeout(timer);
//                     cleanup();
//                     resolve(acc);
//                     return;
//                 }
//                 sendNext(); // 继续下一块
//             } catch (err) {
//                 // 捕获到错误但不立即拒绝Promise，只记录错误
//                 console.error("onReport处理错误:", err);
//                 // 不调用reject，继续等待正确数据
//             }
//         };

//         const sendNext = () => {
//             const start = index * chunk;

//             const end = Math.min(start + chunk, total);

//             const size = end - start;

//             const offset = start + (isWrite ? (quantityOffset === 0 ? offsetSize * len : quantityOffset) : 0);

//             const { lowBits, highBits } = splitHex(offset);

//             const lenField = index === times - 1 ? hex2(size) : hex2(lenIdx);


//             const payload = isWrite
//                 ? dataArr.slice(start, end).join(' ')
//                 : '';

//             const frame = [
//                 '00', '00', cmd, lenField, lowBits, highBits, '00', payload,
//             ]
//                 .filter(Boolean)
//                 .join(' ');

//             const buf = new Uint8Array(63).fill(0);
//             frame.split(' ').forEach((b, i) => (buf[i] = parseInt(b, 16)));

//             // Node-HID write with Report ID 4
//             const writeData = [0x04, ...buf];

//             try {
//                 dev.write(writeData);
//             } catch (e) {
//                 cleanup();
//                 reject(e);
//                 return;
//             }

//             //  index 已经指向下一个包了
//             // 所以这里判断如果还有下一包才开定时器
//             if (index < times) {
//                 clearTimeout(timer);
//                 timer = setTimeout(() => {
//                     cleanup();
//                     reject(new Error('Timeout: no response within 2s'));
//                 }, 2000);
//             }
//         };

//         //启动 
//         dev.on('data', onReport);
//         sendNext();
//     });
// }


// // 初始化
// export async function fetchHidData(command, length, dataArr = null, offsetSize = 0) {
//     try {
//         await new Promise((resolve) => setTimeout(resolve, 10));

//         const data = await hidTransfer(command, length, null, offsetSize);

//         const flattenedData = await flattenArray(data);
//         return flattenedData;
//     } catch (error) {
//         console.error(`初始化获取失败`, error);
//         throw error; // 继续抛出错误以便后续捕获
//     }
// }








import { stores } from './Stores.js';
import { flattenArray } from './Utils.js';

console.log('[hidCore.node.js] Loaded');

const TIMEOUT = 2000;

let writeLock = Promise.resolve();
const pendingQueue = [];

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function safeWrite(dev, data) {
    const run = writeLock
        .catch(() => undefined)
        .then(async () => {
        dev.write(data);
        await sleep(2); // 防止 HID 忙
    });

    writeLock = run.catch(() => undefined);

    return run;
}

function rejectAllPending(error) {
    const pending = pendingQueue.splice(0, pendingQueue.length);
    pending.forEach((item) => {
        clearTimeout(item.timer);
        item.reject(error);
    });
}

function isValidResponse(bytes) {
    return bytes.length >= 8;
}

function setupGlobalListener(dev) {

    if (!dev || dev.__listenerAttached) return;

    const onData = (data) => {
        const bytes = new Uint8Array(data);
        const idx = pendingQueue.findIndex((item) => item.matcher(bytes));

        if (idx >= 0) {
            const [current] = pendingQueue.splice(idx, 1);
            clearTimeout(current.timer);
            current.resolve(data);
        }
    };

    const onError = (err) => {
        rejectAllPending(new Error(`HID 通道异常: ${err?.message || 'unknown error'}`));
    };

    dev.on('data', onData);
    dev.on('error', onError);
    dev.__hidCoreOnData = onData;
    dev.__hidCoreOnError = onError;
    dev.__listenerAttached = true;
}

export function resetHidCoreState(dev = null) {
    writeLock = Promise.resolve();
    rejectAllPending(new Error('设备连接已重置'));

    if (!dev || !dev.__listenerAttached) return;

    if (dev.__hidCoreOnData) {
        dev.removeListener('data', dev.__hidCoreOnData);
    }

    if (dev.__hidCoreOnError) {
        dev.removeListener('error', dev.__hidCoreOnError);
    }

    dev.__hidCoreOnData = null;
    dev.__hidCoreOnError = null;
    dev.__listenerAttached = false;
}

function createResponsePromise(matcher = isValidResponse) {

    return new Promise((resolve, reject) => {
        const entry = {
            resolve,
            reject,
            matcher,
            timer: null
        };

        entry.timer = setTimeout(() => {
            const idx = pendingQueue.indexOf(entry);
            if (idx >= 0) pendingQueue.splice(idx, 1);
            reject(new Error('通讯超时'));
        }, TIMEOUT);

        pendingQueue.push(entry);
    });

}

export async function communicateWithDevice(commandCode, maxRetries = 3, device = null) {

    const CMD_LENGTH_FAST = 0x18;

    const CMD_TPL = {
        0x01: [0x01, CMD_LENGTH_FAST, 0, 0, 0],
        0x02: [0x02, CMD_LENGTH_FAST, 0, 0, 0],
        0x0d: [0x0d, 0, 0, 0, 0],
        0x1c: [0x1c, CMD_LENGTH_FAST, 0, 0, 0],
        0xaa: [0xaa, 0, 0, 0, 0],
        0x1a: [0x1a, 0x06, 0, 0, 0],
        0xb2: [0xb2, 0, 0, 0, 0],
    };

    async function once() {

        const dev = device ?? stores.getDevice();

        if (!dev) throw new Error('设备未连接');
        if (!CMD_TPL[commandCode]) throw new Error(`无效命令码: ${commandCode}`);

        setupGlobalListener(dev);

        const payload = new Uint8Array(63);
        payload.set([0, 0, ...CMD_TPL[commandCode]]);

        const sendData = [0x04, ...payload];

        // 关键：先创建 response promise
        const responsePromise = createResponsePromise((bytes) => bytes.length >= 8);

        // 再发送
        await safeWrite(dev, sendData);

        const data = await responsePromise;

        const bytes = new Uint8Array(data);

        if (commandCode === 0x1a || commandCode === 0xaa) {
            return Number.parseInt(bytes[7].toString(10), 10);
        }

        return bytes;
    }

    let lastError;

    for (let i = 0; i < maxRetries; i++) {

        try {
            return await once();
        } catch (e) {

            lastError = e;

            await sleep(50);

        }

    }

    throw lastError;
}

export async function safeCommSession(callback) {

    try {

        await communicateWithDevice(0x01);

        const result = await callback();

        await communicateWithDevice(0x02);

        return result;

    } catch (err) {

        try {
            await communicateWithDevice(0x02);
        } catch { }

        throw err;
    }

}

export async function hidTransfer(cmd, len, dataArr = null, offsetSize = 0, quantityOffset = 0) {
    return safeCommSession(() => execHid(cmd, len, dataArr, offsetSize, quantityOffset));
}

async function execHid(cmd, len, dataArr, offsetSize, quantityOffset) {

    const dev = stores.getDevice();
    const type = stores.getConnectionType();
    if (!dev) throw new Error('设备未连接');

    setupGlobalListener(dev);

    const CFG = {
        1: { chunk: 56, packet: 63, lenIdx: 56 },
        2: { chunk: 24, packet: 31, lenIdx: 24 }
    }[type];
    if (!CFG) throw new Error(`不支持的连接类型: ${type}`);

    const { chunk, lenIdx } = CFG;

    const hex2 = n => (+n).toString(16).padStart(2, '0');

    const total = dataArr ? dataArr.length : len;

    const times = Math.ceil(total / chunk);

    let index = 0;

    const acc = [];

    while (index < times) {

        const start = index * chunk;
        const end = Math.min(start + chunk, total);

        const size = end - start;

        const offset = start;

        const low = hex2(offset & 0xff);
        const high = hex2((offset >> 8) & 0xff);

        const lenField = index === times - 1 ? hex2(size) : hex2(lenIdx);

        const payload = dataArr
            ? dataArr.slice(start, end).join(' ')
            : '';

        const frame = [
            '00', '00', cmd, lenField, low, high, '00', payload
        ].filter(Boolean).join(' ');

        const buf = new Uint8Array(63).fill(0);

        frame.split(' ').forEach((b, i) => {
            buf[i] = parseInt(b, 16);
        });

        const writeData = [0x04, ...buf];

        // 先创建 response promise
        const responsePromise = createResponsePromise((bytes) => bytes.length >= 8);

        await safeWrite(dev, writeData);

        const data = await responsePromise;

        const bytes = new Uint8Array(data);

        const dataLen = bytes[4];

        const slice = [...bytes.slice(8, 8 + dataLen)].map(hex2);

        acc.push(slice);

        index++;
    }

    return acc;
}

export async function fetchHidData(command, length, dataArr = null, offsetSize = 0) {

    await sleep(10);

    const data = await hidTransfer(command, length, null, offsetSize);

    return flattenArray(data);
}
