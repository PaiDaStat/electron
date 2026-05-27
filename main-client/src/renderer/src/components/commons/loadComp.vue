<!-- 加载动画组件 -->
<script setup>

</script>

<template>
    <div class="loader-container">
        <span class="loader"></span>
    </div>
</template>

<style lang="scss" scoped>
.loader-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--theme-loading-color);
    backdrop-filter: blur(var(--funAreaRadius));
    // background-color: rgba(255, 255, 255, 0.8);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10000;
}

.loader {
    position: relative;
    width: 164px;
    height: 164px;
}

.loader::before,
.loader::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    background-color: #fff;
    left: 50%;
    top: 50%;
    animation: rotate 1s ease-in infinite;
}

.loader::after {
    width: 20px;
    height: 20px;
    background-color: var(--el-color-primary);
    animation: rotate 1s ease-in infinite, moveY 1s ease-in infinite;
}

@keyframes moveY {

    0%,
    100% {
        top: 10%
    }

    45%,
    55% {
        top: 59%
    }

    60% {
        top: 40%
    }
}

@keyframes rotate {
    0% {
        transform: translate(-50%, -100%) rotate(0deg) scale(1, 1)
    }

    25% {
        transform: translate(-50%, 0%) rotate(180deg) scale(1, 1)
    }

    45%,
    55% {
        transform: translate(-50%, 100%) rotate(180deg) scale(3, 0.5)
    }

    60% {
        transform: translate(-50%, 100%) rotate(180deg) scale(1, 1)
    }

    75% {
        transform: translate(-50%, 0%) rotate(270deg) scale(1, 1)
    }

    100% {
        transform: translate(-50%, -100%) rotate(360deg) scale(1, 1)
    }
}

// .loader {
//     width: 32px;
//     height: 90px;
//     display: block;
//     margin: 20px auto;
//     position: relative;
//     border-radius: 50% 50% 0 0;
//     border-bottom: 10px solid #FF3D00;
//     background-color: #FFF;
//     background-image: radial-gradient(ellipse at center, #FFF 34%, #FF3D00 35%, #FF3D00 54%, #FFF 55%), linear-gradient(#FF3D00 10px, transparent 0);
//     background-size: 28px 28px;
//     background-position: center 20px, center 2px;
//     background-repeat: no-repeat;
//     box-sizing: border-box;
//     animation: animloaderBack 1s linear infinite alternate;
// }

// .loader::before {
//     content: '';
//     box-sizing: border-box;
//     position: absolute;
//     left: 50%;
//     transform: translateX(-50%);
//     width: 64px;
//     height: 44px;
//     border-radius: 50%;
//     box-shadow: 0px 15px #FF3D00 inset;
//     top: 67px;
// }

// .loader::after {
//     content: '';
//     position: absolute;
//     left: 50%;
//     transform: translateX(-50%) rotate(45deg);
//     width: 34px;
//     height: 34px;
//     top: 112%;
//     background: radial-gradient(ellipse at center, #ffdf00 8%, rgba(249, 62, 0, 0.6) 24%, rgba(0, 0, 0, 0) 100%);
//     border-radius: 50% 50% 0;
//     background-repeat: no-repeat;
//     background-position: -44px -44px;
//     background-size: 100px 100px;
//     box-shadow: 4px 4px 12px 0px rgba(255, 61, 0, 0.5);
//     box-sizing: border-box;
//     animation: animloader 1s linear infinite alternate;
// }

// @keyframes animloaderBack {

//     0%,
//     30%,
//     70% {
//         transform: translateY(0px);
//     }

//     20%,
//     40%,
//     100% {
//         transform: translateY(-5px);
//     }
// }

// @keyframes animloader {
//     0% {
//         box-shadow: 4px 4px 12px 2px rgba(255, 61, 0, 0.75);
//         width: 34px;
//         height: 34px;
//         background-position: -44px -44px;
//         background-size: 100px 100px;
//     }

//     100% {
//         box-shadow: 2px 2px 8px 0px rgba(255, 61, 0, 0.5);
//         width: 30px;
//         height: 28px;
//         background-position: -36px -36px;
//         background-size: 80px 80px;
//     }
// }</style>