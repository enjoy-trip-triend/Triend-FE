<template>
  <header class="admin-header">
    <div class="logo">
      <RouterLink :to="{ name: 'AdminApiStatsView' }">Triend Admin</RouterLink>
    </div>
    <nav class="admin-menu">
      <template v-if="isLoggedIn">
        <RouterLink :to="{ name: 'home' }">유저 페이지</RouterLink>
        <RouterLink
          v-if="route.name === 'AdminApiDetailsView'"
          :to="{ name: 'AdminApiStatsView' }"
        >API 통계</RouterLink>
        <RouterLink
          v-if="route.name === 'AdminApiStatsView'"
          :to="{ name: 'AdminApiDetailsView' }"
        >API 상세</RouterLink>
        <span>{{ loginUser.email }}</span>
        <span @click="logout">로그아웃</span>
      </template>
      <template v-else>
        <RouterLink to="/member/login-form">로그인</RouterLink>
      </template>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { useMemberStore } from '@/stores/member'
import { storeToRefs } from 'pinia'

const route = useRoute()
const memberStore = useMemberStore()
const { isLoggedIn, loginUser } = storeToRefs(memberStore)

const logout = async () => {
  await memberStore.logout()
  alert('로그아웃 되었습니다.')
}
</script>

<style scoped>
.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #1a237e;
  border-bottom: 1px solid #303f9f;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-sizing: border-box;
  z-index: 200;
}

.logo a {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  text-decoration: none;
}

.admin-menu {
  display: flex;
  gap: 20px;
}

.admin-menu a {
  color: #bbdefb;
  font-weight: 500;
  font-size: 16px;
  text-decoration: none;
}

.admin-menu span {
  color: #bbdefb;
  font-weight: 500;
  font-size: 16px;
  text-decoration: none;
}
</style>
