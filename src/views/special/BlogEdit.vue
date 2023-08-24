<template>
    <div>
        <!-- 新增修改弹窗 -->
        <Window :show="windowConfig.show" :buttons="windowConfig.buttons" @close="closeWindow">
            <el-form :model="blogFormData" 
                    :rules="rules"
                    ref="blogFormRef">
                <el-form-item prop="title">
                    <el-input placeholder="请输入博客标题"
                        v-model="blogFormData.title" class="input-title">
                    </el-input>
                </el-form-item>
                <el-form-item prop="content">
                    <div :style="{ 'width': '100%' }">
                        <EditorHtml :height="editorHtmlHeight" v-model="blogFormData.content" v-if="blogFormData.editorType == 0"></EditorHtml>
                        <EditorMarkdown v-else :height="editorMarkdownHeight" v-model="blogFormData.markdownContent" @htmlContent="setHtmlContent"></EditorMarkdown>
                    </div>
                </el-form-item>
            </el-form>
        </Window>
    </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, reactive,ref } from 'vue';
const { proxy } = getCurrentInstance()

const editorMarkdownHeight = window.innerHeight - 250
const editorHtmlHeight = window.innerHeight - 340

const api = {
    saveBlog: '/blog/saveBlog4Special',
    getUserInfo: 'getUserInfo',
    getBlogDetail:'/blog/getBlogById',
    autoSave:'/blog/autoSaveBlog4Special',
}

const init = (type,data) => {
    startTimer()
    windowConfig.show = true
    nextTick(() => {
        blogFormRef.value.resetFields()
        blogFormData.value = {categoryId:data.categoryId , pBlogId:data.blogId}
        if (type === 'add') {
            getUserInfo()
        }else {
            getBlogDetail(data.blogId)
        }
    })
}
defineExpose({init})

const getUserInfo = async () => {
    let result = await proxy.Request({
        url: api.getUserInfo
    })
    if (!result) {
        return
    }
    blogFormData.value.editorType = result.data.editorType
}

const getBlogDetail = async (blogId) => {
    let result = await proxy.Request({
        url:api.getBlogDetail,
        params:{
            blogId:blogId
        }
    })
    if(!result) {
        return
    }
    blogFormData.value = result.data
    if(result.data.tag) {
        blogFormData.value.tag = result.data.tag.split('|')
    }else {
        blogFormData.value.tag = []
    }
}


let timer = ref(null)
const startTimer = () => {
    timer.value = setInterval(() => {
        autoSave()
    }, 5000)
}
const cleanTimer = () => {
    if(timer.value != null) {
        clearInterval(timer.value)
        timer.value = null
    }
}

// 自动保存
const autoSave = async () => {
    if(blogFormData.value.title == undefined || blogFormData.value.content == undefined || timer.value == null) {
        return
    }
    const params ={ }
    Object.assign(params, blogFormData.value)
    let result = await proxy.Request({
        url:api.autoSave,
        showLoading:false,
        params:params
    })
    if(!result) {
        return
    }
    blogFormData.value.blogId = result.data
}

// 新增 修改
const windowConfig = reactive({
    show: false,
    buttons: [
        {
            type: 'danger',
            text: '确定',
            click: (e) => {
                submitBlog()
            }
        }
    ]
})

const emit = defineEmits()
const closeWindow = () => {
    windowConfig.show = false
    emit('callback')
    if(timer.value != null) {
        cleanTimer()
    }
}

const showEdit = (type, data) => {
    windowConfig.show = true
}

// 博客正文
const blogFormData = ref({ tag: [] })
// const blogFormData = reactive()
const blogFormRef = ref(null)

const setHtmlContent = (htmlContent) => {
    blogFormData.value.content = htmlContent
}

// 展示配置弹窗
const submitBlog = () => {
    blogFormRef.value.validate(async (valid) => {
        if (!valid) {
            return
        }
        const params = Object.assign( {} , blogFormData.value)
        let result = await proxy.Request({
            url:api.saveBlog,
            params
        })
        if(!result) {
            return
        }
        proxy.message.success('博客保存成功！')
        closeWindow()
    })
}


const rules =  {
    title: [{
        required: true,
        message: '请输入标题'
    }],
    content: [{
        required: true,
        message: '请输入正文'
    }],
    categoryId: [{
        required: true,
        message:'请选择博客分类'
    }],
    type: [{
        required: true,
        message: '请选择博客类型'
    }],
    allowComment: [{
        required: true,
        message: '请选择是否允许评论'
    }],
    reprintUrl: [{
        required: true,
        message: '请输入原文地址'
    }],
}

// onUnmounted(() => {
//     cleanTimer()
// })

</script>

<style lang="scss">
    .el-form-item.is-error .el-input__wrapper{
        box-shadow: none;
    }
    .el-form-item__error {
            color: var(--el-color-danger);
            font-size: 12px;
            line-height: 1;
            padding-top: 2px;
            position: absolute;
            top: 100%;
            left: 16px;
        }
    .input-title {
        // border-bottom: 1px solid #ddd;
        font-size: 16px;
        padding-left: 5px;
        .el-input__wrapper {
            box-shadow: none;
            border: 1px solid #ddd;
            border-radius: 25px;
        }
    }
    .el-form-item {
        margin-bottom: 20px;
    }

    .blog-setting-form {
        .allow-comment {
            display: flex;
            .info {
                margin-left: 10px;
                color: rgb(141, 140, 140);
                font-size: 12px;
                }
        }
    .tag-input-panel {
        display: flex;
        align-items: center;
        .tag {
            margin-right: 5px;
        }
        .info {
            color: rgb(141, 140, 140);
            font-size: 12px;
        }
        .add {
            cursor: pointer;
            color: rgba(241, 22, 22, 0.842);
            font-size: 18px;
            margin:0px 10px;
        }
        .tag-input {
            width: 150px;
            height: 25px;
            margin-top: 5px;
            margin-left: 10px;
        }
    }
    }
</style>