<template>
    <div>
        <Window :show="windowConfig.show" :buttons="windowConfig.buttons"  @close="windowConfig.show = false">
            <div class="my-title">{{ blog.title }}</div>
            <div v-html="blog.content" class="blog-detail"></div>
        </Window>
    </div>
</template>

<script setup>
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'
import { ref,getCurrentInstance, reactive, nextTick } from 'vue'
const {proxy} = getCurrentInstance()
const blog = ref({})
const api = {
    getBlogDetail:'/blog/getBlogById'
}

const windowConfig = reactive({
    show: false,
    buttons: [
        {
            type: 'danger',
            text: '确定',
            click: (e) => {
                windowConfig.show = false
            }
        }
    ]
})

const showDetail = async (blogId) => {
    windowConfig.show = true
    let result = await proxy.Request({
        url:api.getBlogDetail,
        params: {
            blogId : blogId
        }
    })
    if(!result) {
        return
    }
    blog.value = result.data
    nextTick(()=>{
        // 高亮显示
        let blocks = document.querySelectorAll('pre code')
        blocks.forEach((block) => {
            hljs.highlightBlock(block)
        })
    })
}
defineExpose({ showDetail })
</script>

<style lang="scss">
    .my-title {
        font-size: 18px;
    }
    .blog-detail {
        code {
            padding: 10px;
            background-color: #fcf7f7;
        }
        img {
            max-width: 70%;
        }
        blockquote {
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25 solid #dfe2e5;
    }
    }
    
</style>