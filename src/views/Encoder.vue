<template>
  <a-space>
    <a-upload name="file" :action="onFileUpload" :showUploadList="false" :customRequest="() => ''">
      <a-button>
        <upload-outlined />
        点击上传
      </a-button>
    </a-upload>
    <a-typography-text v-if="tsfFile">{{ tsfFile.name }}</a-typography-text>
  </a-space>
  <a-qrcode v-if="data" :size="600" error-level="H" :value="data" />
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

const tsfFile = ref<File | null>(null)
const sha256 = ref<string>('')
const fps = 15
const sliceSize = 200
const processing = ref<boolean>(false)
const count = ref<number>(0)
const sliceCount = ref<number>(0)
const data = ref<string>('')

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
