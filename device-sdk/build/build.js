import { build } from 'esbuild';
import pkg from 'javascript-obfuscator';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
const { obfuscate } = pkg;

// 1. 出口目录
const DIST = resolve('dist');   // 想换地方就改这里，如 resolve('lib')
mkdirSync(DIST, { recursive: true });

// 2. javascript-obfuscator 配置全表

const obOptions = {
    compact: true,                    // true | false  是否压成一行
    controlFlowFlattening: true,      // 是否做控制流扁平化（true 体积↑ 强度↑）
    controlFlowFlatteningThreshold: 1, // 0~1 应用概率
    stringArray: true,                // 把字符串集中到一个数组
    stringArrayEncoding: ['rc4'],     // 加密方式：false | 'base64' | 'rc4'  或数组混合
    stringArrayThreshold: 1,       // 0~1  多少比例的字符串被收进数组
    disableConsoleOutput: false,       // 插入废代码禁用 console.log 等
};

// 3. 打包 + 混淆 
/**
 * @param {string} format      打包格式：'esm' | 'cjs' | 'iife'
 * @param {string} outfile     输出文件绝对路径，例：join(DIST,'index.esm.js')
 * @param {string} [globalName] 仅 iife 需要，window 上的变量名，例：'MySDK'
 */
async function bundle(format, outfile, globalName) {
    // 3-1 esbuild 阶段
    const { outputFiles } = await build({
        entryPoints: ['src/index.js'], // 入口文件，想换就改这里
        bundle: true,                  // 是否把依赖全部打在一起
        platform: 'browser',           // 目标环境：'browser' | 'node' | 'neutral'
        format,                        // 输出格式：
        globalName,                    // 仅 iife 生效，window 上的变量名
        target: 'es2015',              // 想兼容更老浏览器可改 'es5'
        minify: true,                  // 是否压缩（去空格/短变量名）
        sourcemap: false,              // 是否生成 .map 文件（true | false | 'inline' | 'external'）
        write: false,                  // 不落地磁盘，留在内存里待混淆
        // loader: { '.ts': 'ts' },       // 显式告诉 esbuild 用 ts 解析
        platform: 'node',   // ← 加这一行
        external: ['fs', 'path'], // 可选，显式告诉 esbuild 不要碰它们
    });

    // 3-2 混淆阶段
    const code = outputFiles[0].text;                     // 拿到打包后源码
    const obfuscated = obfuscate(code, obOptions).getObfuscatedCode();

    // 3-3 写出磁盘
    writeFileSync(outfile, obfuscated, 'utf8');
    console.log(`✅ 完成：${outfile}  （格式：${format}  全局：${globalName || '无'}）`);
}

// 4. 主流程
(async () => {
    try {

        await bundle('esm', join(DIST, 'index.esm.js'));

        await bundle('cjs', join(DIST, 'index.cjs.cjs'));

        await bundle('iife', join(DIST, 'index.global.js'), 'deviceSDK');

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();