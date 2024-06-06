<template>
  <div class="h-full flex flex-col">
    <a-page-header
      :title="$router.currentRoute.value.meta.label"
      class="site-page-header"
      :sub-title="$router.currentRoute.value.meta.desc"
    >
      <template #extra>
        <div class="hidden space-x-2 sm:ml-6 sm:block">
          <a-button
            :type="$router.currentRoute.value.name === 'Home' ? 'primary' : 'default'"
            @click="() => $router.push('/qr_import_channel/home')"
          >
            <template #icon><HomeOutlined /></template>
            主页
          </a-button>
          <a-button
            :type="$router.currentRoute.value.name === 'Encoder' ? 'primary' : 'default'"
            @click="() => $router.push('/qr_import_channel/encoder')"
          >
            <template #icon><QrcodeOutlined /></template>
            编码器
          </a-button>
          <a-button
            :type="$router.currentRoute.value.name === 'Decoder' ? 'primary' : 'default'"
            @click="() => $router.push('/qr_import_channel/decoder')"
          >
            <template #icon><ScanOutlined /></template>
            解码器
          </a-button>
        </div>

        <a-dropdown class="sm:hidden" key="more">
          <a-button class="p-0 border-0">
            <EllipsisOutlined class="align-top text-xl" />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <router-link to="/qr_import_channel/home">主页</router-link>
              </a-menu-item>
              <a-menu-item>
                <router-link to="/qr_import_channel/encoder">编码器</router-link>
              </a-menu-item>
              <a-menu-item>
                <router-link to="/qr_import_channel/decoder">解码器</router-link>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-page-header>
    <div class="flex-1 px-10">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EllipsisOutlined, HomeOutlined, QrcodeOutlined, ScanOutlined } from '@ant-design/icons-vue'
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
