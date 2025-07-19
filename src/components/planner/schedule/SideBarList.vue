<!-- src/components/planner/schedule/SidebarList.vue -->
<template>
  <div class="sidebar-wrapper">
    <h3 class="sidebar-title">장소 담아두기</h3>
    <hr class="divider" />

    <div v-if="places.length === 0" class="empty-message">담은 장소가 없습니다. <br><br>
      장소를 담아주세요!
    </div>

    <ul v-else class="place-list">
      <li v-for="place in places" :key="place.id" class="sidebar-item">
        <span class="place-title">{{ place.title }}</span>
        <button class="remove-btn" @click="$emit('remove', place.id)">✕</button>
      </li>
    </ul>
  </div>
</template>
<script setup>
const props = defineProps({
  places: { type: Array, default: () => [] }
})
const emit = defineEmits(['remove'])
</script>

<style scoped>
.sidebar-wrapper {
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
  color: #015f9b;
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
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.4rem;
  border-bottom: 1px solid #eee;
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
</style>