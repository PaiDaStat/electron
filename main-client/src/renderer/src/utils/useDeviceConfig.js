// 设备配置文件
const entries = Object.values(
    import.meta.glob('/src/devices/*.js', { eager: true })
).map(m => m);
// 索引设备配置
const index = new Map();
entries.forEach(e => {
    e.meta.matches.forEach(m =>
        index.set(`${m.vid}:${m.pid}`.toLowerCase(), e)
    );
});
// 加载设备配置
export async function loadConfig(vid, pid) {
    const entry = index.get(`${vid}:${pid}`.toLowerCase());
    if (!entry) return null;

    const mod = await entry.load();   // 动态导入
    return { ...entry.meta, ...mod.data };
}