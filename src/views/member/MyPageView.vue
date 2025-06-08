<template>
  <div class="mypage-layout">
    <!-- 사이드바 -->
    <SideBar width="250px">
      <nav class="menu-list">
        <div
          v-for="item in menuItems"
          :key="item.key"
          :class="['menu-item', { active: selected === item.key }]"
          @click="selected = item.key"
        >
          {{ item.label }}
        </div>
      </nav>
    </SideBar>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <MemberInfo v-if="selected === 'member'" />
      <MyPlaceList v-else-if="selected === 'places'" />
      <FaqList v-else-if="selected === 'faq'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import MemberInfo from '@/components/member/mypage/MemberInfo.vue'
import MyPlaceList from '@/components/myplace/MyPlaceList.vue'
import FaqList from '@/components/member/mypage/FaqList.vue'

const menuItems = [
  { key: 'member', label: '👤 회원 정보' },
  { key: 'places', label: '📍 나만의 장소' },
  { key: 'faq',    label: '❓ FAQ' },
]

const selected = ref('member')
</script>

<style scoped>
.mypage-layout {
  display: flex;
  height: 100vh;
}

.menu-list {
  padding-top: 80px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  color: #0277bd;
  font-weight: 500;
}
.menu-item:hover {
  background-color: #b3e5fc;
}
.menu-item.active {
  background-color: #4fc3f7;
  color: white;
}

.main-content {
  flex: 1;
  padding: 24px;
  padding-top: 60px;
  overflow-y: auto;
  background-color: #f9f9f9;
}
</style>
