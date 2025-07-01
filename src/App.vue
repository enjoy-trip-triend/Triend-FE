<template>
  <div>
    <AdminHeader v-if="isAdminRoute" />
    <AppHeader v-else-if="!route.meta.hideLayout" />

    <RouterView />

    <AiChatbot v-if="!isAdminRoute && !route.meta.hideLayout" />
    <AppFooter v-if="!isAdminRoute && !route.meta.hideLayout" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AiChatbot from '@/components/chat/AiChatbot.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 전체 화면 높이 */
}
</style>
