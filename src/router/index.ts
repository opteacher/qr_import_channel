import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Encoder from '../views/Encoder.vue'
import Decoder from '@/views/Decoder.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/encoder',
    name: 'Encoder',
    component: Encoder
  },
  {
    path: '/decoder',
    name: 'Decoder',
    component: Decoder
  }
]

const router = createRouter({
  history: createWebHistory('qr_import_channel'),
  routes
})

export default router
