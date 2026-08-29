import { createRouter, createWebHashHistory } from 'vue-router'

// PWA 单页应用用 hash 路由，file:// 或离线场景都稳定
const routes = [
  { path: '/', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '首页' } },
  { path: '/library', name: 'library', component: () => import('../views/Library.vue'), meta: { title: '动词库' } },
  { path: '/compare', name: 'compare', component: () => import('../views/Compare.vue'), meta: { title: '对比中心' } },
  { path: '/practice', name: 'practice', component: () => import('../views/Practice.vue'), meta: { title: '练习' } },
  { path: '/mistakes', name: 'mistakes', component: () => import('../views/Mistakes.vue'), meta: { title: '错题集' } },
  { path: '/notes', name: 'notes', component: () => import('../views/Notes.vue'), meta: { title: '笔记' } },
  { path: '/reference', name: 'reference', component: () => import('../views/Reference.vue'), meta: { title: '规律速查' } },
  { path: '/settings', name: 'settings', component: () => import('../views/Settings.vue'), meta: { title: '设置' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
