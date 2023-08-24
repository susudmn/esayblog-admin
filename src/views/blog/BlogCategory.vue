<template>
    <div class="category">
        <el-button color="#f37209" style="color:white ;" @click="showEdit('add')" v-if="userInfo.roleType == 1">新增分类</el-button>
        <Table  :columns="columns"
                :showPagination="false"
                :dataSource="tableData"
                :fetch="loadDataList"
                :options="tableOptions">
            <template #cover="{index,row}">
                    <cover :cover="row.cover"></cover>
            </template>
            <template #opration="{ index, row }">
                <div class="op">
                    <a href="javascript:void(0)" class="a-link" @click="showEdit('update',row)" v-if="userInfo.roleType == 1">修改</a>
                    <span v-else>&nbsp;&nbsp;</span>
                    <el-divider direction="vertical" v-if="userInfo.roleType == 1"></el-divider>
                    <a href="javascript:void(0)" class="a-link" @click="del(row)" v-if="userInfo.roleType == 1">删除</a>
                    <span v-else>-</span>
                    <el-divider direction="vertical" v-if="userInfo.roleType == 1"></el-divider>
                    <a href="javascript:void(0)" :class="[index==0?'not-allow' : 'a-link']" @click="changeSort(index,'up')" v-if="userInfo.roleType == 1">上移</a>
                    <span v-else>-</span>
                    <el-divider direction="vertical" v-if="userInfo.roleType == 1"></el-divider>
                    <a href="javascript:void(0)" :class="[index == tableData.list.length-1 ? 'not-allow' : 'a-link']" @click="changeSort(index, 'down')" v-if="userInfo.roleType == 1">下移</a>
                    <span v-else>&nbsp;&nbsp;</span>
                </div>
            </template>
        </Table>
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
    </div>
</template>

<script setup>
import { getCurrentInstance,reactive, ref, nextTick } from 'vue';

const { proxy } = getCurrentInstance()

const api = {
    'loadDataList':'/category/loadAllCategory4Blog',
    'saveCategory':'/category/saveCategory4Blog',
    'delCategory':'/category/delCategory4Blog',
    'changeSort':'/category/changeCategorySort4Blog'
}
const userInfo = ref(proxy.VueCookies.get("userInfo") || {})
const columns = [
    {
        label:'封面',
        prop:'cover',
        width:150,
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
        width: 190,
        scopeSlots: 'opration'
    }
]

const tableData = reactive({})
const tableOptions = {
    extHeight:10
}
const loadDataList = async ()=> {
    let result = await proxy.Request({
        url:api.loadDataList
    })
    if(!result) {
        return
    }
    tableData.list = result.data
}

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
    })
}

// 修改排序
const changeSort = async (index,type) => {
    let categoryList = tableData.list
    if(type == 'down' && index === categoryList.length-1 || type == 'up' && index===0){
        return
    }
    let temp = categoryList[index]
    let number = type == 'down' ? 1:-1
    categoryList.splice(index, 1)
    categoryList.splice(index + number, 0, temp)
    let result = await proxy.Request({
        url:api.changeSort,
        dataType:'json',
        params:categoryList
    })

    if(!result) {
        return
    }
    proxy.message.success('重新排序成功')
    loadDataList()
}
</script>

<style lang="scss">
.op {
    display: flex;
    align-items: center;
}
.category{
        .cust-dialog {
            width: 500px;
            // height: 500px;
        }
    }
</style>