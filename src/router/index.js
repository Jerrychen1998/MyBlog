import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Resume from '../views/Resume.vue'
import Editor from '../views/Editor.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/resume',
    name: 'Resume',
    component: Resume,
    meta: { title: '个人简历' }
  },
  {
    path: '/editor',
    name: 'Editor',
    component: Editor,
    meta: { title: '云端文本编辑器' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - 个人博客`
  next()
})

export default router