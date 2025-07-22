<template>
  <div class="schedule-edit-table">
    <div v-for="date in dateList" :key="date" class="date-section">
      <h4 class="date-label">📅 {{ formatDate(date) }}</h4>

      <draggable
        :list="getItemsForDate(date)"
        group="places"
        item-key="id"
        class="item-dropzone"
        @add="onAddItem(date, $event)"
        @end="emitUpdate"
      >
        <template #item="{ element }">
          <div class="schedule-item">
            <span class="drag-handle">☰</span>
            <span class="title">{{ element.title }}</span>
            <span class="time">{{ element.time || '시간 미지정' }}</span>
            <button class="remove-btn" @click="removeItem(element.id)">×</button>
          </div>
        </template>
      </draggable>
    </div>

    <button class="save-btn" @click="emitUpdate">저장</button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isSameOrBefore)

const props = defineProps({
  items: { type: Array, default: () => [] }, // scheduleItems
  startDate: String,
  endDate: String
})
const emit = defineEmits(['update'])

const scheduleItems = ref([...props.items])

watch(() => props.items, (val) => {
  scheduleItems.value = [...val]
}, { deep: true })

// 📅 startDate ~ endDate 범위 내 날짜 리스트 생성
const dateList = computed(() => {
  const dates = []
  let current = dayjs(props.startDate)
  const end = dayjs(props.endDate)

  while (current.isSameOrBefore(end)) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  return dates
})

// 📌 날짜별 일정 필터링
function getItemsForDate(date) {
  return scheduleItems.value.filter(i => i.visit_date === date)
}

// ⛳ 드래그로 추가될 때 처리
function onAddItem(date, event) {
  const item = event.item?._underlying_vm_ || event.clone()
  if (!item) return

  // 날짜 설정 및 중복 방지
  const already = scheduleItems.value.find(i => i.id === item.id && i.visit_date === date)
  if (!already) {
    scheduleItems.value.push({ ...item, visit_date: date })
  }
  emit('update', scheduleItems.value)
}

// ❌ 항목 제거
function removeItem(id) {
  scheduleItems.value = scheduleItems.value.filter(i => i.id !== id)
  emit('update', scheduleItems.value)
}

function emitUpdate() {
  emit('update', scheduleItems.value)
}

function formatDate(dateStr) {
  return dayjs(dateStr).format('M월 D일 (ddd)')
}
</script>

<style scoped>
.schedule-edit-table {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.date-section {
  background: #fff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.date-label {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 0.6rem;
  color: #1d4ed8;
}

.item-dropzone {
  min-height: 80px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  padding: 0.5rem;
  background: #f9f9f9;
}

.schedule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 0.4rem;
}

.drag-handle {
  margin-right: 8px;
  cursor: grab;
  color: #888;
}

.title {
  font-weight: 500;
  flex: 1;
}

.time {
  font-size: 12px;
  color: #666;
  margin-right: 1rem;
}

.remove-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #e53935;
  cursor: pointer;
}

.save-btn {
  align-self: flex-end;
  padding: 8px 16px;
  background-color: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
</style>
