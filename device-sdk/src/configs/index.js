import M9ProMaxMouse from './M9ProMax-mouse.json';
import MX83Keyboard from './MX8.3-keyboard.json';

const flat = {};


function add(cfg) {
    Object.entries(cfg).forEach(([sectionKey, section]) => {
        if (!Array.isArray(section?.model)) return;
        section.model.forEach(m => {
            const k = `${m.vid}-${m.pid}`;
            flat[k] = { config: cfg.keyboard, sectionKey, connectionType: m.connectionType };
        });
    });
}

add(M9ProMaxMouse);
add(MX83Keyboard);

export default flat;