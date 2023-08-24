<template >
    <div>
        <EditorHtml v-model="markdownContent"></EditorHtml>
            {{ markdownContent }}
    </div>
</template>

<script setup>
import { ref } from 'vue';

const markdownContent = ref("# test")
</script>

<style lang="scss"></style>