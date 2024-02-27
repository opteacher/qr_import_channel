<template>
  <a-typography-paragraph v-if="!supported">
    所用浏览器不支持调用摄像头，无法进行解码操作，请更换其他设备尝试！
  </a-typography-paragraph>
  <template v-else>
    <a-form
      :labelCol="{ style: { width: '150px' } }"
      :wrapperCol="{ span: 14 }"
      layout="horizontal"
    >
      <a-form-item label="选择设备">
        <a-select :options="mdaDevs" v-model:value="selMdaDev" />
      </a-form-item>
      <a-form-item>
        <a-button :danger="!vdoReceiver?.paused" @click="onPlayClick">
          {{ vdoReceiver?.paused ? '开始' : '停止' }}录摄
        </a-button>
      </a-form-item>
    </a-form>
    <ReceiverIndication :state="recvState" :stop="stop" />
    <div>
      <div v-if="recvState.descriptor" class="progressbar">
        <div
          v-for="slice in totalSlicesArray"
          :key="slice"
          :class="determinedSlices.includes(slice) ? 'slice available' : 'slice missing'"
        />
      </div>
    </div>
    <video id="vdoReceiver" class="w-full" autoplay />
  </template>
</template>

<script setup lang="ts">
import { useDecoder, sliceReducerState } from '@/Decorder'
import useQrCode from '@/QrCode'
import { waitFor } from '@lib/utils'
import { SelectProps } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import ReceiverIndication from '@/components/ReceiverIndication.vue'
import { determinedSliceIndices } from '@/FileUtils'

const supported = ref<boolean>(false)
const vdoReceiver = ref<HTMLVideoElement | null>(null)
const mdaDevs = ref<SelectProps['options']>([])
const selMdaDev = ref<string>('')
const recvState = ref<sliceReducerState>({
  store: [],
  descriptor: undefined,
  rawDataRateBuffer: [],
  dataRateBuffer: [],
  lastSliceReceivedOn: 0,
  lastIdentifiersAdded: [],
  addDataCount: 0
})
const stop = ref<() => void>()
const totalSlicesArray = computed(() =>
  recvState.value.descriptor ? Array.from(Array(recvState.value.descriptor.totalSlices).keys()) : []
)
const determinedSlices = computed(() => determinedSliceIndices(recvState.value.store))

onMounted(async () => {
  supported.value = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  if (supported.value) {
    const mds = await navigator.mediaDevices.enumerateDevices()
    mdaDevs.value = mds
      .filter(md => md.kind === 'videoinput')
      .map(md => ({ label: md.label, value: md.deviceId }))
    if (!mdaDevs.value.length) {
      console.error('没有找到摄像设备！')
      return
    }
    selMdaDev.value = mdaDevs.value[0].value as string

    vdoReceiver.value = (await waitFor('vdoReceiver')) as HTMLVideoElement
    const pageSize = await waitFor('app').then(ele => ele?.getBoundingClientRect())
    const { callbackFunction } = useDecoder(recvState)
    stop.value = await useQrCode(
      {
        width: pageSize?.width,
        height: pageSize?.width,
        facingMode: { exact: 'environment' },
        deviceId: selMdaDev.value
      },
      vdoReceiver,
      callbackFunction
    )
  }
})

function onPlayClick() {
  if (vdoReceiver.value) {
    if (vdoReceiver.value?.paused) {
      vdoReceiver.value.play()
    } else {
      vdoReceiver.value.pause()
    }
  }
}
</script>

<style>
.progressbar {
  display: flex;
  margin-top: 1rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  margin-bottom: 1rem;
}

.progressbar .slice {
  width: 8px;
  height: 1rem;
  border-color: gray;
  border-width: 1px;
}

.progressbar .available {
  background-color: #52c41a;
}

.progressbar .missing {
  background-color: #ff4d4f;
}
</style>
