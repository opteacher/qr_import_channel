<template>
  <a-layout class="h-full flex flex-col">
    <a-layout-header>
      <div class="logo" />
      <a-menu
        v-model:selectedKeys="current"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item key="Home">
          <router-link to="/qr_import_channel/home">主页</router-link>
        </a-menu-item>
        <a-menu-item key="Encoder">
          <router-link to="/qr_import_channel/encoder">编码器</router-link>
        </a-menu-item>
        <a-menu-item key="Decoder">
          <router-link to="/qr_import_channel/decoder">解码器</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content class="flex-1 px-12 py-3">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router';

const current = ref<string[]>(['Home'])
const router = useRouter()

watch(
  () => current.value,
  () => {
    router.push(current.value[0].toLowerCase())
  }
)
watch(() => router.currentRoute.value.name, (rName: any) => {
  if (current.value[0] !== rName) {
    current.value = [rName]
  }
})
</script>

<style scoped>
body {
  overflow-y: hidden;
}

#app {
  height: 100%;
  color: #2c3e50;
}

.logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}
</style>
