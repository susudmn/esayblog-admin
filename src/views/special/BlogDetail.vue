<template>
    <div>
        <Window :show="windowConfig.show" :buttons="windowConfig.buttons"  @close="windowConfig.show = false" :showCancel="false">
            <el-row :gutter="6">
                <el-col :span="10">
                    <el-card class="box-card">
                        <template #header>
                            <div class="card-header">
                                <span>专题文章</span>
                            </div>
                        </template>
                            <el-tree class="tree-panel"
                                     ref="refTree"
                                     :data="blogList"
                                     defaultExpandAll
                                     node-key="blogId"
                                     :expand-on-click-node="false"
                                     :props="treeProps"
                                     :highlight-current="true"
                                     @node-click="showDetail">
                            <template #default="{ node, data }">
                                <span class="custom-node-style">
                                    <span class="node-title">
                                        <span v-if="data.status == 0" :style="{ 'color': 'red', 'font-size': '10px' }">{{ data.title }}</span>
                                        <span v-else :style="{ 'color': 'green', 'font-size': '10px' }">{{ data.title }}</span>
                                    </span>
                                </span>
                            </template>
                            </el-tree>
                    </el-card>
                </el-col>
                <el-col :span="14">
                    <el-card class="box-down">
                         <template #header>
                            <div class="card-header">
                                <span>文章详情</span>
                            </div>
                         </template>
                         <div v-if="blog.title">
                            <div class="my-title">{{ blog.title }}</div>
                            <div v-html="blog.content" class="blog-detail"></div>
                        </div>
                         <div v-else class="no-data">请选择专题文章，查看详情！</div>
                    </el-card>
                </el-col>
            </el-row>
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
    getBlogDetail:'/blog/getBlogById',
    getSpecialInfo:'/blog/getSpecialInfo',
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

const currentBlogId = ref(null)
const showDetail = async (data) => {
    if(data.blogId == '0') {
        blog.value = {}
    }
    currentBlogId.value = data.blogId
    getSpecialInfo(data.categoryId)
    windowConfig.show = true
    let result = await proxy.Request({
        url:api.getBlogDetail,
        params: {
            blogId : data.blogId
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

// 属性展示专题
const treeProps = {
    children: 'children',
    label: 'title',
    value: 'blogId'
}

const blogList = ref([])
const refTree = ref(null)
const getSpecialInfo = async (categoryId) => {
    let result = await proxy.Request({
        url: api.getSpecialInfo,
        params: {
            categoryId: categoryId,
            showType: '1'
        }
    })
    if(!result) {
        return
    }
    blogList.value = result.data
    nextTick(()=>{
        refTree.value.setCurrentKey(currentBlogId.value)
    })
    // if (result.data[0].children != null && result.data[0].children.length > 0) {
    //     nextTick(() => {
    //         refTree.value.setCurrentKey(result.data[0].children[0].blogId)
    //     })
    // }
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
        color: #838c96;
        border-left: 0.25 solid #dfe2e5;
    }
}
    .no-data {
        text-align: center;
        font-size: 14px;
        color: #6a737d;
    }
    
   .box-down {
        .el-card__body  {
            height: calc(100vh - 246.4px);
            overflow: auto;
}
   }
</style>