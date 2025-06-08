<template>
  <ul class="places-list">
    <li v-for="place in places" :key="place.kakaoId" class="place-item" @click="$emit('select', place)">
      <div class="place-header">
        <span class="recommend-badge">추천</span>
        <strong class="place-name">{{ place.locationName }}</strong>
      </div>
      <p class="address">{{ place.road_address_name }}</p>
      <p v-if="place.phone" class="phone">{{ place.phone }}</p>
    </li>
  </ul>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  places: {
    type: Array,
    default: () => []
  }
})

console.log('RecommendList 초기 places:', props.places)

defineEmits(['select'])
</script>

<style scoped>
.places-list {
  max-height: 70vh;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  margin-top: 10px;
  padding: 0;
  list-style: none;
}
.place-item {
  padding: 12px;
  margin: 8px;
  border: 1px solid #90caf9;       /* 아이템 경계선 색상 */
  border-radius: 6px;              /* 부드러운 모서리 */
  background-color: #f9fbfc;       /* 약간 연한 배경 */
  display: flex;
  flex-direction: column;
}

.place-item:hover {
  background: #e3f2fd; 
}
.place-name {
  font-size: 1rem;
  color: #4a90e2;
  margin-bottom: 4px;
}
.address {
  font-size: 0.875rem;
  color: #666;
  margin: 2px 0;
}
.phone {
  font-size: 0.875rem;
  color: #0288d1;
}

.place-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.recommend-badge {
  background: #ffca28;
  color: #bf360c;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
}
</style>