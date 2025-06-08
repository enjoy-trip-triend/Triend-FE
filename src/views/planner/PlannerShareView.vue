<template>
  <main class="share-layout">
    <div class="planner-sections">
      <div class="left-section">
        <PlanTableSection
          v-if="currentView === 'table'"
          @openUpdatePlansModal="handleUpdatePlan"
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
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { triendApi } from '@/axios'
import PlanTableSection from '@/components/planner/plan/PlanTableSection.vue'
import PlanCardSection from '@/components/planner/plan/PlanCardSection.vue'
import { useRouter } from 'vue-router'
import PlanMapSection from '@/components/planner/plan/PlanMapSection.vue'
const router = useRouter()
const route = useRoute()
const plannerId = Number(route.params.plannerId)
const plans = ref([])
const selectedPlan = ref(null)
const currentView = ref('table')
const selectedDate = ref('')
onMounted(async () => {
  try {
    const response = await triendApi({
      url: `/api/planners/${plannerId}/shared`,
      method: 'get',
    })
    plans.value = response.data
  } catch (err) {
    console.error('플랜 불러오기 실패:', err)
  }
})

const handleUpdatePlan = () => {
  alert('로그인 후 이용 가능한 기능입니다.')
  return router.push({ name: 'LoginView' })
}

const toggleView = () => {
  if (currentView.value === 'table' && (!plans.value || plans.value.length === 0)) {
    alert('플랜이 없어서 지도를 표시할 수 없습니다.')
    return
  }
  currentView.value = currentView.value === 'table' ? 'map' : 'table'
}
</script>

<style scoped>
.share-layout {
  margin-top: 60px;
  height: calc(100vh - 120px); /* 예: 헤더 60px + 푸터 60px 고려 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.share-title {
  text-align: center;
  margin-bottom: 20px;
  color: #0288d1;
}

.planner-sections {
  display: flex;
  flex: 1;
  width: 100%;
  gap: 20px;
  overflow: hidden;
}

.planner-sections > *:first-child {
  flex: 7;
}

.planner-sections > *:last-child {
  flex: 3;
}

.table-section {
  flex: 6;
  overflow-y: auto;
}

.card-section {
  flex: 4;
  overflow-y: auto;
}

.left-section {
  flex: 7;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

.right-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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
</style>
