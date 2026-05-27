export const meta = {
    deviceName: 'V9 Pro',
    // 同一设备多种连接方式
    matches: [
        { vid: 12610, pid: 8888, connectionType: 1 },
        { vid: 12610, pid: 8887, connectionType: 2 },
    ],
    ids: [12610, 8888, 8887],
    
};

export const load = () => import('../devicesChunks/V9-Pro.mouse.full.js')