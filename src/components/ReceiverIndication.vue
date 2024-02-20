<template>
  <a-descriptions v-if="descriptor" class="mb-5" bordered size="small" :column="1">
    <a-descriptions-item label="文件名">{{ descriptor.name }}</a-descriptions-item>
    <a-descriptions-item label="哈希值">
      {{ descriptor.sha256.slice(0, 5) }}...{{ descriptor.sha256.slice(-5) }}
    </a-descriptions-item>
    <a-descriptions-item label="传输速率">
      {{ rawDataRateInBitsPerSeconds / 8 }} B/s (raw)
    </a-descriptions-item>
    <a-descriptions-item label="大小">{{ descriptor.totalByteSize }} Bytes</a-descriptions-item>
    <a-descriptions-item label="进度">
      {{ (determinedPercentage * 100).toFixed(1) }} %
      <a-button v-if="determinedPercentage >= 1" class="ml-2" size="small" type="primary">下载</a-button>
    </a-descriptions-item>
    <a-descriptions-item label="最后一帧">
      {{ receivedAgo && receivedAgo < 600 ? receivedAgo + ' 秒' : '无' }}
    </a-descriptions-item>
  </a-descriptions>
</template>

<script setup lang="ts">
import { PropType, onMounted, ref } from 'vue'
import { Descriptor } from '../FileUtils'

const props = defineProps({
  descriptor: { type: Object as PropType<Descriptor> },
  rawDataRateInBitsPerSeconds: { type: Number, required: true },
  determinedPercentage: { type: Number, required: true },
  lastSliceReceivedOn: { type: Number, required: true },
  getPayload: { type: Function, default: (): Blob | null => null },
  stop: { type: Function, default: () => undefined }
})
const receivedAgo = ref<number>(0)

onMounted(() => {
  receivedAgo.value = props.lastSliceReceivedOn
    ? (Date.now() - props.lastSliceReceivedOn) / 1000
    : -1
})
</script>
