import FileSaver from "file-saver";
import { AES, enc } from "crypto-js";

// 加密函数
async function encrypt(data) {
    try {
        // 密钥secretKey
        const secretKey = "AULA-HUB";
        // 将数据转换为字符串
        const stringifiedData = JSON.stringify(data);
        const encryptData = AES.encrypt(stringifiedData, secretKey).toString();
        return encryptData;
    } catch (error) {
        console.error("加密失败：", error);
        return null;
    }
}

// 解密函数
async function decrypt(encryptedData) {
    try {
        const secretKey = "AULA-HUB";
        const bytes = AES.decrypt(encryptedData, secretKey);
        const decryptedString = bytes.toString(enc.Utf8);
        const decryptData = JSON.parse(decryptedString);
        return decryptData;
    } catch (error) {
        console.error("解密失败：", error);
        return null;
    }
}

// 封装导出方法
const exportFileData = async (data, fileName) => {
    try {
        // 文件后缀名写死为 .AULA
        const fileExtension = "AULA";
        // 加密数据
        const encryptData = await encrypt(data);
        if (!encryptData) {
            throw new Error("加密失败");
        }
        // 创建 Blob 对象
        const blob = new Blob([encryptData], { type: "application/octet-binary;charset=utf-8" });
        // 使用 FileSaver 保存文件
        FileSaver.saveAs(blob, `${fileName}.${fileExtension}`);
    } catch (error) {
        console.error("导出文件失败：", error);
    }
};

// 封装导入方法
const importFileData = (event) => {
    return new Promise((resolve, reject) => {
        const file = event.target.files[0];
        if (!file) {
            reject(new Error("没有选择文件"));
            return;
        }

        // 获取文件后缀名
        const fileExtension = file.name.split(".").pop().toUpperCase();
        // 检查后缀名是否符合预期
        if (fileExtension !== "AULA") {
            reject(new Error("文件后缀名必须是 .AULA"));
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            try {
                // 解密内容
                const decryptData = await decrypt(content);
                if (!decryptData) {
                    throw new Error("解密失败");
                }
                resolve(decryptData);
            } catch (error) {
                reject(new Error("文件内容解析失败"));
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        // 读取文件内容
        reader.readAsText(file);
    });
};

export { exportFileData, importFileData, encrypt, decrypt };