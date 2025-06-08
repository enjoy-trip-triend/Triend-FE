<template>
  <header>
    <div class="logo"><RouterLink to="/">Triend</RouterLink></div>
    <nav class="nav-menu">
      <template v-if="isLoggedIn">
        <RouterLink :to="{ name: 'PlannerView' }">내 플래너</RouterLink>
        <RouterLink :to="{ name: 'MyPageView' }">마이페이지</RouterLink>
        <span>{{ loginUser.email }}</span>
        <span @click="logout">로그아웃</span>
      </template>
      <template v-else>
        <RouterLink to="/member/login-form">로그인</RouterLink>
        <RouterLink to="/member/signup-form">회원가입</RouterLink>
      </template>
    </nav>
  </header>
</template>

<script setup>
import { useMemberStore } from '@/stores/member'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

const memberStore = useMemberStore()
// storeToRefs를 사용해야, store 내부의 Ref/Computed가 그대로 반응성을 유지합니다
const { isLoggedIn, loginUser } = storeToRefs(memberStore)

const logout = async () => {
  await memberStore.logout()
  alert('로그아웃 되었습니다.')
}
</script>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 100;
}

.logo a {
  font-size: 20px;
  font-weight: bold;
  color: #0288d1;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  gap: 20px;
}

.nav-menu a,
.nav-menu span {
  color: #0277bd;
  font-weight: 500;
  font-size: 18px;
  text-decoration: none;
}
</style>
