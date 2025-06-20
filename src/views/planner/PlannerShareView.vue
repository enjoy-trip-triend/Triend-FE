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
      <div class="participation-section">
        <template v-if="isLoggedIn && isEditable">
          <p>✏️ 플랜 수정이 가능합니다.</p>
        </template>

        <template v-else-if="isLoggedIn && !isEditable">
          <p>✅ 플랜에 참여하고 함께 수정해보세요!</p>
          <button @click="joinPlanner">참여하기</button>
        </template>

        <template v-else>
          <p>🔒 로그인 후 더 많은 서비스를 경험해보세요!</p>
          <button @click="goLogin">로그인 하기</button>
        </template>
      </div>
      <br>
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
        :isEditable="isEditable"
        :plans="plans"
        :selectedPlan="null"
        @selectPlan="handleSelectPlan"
        @openUpdatePlansModal="handleOpenUpdatePlansModal"
      />
      <UpdatePlanModal
        v-if="updatePlansVisible"
        :plans="plans"
        :planner="planner"
        @close="updatePlansVisible = false"
        @updatePlans="handlePlansUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { triendApi } from '@/axios'
import PlanTableSection from '@/components/planner/plan/PlanTableSection.vue'
import UpdatePlanModal from '@/components/planner/plan/UpdatePlanModal.vue'

const route = useRoute()
const router = useRouter()
const secretCode = route.params.secretCode

const password = ref('')
const planner = ref({})
const isEditable = ref(false)
const plans = ref([])
const joined = ref(false)
const errorMsg = ref('')
const updatePlansVisible = ref(false)
const isLoggedIn = computed(() => !!localStorage.getItem('accessToken'))

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
    isEditable.value = response.data.isEditable
    joined.value = true;
  } catch (err) {
    console.error('비밀번호 검증 실패', err)
    alert('비밀번호가 틀렸거나 잘못된 링크입니다.')
  }
}

const joinPlanner = async () => {
  try {
    await triendApi({
      url: `/api/planners-share/${secretCode}/join`,
      method: 'post',
    })
    alert('참여가 완료되었습니다!')
  } catch (err) {
    console.error('참여 실패', err)
    alert('참여 중 오류가 발생했습니다.')
  }
}

const goLogin = () => {
  router.push({ name: 'LoginView' })
}

const handleSelectPlan = (plan) => {
  console.log('선택된 플랜:', plan)
}

const handleOpenUpdatePlansModal = () => {
  console.log('수정 모달 열기')
  updatePlansVisible.value = true
}

const handlePlansUpdate = (updatedPlans) => {
  plans.value = updatedPlans
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

.participation-section {
  margin-top: 20px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f1f7fc;
  border: 1px solid #cce0f4;
  text-align: center;
}

.participation-section p {
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
}

.participation-section button {
  padding: 10px 20px;
  font-size: 15px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.participation-section button:hover {
  background-color: #135ba1;
}


</style>
