<template>
  <div class="member-card" v-if="member">
    <h2 class="title">👤 회원 정보</h2>
    <div class="info-row"><span class="label">이름</span><span>{{ member.name }}</span></div>
    <div class="info-row"><span class="label">이메일</span><span>{{ member.email }}</span></div>
    <div class="info-row"><span class="label">권한</span><span>{{ member.role }}</span></div>
    <div class="info-row"><span class="label">MBTI</span><span>{{ member.mbti }}</span></div>
    <div class="info-row"><span class="label">생년월일</span><span>{{ member.birth }}</span></div>
    <div class="info-row"><span class="label">성향</span><span>{{ member.characters?.join(', ') }}</span></div>
    <button class="edit-btn" @click="editProfile">회원 정보 수정</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { triendApi } from '@/axios'

const member = ref(null)

onMounted(async () => {
  try {
    const res = await triendApi.get('/api/member/details', {
    })
    console.log("사용자 정봊조회 res:", res);
    member.value = res.data
  } catch (e) {
    console.error('회원 정보 불러오기 실패', e)
    alert('회원 정보를 불러오지 못했습니다.')
  }
})

function editProfile() {
  alert('회원 정보 수정 로직 실행!')
}
</script>

<style scoped>
.member-card {
  max-width: 500px;
  margin: 40px auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 30px 25px;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.title {
  font-size: 24px;
  color: #0077b6;
  text-align: center;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  font-size: 16px;
}

.label {
  font-weight: 600;
  color: #555;
}

.edit-btn {
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  background-color: #0077b6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.edit-btn:hover {
  background-color: #005f8e;
}
</style>
