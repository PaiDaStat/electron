
import vidPidMap from '../configs/index';

export class ConfigLoader {
    getConfigByVidPid(vid, pid) {
        const key = `${vid}-${pid}`;
        return vidPidMap[key] || null;
    }
}