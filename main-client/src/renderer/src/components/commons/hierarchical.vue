<script setup>

</script>

<template>
    <div class="hierarchical">
        <div>Win Base</div>
        <div>Win Fn</div>
        <div>Mac Base</div>
        <div>Mac Fn</div>
        <div>恢复默认</div>
    </div>
</template>

<style lang="scss" scoped>
.hierarchical {
    width: 128px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    >div {
        width: 100%;
        height: 40px;
        background: var(--theme-fun-bgcolor);
        backdrop-filter: blur(var(--funAreaRadius));
        border-radius: var(--globalRadius);
        border: 0.5px solid var(--keyboard-key-border-color);
        line-height: 40px;
        text-align: center;
        color: var(--theme-font-color);
        cursor: pointer;
        transition: all 0.3s ease-in-out;

        &:hover {
            border: 0.5px solid var(--el-color-primary);
            background: var(--el-color-primary-hover);
            transition: all 0.3s ease-in-out;
        }
    }
}
</style>