<template>
  <section class="schedule-edit-table">
    <div class="header">
      <h3>🗓️ 여행 일정 구성</h3>
      <button @click="addDay">+ 일자 추가</button>
    </div>

    <div class="day-columns">
      <div
        v-for="(day, index) in localSchedule"
        :key="day.date"
        class="day-column"
      >
        <h4>{{ index + 1 }}일차 ({{ day.date }})</h4>

        <draggable
          v-model="day.items"
          :group="{ name: 'places', pull: true, put: true }"
          item-key="id"
          handle=".drag-handle"
          class="item-list"
          @end="emitUpdate"
        >
          <template #item="{ element }">
            <div class="schedule-item">
              <span class="drag-handle">☰</span>
              <span class="title">{{ element.title }}</span>
              <span class="time">{{ element.time || '시간 미지정' }}</span>
              <button class="remove-btn" @click="removeItem(index, element.id)">×</button>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <button class="save-btn" @click="emitUpdate">저장</button>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import dayjs from 'dayjs'

const props = defineProps({
  items: { type: Array, default: () => [] }  // [{ date, items: [{id, title, time}] }]
})
const emit = defineEmits(['update'])

const localSchedule = ref([...props.items])

watch(() => props.items, (newVal) => {
  localSchedule.value = [...newVal]
}, { deep: true })

function addDay() {
  const today = dayjs().format('YYYY-MM-DD')
  const nextDate = dayjs(today).add(localSchedule.value.length, 'day').format('YYYY-MM-DD')
  localSchedule.value.push({ date: nextDate, items: [] })
  emit('update', localSchedule.value)
}

function removeItem(dayIndex, id) {
  localSchedule.value[dayIndex].items = localSchedule.value[dayIndex].items.filter(p => p.id !== id)
  emit('update', localSchedule.value)
}

function emitUpdate() {
  emit('update', localSchedule.value)
}
</script>

<style scoped>
.schedule-edit-table {
  background: transparent;
  border-radius: 0;         
  padding: 1rem;               
  box-shadow: none;         
  max-height: 100%;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-row {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.schedule-edit-table h3 {
  margin-bottom: 12px;
  color: #0288d1;
}

.cell {
  flex: 1;
  text-align: center;
}
.drag-handle {
  cursor: grab;
  padding: 0 8px;
}
.remove-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #f44336;
}
.save-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.save-btn:hover {
  background: #135ba1;
}

.day-columns {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
}

.day-column {
  background: #fff;
  padding: 0.8rem;
  border: 1px solid #eee;
  border-radius: 8px;
  min-width: 250px;
  max-height: 600px;
  overflow-y: auto;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}
</style>
