import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Encoder from '../views/Encoder.vue'
import Decoder from '@/views/Decoder.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/qr_import_channel/home'
  },
  {
    path: '/qr_import_channel/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/qr_import_channel/encoder',
    name: 'Encoder',
    component: Encoder
  },
  {
    path: '/qr_import_channel/decoder',
    name: 'Decoder',
    component: Decoder
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
