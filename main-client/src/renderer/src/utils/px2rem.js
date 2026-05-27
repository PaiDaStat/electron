// px2rem.js
export const px2remUnit = (px) => {
    return `${parseFloat(px) / 16}rem`
}

export const px2rem = (px) => px / 16;