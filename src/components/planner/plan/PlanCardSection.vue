<template>
  <section class="plan-cards">
    <div class="img-title">
      <h3>🗺️ 이미지 뷰</h3>
    </div>
    <div class="card-container">
      <!-- 📅 페이지네이션 -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 0">⏪</button>
        <span class="pagination-date">{{ currentPage + 1 }}일차({{ currentDate }} )</span>
        <button @click="nextPage" :disabled="currentPage >= uniqueDates.length - 1">⏩</button>
      </div>
      <div
        v-for="plan in paginatedPlans"
        :key="plan.id"
        :id="`card-${plan.id}`"
        class="plan-card"
        @click="$emit('selectPlan', plan)"
        :class="{ selected: plan.id === selectedPlan?.id }"
      >
        <div class="plan-title">
          <a v-if="plan.placeUrl" class="place-url" :href="plan.placeUrl" target="_blank">
            <span class="card-title">{{ plan.placeName }}</span>
          </a>
          <span v-else class="card-title">{{ plan.placeName }}</span>

          <span class="card-time">
            🕒 {{ formatTime(plan.startTime) }} ~ {{ formatTime(plan.endTime) }}</span
          >
        </div>

        <div class="plan-item">
          <!-- 🔷 캐러셀 방식 -->
          <v-carousel class="custom-carousel" show-arrows="hover">
            <v-carousel-item
              v-for="(url, i) in imageMap[plan.id] || []"
              :key="i"
              :src="url"
              cover
            />
            <v-carousel-item v-if="!imageMap[plan.id]?.length">
              <div style="text-align: center; padding: 60px">이미지를 추가해주세요.</div>
            </v-carousel-item>
          </v-carousel>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { watch, computed, ref, nextTick } from 'vue'
import { triendApi } from '@/axios/index.js'
import qs from 'qs'

// ✅ 부모 컴포넌트에서 받아오는 데이터
const props = defineProps({
  plans: Array,
  selectedPlan: Object,
  selectedDate: String, // ✅ 상위에서 받은 날짜
})

const emit = defineEmits(['updateDate', 'selectPlan', 'update:selectedDate'])
const currentPage = ref(0)
const imageMap = ref({})

const currentDate = computed(() => uniqueDates.value[currentPage.value])
const paginatedPlans = computed(() => {
  return props.plans.filter((p) => p.date === currentDate.value)
})
const uniqueDates = computed(() => {
  const dateSet = new Set(props.plans.map((p) => p.date))
  return [...dateSet].sort()
})

watch(
  () => props.selectedDate,
  (newDate) => {
    const index = uniqueDates.value.findIndex((d) => d === newDate)
    if (index !== -1) {
      currentPage.value = index
    }
  },
  { immediate: true },
)

watch(currentPage, (newPage) => {
  const newDate = uniqueDates.value[newPage]
  emit('updateDate', newDate)
  emit('update:selectedDate', newDate) // ✅ 변경
})

const loadImages = async (plans) => {
  const idsToFetch = plans.filter((plan) => !imageMap.value[plan.id]).map((plan) => plan.id)

  if (idsToFetch.length === 0) return

  try {
    const response = await triendApi.get('/api/plans/images', {
      params: { planIds: idsToFetch },
      paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    })
    const imageData = response.data // { 1: [...], 2: [...] }
    console.log('조회된 이미지 데이터: ', imageData)
    for (const [planId, urls] of Object.entries(imageData)) {
      imageMap.value[planId] = urls
    }
  } catch (e) {
    console.error('이미지 로딩 실패', e)
  }
}

watch(
  paginatedPlans,
  (newPlans) => {
    if (newPlans.length > 0) {
      loadImages(newPlans)
    }
  },
  { immediate: true },
)


watch(
  () => props.selectedPlan,
  async (plan) => {
    if (!plan) return
    const index = uniqueDates.value.findIndex((d) => d === plan.date)
    if (index !== -1) {
      currentPage.value = index
      await nextTick()
      const el = document.getElementById(`card-${plan.id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  },
)

const nextPage = () => {
  if (currentPage.value < uniqueDates.value.length - 1) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 0) currentPage.value--
}

const formatTime = (isoString) => {
  const date = new Date(`1970-01-01T${isoString}`) // 시:분:초만 추출
  return date.toTimeString().slice(0, 5) // 'HH:mm'
}
</script>

<style scoped>
.title {
  margin-bottom: 15px;
}
.card-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.plan-card {
  border: 2px solid #81d4fa;
  border-radius: 10px;
  background-color: #e0f7fa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 18px;
  transition: transform 0.2s ease-in-out;
  text-align: center;
  width: 80%;
}

.plan-card:hover {
  transform: translateY(-3px);
}

.plan-title {
  margin-bottom: 12px;
  color: #000000;
  border-bottom: 1px dashed #4fc3f7;
  padding-bottom: 5px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
}
.plan-item p {
  margin: 6px 0;
  font-size: 16px;
  color: #333;
  line-height: 1.4;
}

.plan-item strong {
  color: #0277bd;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pagination button {
  font-size: 20px;
}

.pagination button:disabled {
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background-color: #d9e1e6;
}

.pagination-date {
  font-size: 20px;
  align-self: center;
  font-weight: bold;
  color: #000000;
}

.plan-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.plan-info {
  flex-shrink: 0; /* ✅ 줄바꿈 안되고 넉넉한 너비 확보 */
  white-space: nowrap;
  overflow-x: auto;
}

.plan-image img {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #81d4fa;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.custom-carousel {
  width: 100% !important;
  max-width: 400px !important;
  height: 200px !important;
  max-height: 200px !important;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  margin: 0 auto;
}
::v-deep(.v-carousel-item) {
  height: 200px !important;
}

.place-url {
  text-decoration: none; /* 밑줄 제거 */
  color: inherit; /* 글자색 상속 */
  transition: transform 0.2s ease-in-out; /* 부드러운 확대 애니메이션 */
  display: inline-block;
}

.place-url:hover {
  transform: scale(1.1); /* 마우스 오버 시 살짝 확대 */
  color: rgb(16, 178, 223); /* 마우스 오버 시 색상 변경 */
}

.selected {
  outline: 3px solid #0288d1;
}
</style>
