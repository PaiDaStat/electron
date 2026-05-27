import { stores } from '../utils/Stores'
import { parseKeyIds, flattenArray, to7BitBinary, splitHex } from '../utils/Utils'
import { keyboardMap } from '../utils/KeyMap'
import { hidTransfer, fetchHidData } from '../utils/hidCore'

//灯光功能操作
export const LightSettings = core => {

    return {
        // 查询灯光效果列表
        async getLightingEffectList() {
            const LightingEffectList = stores.getLightingEffectList();
            if (!Array.isArray(LightingEffectList)) {
                return [];
            }
            return LightingEffectList.map(item => {
                const { command, ...rest } = item;
                return rest;
            });
        },
        // 查询当前灯光信息
        async getLightingInfo() {
            try {
                const funcInfo = stores.getFuncInformationInfo();


                if (!funcInfo || (Array.isArray(funcInfo) && funcInfo.length === 0)) {
                    throw new Error('获取灯光信息失败：数据为空或无效');
                }

                const LightingEffectList = stores.getLightingEffectList();
                const targetCommand = funcInfo[1];
                const effect = Array.isArray(LightingEffectList)
                    ? LightingEffectList.find(item => item.command.toLowerCase() === targetCommand.toLowerCase())
                    : null;

                if (effect) {
                    const { command, ...rest } = effect;
                    const commandTable = stores.getCommandTable();
                    const maxSpeed = commandTable.speed?.range?.max || 5;
                    const data = {
                        ...rest,
                        brightness: parseInt(funcInfo[commandTable.brightness.offset], 16),
                        speed: maxSpeed - parseInt(funcInfo[commandTable.speed.offset], 16),
                        direction: parseInt(funcInfo[commandTable.direction.offset], 16),
                        isColorful: parseInt(funcInfo[commandTable.isColorful.offset], 16) === 0 ? 0 : 1,
                        colorR: parseInt(funcInfo[commandTable.colorR.offset], 16),
                        colorG: parseInt(funcInfo[commandTable.colorG.offset], 16),
                        colorB: parseInt(funcInfo[commandTable.colorB.offset], 16)
                    };

                    if (commandTable.specialLighting) {
                        data.specialLighting = parseInt(funcInfo[commandTable.specialLighting.offset], 16);
                    }

                    return { status: 'success', data };
                }

            } catch (error) {
                throw new Error(`getLightingInfo 失败: ${error.message}`);
            }
        },
        // 设置普通灯光效果
        async setLightingEffect(ledIndex, effect = {}) {
            try {
                const { brightness, speed, direction, isColorful, colorR, colorG, colorB, specialLighting } = effect;

                const commandTable = stores.getCommandTable();
                const validateParam = (key, value) => {
                    if (value !== undefined) {
                        if (typeof value !== 'number') {
                            throw new Error(`参数 ${key} 必须为数字`);
                        }
                        const config = commandTable[key];
                        if (config && config.range) {
                            if (value < config.range.min || value > config.range.max) {
                                throw new Error(`参数 ${key} 值 ${value} 超出范围 [${config.range.min}, ${config.range.max}]`);
                            }
                        }
                    }
                };

                validateParam('brightness', brightness);
                validateParam('speed', speed);
                validateParam('direction', direction);
                validateParam('isColorful', isColorful);
                validateParam('colorR', colorR);
                validateParam('colorG', colorG);
                validateParam('colorB', colorB);
                if (commandTable.specialLighting) {
                    validateParam('specialLighting', specialLighting);
                }

                const LightingEffectList = stores.getLightingEffectList();
                const targetEffect = LightingEffectList.find(item => item.ledIndex === ledIndex);

                if (!targetEffect) {
                    throw new Error('未找到对应的灯光效果配置');
                }

                const funcInfo = stores.getFuncInformationInfo();

                const profileSize = stores.getProfileSize();
                const profileNumber = stores.getProfileNumber();

                if (!funcInfo) {
                    throw new Error('获取设备信息失败');
                }

                // Update funcInfo
                funcInfo[1] = targetEffect.command;
                const maxSpeed = commandTable.speed?.range?.max || 5;

                if (brightness !== undefined) funcInfo[commandTable.brightness.offset] = brightness.toString(16).padStart(2, '0');
                if (speed !== undefined) funcInfo[commandTable.speed.offset] = (maxSpeed - speed).toString(16).padStart(2, '0');
                if (direction !== undefined) funcInfo[commandTable.direction.offset] = direction.toString(16).padStart(2, '0');
                if (isColorful !== undefined) funcInfo[commandTable.isColorful.offset] = (isColorful === 0 ? 0 : 255).toString(16).padStart(2, '0');
                if (colorR !== undefined) funcInfo[commandTable.colorR.offset] = colorR.toString(16).padStart(2, '0');
                if (colorG !== undefined) funcInfo[commandTable.colorG.offset] = colorG.toString(16).padStart(2, '0');
                if (colorB !== undefined) funcInfo[commandTable.colorB.offset] = colorB.toString(16).padStart(2, '0');
                if (specialLighting !== undefined && commandTable.specialLighting) {
                    funcInfo[commandTable.specialLighting.offset] = specialLighting.toString(16).padStart(2, '0');
                }


                const result = await hidTransfer(0x06, profileSize, funcInfo, profileNumber);
                const newData = await flattenArray(result);
                stores.setFuncInformationInfo(newData);

                return { status: 'success' };
            } catch (error) {
                throw new Error(`setLightingEffect 失败: ${error.message}`);
            }
        },
        // 初始化按键自定义颜色信息0A
        async getCustomizeButtonColor() {
            try {
                const matrixSize = stores.getMatrixSize();
                const matrixData = await fetchHidData('0A', matrixSize);

                const processedData = [];
                for (let i = 0; i < matrixData.length; i += 3) {
                    // 确保数据存在，防止越界
                    if (i + 2 < matrixData.length) {
                        processedData.push({
                            R: parseInt(matrixData[i], 16),
                            G: parseInt(matrixData[i + 1], 16),
                            B: parseInt(matrixData[i + 2], 16)
                        });
                    }
                }

                return {
                    data: processedData,
                    status: 'success'
                };
            } catch (error) {
                throw new Error(`getCustomizeButtonColor 失败: ${error.message}`);
            }
        },
        // 自定义灯效设置
        async setCustomizeButtonColor(colors) {
            try {
                if (!Array.isArray(colors)) {
                    throw new Error('参数必须是颜色对象数组');
                }

                // 将对象数组转换为十六进制字符串数组
                const matrixData = [];
                colors.forEach(color => {
                    if (color && typeof color === 'object') {
                        // 确保 RGB 值在 0-255 范围内，并转为 2 位十六进制字符串
                        matrixData.push(
                            Math.min(255, Math.max(0, color.R || 0)).toString(16).padStart(2, '0').toUpperCase()
                        );
                        matrixData.push(
                            Math.min(255, Math.max(0, color.G || 0)).toString(16).padStart(2, '0').toUpperCase()
                        );
                        matrixData.push(
                            Math.min(255, Math.max(0, color.B || 0)).toString(16).padStart(2, '0').toUpperCase()
                        );
                    }
                });

                const matrixSize = stores.getMatrixSize();
                const profileNumber = stores.getProfileNumber();
                
                const result = await hidTransfer('0B', matrixSize, matrixData, profileNumber);
                const newData = await flattenArray(result);
                
                // 将返回的十六进制数据转换为对象数组格式
                const processedData = [];
                for (let i = 0; i < newData.length; i += 3) {
                    if (i + 2 < newData.length) {
                        processedData.push({
                            R: parseInt(newData[i], 16),
                            G: parseInt(newData[i + 1], 16),
                            B: parseInt(newData[i + 2], 16)
                        });
                    }
                }

                return { 
                    data: processedData,
                    status: 'success' 
                };
            } catch (error) {
                throw new Error(`setCustomizeButtonColor 失败: ${error.message}`);
            }
        }
    }
}