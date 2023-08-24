import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from 'vue-cookies'
//创建并暴露一个路由器
const routes = [
    {
        name: '登录',
        path: '/login',
        component: () => import('../views/Login.vue')
    },
    {
        name: '框架页',
        path: '/',
        component: () => import('../views/Framework.vue'),
        redirect: '/blog/list',
        children: [
            {
                name: '博客管理',
                path: '/blog/list',
                component: () => import('../views/blog/BlogList.vue')
            },
            {
                name: '分类管理',
                path: '/blog/category',
                component: () => import('../views/blog/BlogCategory.vue')
            },
            {
                name: 'test',
                path: '/blog/test',
                component: () => import('../views/blog/Test.vue')
            },
            {
                name: '专题管理',
                path: '/special/category',
                component: () => import('../views/special/SpecialList.vue')
            },
            {
                name: '个人信息设置',
                path: '/settings/myInfo',
                component: () => import('../views/settings/MyInfo.vue')
            },
            {
                name: '博客成员',
                path: '/settings/user',
                component: () => import('../views/settings/TeamUser.vue')
            },
            {
                name: '系统设置',
                path: '/settings/SysSetting',
                component: () => import('../views/settings/SysSetting.vue')
            },
            {
                name: '回收站',
                path: '/recovery/list',
                component: () => import('../views/recovery/RecoveryList.vue')
            }
        ]
    }
];

const router = createRouter({
    routes,
    history: createWebHistory()
})

router.beforeEach((to, from, next) => {
    const userInfo = VueCookies.get("userInfo")
    if (!userInfo && to.push != "/login") {
        router.push("/login")
    }
    next()
})

export default router