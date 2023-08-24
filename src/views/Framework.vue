<template>
  <div class="layout">
    <el-container>
      <el-header class="header">
        <div class="logo">Su.blog</div>
        <div class="user-info">
          <span>欢迎回来，</span>
          <el-dropdown>
          <span class="el-dropdown-link">
           {{ userInfo.nickName }}
           <span class="iconfont icon-close"></span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <router-link to="../settings/myInfo" class="link">个人信息</router-link>
              </el-dropdown-item>
              <el-dropdown-item @click="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
            <img :src="userInfo.avatar">
        </div>
      </el-header>
      <el-container class="container">
        <el-aside class="left-aside">
          <div>
            <el-button class="post-btn" @click="createHtml">发布</el-button>
          </div>
          <div class="menu-panel">
            <ul>
              <li v-for="(menu, index) in menuList">
                <span class="menu-title-p" @click="openClose(index)">
                  <span :class="['iconfont', menu.icon]"></span>
                  <span class="menu-title">{{ menu.title }}</span>
                  <span :class="['iconfont', menu.open?
                   'icon-open' : 'icon-close']"></span>
                </span>
                <ul class="sub-menu" v-show="menu.open">
                  <li v-for="subMenu in menu.children">
                    <router-link :to="subMenu.path" :class="['sub-menu-item', activePath == subMenu.path?'active' : '']"
                    v-if="subMenu.roleType == null || subMenu.roleType == userInfo.roleType">{{ subMenu.title }}</router-link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>

        </el-aside>
        <el-main class="right-main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
    <Dialog :show="progressDialog.show"
            :title="progressDialog.title" 
            :buttons="progressDialog.buttons" 
            @close="progressDialog.show = false"
            :show-close="false"
            :showClose="false"
            :width="200">
        <div class="progress-container">
          <div class="progress-panel">
            <el-progress type="circle"
                        :percentage="progressInfo.progress"
                        :status="progressInfo.status"
                        :color="colors"/>
          </div>
          <div class="error"
               v-if="progressInfo.result==0">
            <div>生成页面出错啦：{{ progressInfo.errorMsg }}</div>
            <div class="info">具体错误，请查看服务器日志</div>
          </div>
          <div class="success"
                v-if="progressInfo.progress==100&&progressInfo.result==1">发布成功</div>
          <div class="btn-panel"
                v-if="progressInfo.progress == 100 || progressInfo.result == 0">
                <el-button class="btn" type="primary" @click="progressDialog.show = false">关闭</el-button>
          </div>
        </div>
    </Dialog>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
const store = useStore()
    import {  getCurrentInstance, ref,watch, reactive } from 'vue'
    import { useRouter , useRoute } from 'vue-router'
    const { proxy } = getCurrentInstance()
    const router = useRouter()
    const route = useRoute()
const userInfo = ref(proxy.VueCookies.get("userInfo") || {})
    const api = {
      'getUserInfo':'getUserInfo',
      'logout':'logout',
      'createHtml':'createHtml',
      'checkProgress':'checkProgress',
    }
    const menuList = ref([
      {
        title:'博客',
        icon:'icon-blog',
        open:true,
        children:[
          {
          title:'博客管理',
          path:'/blog/list'
          },
          {
          title: '分类管理',
          path: '/blog/category'
          }
        ]
      },
      {
        title:'专题',
        icon:'icon-special_subject',
        open:true,
        children:[
         {
          title: '专题管理',
          path: '/special/category'
        }
      ]
      },
      {
        title: '设置',
        icon: 'icon-set_up_dot',
        open: true,
        children: [
          {
            title: '个人信息设置',
            path: '/settings/myInfo'
          },
          {
            title: '博客成员',
            path: '/settings/user'
          },
          {
            title: '系统设置',
            path: '/settings/SysSetting',
            roleType:1
          }
        ]
      },
      {
      title: '回收站',
      icon: 'icon-recycle_bin',
      open: true,
      children: [
        {
          title: '回收站',
          path: '/recovery/list'
        }
      ]
    }
  ])

    const openClose = (index)=>{
        const open = menuList.value[index].open
        menuList.value[index].open = !open
    }

    // const userInfo = ref({})
    // const init = ()=>{
    //  userInfo.value =  VueCookies.get('userInfo')
    //  userInfo.value.avatar = proxy.globalInfo.imageUrl + userInfo.value
    // }
    // init()

const getUserInfo = async () => {
  let result = await proxy.Request({
    url:api.getUserInfo
  })
  if(!result) {
    return
  }
  userInfo.value = result.data
  userInfo.value.avatar = proxy.globalInfo.imageUrl + result.data
}
getUserInfo()

    const activePath = ref(null)
    watch(route,(newValue,oldValue)=>{
        activePath.value = newValue.path
    },{immediate:true,deep:true})

    // 退出
const logout = () => {
  proxy.Confirm(`确定要退出吗？`, async () => {
    let result = await proxy.Request({
      url: api.logout
    })
    if (!result) {
      return
    }
    router.push('/login')
  })
}

// 监听store
watch(()=>store.state.userInfo,(newVal,oldVal) => {
  const avatar = proxy.globalInfo.imageUrl+newVal.avatar
  const nickName = newVal.nickName
  userInfo.value = {avatar,nickName}
},{immediate:true,deep:true})

// 发布
const colors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
]

const progressDialog = reactive({
  title:'发布',
  buttons:[],
  show:false
})

const progressInfo = reactive({
    progress:0
})

let checkTimer = null
const createHtml = async () => {
  progressDialog.show = true
  progressInfo.progress = 0
  progressInfo.status = undefined
  let result = await proxy.Request({
    url:api.createHtml
  })
  if(!result) {
    return
  }
  checkProgress()
  checkTimer = setInterval(()=>{
    checkProgress()
  },1000)
}
const checkProgress = async () => {
  let result = await proxy.Request({
    url:api.checkProgress,
    showLoading:false,
  })
  if(!result) {
    return
  }
  if(result.data.result == 0) {
    progressInfo.status = 'exception'
    progressInfo.errorMsg = result.data.errorMsg
  } else {
    progressInfo.progress = result.data.progress
  }
  progressInfo.result = result.data.result
  if(
    (result.data.progress == 100 || result.data.result == 0) && checkTimer != null
  ) {
    clearInterval(checkTimer)
  }
}

</script>

<style lang="scss">
    .header {
      align-items: center;
      border-bottom: 1px solid #ddd;
      background-color: #fff;
      display: flex;
      justify-content: space-between;
      .user-info {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #222222;
          .el-dropdown-link {
              cursor: pointer;
              padding-right: 15px;
              font-size: 14px;
              color:var(--el-color-primary);
              .iconfont {
                color: #3d3d3d;
              }
        }
          img {
          height: 40px;
          width: 40px;
          overflow: hidden;
          border-radius: 50%;
        }
      }
    }
    .container {
      padding: 10px;
      height: calc(100vh - 60px);
      background-color: #fdfcf9;
      .left-aside {
          width: 210px;
      }
      .post-btn {
        width: 205px;
        color: #fff;
        background-color: darkgreen;
      }
      .menu-panel {
        margin-top: 10px;
        ul,
        li {
          padding: 0px;
          margin: 0px;
        }
        .menu-title-p {
          height: 40px;
          width: 200px;
          line-height: 40px;
          cursor: pointer;
          display: flex;
          .icon-open ,
          .icon-close{
            padding-right: 8px;
            font-size: 16px;
            color: #525355;
          }
          :first-child {
            font-size: 20px;
            font-weight: 600;
            padding-left: 8px;
            color: gray;
          }
          .menu-title {
            flex: 1;
            color: #3f4042;
            margin-left: 5px;
          }
        }
        .menu-title-p:hover {
            background-color: #ddd;
          }
        .sub-menu .sub-menu-item {
          display: block;
          cursor: pointer;
          padding-left: 38px;
          height: 30px;
          width: 200px;
          line-height: 30px;
          font-size: 14px;
          color: #42403f;
        }
        .sub-menu .active {
          color: #f37209;
          background-color: #f1e9e9;
        }
         .sub-menu .sub-menu-item:hover {
            color: #f37209;
            background-color: #ddd;
         }
      }
    }
    .right-main {
      position: relative;
      background-color: #fff;
      padding:17px 10px 10px 10px;
    }
    .link:hover {
      color: #1890ff;
    }

    .progress-container {
      .progress-panel {
        display: flex;
        justify-content: center;
      }
      .error {
        color: red;
        margin-top: 20px;
        .info {
          font-size: 13px;
        }
      }
      .success {
        margin-top: 20px;
        text-align: center;
        font-size: 16px;
        color: green;
      }
      .btn-panel {
        text-align: center;
        margin-top: 20px;
        .btn {
          margin: 0px auto;
        }
      }
    }

    .layout{
    .cust-dialog {
        width: 350px;
    }
}
</style>