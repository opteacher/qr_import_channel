<template>
  <a-typography-paragraph v-if="!supported">
    所用浏览器不支持调用摄像头，无法进行解码操作，请更换其他设备尝试！
  </a-typography-paragraph>
  <video v-else id="vdoReceiver" class="w-full h-full" autoplay></video>
</template>

<script setup lang="ts">
import { waitFor } from '@lib/utils'
import { onMounted, ref } from 'vue'

const supported = ref<boolean>(false)

onMounted(async () => {
  supported.value = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  const vdoReceiver = (await waitFor('vdoReceiver')) as HTMLVideoElement
  const pageSize = await waitFor('app').then(ele => ele?.getBoundingClientRect())
  if (supported.value) {
    vdoReceiver.srcObject = await navigator.mediaDevices.getUserMedia({
      video: {
        width: pageSize?.width,
        height: pageSize?.height,
        facingMode: { exact: "environment" },  
      },
      audio: false
    })
  }
})
</script>
