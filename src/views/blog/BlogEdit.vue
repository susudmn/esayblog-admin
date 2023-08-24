<template>
    <div class="layout">
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
                    <div :style="{ 'width': '100%','margin-top':'5px' }">
                        <EditorHtml :height="editorHtmlHeight" v-model="blogFormData.content" v-if="blogFormData.editorType == 0" @htmlContent="setHtmlContent"></EditorHtml>
                        <EditorMarkdown v-else :height="editorMarkdownHeight" v-model="blogFormData.markdownContent" @htmlContent="setHtmlContent"></EditorMarkdown>
                    </div>
                </el-form-item>
            </el-form>
            <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"  @close="dialogConfig.show = false">
               <el-form :model="blogFormData" 
                        :rules="rules"
                        ref="settingFormRef" label-width="80px" class="blog-setting-form">
                    <el-form-item label="博客分类" prop="categoryId" >
                        <el-select v-model="blogFormData.categoryId" placeholder="请选择分类" :style="{ width: '100%' }">
                            <el-option label="全部分类" :value="0"></el-option>
                            <el-option :label="item.categoryName" :value="item.categoryId" v-for="item in categoryList"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="封面" prop="cover">
                        <CoverUpload v-model="blogFormData.cover"></CoverUpload>
                    </el-form-item>
                    <el-form-item label="博客类型" prop="type">
                        <el-radio-group  v-model="blogFormData.type">
                            <el-radio :label="0">原创</el-radio>
                            <el-radio :label="1">转载</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="原文地址" prop="reprintUrl" v-if="blogFormData.type==1">
                        <el-input placeholder="请输入原文地址" v-model="blogFormData.reprintUrl">
                        </el-input>
                    </el-form-item>
                    <div class="allow-comment">
                        <el-form-item label="评论" prop="allowComment">
                            <el-radio-group v-model="blogFormData.allowComment">
                                <el-radio :label="1">允许</el-radio>
                                <el-radio :label="0">不允许</el-radio>
                            </el-radio-group>
                            <span class="info">请先在评论设置设置好相应参数，评论</span>
                        </el-form-item>
                    </div>
                    <el-form-item label="博客摘要" prop="Summary">
                        <el-input placeholder="请输入简介" v-model="blogFormData.Summary" :style="{ marginTop: '10px'}" type="textarea" :cols="40" :rows="2">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="博客标签" prop="categoryDesc" >
                        <div class="tag-input-panel">
                            <el-tag v-for="(item,index) in blogFormData.tag" @close="closeTag(index)" class="tag" closable>
                                {{ item }}
                            </el-tag>
                            <span class="info" v-if="blogFormData.tag.length == 0">添标签更容易被搜索引擎收录</span>
                            <span class="add" @click="showInputTagHandler" v-if="!showInputTag">+</span>
                            <el-input class="tag-input" 
                                      v-if="showInputTag"
                                      v-model="tagInputValue"
                                      @blur="tagInputResult"
                                      @keyup.enter="tagInputResult"></el-input>
                        </div>
                    </el-form-item>
                </el-form>
        </Dialog>
        </Window>
    </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, reactive,ref } from 'vue';
const { proxy } = getCurrentInstance()

const editorMarkdownHeight = window.innerHeight - 250
const editorHtmlHeight = window.innerHeight - 340

const api = {
    loadAllCategory4Blog: '/category/loadAllCategory4Blog',
    saveBlog: '/blog/saveBlog',
    getUserInfo: 'getUserInfo',
    getBlogDetail:'/blog/getBlogById',
    autoSave:'/blog/autoSaveBlog',
}

const init = (type,data) => {
    startTimer()
    windowConfig.show = true
    nextTick(() => {
        blogFormRef.value.resetFields()
        blogFormData.value = {tag:[]}
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
    if(blogFormData.value.title == undefined || blogFormData.value.content == undefined || dialogConfig.show) {
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
                showSettings()
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
const showSettings = () => {
    blogFormRef.value.validate(async (valid) => {
        if (!valid) {
            return
        }
        dialogConfig.show = true
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

// 博客设置
const dialogConfig = reactive({
    show: false,
    title: '博客设置',
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


// 博客分类
const categoryList = ref([])

const loadCategory = async () => {
    let result = await proxy.Request({
        url: api.loadAllCategory4Blog
    })
    if (!result) {
        return
    }
    categoryList.value = result.data
}
loadCategory()
// onMounted(() => {
//     loadCategory()
// })

// onUnmounted(() => {
//     cleanTimer()
// })

// 关闭标签
const closeTag = (index) => {
    blogFormData.value.tag.splice(index,1)
}
// 是否显示tag输入框
const showInputTag = ref(false)
const showInputTagHandler = () => {
    showInputTag.value = true
}

// 输入框的值
const tagInputValue = ref(null)

const tagInputResult = () => {
    if(tagInputValue.value == undefined) {
        return
    }
    showInputTag.value = false
    if(blogFormData.value.tag.indexOf(tagInputValue.value) == -1) {
        blogFormData.value.tag.push(tagInputValue.value) //  =-1 就是不存在某值
    }
    tagInputValue.value = undefined
}
const settingFormRef = ref()
const submitBlog = () => {
    settingFormRef.value.validate(async (valid)=> {
        if(!valid) {
            return
        }
        const params = {}
        // Object.assign(params, blogFormData.value)
        Object.assign(params, blogFormData.value)
        params.tag = params.tag.join('')
        // params.editorType = 1
        let result = await proxy.Request({
            url: api.saveBlog,
            params
        })
        if (!result) {
            return
        }
        proxy.message.success('博客保存成功!')
        dialogConfig.show = false
        closeWindow()
        // emit('callback')
    })
}

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
    .layout{
        .cust-dialog {
            width: 600px;
            // height: 500px;
        }
        .dialog-body {
        border-top: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        padding: 10px;
        height: 472px;
    }
    .el-form-item {
        margin-bottom: 13px;
    }
}

</style>