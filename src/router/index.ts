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
    path: '/qr_import_channel/',
    redirect: '/qr_import_channel/home'
  },
  {
    path: '/qr_import_channel/home',
    name: 'Home',
    component: Home,
    meta: {
      dspName: '主页',
      desc: '显示当前传输任务和最近历史记录'
    }
  },
  {
    path: '/qr_import_channel/encoder',
    name: 'Encoder',
    component: Encoder,
    meta: {
      dspName: '编码页',
      desc: '上传文件进行编码传输'
    }
  },
  {
    path: '/qr_import_channel/decoder',
    name: 'Decoder',
    component: Decoder,
    meta: {
      dspName: '解码页',
      desc: '打开摄像头对准发送端的二维码，接受传输的文件'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
