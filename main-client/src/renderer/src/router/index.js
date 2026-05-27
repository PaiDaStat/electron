import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    { path: '/', component: () => import('../views/DriveGather.vue') },
    { path: '/tray', component: () => import('../views/TrayWindow.vue') },
    {
        path: '/:pathMatch(.*)*',
        redirect: "/",
    }
]

export default createRouter({
    history: createWebHashHistory(),
    routes
})
