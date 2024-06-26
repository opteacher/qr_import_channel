<template>
  <div class="space-y-2" ref="page">
    <a-space>
      <a-upload
        name="file"
        :showUploadList="false"
        :data="(file: File) => ({ file_real_name: file.name })"
        :action="sendURL"
      >
        <a-button type="primary">
          <template #icon><UploadOutlined /></template>
          上传文件
        </a-button>
      </a-upload>
      <a-typography-text v-if="tsfFile" strong>{{ tsfFile.name }}</a-typography-text>
    </a-space>
    <div v-if="tsfFile" class="flex space-x-1.5">
      <a-progress
        class="flex-1"
        :percent="(sliceCount / (totalSlices || 1)) * 100"
        :format="() => `${sliceCount} / ${totalSlices}`"
        :showInfo="false"
      />
      <a-button type="primary" danger size="small" @click="() => onFileClick(null)">
        <template #icon>
          <CloseOutlined />
        </template>
      </a-button>
    </div>
    <a-qrcode v-if="data" :size="qrSize" error-level="H" :value="data" />
  </div>
</template>

<script setup lang="ts">
import {
  getDescriptor,
  getNextPermutation,
  getNextSliceCount,
  hashFileSHA256B64,
  marshalDescriptor,
  marshalSlice
} from '@/FileUtils'
import { UploadOutlined, CloseOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, ref } from 'vue'
import mqtt from 'mqtt'
import axios from 'axios'

const sendURL = computed(() =>
  [
    import.meta.env.VITE_BACK_HOST ? `http://${import.meta.env.VITE_BACK_HOST}` : '',
    import.meta.env.VITE_BACK_PORT ? `:${import.meta.env.VITE_BACK_PORT}` : '',
    `/${import.meta.env.VITE_PJT}/api/v1/file/send`
  ].join('')
)
const tsfFile = ref<File | null>(null)
const sha256 = ref<string>('')
const fps = 15
const sliceSize = 200
const processing = ref<boolean>(false)
const count = ref<number>(0)
const totalSlices = ref<number>(0)
const sliceCount = ref<number>(0)
const data = ref<string>('')
const page = ref<HTMLElement | null>(null)
const qrSize = ref<number>()

onMounted(async () => {
  setInterval(async () => {
    if (tsfFile.value && processing.value === false) {
      if (count.value % 50 === 0) {
        const descriptor = getDescriptor(tsfFile.value, sha256.value, sliceSize)
        totalSlices.value = descriptor.totalSlices
        const marshaled = marshalDescriptor(descriptor, sliceSize)
        data.value = marshaled
      } else {
        processing.value = true
        const permutation = getNextPermutation(tsfFile.value, sliceSize)
        const marshaled = await marshalSlice(tsfFile.value, sliceSize, permutation)
        processing.value = false
        data.value = marshaled
        sliceCount.value = getNextSliceCount(tsfFile.value, sliceSize, sliceCount.value)
      }
      count.value++
    }
  }, 1000 / fps)

  initMqtt()
})

function initMqtt() {
  const client = mqtt.connect(
    `ws://${import.meta.env.VITE_MQTT_HOST}:${import.meta.env.VITE_MQTT_PORT}/mqtt`,
    {
      clientId: 'emqx_pop_' + Math.random().toString(16).substring(2, 8),
      username: import.meta.env.VITE_MQTT_USERNAME,
      password: import.meta.env.VITE_MQTT_PASSWORD,
      resubscribe: true,
      clean: true
    }
  )
  client.on('connect', res => {
    console.log('连接成功！', JSON.stringify(res))
    client.subscribe('send_file', err => (err ? console.error(err) : undefined))
  })
  client.on('error', e => console.error(JSON.stringify(e)))
  client.on('message', async (topic: string, message: Buffer) => {
    if (topic === 'send_file') {
      const strMsg = message.toString().trim()
      const flInfo = JSON.parse(strMsg.slice(0, -2))
      console.log(flInfo)
      const resp = await axios.get(
        [
          import.meta.env.VITE_MINIO_HOST ? 'http://' + import.meta.env.VITE_MINIO_HOST : '',
          import.meta.env.VITE_MINIO_PORT ? ':' + import.meta.env.VITE_MINIO_PORT : '',
          flInfo.path
        ].join('')
      )
      const blob = new Blob([resp.data], { type: resp.headers['content-type'] })
      onFileClick(new File([blob], flInfo.name))
    }
  })
}
async function onFileClick(file: File | null) {
  qrSize.value = page.value?.clientWidth
  tsfFile.value = file
  sha256.value = file ? await hashFileSHA256B64(file) : ''
  processing.value = false
  count.value = 0
  totalSlices.value = 0
  sliceCount.value = 0
  data.value = ''
}
</script>
