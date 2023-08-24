<template>
    <div class="myInfo">
         <el-form :model="searchFormData">
            <el-row>
                <el-col :span="5.3">
                    <el-form-item label="昵称" prop="nickNameFuzzy" style="margin-left:13px">
                        <el-input placeholder="请输入昵称(支持模糊搜索)"
                            v-model="searchFormData.nickNameFuzzy" 
                            clearable @keyup.enter.native="loadDataList">
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="5">
                    <el-form-item label="手机号" prop="phoneFuzzy"  label-width="80px">
                        <el-input placeholder="请输入手机号"
                            v-model="searchFormData.phoneFuzzy" 
                            clearable @keyup.enter.native="loadDataList">
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="5" :style="{'padding-left':'10px'}">
                    <el-button type="danger" @click="loadDataList">搜索</el-button>
                    <el-button type="danger" @click="showEdit('add')" v-if="userInfo.roleType == 1">新增成员</el-button>
                </el-col>
            </el-row>
        </el-form>
        <Table  :columns="columns"
                :showPagination="true"
                :dataSource="tableData"
                :fetch="loadDataList"
                :options="tableOptions">
            <!-- 头像 -->
            <template #avatar="{ index, row }">
                <cover :cover="row.avatar"></cover>
            </template>
            <!-- 用户信息 -->
            <template #userInfo="{ index, row }">
                <div>昵&nbsp;&nbsp;&nbsp;&nbsp;称：{{ row.nickName }}</div>
                <div>手机号：{{ row.phone }}</div>
                <div>职&nbsp;&nbsp;&nbsp;&nbsp;业：{{ row.profession }}</div>
            </template>
            <!-- 类型 -->
            <template #roleInfo="{ index, row }">
                <div>{{ row.roleTypeName }}</div>
            </template>
            <!-- 状态 -->
            <template #statusInfo="{ index, row }">
                <span v-if="row.status == 1" :style="{ color: 'green' }">{{ row.statusName }}</span>
                <span v-else :style="{ color: 'red' }">{{ row.statusName }}</span>
            </template>
            <!-- 时间 -->
            <template #timeInfo="{ index, row }">
                <div>创建时间：{{ row.createTime }}</div>
                <div>最后登录时间：{{ row.lastLoginTime }}</div>
            </template>
            <template #opration="{ index, row }">
                <span v-if="userInfo.roleType == 1">
                    <a href="javascript:void(0)" class="a-link" @click="showEdit('edit', row)">修改</a>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0)" class="a-link" @click="changeCountStatus(row)">{{ row.status == 0?'启用':'禁用' }}</a>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0)" class="a-link" @click="showEditPass(row)">修改密码</a>
                    <el-divider direction="vertical"></el-divider>
                    <a href="javascript:void(0)" class="a-link" @click="delUser(row)">删除</a>
                </span>
                <span v-else>--</span>
            </template>
        </Table>
        <Dialog :show="editDialogInfo.show" :title="editDialogInfo.title" :buttons="editDialogInfo.buttons" @close="editDialogInfo.show = false">
            <el-form :model="formData" 
                        :rules="rules"
                        ref="editFormRef" label-width="11px">
                    <el-row :gutter="10">
                        <el-col :span="10">
                            <el-form-item label="昵称" prop="nickName" label-width="95px">
                                <el-input :maxLength="30"
                                    v-model="formData.nickName" >
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="手机号" prop="phone" label-width="148px">
                                <el-input :maxLength="11"
                                    v-model="formData.phone" >
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="10" v-if="formData.userId == null">
                        <el-col :span="10">
                            <el-form-item label="密码" prop="password" label-width="95px">
                                <el-input :maxLength="20"
                                    v-model="formData.password" >
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="再次输入密码" prop="rePassword" label-width="148px">
                                <el-input :maxLength="20"
                                    v-model="formData.rePassword" >
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="10">
                        <el-col :span="12">
                            <el-form-item label="默认编辑器"  prop="editorType" label-width="95px">
                                 <el-radio-group v-model="formData.editorType">
                                    <el-radio :label="0">富文本编辑器</el-radio>
                                    <el-radio :label="1">Markdown编辑器</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="职业" prop="profession" label-width="85px">
                                <el-input v-model="formData.profession" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="10">
                        <el-col :span="12">
                            <el-form-item label="头像" prop="avatar" label-width="95px">
                                    <CoverUpload v-model="formData.avatar"></CoverUpload>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="10">
                        <el-col :span="22">
                            <el-form-item label="简介" prop="introduction" label-width="95px" >
                                <EditorHtml :height="100" id="introduction" ref="introduction"  v-model="formData.introduction">
                                </EditorHtml>
                        </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
        </Dialog>
        <!-- <Dialog :show="dialogConfig.show"
                :title="dialogConfig.title" 
                :buttons="dialogConfig.buttons" 
                @close="dialogConfig.show = false">
            <el-form :model="formData" 
                    :rules="rules"
                    ref="passwordFormDataRef" label-width="78px">
                <el-form-item label="密码" prop="password">
                    <el-input placeholder="请输入密码"
                        v-model="formData.password">
                    </el-input>
                </el-form-item>
                <el-form-item label="重复密码" prop="rePassword">
                        <el-input placeholder="请再次输入密码"
                            v-model="formData.rePassword" >
                        </el-input>
                </el-form-item>
            </el-form>
        </Dialog> -->
    </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { getCurrentInstance, nextTick, reactive, ref } from 'vue';
const { proxy } = getCurrentInstance()
const store = useStore()
const userInfo = ref(proxy.VueCookies.get("userInfo") || {})
const api = {
    'loadDataList':'setting/loadUser',
    'saveTeamUser':'setting/saveTeamUser',
    'delUser':'setting/delUser',
    'updateStatus':'setting/updateStatus',
    'updatePassword':'setting/updatePassword',
}

const tableOptions = {
    extHeight: 60
}
// const userInfo = ref({ roleType : 1})
// 列表功能
const columns = [
    {
        label: '头像',
        prop: 'avatar',
        width: 80,
        scopeSlots: 'avatar'
    },
    {
        label: '用户信息',
        prop: 'nickName',
        scopeSlots: 'userInfo'
    },
    {
        label: '默认编辑器',
        prop: 'editorTypeName',
        width: 120
    },
    {
        label: '角色',
        prop: 'roleTypeName',
        scopeSlots: 'roleInfo',
        width: 80,
    },
    {
        label: '状态',
        prop: 'statusInfo',
        width: 80,
        scopeSlots: 'statusInfo'
    },
    {
        label: '时间',
        prop: 'createTime',
        width: 300,
        scopeSlots: 'timeInfo'
    },
    {
        label: '操作',
        prop: 'opration',
        width: 240,
        scopeSlots: 'opration'
    }
]

const searchFormData = reactive({})
const tableData = ref({})
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

// 新增成员修改弹窗
const validateRePass = (rule, value, callback) => {
    if (value != formData.value.password) {
        callback(new Error(rule.message))
    } else {
        callback()
    }
}

const rules = {
    nickName: [{
        required: true,
        message: '昵称不能为空！'
    }],
    phone: [
        {
            required: true,
            message: '请输入手机号'
        },
        {
            validator: proxy.Verify.phone,
            trigger: 'blur',
            message: '请输入正确的手机号'
        }
    ],
    editorType: [{
        required: true,
        message: '请选择默认编辑器'
    }],
    password: [
        {
            required: true,
            message: '请输入密码'
        },
        {
            validator: proxy.Verify.password,
            message: '密码最少8位，且只能包含数字字母和特殊符号'
        },
    ],
    rePassword: [
        {
            required: true,
            message: '请再次输入密码'
        },
        {
            validator: validateRePass,
            message: '两次输入密码不一致'
        },
    ],
}
// 重复密码校验
const formData = ref({})
const editFormRef = ref()

const editDialogInfo = reactive({
    show: false,
    title: '新增用户',
    buttons: [
        {
            type: 'danger',
            text: '确定',
            click: (e) => {
                submitForm()
            }
        }
    ]
})


const submitForm = () => {
    editFormRef.value.validate(async (volid) => {
        if (!volid) {
            return
        }
        let params = {}
        Object.assign(params, formData.value)
        delete params.createTime
        delete params.lastLoginTime
        let result = await proxy.Request({
            url: api.saveTeamUser,
            params: params
        })
        if (!result) {
            return
        }
        editDialogInfo.show = false
        proxy.message.success('保存成功')
        loadDataList()
    })
}

const showEdit = (type, data) => {
    editDialogInfo.show = true
    nextTick(() => {
        editFormRef.value.resetFields()
        if (type == 'add') {
            editDialogInfo.edit = false
            editDialogInfo.title = '新增账号'
            formData.value = {
                introduction:''
            }
        } else {
            editDialogInfo.edit = true
            editDialogInfo.title = '修改账号'
            Object.assign(formData.value , data)
        }
    })
}

// 删除
const delUser = (data) => {
    proxy.Confirm(`确定删除${data.nickName}吗？`, async () => {
        let result = await proxy.Request({
            url: api.delUser,
            params: {
                userId: data.userId
            }
        })
        if (!result) {
            return
        }
        loadDataList()
    })
}

// 修改状态
const changeCountStatus = (data) => {
    let status =  data.status == 0 ? 1 : 0
    let statusName =  data.status == 0 ? '启用' : '禁用'
    proxy.Confirm(`确定${statusName}【${data.nickName}】吗？`, async () => {
        let result = await proxy.Request({
            url: api.updateStatus,
            params: {
                userId: data.userId,
                status: status,
            }
        })
        if (!result) {
            return
        }
        loadDataList()
    })
}

// 修改密码
const passwordFormDataRef = ref(null)
const dialogConfig = reactive({
    show: false,
    title: '修改密码',
    buttons: [
        {
            type: 'danger',
            text: '确定',
            click: (e) => {
                updatePassword()
            }
        }
    ]
})


// 修改密码
const updatePassword = () => {
    passwordFormDataRef.value.validate(async (valid) => {
        if (!valid) {
            return
        }
        let result = await proxy.Request({
            url: api.updatePassword,
            params: {
                userId: formData.value.userId,
                password: formData.value.password
            }
        })
        if (!result) {
            return
        }
        dialogConfig.show = false
        proxy.message.success('密码修改成功')
    })
}

const showEditPass = (row) => {
    dialogConfig.show = true
    nextTick(() => {
        passwordFormDataRef.value.resetFields()
        formData.value = { userId : row.userId }
    })
}
</script>

<style lang="scss">
    .myInfo{
        .cust-dialog {
            width: 800px;
        }
    }
</style>