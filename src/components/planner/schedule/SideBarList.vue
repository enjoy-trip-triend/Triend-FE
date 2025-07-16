<!-- src/components/planner/schedule/SidebarList.vue -->
<template>
  <ul>
    <li
      v-for="place in places"
      :key="place.id"
      class="sidebar-item"
    >
      {{ place.title }}
      <button @click="$emit('remove', place.id)">삭제</button>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  places: { type: Array, default: () => [] }
})
const emit = defineEmits(['remove'])
</script>

<style scoped>
.sidebar-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}
</style>
