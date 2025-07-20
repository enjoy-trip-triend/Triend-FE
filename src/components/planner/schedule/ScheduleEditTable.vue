<template>
  <section class="schedule-edit-table">
    <h3>✏️ 일정 편집</h3>
    <draggable
      v-model="localItems"
      group="schedules"
      handle=".drag-handle"
      @end="onDragEnd"
    >
      <template #item="{ element: item, index }">
        <div :key="item.id" class="edit-row">
          <span class="drag-handle">☰</span>
          <span class="cell date">{{ formatDate(item.date) }}</span>
          <span class="cell time">{{ formatTime(item.startTime) }}</span>
          <span class="cell place">{{ item.title }}</span>
          <button class="remove-btn" @click="$emit('remove', item.id)">×</button>
        </div>
      </template>
    </draggable>
    <button class="save-btn" @click="emitUpdate">저장</button>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  items: { type: Array, default: () => [] }
})
const emit = defineEmits(['update', 'remove'])

// 로컬 복사본으로 드래그 중 UI 반응성 유지
const localItems = ref([...props.items])

watch(
  () => props.items,
  (newVal) => { localItems.value = [...newVal] }
)

function onDragEnd() {
  emit('update', localItems.value)
}

function emitUpdate() {
  emit('update', localItems.value)
}

// 날짜, 시간 포맷터 (필요 시 구현)
function formatDate(dateStr) {
  return dateStr // TODO: 포맷팅 로직 추가
}
function formatTime(timeStr) {
  return timeStr // TODO: 포맷팅 로직 추가
}
</script>

<style scoped>
.schedule-edit-table {
  background: transparent;
  border-radius: 0;         
  padding: 0;               
  box-shadow: none;         
  max-height: 100%;
  overflow-y: auto;
}

.schedule-edit-table h3 {
  margin-bottom: 12px;
  color: #0288d1;
}
.edit-row {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
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
</style>
