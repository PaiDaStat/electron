module.exports = {
    plugins: {
        "postcss-pxtorem": {
            rootValue: 16, // 根元素字体大小，用于将像素转换为rem的基准值
            unitPrecision: 5, // rem的小数位数
            propList: ["*"], // 需要转换的属性列表，['*']表示所有属性都会被转换。
            selectorBlackList: [], // 需要忽略的选择器，可以是正则表达式或字符串
            replace: true, // 是否替换原始值
            mediaQuery: false, // 是否在媒体查询中转换px。
            minPixelValue: 0, // 小于或等于该值的像素单位不被转换。
            include: /(\.css|\.less|\.scss|<style>)/,
        }
    }
};
