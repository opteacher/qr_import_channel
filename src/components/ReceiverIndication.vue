<template>
  <a-descriptions v-if="state.descriptor" class="mb-5" bordered size="small" :column="1">
    <a-descriptions-item label="文件名">{{ state.descriptor.name }}</a-descriptions-item>
    <a-descriptions-item label="哈希值">
      {{ state.descriptor.sha256.slice(0, 5) }}...{{ state.descriptor.sha256.slice(-5) }}
    </a-descriptions-item>
    <a-descriptions-item label="传输速率">
      {{ rawDataRateInBitsPerSeconds / 8 }} B/s (raw)
    </a-descriptions-item>
    <a-descriptions-item label="大小">
      {{ state.descriptor.totalByteSize }} Bytes
    </a-descriptions-item>
    <a-descriptions-item label="进度">
      {{ (determinedPercentage * 100).toFixed(1) }} %
      <a-button
        v-if="determinedPercentage >= 1"
        class="ml-2"
        size="small"
        type="primary"
        @click="onDownloadClick"
      >
        下载
      </a-button>
    </a-descriptions-item>
    <a-descriptions-item label="最后一帧">
      {{ receivedAgo && receivedAgo < 600 ? receivedAgo + ' 秒' : '无' }}
    </a-descriptions-item>
  </a-descriptions>
</template>

<script setup lang="ts">
import { PropType, computed, onMounted, ref, watch } from 'vue'
import { assemblePayload, determinedPercentage as calculateDeterminedPercentage } from '@/FileUtils'
import { calculateBitsPerSecond, sliceReducerState } from '@/Decorder'

const props = defineProps({
  state: { type: Object as PropType<sliceReducerState>, required: true },
  stop: { type: Function, default: () => undefined }
})
const receivedAgo = ref<number>(0)
const rawDataRateInBitsPerSeconds = computed(() =>
  calculateBitsPerSecond(props.state.rawDataRateBuffer)
)
const determinedPercentage = computed(() => calculateDeterminedPercentage(props.state.store))

onMounted(() => {
  receivedAgo.value = props.state.lastSliceReceivedOn
    ? (Date.now() - props.state.lastSliceReceivedOn) / 1000
    : -1
})
watch(
  () => determinedPercentage,
  () => {
    console.log(determinedPercentage.value)
  },
  { deep: true }
)

function getPayload(): Blob | null {
  return props.state.descriptor ? assemblePayload(props.state.store, props.state.descriptor) : null
}
function onDownloadClick() {
  const blob = getPayload()
  if (blob === null) {
    console.error('Blob is null')
    return
  }
  if (!props.state.descriptor) {
    console.error('Descriptor is null')
    return
  }

  const a = window.document.createElement('a')

  a.href = window.URL.createObjectURL(blob)
  a.download = props.state.descriptor.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>
