<template>
    <div class="special">
        <el-button color="#f37209" style="color:white ;" @click="showEdit('add')">新增专题</el-button>
        <el-row :gutter="6" :style="{'margin-top':'5px'}">
            <el-col :span="14">
                <el-card class="box-card">
                    <template #header>
                        <div class="card-header">
                            <span>专题</span>
                        </div>
                    </template>
                    <Table  :columns="columns"
                        :showPagination="false"
                        :dataSource="tableData"
                        :fetch="loadDataList"
                        :options="tableOptions"
                        @rowClick="rowClick"
                        ref="dataTableRef">
                    <template #cover="{ index, row }">
                            <cover :cover="row.cover"></cover>
                    </template>
                    <template #opration="{ index, row }">
                        <div class="op">
                            <a href="javascript:void(0)" class="a-link" @click="showEdit('update', row)"  v-if="userInfo.userId == row.userId">修改</a>
                            <span v-else>--</span>
                            <el-divider direction="vertical"></el-divider>
                            <a href="javascript:void(0)" class="a-link" @click="del(row)"  v-if="userInfo.userId == row.userId">删除</a>
                            <span v-else>--</span>
                        </div>
                    </template>
                </Table>
            </el-card>
            </el-col>
            <el-col :span="10">
                <el-card class="box-card">
                    <template #header>
                        <div class="card-header">
                            <span>专题文章</span>
                        </div>
                    </template>
                    <div class="special-blog-tree">
                        <div :style="{'margin-bottom':'5px'}">
                            <el-alert title="红色：已发布 | 绿色：草稿"
                                      type="info"
                                      show-icon
                                      :closable="false"/>
                        </div>
                        <el-tree class="tree-panel"
                                 ref="refTree"
                                 :data="blogList"
                                 defaultExpandAll
                                 node-key="blogId"
                                 :expand-on-click-node="false"
                                 :props="treeProps"
                                 :highlight-current="true"
                                 draggable
                                 @node-drop="blogDrag"
                                 >
                        <template #default="{ node, data }">
                            <span class="custom-node-style">
                                <span class="node-title">
                                    <span v-if="data.status == 0" :style="{'color':'red','font-size':'10px'}">{{ data.title }}</span>
                                    <span v-else :style="{ 'color': 'green', 'font-size': '10px' }">{{ data.title }}</span>
                                </span>
                                <span class="node-op">
                                    <template v-if="data.blogId === '0'">
                                        <a class="a-link"
                                            href="javascript:void(0)"
                                            @click="editBlog('add', data)">新增文章</a>
                                    </template>
                                     <template v-else>
                                        <a class="a-link"
                                            href="javascript:void(0)"
                                            @click="showDetail(data)">预览</a>
                                        <el-divider direction="vertical"/>
                                        <a class="a-link"
                                            href="javascript:void(0)"
                                            @click="editBlog('edit', data)"  v-if="userInfo.userId == data.userId">修改</a>
                                        <el-divider direction="vertical" v-if="userInfo.userId == data.userId"/>
                                        <a class="a-link"
                                            href="javascript:void(0)"
                                            @click="delBlog(data)" v-if="userInfo.userId == data.userId">删除</a>
                                        <el-divider direction="vertical" v-if="userInfo.userId == data.userId"/>
                                        <a class="a-link"
                                            href="javascript:void(0)"
                                            @click="editBlog('add', data)">新增下级文章</a>
                                    </template>
                                </span>
                            </span>
                        </template>
                        </el-tree>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" @close="dialogConfig.show=false">
           <el-form :model="formData" 
                        :rules="rules"
                        ref="formDataRef" label-width="50px">
                    <el-form-item label="名称" prop="categoryName">
                        <el-input placeholder="请输入名称"
                            v-model="formData.categoryName" >
                        </el-input>
                    </el-form-item>
                    <el-form-item label="封面" prop="cover">
                        <CoverUpload v-model="formData.cover"></CoverUpload>
                    </el-form-item>
                    <el-form-item label="简介" prop="categoryDesc">
                        <el-input placeholder="请输入简介" v-model="formData.categoryDesc" :style="{ marginTop: '10px' }" type="textarea" :autosize="{minRows:4,maxRows:8}">
                        </el-input>
                    </el-form-item>
                </el-form>
        </Dialog>
        <BlogEdit ref="blogEditRef" @callback="saveBlogCallback"></BlogEdit>
        <BlogDetail ref="blogDetailRef" @callback="saveBlogCallback"></BlogDetail>
    </div>
</template>

<script setup>
import BlogEdit from './BlogEdit.vue'
import BlogDetail from './BlogDetail.vue'
import { getCurrentInstance,reactive, ref, nextTick } from 'vue';

const { proxy } = getCurrentInstance()
const userInfo = ref(proxy.VueCookies.get("userInfo") || {})
const api = {
    'loadDataList':'/category/loadCategory4Special',
    'saveCategory':'/category/saveCategory4Special',
    'delCategory':'/category/delCategory4Special',
    'getSpecialInfo':'blog/getSpecialInfo',
    'delBlog':'/blog/recoveryBlog',
    'updateSpecialBlogSort':'blog/updateSpecialBlogSort',
}

const columns = [
    {
        label:'封面',
        prop:'cover',
        width:120,
        scopeSlots:'cover'
    },
    {
        label: '名称',
        prop: 'categoryName',
        width: 150
    },
     {
        label: '简介',
        prop: 'categoryDesc',
    },
    {
        label: '博客数量',
        prop: 'blogCount',
        width: 80
    },
    {
        label: '操作',
        prop: 'op',
        width: 100,
        scopeSlots: 'opration'
    }
]

const tableData = reactive({})
const tableOptions = {
    extHeight:90
}

const currentCategoryId = ref(null)
const dataTableRef = ref(null)
const loadDataList = async ()=> {
    let result = await proxy.Request({
        url:api.loadDataList
    })
    if(!result) {
        return
    }
    Object.assign(tableData,result.data)
    if(currentCategoryId.value == null && result.data.list.length > 0) {
        currentCategoryId.value = result.data.list[0].categoryId
        loadBlogList()
    }
    nextTick(()=>{
        dataTableRef.value.setCurrentRow('categoryId',currentCategoryId.value)
    })
}

// 新增 修改 专题
const dialogConfig = reactive({
    show:false,
    title:'标题',
    buttons:[
    {
        type: 'danger',
        text:'确定',
        click: (e) => {
            submitForm()
        }
    }
]
})

const formData = ref({})
const formDataRef = ref()

const rules = {
    categoryName:[{
        required:true,
        message:'请输入分类名称'
    }]
}
const showEdit = (type,data)=> {
    dialogConfig.show = true
    nextTick( () => {
        formDataRef.value.resetFields()
        if (type == 'add') {
            dialogConfig.title = '新增分类'
            formData.value = {}
        } else if (type == 'update') {
            dialogConfig.title = '编辑分类'
            formData.value = JSON.parse(JSON.stringify(data))
        }
    })
}

const submitForm = () => {
    formDataRef.value.validate(async (volid) => {
        if(!volid) {
            return
        }
        let params = {}
        Object.assign(params,formData.value)
        let result = await proxy.Request({
            url:api.saveCategory,
            params
        })
        if(!result) {
            return
        }
        dialogConfig.show = false
        proxy.message.success('保存成功')
        loadDataList()
        loadBlogList()
    })
}

// 删除
const del = (data) => {
    proxy.Confirm(`确定删除${data.categoryName}吗？`,async () => {
        let result = await proxy.Request({
            url:api.delCategory,
            params:{
                categoryId:data.categoryId
            }
        })
        if(!result) {
            return
        }
        loadDataList()
        currentCategoryId.value = null
    })
}

// 专题树

// 获取专题文章
const rowClick = (row) => {
    currentCategoryId.value = row.categoryId
    loadBlogList()
}
const blogList = ref({})
const refTree = ref()

const loadBlogList = async() => {
    let result = await proxy.Request({
        url:api.getSpecialInfo,
        params:{
            categoryId: currentCategoryId.value,
            showType:'1'
        }
    })
    if(!result) {
        return
    }
     
    if (currentCategoryId.data = null) {
        blogList.value = null
    } else {
        blogList.value = result.data
    }
}


// 属性展示专题
const treeProps = {
    children: 'children',
    label: 'title',
    value:'blogId'
}


// 新增、修改、专题博客
const blogEditRef = ref(null)
const editBlog = (type,data) => {
    blogEditRef.value.init(type,data)
}

// 删除博客
const delBlog = (data) => {
    proxy.Confirm(`确定要删除 【${data.title}】 吗？`, async () => {
        let result = await proxy.Request({
            url: api.delBlog,
            params: {
                blogId: data.blogId
            }
        })
        if (!result) {
            return
        }
        loadBlogList()
    })
}

// 保存专题博客回调
const saveBlogCallback = () => {
    loadBlogList()
}

// 拖拽排序 修改父级
const blogDrag = async (draggingNode,dropNode,dropType,ev) => {
    // 拽入某个节点内 修改父级节点为目标节点 同时修改目标节点下的所有子节点的排序
    let parentNode = null
    if(dropType == 'inner') {
    // 拽入某个节点内 修改父级节点为目标节点 同时修改目标节点下的所有子节点的排序
        parentNode = dropNode
    }else {
    // 拽入之前 之后 修改被拖动的节点为父节点为目标节点的父节点 同时修改目标节点父节点下的所有子节点的排序
        parentNode = dropNode.parent
    }
    // 操作的节点
    const blogId = draggingNode.data.blogId
    const pBlogId = parentNode.data.blogId
    // 需要重新排序的博客ID
    const blogIds = []
    parentNode.childNodes.forEach(element => {
        blogIds.push(element.data.blogId)
    });
    let params = {
        blogId,
        pBlogId,
        blogIds:blogIds.join(',')
    }
    let result = await proxy.Request({
        url:api.updateSpecialBlogSort,
        params
    })
    if(!result) {
        return
    }
    // 重新加载文章树
    loadBlogList()
}

const blogDetailRef = ref(null)
const showDetail = (data) => {
    blogDetailRef.value.showDetail(data)
}
</script>

<style lang="scss">
.op {
    display: flex;
    align-items: center;
}
.tree-panel {
    height: calc(100vh - 286px);
    overflow: auto;
}
.tree-panel {
        .custom-node-style {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-right: 6px;
    }
}
a:-webkit-any-link {
    color: #1890ff;
    cursor: pointer;
}
.special{
        .cust-dialog {
            width: 500px;
            // height: 500px;
        }
    }
 
</style>