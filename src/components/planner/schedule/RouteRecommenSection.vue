<template>
  <div class="route-recommend-section">
    <div class="header-section">
      <h2>🗺️ 경로 최적화</h2>
      <button
        class="recommend-btn-compact"
        @click="requestRouteRecommend"
        :disabled="isLoading || filteredSchedules.length === 0"
        :title="filteredSchedules.length === 0 ? '일정을 추가해주세요' : 'AI로 경로 최적화'"
      >
        <span v-if="!isLoading" class="btn-content">
          <span class="btn-icon">🚀</span>
          <span class="btn-text">최적화</span>
        </span>
        <span v-else class="loading">
          <span class="spinner"></span>
        </span>
      </button>
    </div>

    <div v-if="filteredSchedules.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <p>선택한 날짜에 해당하는 일정이 없습니다.</p>
    </div>

    <div v-else class="content-wrapper">
      <!-- 경로 비교 섹션 -->
      <div class="route-comparison">
        <!-- 기본 경로 (드래그 가능) -->
        <div class="route-card original">
          <div class="card-header">
            <h3>📍 기본 경로</h3>
            <div class="route-info">
              <span class="route-count">{{ draggableSchedules.length }}곳</span>
            </div>
          </div>
          <span class="drag-hint">🔄 드래그로 순서 변경</span>

          <draggable
            v-model="draggableSchedules"
            tag="ul"
            class="route-list draggable-list"
            :group="{ name: 'schedules' }"
            :animation="200"
            :ghost-class="'ghost-item'"
            :chosen-class="'chosen-item'"
            :drag-class="'drag-item'"
            @start="isDragging = true"
            @end="onDragEnd"
            item-key="id"
          >
            <template #item="{ element: schedule, index }">
              <li
                :class="{
                  selected: schedule === selectedSchedule,
                  'start-point': index === 0,
                  'end-point': index === draggableSchedules.length - 1
                }"
                @click="$emit('update:selectedSchedule', schedule)"
                class="route-item draggable-item"
              >
                <div class="item-content">
                  <span class="item-number" :class="{
                    'start-number': index === 0,
                    'end-number': index === draggableSchedules.length - 1
                  }">
                    {{ index === 0 ? '🛫' : index === draggableSchedules.length - 1 ? '🛬' : index + 1 }}
                  </span>
                  <span class="item-name">{{ schedule.place?.placeName }}</span>
                  <span class="drag-handle">⋮⋮</span>
                </div>
                <div v-if="index === 0" class="point-label start-label">출발지</div>
                <div v-if="index === draggableSchedules.length - 1" class="point-label end-label">도착지</div>
              </li>
            </template>
          </draggable>
        </div>

        <!-- 추천 경로 -->
        <div class="route-card recommended" :class="{ active: recommendedRoute.length > 0 }">
          <div class="card-header">
            <h3>✨ 추천 경로</h3>
            <span class="route-count" v-if="recommendedRoute.length > 0">
              {{ recommendedRoute.length }}곳
            </span>
          </div>
          <span class="drag-hint">💡 추천 경로를 적용해보세요</span>

          <div v-if="recommendedRoute.length === 0" class="empty-recommended">
            <div class="empty-icon">🎯</div>
            <p>최적화 버튼을 눌러<br>AI 추천 경로를 확인해보세요</p>
          </div>

          <div v-else class="recommended-content">
            <ul class="route-list">
              <li
                v-for="(schedule, index) in recommendedRoute"
                :key="`recommended-${schedule.id}`"
                :class="{
                  selected: schedule === selectedSchedule,
                  'start-point': index === 0,
                  'end-point': index === recommendedRoute.length - 1
                }"
                @click="$emit('update:selectedSchedule', schedule)"
                class="route-item recommended-item"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="item-content">
                  <span class="item-number" :class="{
                    'start-number': index === 0,
                    'end-number': index === recommendedRoute.length - 1
                  }">
                    {{ index === 0 ? '🛫' : index === recommendedRoute.length - 1 ? '🛬' : index + 1 }}
                  </span>
                  <span class="item-name">{{ schedule.place?.placeName }}</span>
                </div>
                <div v-if="index === 0" class="point-label start-label">출발지</div>
                <div v-if="index === recommendedRoute.length - 1" class="point-label end-label">도착지</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 적용하기 버튼 섹션 -->
      <div v-if="recommendedRoute.length > 0" class="apply-button-section">
        <button
          class="apply-btn-full"
          @click="applyRecommendedRoute"
          :disabled="isApplying"
        >
          <span v-if="!isApplying" class="apply-btn-content">
            <span class="apply-icon">✅</span>
            <span class="apply-text">추천 경로 적용하기</span>
          </span>
          <span v-else class="applying">
            <span class="spinner"></span>
            <span>적용 중...</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { triendApi } from '@/axios'

const props = defineProps({
  schedules: Array,
  selectedSchedule: Object,
  selectedDate: String,
  plannerId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:selectedSchedule', 'update:recommendedRoute', 'routeApplied'])

const isLoading = ref(false)
const isApplying = ref(false)
const isDragging = ref(false)

// 현재 날짜에 해당하는 스케줄 필터링
const filteredSchedules = computed(
  () => props.schedules?.filter((s) => s.date === props.selectedDate) ?? [],
)

// 드래그 가능한 스케줄 리스트
const draggableSchedules = ref([])

// 추천 경로
const recommendedRoute = ref([])

// filteredSchedules가 변경될 때 draggableSchedules 초기화
watch(filteredSchedules, (newVal) => {
  draggableSchedules.value = [...newVal].sort((a, b) => a.idx - b.idx)
  recommendedRoute.value = []
}, { immediate: true })

// 드래그 끝날 때 실행
const onDragEnd = () => {
  isDragging.value = false
  // 드래그된 순서대로 idx 업데이트 (필요한 경우)
  console.log('새로운 순서:', draggableSchedules.value.map(s => s.place?.placeName))
}

const requestRouteRecommend = async () => {
  if(draggableSchedules.value.length <= 2) {
    alert('일정을 3개 이상 추가해주세요.')
    return
  }

  if (isLoading.value) return

  isLoading.value = true

  // 현재 드래그된 순서대로 API 요청
  const payload = draggableSchedules.value.map((s) => ({
    scheduleId: s.id,
    lat: s.place?.latitude,
    lng: s.place?.longitude,
  }))

  try {
    const response = await triendApi({
      url: '/api/planner/routes/recommendation',
      method: 'post',
      data: payload,
    })

    const routeId = response.data.route

    // routeId 정보를 기반으로 추천 경로 생성
    recommendedRoute.value = routeId.map(id => filteredSchedules.value.find(s => s.id === id)).filter(Boolean)

    // emit으로 지도에 전달
    emit('update:recommendedRoute', recommendedRoute.value)
    console.log('추천 경로:', recommendedRoute.value)
  } catch (err) {
    console.error('추천 요청 실패:', err)
    alert('추천 요청 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}

const applyRecommendedRoute = async () => {
  if (isApplying.value || recommendedRoute.value.length === 0) return

  isApplying.value = true

  try {
    // 추천 경로 순서대로 idx를 1부터 할당
    const orderData = recommendedRoute.value.map((schedule, index) => ({
      scheduleId: schedule.id,
      idx: index + 1
    }))

    const updateRequest = {
      date : props.selectedDate,
      schedules: orderData
    }

    console.log('경로 적용 요청:', updateRequest)

    await triendApi({
      url: `/api/planners/${props.plannerId}/schedules/order`,
      method: 'put',
      data: updateRequest
    })

    // 성공 시 draggableSchedules도 업데이트
    draggableSchedules.value = [...recommendedRoute.value]

    // 부모 컴포넌트에 알림
    emit('routeApplied', props.plannerId)

    // 추천 경로 초기화 (적용 완료 후)
    recommendedRoute.value = []

    alert('추천 경로가 성공적으로 적용되었습니다!')

  } catch (err) {
    console.error('경로 적용 실패:', err)
    alert('경로 적용 중 오류가 발생했습니다.')
  } finally {
    isApplying.value = false
  }
}
</script>

<style scoped>
.route-recommend-section {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.route-recommend-section h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

/* 헤더 섹션 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

/* 컴팩트 추천 버튼 */
.recommend-btn-compact {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 100px;
  height: 40px;
}

.recommend-btn-compact:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
}

.recommend-btn-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.recommend-btn-compact .btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.recommend-btn-compact .btn-icon {
  font-size: 16px;
}

.recommend-btn-compact .btn-text {
  font-size: 14px;
}

.recommend-btn-compact .loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommend-btn-compact .spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 경로 비교 섹션 */
.route-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
  flex: 1;
  min-height: 400px;
}

.route-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid #e9ecef;
  height: fit-content;
  max-height: 600px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.route-card.original {
  border-color: #a8d0f0;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%);
}

.route-card.recommended.active {
  border-color: #ffb3ba;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
  box-shadow: 0 8px 32px rgba(255, 179, 186, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f8f9fa;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #495057;
}

.route-card.original .card-header h3 {
  color: #2c5aa0;
}

.route-card.recommended.active .card-header h3 {
  color: #c53030;
}

.route-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.route-count {
  background: #e9ecef;
  color: #6c757d;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.route-card.original .route-count {
  background: #bee3f8;
  color: #2a69ac;
}

.route-card.recommended.active .route-count {
  background: #fed7d7;
  color: #c53030;
}

.drag-hint {
  font-size: 10px;
  color: #6c757d;
  font-weight: 400;
}

/* 적용 버튼 섹션 */
.apply-button-section {
  margin-top: 20px;
  width: 100%;
}

.apply-btn-full {
  width: 100%;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  box-shadow: 0 4px 16px rgba(72, 187, 120, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 50px;
}

.apply-btn-full:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.35);
  background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
}

.apply-btn-full:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
}

.apply-btn-full:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: #9ca3af;
  box-shadow: none;
}

.apply-btn-full .apply-btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.apply-btn-full .apply-icon {
  font-size: 18px;
}

.apply-btn-full .apply-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.apply-btn-full .applying {
  display: flex;
  align-items: center;
  gap: 8px;
}

.apply-btn-full .spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 추천 컨텐츠 */
.recommended-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
}

/* 경로 리스트 */
.route-list {
  list-style: none;
  padding: 0;
  margin: 0;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  padding-right: 4px;
}

.draggable-list {
  padding-top : 10px;
  min-height: 60px;
}

.route-list::-webkit-scrollbar {
  width: 6px;
}

.route-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.route-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.route-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.route-card.original .route-list::-webkit-scrollbar-thumb {
  background: #bee3f8;
}

.route-card.original .route-list::-webkit-scrollbar-thumb:hover {
  background: #90cdf4;
}

.route-card.recommended .route-list::-webkit-scrollbar-thumb {
  background: #ffb3ba;
}

.route-card.recommended .route-list::-webkit-scrollbar-thumb:hover {
  background: #ff8a95;
}

.route-item {
  position: relative;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
  overflow: visible;
}

.route-card.original .route-item {
  background: #f0f7ff;
  border-color: #bee3f8;
}

.route-card.original .route-item:hover {
  background: #e6f3ff;
  border-color: #63b3ed;
  transform: translateX(4px);
}

.route-card.original .route-item.selected {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

/* 드래그 가능한 아이템 */
.draggable-item {
  cursor: grab;
}

.draggable-item:active {
  cursor: grabbing;
}

.draggable-item .item-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  position: relative;
}

.drag-handle {
  color: #6c757d;
  font-size: 12px;
  margin-left: auto;
  padding-left: 8px;
  cursor: grab;
}

.draggable-item:hover .drag-handle {
  color: #495057;
}

/* 출발지/도착지 특별 스타일 */
.start-point {
  border-color: #48bb78 !important;
  background: #f0fff4 !important;
}

.end-point {
  border-color: #ed8936 !important;
  background: #fffaf0 !important;
}

.start-point:hover, .end-point:hover {
  transform: translateX(2px) !important;
}

/* 출발지/도착지 선택 시 배경색 */
.start-point.selected {
  background: #48bb78 !important;
  color: white !important;
  border-color: #48bb78 !important;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3) !important;
}

.end-point.selected {
  background: #ed8936 !important;
  color: white !important;
  border-color: #ed8936 !important;
  box-shadow: 0 4px 12px rgba(237, 137, 54, 0.3) !important;
}

.start-number, .end-number {
  font-size: 14px !important;
  width: 28px !important;
  height: 28px !important;
}

.start-number {
  background: #48bb78 !important;
}

.end-number {
  background: #ed8936 !important;
}

/* 출발지/도착지 선택 시 번호 색상 */
.start-point.selected .item-number {
  background: white !important;
  color: #48bb78 !important;
}

.end-point.selected .item-number {
  background: white !important;
  color: #ed8936 !important;
}

/* 포인트 라벨 - 짤림 방지 및 위치 조정 */
.point-label {
  position: absolute;
  top: -10px;
  right: 6px;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  z-index: 10;
  white-space: nowrap;
  overflow: visible;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.start-label {
  background: #48bb78;
  color: white;
}

.end-label {
  background: #ed8936;
  color: white;
}

/* 추천 아이템 */
.recommended-item {
  animation: slideInRight 0.5s ease-out both;
  border-color: #ffb3ba;
  background: #fff5f5;
}

.recommended-item:hover {
  background: #ffe6e6;
  border-color: #ff8a95;
}

.recommended-item.selected {
  background: #f56565;
  color: white;
  border-color: #f56565;
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
}

.recommended-item .item-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.recommended-item.start-point {
  border-color: #48bb78 !important;
  background: #f0fff4 !important;
}

.recommended-item.end-point {
  border-color: #ed8936 !important;
  background: #fffaf0 !important;
}

/* 추천 아이템 출발지/도착지 선택 시 */
.recommended-item.start-point.selected {
  background: #48bb78 !important;
  color: white !important;
  border-color: #48bb78 !important;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3) !important;
}

.recommended-item.end-point.selected {
  background: #ed8936 !important;
  color: white !important;
  border-color: #ed8936 !important;
  box-shadow: 0 4px 12px rgba(237, 137, 54, 0.3) !important;
}

.recommended-item.start-point.selected .item-number {
  background: white !important;
  color: #48bb78 !important;
}

.recommended-item.end-point.selected .item-number {
  background: white !important;
  color: #ed8936 !important;
}

.item-number {
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.route-card.original .item-number {
  background: #4299e1;
}

.recommended-item .item-number {
  background: #f56565;
}

.route-item.selected .item-number {
  background: white;
  color: #667eea;
}

.route-card.original .route-item.selected .item-number {
  background: white;
  color: #4299e1;
}

.recommended-item.selected .item-number {
  background: white;
  color: #f56565;
}

.item-name {
  flex: 1;
  font-weight: 500;
  font-size: 14px;
}

/* 드래그 상태 스타일 */
.ghost-item {
  opacity: 0.5;
  background: #e3f2fd !important;
  transform: rotate(2deg);
}

.chosen-item {
  background: #bbdefb !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.drag-item {
  background: #e3f2fd !important;
  transform: rotate(5deg);
  z-index: 1000;
}

/* 빈 상태 */
.empty-state, .empty-recommended {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p, .empty-recommended p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

/* 애니메이션 */
.flip-list-move {
  transition: transform 0.3s ease;
}

.no-move {
  transition: transform 0s;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .route-comparison {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .route-recommend-section {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    text-align: center;
  }

  .route-recommend-section h2 {
    font-size: 20px;
  }

  .recommend-btn-compact {
    align-self: center;
    min-width: 120px;
  }

  .route-card {
    max-height: 400px;
  }

  .route-list {
    max-height: 250px;
  }

  .apply-btn-full {
    padding: 14px 20px;
    font-size: 14px;
  }

  .apply-btn-full .apply-icon,
  .apply-btn-full .apply-text {
    font-size: 14px;
  }
}
</style>
