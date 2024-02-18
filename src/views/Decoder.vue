<template>
  <a-typography-paragraph v-if="!supported">
    所用浏览器不支持调用摄像头，无法进行解码操作，请更换其他设备尝试！
  </a-typography-paragraph>
  <template v-else>
    <video id="vdoReceiver" class="w-full h-full" autoplay />
    <a-button :danger="vdoReceiver?.played" @click="onPlayClick">
      {{ vdoReceiver?.played ? '停止' : '开始' }}录摄
    </a-button>
  </template>
</template>

<script setup lang="ts">
import { waitFor } from '@lib/utils'
import { onMounted, ref } from 'vue'

const supported = ref<boolean>(false)
const vdoReceiver = ref<HTMLVideoElement | null>(null)

onMounted(async () => {
  supported.value = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  vdoReceiver.value = (await waitFor('vdoReceiver')) as HTMLVideoElement
  const pageSize = await waitFor('app').then(ele => ele?.getBoundingClientRect())
  console.log(pageSize)
  if (supported.value) {
    vdoReceiver.value.srcObject = await navigator.mediaDevices.getUserMedia({
      video: {
        width: pageSize?.width,
        height: pageSize?.height
        // facingMode: { exact: "environment" },
      },
      audio: false
    })
  }
})

function onPlayClick() {
  if (vdoReceiver.value) {
    if (vdoReceiver.value.played) {
      vdoReceiver.value.pause()
    } else {
      vdoReceiver.value.play()
    }
  }
}
</script>
