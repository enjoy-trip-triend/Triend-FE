<!-- src/components/common/PlaceInfoWindow.vue -->
<template>
  <!-- 최상위에 .stop을 걸어서 내부 클릭이 밖으로 전파되지 않도록 -->
  <div class="place-info-window" @click.stop @mousedown.stop>
    <button class="close-btn" @click="$emit('close')">✕</button>
    <div class="header">
      <img v-if="place.imageUrl" :src="place.imageUrl" alt="장소 이미지" class="place-img"/>
      <h3 class="title">
        <a
          v-if="place.place_url"
          :href="place.place_url"
          target="_blank"
          rel="noopener"
          @click.stop
        >{{ place.place_name }}</a>
        <span v-else>{{ place.place_name }}</span>
      </h3>
    </div>
    <ul class="details">
      <li><strong>카테고리</strong> {{ place.category_name }}</li>
      <li><strong>전화번호</strong> {{ place.phone || '-' }}</li>
      <li><strong>주소</strong> {{ place.road_address_name || place.address_name }}</li>
    </ul>
    <div class="actions">
      <button class="btn btn-heart" @click.stop="$emit('heart')">💖 나만의 장소</button>
      <button class="btn btn-plan"  @click.stop="$emit('plan')">📅 플래너에 담기</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({ place: Object })
const emit  = defineEmits(['close','heart','plan'])
</script>

<style scoped>
.place-info-window {
  position: relative;
  width: 260px;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-size: 14px;
  color: #333;
}
.close-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.place-img {
  width: 40px; height: 40px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 8px;
}
.title { font-size: 16px; margin: 0; line-height: 1.2; }
.title a { color: #2978b5; text-decoration: none; }
.details { list-style: none; padding: 0; margin: 8px 0; }
.details li { margin-bottom: 4px; }
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
.btn {
  flex: 1; padding: 6px 8px;
  border: none; border-radius: 6px;
  font-size: 13px; cursor: pointer;
}
.btn + .btn { margin-left: 6px; }
.btn-heart { background: #ffe6e6; color: #e63946; }
.btn-plan  { background: #e6f0ff; color: #1d4ed8; }
</style>
