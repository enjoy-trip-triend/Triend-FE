<!-- src/components/planner/schedule/SidebarList.vue -->
<template>
  <div class="sidebar-wrapper">
    <h3 class="sidebar-title">장소 담아두기</h3>
    <hr class="divider" />

    <div v-if="places.length === 0" class="empty-message">담은 장소가 없습니다. <br><br>
      장소를 담아주세요!
    </div>

    <draggable
      v-model="localPlaces"
      item-key="id"
      handle=".drag-handle"
      @end="onDragEnd"
      class="place-list"
      animation="200"
    >
      <template #item="{ element }">
        <li class="sidebar-item">
          <span class="drag-handle">☰</span>
          <span class="place-title">{{ element.title }}</span>
          <button class="remove-btn" @click="$emit('remove', element.id)">✕</button>
        </li>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  places: { type: Array, default: () => [] }
})
const emit = defineEmits(['remove', 'reorder'])

// 로컬 복사본 (v-model용)
const localPlaces = ref([...props.places])

// props가 바뀌면 로컬도 동기화
watch(() => props.places, (newVal) => {
  localPlaces.value = [...newVal]
}, { deep: true })

// 드래그 끝나면 순서를 상위에 알려줌
function onDragEnd() {
  emit('reorder', localPlaces.value)
}
</script>

<style scoped>
.sidebar-wrapper {
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1d4ed8;
}

.divider {
  border: none;
  height: 1px;
  background-color: #ddd;
  margin: 0.5rem 0 1rem;
}

.place-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.4rem;
  border-bottom: 1px solid #eee;
  cursor: grab;
}

.drag-handle {
  font-size: 18px;
  margin-right: 8px;
  color: #888;
  cursor: grab;
}

.place-title {
  flex: 1;
  font-size: 14px;
  color: #333;
  word-break: keep-all;
}

.remove-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s ease;
}

.remove-btn:hover {
  color: #e63946;
}

.empty-message {
  text-align: center;
  color: #888;
  font-size: 14px;
  margin-top: 2rem;
}

.sidebar-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.4rem;
  border-bottom: 1px solid #eee;
  cursor: grab;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.place-list .sortable-chosen {
  background-color: #f0f8ff;
  transform: scale(1.02);
}

.place-list .sortable-ghost {
  opacity: 0.4;
}
</style>