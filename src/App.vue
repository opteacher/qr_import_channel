<template>
  <div class="h-full flex flex-col">
    <a-page-header
      :title="$router.currentRoute.value.meta.dspName"
      class="site-page-header"
      :sub-title="$router.currentRoute.value.meta.desc"
      :avatar="{ icon: createVNode(HomeOutlined) }"
    >
      <template #extra>
        <a-dropdown key="more">
          <a-button :style="{ border: 'none', padding: 0 }">
            <EllipsisOutlined :style="{ fontSize: '20px', verticalAlign: 'top' }" />
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
import { createVNode } from 'vue'
import { EllipsisOutlined, HomeOutlined } from '@ant-design/icons-vue'
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
