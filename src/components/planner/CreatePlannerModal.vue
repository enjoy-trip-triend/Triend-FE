<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>플래너 생성</h2>
      <form @submit.prevent="createPlanner" class="planner-form">
        <!-- 여행 기간 -->
        <div class="form-group date-range">
          <label>여행 기간</label>
          <div class="date-inline">
            <input type="date" v-model="form.startDay" required @change="setEndMin" />
            <span class="arrow">→</span>
            <input type="date" v-model="form.endDay" required :min="form.startDay" />
          </div>
        </div>

        <!-- 이름 -->
        <div class="form-group">
          <label>플래너 이름</label>
          <input type="text" v-model="form.name" placeholder="여행 계획의 이름을 알려주세요." />
        </div>

        <!-- 설명 -->
        <div class="form-group">
          <label>설명</label>
          <textarea v-model="form.comment" rows="3" placeholder="당신의 여행을 소개해주세요.(선택)"></textarea>
        </div>

        <!-- 공개 범위 -->
        <div class="form-group">
          <label>공개 범위</label>
          <div class="radio-group center">
            <label class="radio-item">
              <input type="radio" v-model="form.exposure" value="PUBLIC" /> 전체공개
            </label>
            <label class="radio-item">
              <input type="radio" v-model="form.exposure" value="PRIVATE" /> 비공개
            </label>
          </div>
        </div>

        <!-- 장소 리스트 -->
        <div class="form-group">
          <label>장소 추가 (선택)</label>
          <ul class="locations-list">
            <li v-for="(loc, idx) in form.locations" :key="idx" class="location-item">
              <input type="text" :value="loc.name" readonly />
              <button type="button" class="remove-btn" @click="removeLocation(idx)">×</button>
            </li>
          </ul>
          <button type="button" class="add-location-btn" @click="openLocationModal">장소 추가</button>
        </div>

        <!-- 버튼 -->
        <div class="button-group">
          <button type="submit" class="submit-btn">생성하기</button>
          <button type="button" class="cancel-btn" @click="$emit('close')">닫기</button>
        </div>
      </form>

      <!-- LocationSelectModal -->
      <LocationSelectModal v-if="showLocationModal" @select="onRegionSelect" @close="showLocationModal = false" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LocationSelectModal from '@/components/location/LocationSelectModal.vue'

const emit = defineEmits(['submit', 'close'])

// 폼 데이터
const form = ref({
  startDay: '',
  endDay: '',
  name: '',
  comment: '',
  exposure: 'PUBLIC',
  locations: [] // {sidoCode, gugunCode, name}
})

// 모달 상태
const showLocationModal = ref(false)

// 날짜 유효성
function setEndMin() {
  if (form.value.endDay && form.value.endDay < form.value.startDay) {
    form.value.endDay = form.value.startDay
  }
}

// Location modal 열기
function openLocationModal() {
  showLocationModal.value = true
}

// LocationSelectModal 에서 선택 완료 시 호출
function onRegionSelect(region) {
  console.log('선택된 region:', region)
  form.value.locations.push({
    sidoCode: region.sidoCode,
    gugunCode: region.gugunCode,
    name: region.label // RegionSelectModal emits {label, ...}
  })
  showLocationModal.value = false
}

// 선택된 장소 제거
function removeLocation(idx) {
  form.value.locations.splice(idx, 1)
}

// 플래너 생성
function createPlanner() {
  const requestData = {
    startDay: form.value.startDay,
    endDay: form.value.endDay,
    name: form.value.name,
    comment: form.value.comment || null,
    exposure: form.value.exposure,
    locations: form.value.locations.map(l => ({
      sidoCode: l.sidoCode,
      gugunCode: l.gugunCode
    }))
  }
  emit('submit', requestData)
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.planner-form .form-group {
  margin-bottom: 16px;
  text-align: left;
}

.planner-form label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
}

.planner-form input,
.planner-form textarea {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.date-inline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-inline .arrow {
  font-size: 18px;
  color: #555;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-group.center {
  justify-content: center;
  align-items: center;
}

.radio-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.locations-list {
  list-style: none;
  padding: 0;
  margin: 0 0 8px;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #f44336;
  font-size: 18px;
  cursor: pointer;
}

.add-location-btn {
  background: #4fc3f7;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.add-location-btn:hover {
  background: #039be5;
}

.locations-select {
  width: 100%;
  height: auto;
  margin-top: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px;
  box-sizing: border-box;
  background: #f9f9f9;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  background: #0288d1;
  border: none;
  color: #fff;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #888;
  color: #555;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.submit-btn:hover {
  background: #0277bd;
}

.cancel-btn:hover {
  background: #f0f0f0;
}
</style>
