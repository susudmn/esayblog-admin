import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
//引入VueRouter
import router from './router'
import ElementPlus from 'element-plus'
import store from './store'
import 'element-plus/dist/index.css'
import "./assets/icon/iconfont.css"
import "./assets/icon/iconfont.js"
import Request from './utils/Request'
import message from './utils/Message'
import Confirm from './utils/Confirm'
import Verify from './utils/Verify'
import VueCookies from 'vue-cookies'
import Table from './components/Table.vue'
import Cover from './components/Cover.vue'
import Dialog from './components/Dialog.vue'
import CoverUpload from './components/CoverUpload.vue'
import Window from './components/Window.vue'
import EditorMarkdown from './components/EditorMarkdown.vue'
import EditorHtml from './components/EditorHtml.vue'

const app = createApp(App)
//应用插件
app.use(router)
app.use(ElementPlus)
app.use(store)
app.config.globalProperties.Request = Request
app.config.globalProperties.message = message
app.config.globalProperties.message = message
app.config.globalProperties.Verify = Verify
app.config.globalProperties.VueCookies = VueCookies
app.config.globalProperties.globalInfo = {
    imageUrl: "/api/file/getImage/"
}
app.config.globalProperties.Confirm = Confirm
app.component('Table', Table)
app.component('Cover', Cover)
app.component('Dialog', Dialog)
app.component('CoverUpload', CoverUpload)
app.component('Window', Window)
app.component('EditorMarkdown', EditorMarkdown)
app.component('EditorHtml', EditorHtml)
// 挂载
app.mount('#app')

