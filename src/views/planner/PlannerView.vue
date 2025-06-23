<template>
  <div class="planner-view">
    <!-- 📘 내 플래너 사이드바 -->
    <SideBar class="sidebar">
      <h2>📘 내 플래너</h2>
      <ul class="planner-list">
        <li v-for="planner in planners" :key="planner.id" @click="fetchPlans(planner)">
          <div class="planner-header">
            <span class="planner-name">{{ planner.name }}</span>
            <img
              class="kakao-icon"
              src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
              alt="카카오톡 공유"
              @click.stop="sharePlanner(planner)"
            />
          </div>
          <div class="button-container">
            <button class="edit-button" @click.stop="showPlannerEditModal(planner)">수정</button>
            <button class="delete-button" @click.stop="handlePlannerDelete(planner)">삭제</button>
          </div>
        </li>
      </ul>
    </SideBar>

    <!-- 메인 컨텐츠 -->
    <main class="main-layout">
      <div v-if="!currentPlanner?.id" class="empty-state">
        <div class="empty-content">
          <img src="@/assets/img/planner_select_hint.png" alt="플래너 선택" class="hint-image" />
          <p class="hint-text">왼쪽 사이드바에서 플래너를 선택해주세요 😊</p>
        </div>
      </div>
      <template v-else>
        <!-- 플래너 수정 모델 -->
        <UpdatePlannerModal
          v-if="updatePlannerVisible"
          @updatePlanner="handlePlannerUpdate"
          @close="updatePlannerVisible = false"
          :planner="currentPlanner"
        />

        <!-- 플래 수정 모델 -->
        <UpdatePlanModal
          v-if="updatePlansVisible"
          :plans="plans"
          :planner="currentPlanner"
          @close="updatePlansVisible = false"
          @updatePlans="handlePlansUpdate"
        />
        <!-- 메인 컨텐츠 분할 (6:4 비율) -->
        <div class="planner-sections">
          <div class="left-section">
            <PlanTableSection
              v-if="currentView === 'table'"
              @openUpdatePlansModal="showPlanUpdateModal"
              :plans="plans"
              :selectedPlan="selectedPlan"
              @selectPlan="selectedPlan = $event"
            />
            <PlanMapSection
              v-if="currentView === 'map' && plans && plans.length > 0"
              :plans="plans"
              :selectedPlan="selectedPlan"
              @selectPlan="selectedPlan = $event"
              v-model:selectedDate="selectedDate"
            />
            <button class="circle-toggle-btn" @click="toggleView">
              <span v-if="currentView === 'table'">🗺</span>
              <span v-else>📋</span>
            </button>
          </div>
          <div class="right-section">
            <PlanCardSection
              :plans="plans"
              :selectedPlan="selectedPlan"
              @selectPlan="selectedPlan = $event"
              v-model:selectedDate="selectedDate"
            />
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import PlanCardSection from '@/components/planner/plan/PlanCardSection.vue'
import PlanTableSection from '@/components/planner/plan/PlanTableSection.vue'
import { triendApi } from '@/axios/index.js'
import UpdatePlannerModal from '@/components/planner/UpdatePlannerModal.vue'
import { useMemberStore } from '@/stores/member.js'
import { useRouter } from 'vue-router'
import UpdatePlanModal from '@/components/planner/plan/UpdatePlanModal.vue'
import PlanMapSection from '@/components/planner/plan/PlanMapSection.vue'
const router = useRouter()
const planners = ref([])
const plans = ref([])
const memberStore = useMemberStore()
const currentPlanner = ref([])
const currentView = ref('table')
const updatePlannerVisible = ref(false)
const updatePlansVisible = ref(false)
const selectedPlan = ref(null)
const selectedDate = ref('')

const toggleView = () => {
  if (currentView.value === 'table' && (!plans.value || plans.value.length === 0)) {
    alert('플랜이 없어서 지도를 표시할 수 없습니다.')
    return
  }
  currentView.value = currentView.value === 'table' ? 'map' : 'table'
}

onMounted(() => {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY)
  }
  fetchPlanners()
})

const fetchPlanners = async () => {
  if (!memberStore.isLoggedIn) {
    alert('로그인 후 이용 가능한 기능입니다.')
    router.push({ name: 'LoginView' })
    return
  }
  try {
    const response = await triendApi({ url: '/api/planners', method: 'get' })
    planners.value = response.data
  } catch (err) {
    console.error('플래너 불러오기 실패:', err)
  }
}

const fetchPlans = async (planner) => {
  currentPlanner.value = null
  plans.value = []
  await nextTick()
  currentPlanner.value = planner

  try {
    const response = await triendApi({
      url: `/api/planners/${planner.id}/plans`,
      method: 'get',
    })
    plans.value = response.data
  } catch (err) {
    console.error('플랜 불러오기 실패:', err)
  }
}

const showPlannerEditModal = (planner) => {
  currentPlanner.value = planner
  updatePlannerVisible.value = true
}

const handlePlannerUpdate = async (formData) => {
  try {
    await triendApi({ url: `/api/planners/${formData.id}`, method: 'put', data: formData })
    updatePlannerVisible.value = false
    Object.assign(currentPlanner.value, formData)
  } catch (err) {
    console.error('플래너 수정하기 실패:', err)
  }
}

const showPlanUpdateModal = () => {
  updatePlansVisible.value = true
}

const handlePlannerDelete = async (planner) => {
  const confirmDelete = window.confirm(`'${planner.name}' 플래너를 정말 삭제하시겠습니까?`)
  if (!confirmDelete) return
  try {
    await triendApi({ url: `/api/planners/${planner.id}`, method: 'delete' })
    const index = planners.value.indexOf(planner)
    if (index !== -1) planners.value.splice(index, 1)
  } catch (err) {
    console.log(`플래너 삭제 실패`, err)
  }
}

const handlePlansUpdate = (updatedPlans) => {
  plans.value = updatedPlans
}

const sharePlanner = async (planner) => {
  if (!window.Kakao) {
    alert('Kakao SDK가 로드되지 않았습니다.')
    return
  }

  const password = prompt('공유 비밀번호를 입력하세요 (최소 4자리 이상)')

  if (!password || password.length < 4) {
    alert('비밀번호는 최소 4자리 이상 입력해야 합니다.')
    return
  }

  try{
    const response = await triendApi({
      url: `/api/planners/${planner.id}/share`,
      method: 'post',
      data:{
        password: password
      },
    })
    const secretCode = response.data.secretCode
    const shareUrl = `${window.location.origin}/planners/${planner.id}/share/${secretCode}`

    window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `📘 ${planner.name} 공유 (비밀번호: ${password})`,
      description: [
        `지역: ${planner.location}`,
        `날짜: ${planner.startDay} ~ ${planner.endDay}`,
      ].join('\n'),
      imageUrl:
        'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png',
      link: { webUrl: shareUrl },
    },
    buttons: [{ title: '세부 일정 확인하기', link: { webUrl: shareUrl } }],
  })
  }catch(err){
    console.error('공유 링크 생성 실패', err)
    alert('공유 링크 생성에 실패했습니다.')
  }
}
</script>

<style scoped>
.left-section,
.right-section {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
}
.left-section {
  flex: 7;
  position: relative; /* 버튼 기준점 여기로 변경 */
  flex-direction: column;
  overflow: hidden;
}

.circle-toggle-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #0288d1;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition:
    background-color 0.2s,
    transform 0.2s;
}

.circle-toggle-btn:hover {
  background-color: #015f9b;
  transform: scale(1.1);
}

/* 기본 스타일 */
.planner-view {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f5f9fc;
  color: #333;
  padding-top: 60px;
  padding-bottom: 60px;
  display: flex;
  height: 100vh;
  box-sizing: border-box;
}

/* 왼쪽 사이드바 */
.sidebar {
  width: 220px;
  background-color: #e1f5fe;
  padding: 20px;
  border-right: 2px solid #81d4fa;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.sidebar h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #0288d1;
}

.sidebar .planner-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0; /* flex item 스크롤 위해 필수 */
}

.sidebar .planner-list li {
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin-bottom: 8px;
  background-color: #ffffff;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid #81d4fa;
  transition: background-color 0.2s;
  align-items: center;
}

.sidebar .planner-list li:hover {
  background-color: #e9edef;
}

/* 플래너 이름은 한 줄로 표시 */
.sidebar .planner-list li span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  font-weight: bold;
}

/* 버튼을 감싸는 컨테이너 */
.button-container {
  display: flex;
  width: 100%;
  margin-top: 10px;
}

.button-container button {
  flex: 1;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  background: transparent;
  color: black;
  cursor: pointer;
  transition:
    background-color 0.3s,
    color 0.3s;
}

/* 수정 버튼과 삭제 버튼 구분 */
.button-container .edit-button {
  border-right: 1px solid #ddd;
}

.button-container button:hover {
  background-color: #f1f1f1;
}

.button-container .edit-button:hover {
  background-color: #4fc3f7;
  color: white;
}

.button-container .delete-button:hover {
  background-color: #f44336;
  color: white;
}

/* 레이아웃 전체 영역 (헤더, 사이드바 포함) */
.main-layout {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
  height: calc(100vh - 120px);
  box-sizing: border-box;
}

.create-button {
  width: 100%;
  padding: 10px;
  background-color: #4fc3f7;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}
/* 표 형식 플랜 영역 */
.plan-table {
  flex: 1;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.plan-table h3 {
  margin-bottom: 15px;
  color: #0288d1;
}

.plan-table table {
  width: 100%;
  border-collapse: collapse;
}

.plan-table th,
.plan-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.plan-table th {
  background-color: #e1f5fe;
}

/* 카드 뉴스 형식 플랜 영역 */
.plan-cards {
  flex: 1;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.plan-cards h3 {
  margin-bottom: 15px;
  color: #0288d1;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card {
  border: 1px solid #81d4fa;
  border-radius: 8px;
  padding: 15px;
  background-color: #f0fbff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.card:hover {
  transform: scale(1.02);
}

.card h4 {
  margin: 0 0 5px 0;
  color: #0277bd;
}

/* 플랜 표/카드 내용은 자체적으로 스크롤 */
.plan-table,
.plan-cards {
  flex: 1;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 100%;
}

.edit-btn {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn:hover {
  background-color: #135ba1;
}

.modal-plan-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.modal-plan-table th,
.modal-plan-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
  font-size: 14px;
}

.modal-plan-table input,
.modal-plan-table textarea {
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
  padding: 4px;
}

textarea {
  resize: vertical;
}

.search-panel {
  width: 180px;
  background-color: #e1f5fe;
  padding: 20px;
  border-right: 1px solid #81d4fa;
  height: 100%;
  overflow-y: auto;
}

.search-panel h2 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #0277bd;
}

.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  border: 1px solid #81d4fa;
  border-radius: 5px;
  box-sizing: border-box; /* ✅ 해결 핵심 */
}

.search-button {
  width: 100%;
  padding: 10px;
  background-color: #4fc3f7; /* 💙 선명한 하늘색 버튼 */
  border: none;
  color: white;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
}

.search-results {
  margin-top: 20px;
  font-size: 14px;
  color: #555;
}

.content-wrapper {
  width: 80vw;
  height: 80vh;
  background: white;
  display: flex;
  position: relative; /* 기준점 잡아줌 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.modal-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  z-index: 1000;
  color: #666;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #000;
}

/* 카카오 버튼 */
.kakao-share-button {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background-color: #fee500;
  color: #000;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.kakao-share-button:hover {
  background-color: #ffd900;
}

.planner-header {
  display: flex;
  justify-content: space-between; /* 좌우 끝 정렬 */
  align-items: center;
  width: 100%;
  gap: 8px; /* 아이템 간 간격 */
}

.planner-name {
  font-weight: bold;
  font-size: 15px;
  flex: 1; /* 아이콘 밀어냄 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.kakao-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.kakao-icon:hover {
  transform: scale(1.1);
}

.planner-sections {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 20px;
}

.planner-sections > *:first-child {
  flex: 7;
}

.planner-sections > *:last-child {
  flex: 3;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f6fa;
  border-radius: 12px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

.empty-content {
  text-align: center;
  color: #607d8b;
  padding: 30px;
}

.hint-image {
  width: 400px;
  opacity: 0.8;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.hint-text {
  font-size: 18px;
  font-weight: 500;
}
</style>
