<template>
  <a-list item-layout="horizontal" :data-source="data">
    <template #renderItem="{ item: file }">
      <a-list-item>
        <a-list-item-meta>
          <template #title>
            <a class="text-[#1677ff]" href="#" @click="onFileClick">{{ file.name }}</a>
            &nbsp;
            <a-tag :color="file.otype === 'send' ? 'processing' : 'success'">
              {{ file.otype === 'send' ? '发送' : '接受' }}
            </a-tag>
          </template>
          <template #description>{{ file.createdAt.format('YYYY/MM/DD HH:mm:ss') }}</template>
        </a-list-item-meta>
        <template #actions>
          <a-button type="primary" ghost @click="() => onDloadClick(file)">下载</a-button>
          <a-button danger ghost>取消</a-button>
        </template>
      </a-list-item>
    </template>
  </a-list>
</template>

<script setup lang="ts">
import Filer from '@/filer'
import { reqAll } from '@lib/utils'
import { onMounted, ref } from 'vue'

const data = ref([])

onMounted(refresh)

async function refresh() {
  data.value = await reqAll('file', { copy: Filer.copy })
  console.log(data.value)
}
function onFileClick() {}
function onDloadClick(file: Filer) {
  const link = document.createElement('a')
  link.href = [
    import.meta.env.VITE_MINIO_HOST ? 'http://' + import.meta.env.VITE_MINIO_HOST : '',
    import.meta.env.VITE_MINIO_PORT ? ':' + import.meta.env.VITE_MINIO_PORT : '',
    file.path
  ].join('')
  link.download = file.name
  link.style.display = 'none'
  link.click()
  link.remove()
}
</script>
