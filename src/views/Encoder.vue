<template>
  <a-layout class="h-full">
    <a-layout-header class="bg-white">
      <a-upload
        name="file"
        :action="onFileUpload"
        :showUploadList="false"
        :customRequest="() => ''"
      >
        <a-button type="primary">
          <upload-outlined />
          上传文件夹
        </a-button>
      </a-upload>
      <a-typography-text v-if="tsfFile" class="ml-3">{{ tsfFile.name }}</a-typography-text>
    </a-layout-header>
    <a-layout class="h-full">
      <a-layout-sider :width="300" theme="light" class="p-3">
        <a-list class="h-full" item-layout="horizontal" :data-source="files">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta
                description="Ant Design, a design language for background applications, is refined by Ant UED Team"
              >
                <template #title>
                  <a href="https://www.antdv.com/">{{ item.title }}</a>
                </template>
                <template #avatar>
                  <a-avatar src="https://joeschmoe.io/api/v1/random" />
                </template>
              </a-list-item-meta>
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
import { UploadOutlined, FolderViewOutlined } from '@ant-design/icons-vue'
import { onMounted, ref } from 'vue'

const tsfFile = ref<File | null>(null)
const sha256 = ref<string>('')
const fps = 15
const sliceSize = 200
const processing = ref<boolean>(false)
const count = ref<number>(0)
const sliceCount = ref<number>(0)
const data = ref<string>('')
const files = ref<File[]>([])

onMounted(() => {
  setInterval(async () => {
    if (tsfFile.value && processing.value === false) {
      if (count.value % 50 === 0) {
        const descriptor = getDescriptor(tsfFile.value, sha256.value, sliceSize)
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
})

async function onFileUpload(file: File) {
  tsfFile.value = file
  sha256.value = await hashFileSHA256B64(file)
  return Promise.resolve()
}
</script>
