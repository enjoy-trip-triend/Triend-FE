<template>
  <div class="planner-detail-toggle">
    <button class="toggle-open" @click="isOpen = true" v-if="!isOpen">⮟ My Planner</button>

    <div v-if="isOpen" class="planner-detail-modal">
      <div class="modal-header">
        <h3>🗓️ 플래너 상세 보기</h3>
        <button @click="isOpen = false">❌</button>
      </div>

      <div class="planner-select">
        <label>📋 플래너 선택</label>
        <select v-model="selectedPlannerId" @change="fetchPlans">
          <option disabled value="">플래너를 선택하세요</option>
          <option v-for="planner in planners" :key="planner.id" :value="planner.id">
            {{ planner.name }} ({{ planner.startDay }} ~ {{ planner.endDay }})
          </option>
        </select>
      </div>

      <div v-if="selectedPlannerId != '' && planPages.length > 0" class="plans-section">
        <div class="pagination">
          <button @click="prevPage" :disabled="page === 0">⏪ 이전</button>
          <span>
            {{ dateList[page] || '날짜 없음' }} ({{ page + 1 }} / {{ planPages.length }})
          </span>
          <button @click="nextPage" :disabled="page === planPages.length - 1">다음 ⏩</button>
        </div>

        <div class="scroll-wrapper">
          <ul class="plan-list">
            <li
              v-for="plan in sortedPlansByDate[dateList[page]]"
              :key="plan.id"
              class="plan-item"
              @click="handlePlanClick(plan)"
              :class="{ clickable: plan.placeUrl }"
            >
              <div>
                <div class="time-badge">{{ formatTime(plan.startTime) }}</div>
                <div class="time-badge">{{ formatTime(plan.endTime) }}</div>
              </div>
              <div class="plan-content">
                <p>
                  <strong>{{ plan.placeName }}</strong>
                </p>
                <p class="address">📍 {{ plan.address }}</p>
                <p class="note">📝 {{ plan.content }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { triendApi } from '@/axios'

const props = defineProps({
  planners: Array,
  currentPlanner: Object,
  currentPlans: Array,
})

const selectedPlannerId = ref('')
const internalPlans = ref(props.currentPlans || [])
const page = ref(0)
const isOpen = ref(true)

watch(
  () => props.currentPlanner?.id,
  (newId) => {
    if (newId && selectedPlannerId.value !== newId) {
      selectedPlannerId.value = newId
      internalPlans.value = props.currentPlans || []
      page.value = 0
    }
  },
  { immediate: true },
)

watch(
  () => props.currentPlans,
  (newPlans) => {
    if (Array.isArray(newPlans)) {
      internalPlans.value = newPlans
    }
  },
  { immediate: true },
)

const groupedPlans = computed(() => {
  const map = {}
  for (const plan of internalPlans.value) {
    if (!map[plan.date]) map[plan.date] = []
    map[plan.date].push(plan)
  }
  return map
})

const dateList = computed(() => Object.keys(groupedPlans.value).sort())

const sortedPlansByDate = computed(() => {
  const sorted = {}
  for (const date of dateList.value) {
    sorted[date] = [...groupedPlans.value[date]].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    )
  }
  return sorted
})

const planPages = computed(() => dateList.value)

const fetchPlans = async () => {
  if (!selectedPlannerId.value) return
  try {
    const { data } = await triendApi.get(`/api/planners/${selectedPlannerId.value}/plans`)
    internalPlans.value = data
    page.value = 0
  } catch (err) {
    console.error('플랜 불러오기 실패:', err)
    alert('플랜 데이터를 불러오지 못했습니다.')
  }
}

const prevPage = () => {
  if (page.value > 0) page.value--
}

const nextPage = () => {
  if (page.value < planPages.value.length - 1) page.value++
}

const formatTime = (isoString) => {
  const date = new Date(`1970-01-01T${isoString}`) // 시:분:초만 추출
  return date.toTimeString().slice(0, 5) // 'HH:mm'
}

const handlePlanClick = (plan) => {
  if (plan.placeUrl) {
    window.open(plan.placeUrl, '_blank')
  }
}
</script>

<style scoped>
.planner-detail-toggle {
  position: absolute;
  top: 70px;
  right: 10px;
  z-index: 1000;
}

.toggle-open {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 8px;
  font-weight: bold;
}

.planner-detail-modal {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 400px;
  max-height: 80vh;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.planner-select {
  margin-bottom: 16px;
}

select {
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.plans-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scroll-wrapper {
  flex: 1;
  overflow-y: auto;
}

.plan-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-item {
  display: flex;
  gap: 12px;
  background: #f7fafd;
  border: 1px solid #e0f0ff;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  align-items: flex-start;
}

.time-badge {
  min-width: 50px;
  font-size: 14px;
  font-weight: bold;
  color: #1976d2;
  background-color: #e3f2fd;
  padding: 6px;
  border-radius: 4px;
  text-align: center;
}

.plan-content {
  flex: 1;
}

.address {
  font-size: 13px;
  color: #666;
  margin: 2px 0;
}

.note {
  font-size: 13px;
  color: #333;
  margin: 0;
}

.plan-item.clickable {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.plan-item.clickable:hover {
  background-color: #e0f7fa;
}
</style>
