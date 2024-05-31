<template>
  <a-layout class="h-full">
    <a-layout-header class="bg-white">
      <!-- <a-upload
        name="file"
        :action="onFileUpload"
        :showUploadList="false"
        :customRequest="() => ''"
      >
        <a-button type="primary">
          <template #icon><upload-outlined /></template>
          上传文件夹
        </a-button>
      </a-upload> -->
      <a-space>
        <a-button type="primary">
          <template #icon><UploadOutlined /></template>
          上传文件
        </a-button>
      </a-space>
      <a-space v-if="tsfFile" class="ml-5">
        <!-- <a-typography-title :level="4">{{ tsfFile.name }}</a-typography-title> -->
        <a-typography-text strong>{{ tsfFile.name }}</a-typography-text>
        <a-progress
          class="w-96"
          :percent="(sliceCount / (totalSlices || 1)) * 100"
          :format="() => `${sliceCount} / ${totalSlices}`"
        />
      </a-space>
    </a-layout-header>
    <a-layout class="h-full">
      <a-layout-sider :width="400" theme="light" class="relative">
        <a-list
          class="h-full absolute top-0 bottom-0 left-0 right-0 overflow-auto"
          item-layout="horizontal"
          :data-source="files"
        >
          <template #renderItem="{ item: file }">
            <a-list-item
              class="hover:bg-gray-300 hover:cursor-pointer"
              @click="() => onFileClick(file)"
            >
              <a-space>
                <a-tag :color="file.kind === 'file' ? 'orange' : 'cyan'">{{ file.kind }}</a-tag>
                <a-typography-text
                  :class="{
                    'text-primary font-bold':
                      file.kind === 'file' && tsfFile && tsfFile.name === file.name
                  }"
                >
                  {{ file.name }}
                </a-typography-text>
                <a-typography-text type="secondary">
                  {{ file.kind === 'file' ? `共${file.fileSize}字节` : `含${file.fileNum}个文件` }}
                </a-typography-text>
              </a-space>
            </a-list-item>
          </template>
        </a-list>
      </a-layout-sider>
      <a-layout-content>
        <a-qrcode v-if="data" :size="500" error-level="H" :value="data" />
      </a-layout-content>
    </a-layout>
  </a-layout>
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
import { UploadOutlined } from '@ant-design/icons-vue'
import { onMounted, ref } from 'vue'
import mqtt from 'mqtt'

const tsfFile = ref<File | null>(null)
const sha256 = ref<string>('')
const fps = 15
const sliceSize = 200
const processing = ref<boolean>(false)
const count = ref<number>(0)
const totalSlices = ref<number>(0)
const sliceCount = ref<number>(0)
const data = ref<string>('')
const files = ref<(FileSystemHandle & { fileNum?: number; fileSize?: number })[]>([])

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
    client.subscribe('upload_file', err => (err ? console.error(err) : undefined))
  })
  client.on('error', e => console.error(JSON.stringify(e)))
  client.on('message', (topic: string, message: Buffer) => {
    if (topic === 'upload_file') {
      onFileClick(new File([message], 'test.jpg'))
    }
  })
}
async function onFileClick(file: File) {
  tsfFile.value = file
  sha256.value = await hashFileSHA256B64(tsfFile.value)
  processing.value = false
  count.value = 0
  totalSlices.value = 0
  sliceCount.value = 0
  data.value = ''
}
</script>
