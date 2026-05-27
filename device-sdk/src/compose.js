import { HIDDeviceManager } from './devices/DeviceHID.js';
import { Changekey } from './devices/Keys.js';
import { MacroSetting } from './devices/Macro.js'
import { FireSetting } from './devices/Fire.js'
import { PerformanceSettings } from './devices/Performance.js'
import { LightSettings } from './devices/Light.js'
import { ImportAndExport } from './devices/ImportAndExport.js'



const plugins = [Changekey, MacroSetting, FireSetting, PerformanceSettings, LightSettings, ImportAndExport];

function buildAPI(core) {
    const addons = plugins.map(p => p(core));
    return Object.assign(Object.create(null), core, ...addons);
}

export function DeviceHID(config = {}) {
    const core = HIDDeviceManager(config);
    const api = buildAPI(core);

    function dev() { }                       // 空壳

    Object.keys(api).forEach(k => {         // 暗挂方法
        if (typeof api[k] === 'function')
            Object.defineProperty(dev, k, {
                value: api[k].bind(api),
                enumerable: false
            });
    });

    return dev;
}