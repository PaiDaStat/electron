export const meta = {
    deviceName: 'fifine GK8',
    // 同一设备多种连接方式
    matches: [
        { vid: 12610, pid: 130, connectionType: 1 },
        { vid: 12610, pid: 132, connectionType: 2 },
    ],
    ids: [12610, 130, 132],

};

export const load = () => import('../devicesChunks/fifine-GK8-US.keyboard.full.js')
