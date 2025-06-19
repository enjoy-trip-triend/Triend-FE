<template>
  <div class="planner-share-view">
    <h2>공유된 플래너 보기</h2>

    <div v-if="!joined" class="password-section">
      <label>비밀번호를 입력하세요</label>
      <div class="input-group">
        <input v-model="password" type="password" placeholder="비밀번호 입력" @keyup.enter="joinPlanner" />
        <button @click="verifyAndFetchPlanner">확인</button>
      </div>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>

    <div v-else class="planner-info">
      <h3>{{ planner.name }}</h3>
      <div class="planner-meta">
        <div class="meta-item">
          <span class="meta-label">지역:</span>
          <span class="meta-value">{{ planner.location }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">날짜:</span>
          <span class="meta-value">{{ planner.startDay }} ~ {{ planner.endDay }}</span>
        </div>
      </div>
      <br>
      <PlanTableSection
        :plans="plans"
        :selectedPlan="null"
        @selectPlan="handleSelectPlan"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { triendApi } from '@/axios'
import PlanTableSection from '@/components/planner/plan/PlanTableSection.vue'

const route = useRoute()
const secretCode = route.params.secretCode

const password = ref('')
const planner = ref({})
const plans = ref([])
const joined = ref(false)
const errorMsg = ref('')

const verifyAndFetchPlanner = async () => {
  try {
    // 1단계: 비밀번호 검증
    await triendApi({
      url: `/api/planners-share/${secretCode}/verify`,
      method: 'post',
      data: { password: password.value },
    })

    // 2단계: 데이터 가져오기
    const response = await triendApi({
      url: `/api/planners-share/${secretCode}`,
      method: 'get',
    })

    planner.value = response.data.planner
    plans.value = response.data.plans
    joined.value = true
    console.log("planner:" + planner.value)

    // 3단계: 로그인 사용자면 참여 등록 시도
    // if (localStorage.getItem('accessToken')) {
    //   try {
    //     await triendApi({
    //       url: `/api/planners-share/${secretCode}/join`,
    //       method: 'post',
    //     })
    //     console.log('참여 등록 완료')
    //   } catch (err) {
    //     console.warn('참여 등록 실패 (로그인 안함 or 기타)', err)
    //   }
    // }

  } catch (err) {
    console.error('비밀번호 검증 실패', err)
    alert('비밀번호가 틀렸거나 잘못된 링크입니다.')
  }
}

const handleSelectPlan = (plan) => {
  console.log('선택된 플랜:', plan)
}
</script>

<style scoped>
.planner-share-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.password-section {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(200, 200, 200, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.password-section label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.input-group {
  display: flex;
  gap: 10px;
}

.input-group input[type='password'] {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.input-group button {
  padding: 12px 20px;
  font-size: 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.input-group button:hover {
  background-color: #135ba1;
}

.error-msg {
  margin-top: 8px;
  color: red;
  font-size: 14px;
}
.planner-info {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9fbfd;
  border: 1px solid #e0e0e0;
}

.planner-info h3 {
  margin-bottom: 12px;
  color: #1976d2;
}

.planner-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 16px;
}

.meta-item {
  display: flex;
  gap: 8px;
}

.meta-label {
  font-weight: bold;
  color: #555;
}

.meta-value {
  color: #333;
}

</style>
