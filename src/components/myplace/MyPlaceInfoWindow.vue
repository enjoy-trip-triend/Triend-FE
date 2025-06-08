<!-- src/components/myplace/MyPlaceInfoWindow.vue -->
<template>
  <div class="myplace-info-window"     
    @mousedown.stop
    @click.stop
    @dblclick.stop>
    <button class="close-btn" @click="$emit('close')">✕</button>

    <div class="header">
      <span class="heart">❤️</span>
          <h3 class="title">
      <a
        v-if="place.place_url"
        :href="place.place_url"
        target="_blank"
        rel="noopener"
      >
        {{ place.locationName }}
      </a>
      <span v-else>{{ place.locationName }}</span>
    </h3>
    </div>

    <ul class="details">
      <li>
        <span class="label">주소</span>
        <span class="value">{{ place.address }}</span>
      </li>
      <li v-if="place.phone">
        <span class="label">전화번호</span>
        <span class="value">{{ place.phone }}</span>
      </li>
      <li>
        <span class="label">카테고리</span>
        <span class="value">{{ place.categoryName || '—' }}</span>
      </li>
      <li v-if="place.description">
        <span class="label">설명</span>
        <span class="value">❝{{ place.description }}❞</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  place: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['close'])
</script>

<style scoped>
.myplace-info-window {
  position: relative;
  width: 280px;
  padding: 16px;
  background: #fff5f7;
  border: 2px solid #ff9fb7;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  font-family: 'Nanum Gothic', sans-serif;
  color: #333;
  word-break: break-word;
  white-space: pre-wrap;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.heart {
  font-size: 1.4em;
  margin-right: 6px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #d6336c;
  line-height: 1.2;
}

.details {
  list-style: none;
  padding: 0;
  margin: 0;
}

.details li {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  align-items: flex-start;
}

.label {
  flex-shrink: 0;
  width: 60px;
  font-weight: 600;
  color: #d6336c;
}

.value {
  flex: 1;
}

.description {
  font-style: italic;
  color: #555;
}

</style>
