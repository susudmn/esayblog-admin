<template>
    <div>
        <div class="top-panel">
            <el-form @submit.native.prevent :model="searchFormData" labelAlign="left">
                <el-row :gutter="10">
                    <el-col :span="5.5">
                        <el-form-item label="标题">
                            <el-input placeholder="请输入名称(支持模糊搜索)" v-model="searchFormData.titleFuzzy" allowClear
                                @keyup.enter.native="loadDataList">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item>
                            <el-button type="danger" @click="loadDataList()">搜索</el-button>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </div>
        <Table :columns="columns" :dataSource="tableData" :fetch="loadDataList"
            :options="tableOptions">
            <template #cover="{ index, row }">
                <cover :cover="row.cover"></cover>
            </template>
            <template #blogInfo="{ index, row }">
                <div>标题：{{ row.title }}</div>
                <div>文章类型：{{ row.blogType==0?'博客':'专题' }}
                    <el-divider direction="vertical"></el-divider> <span> {{ row.blogType == 0 ? '分类：' : '专题：' }}</span>{{ row.categoryName||'--' }}
                </div>
                <div>作者：{{ row.nickName }}</div>
            </template>
            <template #time="{ index, row }">
                <div>创建时间：{{ row.createTime }}</div>
                <div>最后更新时间：{{ row.lastUpdateTime }}</div>
            </template>
            <template #opration="{ index, row }">
                <template v-if="row.userId == userInfo.userId||userInfo.roleType == 1">
                        <a href="javascript:void(0)" class="a-link" @click="reductionBlog(row)">还原</a>
                        <el-divider direction="vertical"></el-divider>
                        <a href="javascript:void(0)" class="a-link" @click="delBlog(row)">删除</a>
                </template>
                <span v-else>--</span>
            </template>
        </Table>
    </div>
</template>

<script setup>
import { getCurrentInstance, reactive, ref } from 'vue';
import {useRouter} from 'vue-router'
const router = useRouter()
const { proxy } = getCurrentInstance()
const api = {
    loadDataList: '/blog/loadRecoveryList',
    delBlog: '/blog/delBlog',
    reductionBlog: '/blog/reductionBlog'
}
const userInfo = ref(proxy.VueCookies.get("userInfo") || {})
// const userInfo = reactive({ roleType :1})

// 搜索功能
const searchFormData = reactive({})

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
        prop: 'title',
        // width: 180,
        scopeSlots: 'blogInfo'
    },
    {
        label: '编辑器',
        prop: 'editorTypeName',
        width: 120
    },
    {
        label: '评论',
        prop: 'allowCommentTypeName',
        width: 80,
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
        pageNo: tableData.value.pageNo,
        // pageSize:tableData.pageSize
        pageSize: tableData.value.pageSize
    }
    Object.assign(params, searchFormData)
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

// 删除博客
const delBlog = (data) => {
    proxy.Confirm(`确定要永久删除 【${data.title}】 吗？`, async () => {
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

// 恢复博客
const reductionBlog = (data) => {
    proxy.Confirm(`确定要恢复 【${data.title}】 吗？恢复后博客为草稿状态`, async () => {
        let result = await proxy.Request({
            url: api.reductionBlog,
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
</script>

<style lang="scss"></style>