<template>
    <div>
        <div class="top-panel">
            <el-form :model="searchFormData" label-width="50px">
                <el-row>
                    <el-col :span="5.5">
                        <el-form-item label="标题" prop="titleFuzzy">
                            <el-input placeholder="请输入名称(支持模糊搜索)"
                                v-model="searchFormData.titleFuzzy" 
                                clearable @keyup.enter.native="loadDataList">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4">
                        <el-form-item label="状态" prop="status">
                            <el-select v-model="searchFormData.status" placeholder="请选择状态">
                                <el-option label="草稿" :value="0"></el-option>
                                <el-option label="已发布" :value="1"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="4">
                        <el-form-item label="分类" prop="status">
                            <el-select v-model="searchFormData.categoryId" placeholder="请选择分类" :style="{width:'100%'}">
                                <el-option label="全部分类" :value="0"></el-option>
                                <el-option :label="item.categoryName" :value="item.categoryId" v-for="item in categoryList"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8" style="padding-left:30px">
                        <el-button type="danger" @click="loadDataList()">搜索</el-button>
                        <el-button type="danger" @click="showEdit('add')">新增博客</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </div>
        <Table  :columns="columns"
                :showPagination="true"
                :dataSource="tableData"
                :fetch="loadDataList"
                :options="tableOptions">
            <!-- 封面 -->
            <template #cover="{ index, row }">
                <cover :cover="row.cover"></cover>
            </template>
            <!-- 文章信息 -->
            <template #blogInfo="{ index, row }">
                <div>标题：{{ row.title }}</div>
                <div>分类：{{ row.categoryName }}</div>
                <div>作者：{{ row.nickName }}</div>
            </template>
            <!-- 类型 -->
            <template #typeName="{ index, row }">
                <div><span v-if="row.type == 0">原创</span>
                <span v-if="row.type == 1">转载</span></div>
                <div v-if="row.type==1">转载地址：{{ row.reprintUrl }}</div>
            </template>
            <!-- 状态 -->
            <template #statusName="{ index, row }">
                <span v-if="row.status == 1" :style="{color:'green'}">{{ row.statusName }}</span>
                <span v-else :style="{ color: 'red' }">{{ row.statusName }}</span>
            </template>
            <!-- 时间 -->
            <template #time="{ index, row }">
                <div>创建时间：{{ row.createTime }}</div>
                <div>最后更新时间：{{ row.lastUpdateTime }}</div>
            </template>
            <template #opration="{ index, row }">
                <div class="op">
                    <a href="javascript:void(0)" class="a-link" @click="showEdit('update', row)" v-if="userInfo.userId == row.userId">修改</a>
                    <el-divider direction="vertical" v-if="userInfo.userId == row.userId"></el-divider>
                    <a href="javascript:void(0)" class="a-link" @click="delBlog(row)" v-if="userInfo.userId == row.userId">删除</a>
                    <el-divider direction="vertical" v-if="userInfo.userId == row.userId"></el-divider>
                    <a href="javascript:void(0)" class="a-link" @click="showDetail(row.blogId)">预览</a>
                </div>
            </template>
        </Table>
       <BlogEdit ref="blogEditRef" @callback="loadDataList"></BlogEdit>
       <BlogDetail ref="blogDetailRef"></BlogDetail>
    </div>
</template>

<script setup>
import {  getCurrentInstance,reactive,ref } from 'vue';
import BlogEdit from "./BlogEdit.vue";
import BlogDetail from "./BlogDetail.vue";
const { proxy } = getCurrentInstance()
const api = {
    loadCategory: '/category/loadAllCategory4Blog',
    loadDataList:'/blog/loadBlog',
    delBlog: '/blog/recoveryBlog'
}

const userInfo = ref(proxy.VueCookies.get("userInfo") || {})

// 搜索功能
const searchFormData = reactive({})

const categoryList = ref([])
const loadCategoryList =async () => {
    let result = await proxy.Request({
        url: api.loadCategory,
    })
    categoryList.value = result.data
}
    loadCategoryList()


// 列表功能
const columns = [
    {
        label: '封面',
        prop: 'cover',
        width: 100,
        scopeSlots: 'cover'
    },
    {
        label: '文章信息',
        prop: 'blogInfo',
        // width: 180,
        scopeSlots: 'blogInfo'
    },
    {
        label: '编辑器',
        prop: 'editorTypeName',
        width: 120
    },
    {
        label: '类型',
        prop: 'typeName',
        width: 150,
        scopeSlots: 'typeName'
    },
    {
        label: '评论',
        prop: 'allowCommentTypeName',
        width: 80,
    },
    {
        label: '状态',
        prop: 'statusName',
        width: 80,
        scopeSlots: 'statusName'
    },
    {
        label: '时间',
        prop: 'time',
        width: 260,
        scopeSlots: 'time'
    },
    {
        label: '操作',
        prop: 'op',
        width: 145,
        scopeSlots: 'opration'
    }
]

// const tableData = reactive({})
const tableData = ref({})
const tableOptions = {
    extHeight: 45
}
const loadDataList = async () => {
    let params = {
        // pageNo:tableData.pageNo,
        pageNo:tableData.value.pageNo,
        // pageSize:tableData.pageSize
        pageSize:tableData.value.pageSize
    }
    Object.assign(params,searchFormData)
    let result = await proxy.Request({
        url: api.loadDataList,
        params
    })
    if (!result) {
        return
    }
    // Object.assign(tableData,result.data)
    tableData.value = result.data
}

const blogEditRef = ref(null)
const showEdit = (type,data) => {
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
        loadDataList()
    })
}

// 详情
const blogDetailRef = ref(null)
const showDetail = (blogId) => {
    blogDetailRef.value.showDetail(blogId)
}
</script>

<style lang="scss">
    
</style>