<template>
    <div class="cover">
       <img :src="proxy.globalInfo.imageUrl + cover" v-if="cover">
       <img v-else src="../assets/default_img.jpg">
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue';

const cover = defineProps({
    type:String
})
const {proxy} = getCurrentInstance()
</script>

<style  lang="scss">
    .cover {
        background-color: #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 100px;
        overflow: hidden;
        img {
            width: 100%;
        }
    }
</style>