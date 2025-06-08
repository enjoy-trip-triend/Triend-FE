<template>
  <div>
    <AppHeader v-if="!route.meta.hideLayout" />
    <RouterView />
    <AiChatbot v-if="!route.meta.hideLayout" />
    <AppFooter v-if="!route.meta.hideLayout" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
// import { RouterView } from 'vue-router'
import AiChatbot   from '@/components/chat/AiChatbot.vue'
import AppHeader   from '@/components/common/AppHeader.vue'
import AppFooter   from '@/components/common/AppFooter.vue'

const route = useRoute()

</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 전체 화면 높이 */
}
</style>

