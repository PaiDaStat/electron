<!-- 其他设置组件 -->
<script setup>
import { ref } from 'vue'
import GK8Img from '../../../assets/deviceImg/a7pro.png'
</script>

<template>
    <div class="other-settings">
        <div>
            <div>
                <img :src="GK8Img" />
            </div>
        </div>
        <div>
            <div>
                <div>
                    <div>
                        <div>键盘固件版本：V1.0.0</div>
                        <div>接收器固件版本：V1.0.0</div>
                        <div>固件已为最新版本，无需更新</div>
                    </div>
                    <div>
                        <div>去升级</div>
                    </div>
                </div>
                <div>
                    <div>配对接收器</div>
                    <div>立即配对</div>
                </div>
                <div>
                    <div>
                        <div>恢复出厂设置</div>
                        <div>
                            所有设置将恢复到出厂状态，请谨慎操作
                        </div>
                    </div>
                    <div>
                        恢复出厂
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.other-settings {
    width: 100%;
    height: 100%;
    padding: 24px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;

    >div:nth-of-type(1) {
        width: 60%;
        max-width: 700px;
        display: flex;
        flex-direction: column;
        align-items: center;

        >div:nth-of-type(1) {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            max-height: 35vh;

            >img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
        }

    }

    >div:nth-of-type(2) {
        width: 60%;
        max-width: 700px;


        >div {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            width: 100%;

            >div {
                width: 100%;
                padding: 24px;
                border-radius: var(--globalRadius);
                color: var(--theme-font-color);
                background: var(--theme-fun-bgcolor);
                backdrop-filter: blur(var(--funAreaRadius));
                border: 1px solid var(--theme-border-color);
                animation: bounce-in 0.5s;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
            }

            >div:nth-of-type(1),
            >div:nth-of-type(2),
            >div:nth-of-type(3) {
                >div:nth-of-type(1) {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    line-height: 16px;

                    >div:nth-of-type(1),
                    >div:nth-of-type(2) {
                        font-weight: bold;
                    }

                    >div:nth-of-type(3) {
                        font-size: 12px;
                        line-height: 12px;
                    }
                }

                >div:nth-of-type(2) {
                    padding: 12px 24px;
                    min-width: 100px;
                    border: 1px solid var(--theme-border-color);
                    background: var(--theme-fun-bgcolor);
                    backdrop-filter: blur(var(--funAreaRadius));
                    border-radius: var(--globalRadius);
                    cursor: pointer;
                    font-size: 12px;
                    line-height: 12px;
                    text-align: center;
                    transition: all 0.3s ease-in-out;
                    box-sizing: border-box;

                    &:hover {
                        border: 1px solid var(--el-color-primary);
                        background-color: var(--el-color-primary-hover);
                        transition: all 0.3s ease-in-out;
                    }
                }
            }

            >div:nth-of-type(3) {
                >div:nth-of-type(1) {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    line-height: 16px;

                    >div:nth-of-type(1) {
                        font-weight: bold;
                    }

                    >div:nth-of-type(2) {
                        font-size: 12px;
                        line-height: 12px;
                        font-weight: 400;
                    }
                }
            }
        }
    }
}
</style>