<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <h2>플래너 수정</h2>
      <form @submit.prevent="updatePlanner" class="planner-form">
        <input type="hidden" v-model="form.id" />

        <!-- 여행 기간 -->
        <div class="form-group date-range">
          <label>여행 기간</label>
          <div class="date-inline">
            <input type="date" v-model="form.startDay" required @change="setEndMin" />
            <span class="arrow">→</span>
            <input type="date" v-model="form.endDay" required :min="form.startDay" />
          </div>
        </div>

        <!-- 플래너 이름 -->
        <div class="form-group">
          <label>플래너 이름</label>
          <input
            type="text"
            v-model="form.name"
            required
            placeholder="여행 계획의 이름을 알려주세요." />
        </div>

        <!-- 설명 -->
        <div class="form-group">
          <label>설명</label>
          <textarea
            v-model="form.comment"
            rows="3"
            placeholder="당신의 여행을 소개해주세요.(선택)">
          </textarea>
        </div>

        <!-- 공개 범위 -->
        <div class="form-group">
          <label>공개 범위</label>
          <div class="radio-group">
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
            <li
              v-for="(loc, idx) in form.locations"
              :key="idx"
              class="location-item">
              <input type="text" :value="loc.name" readonly />
              <button
                type="button"
                class="cancel-btn"
                @click="removeLocation(idx)">
                ×
              </button>
            </li>
          </ul>
          <button
            type="button"
            class="submit-btn"
            @click="openLocationModal">
            장소 추가
          </button>
        </div>

        <!-- 액션 버튼 -->
        <div class="button-group">
          <button type="submit" class="submit-btn">수정하기</button>
          <button type="button" class="cancel-btn" @click="closeModal">닫기</button>
        </div>
      </form>

      <!-- LocationSelectModal -->
      <LocationSelectModal
        v-if="showLocationModal"
        @select="onRegionSelect"
        @close="showLocationModal = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import LocationSelectModal from '@/components/location/LocationSelectModal.vue'

const props = defineProps({
  planner: { type: Object, required: true }
})
const emit = defineEmits(['close', 'updatePlanner'])

const form = reactive({
  id: props.planner.id,
  startDay: props.planner.startDay,
  endDay: props.planner.endDay,
  name: props.planner.name,
  comment: props.planner.comment || '',
  exposure: props.planner.exposure,
  locations: (props.planner.locations || []).map(l => ({
   sidoCode:  l.sidoCode,
   gugunCode: l.gugunCode,
   name:`${l.sidoName} ${l.gugunName}`
 }))
})
const showLocationModal = ref(false)

function setEndMin() {
  if (form.endDay && form.endDay < form.startDay) {
    form.endDay = form.startDay
  }
}

function openLocationModal() {
  showLocationModal.value = true
}

function onRegionSelect(region) {
  form.locations.push({
    sidoCode: region.sidoCode,
    gugunCode: region.gugunCode,
    name: region.label
  })
  showLocationModal.value = false
}

function removeLocation(idx) {
  form.locations.splice(idx, 1)
}

function updatePlanner() {
  const requestData = {
    id: form.id,
    startDay: form.startDay,
    endDay: form.endDay,
    name: form.name,
    comment: form.comment || null,
    exposure: form.exposure,
    locations: form.locations.map(l => ({
      sidoCode: l.sidoCode,
      gugunCode: l.gugunCode
    }))
  }
  emit('updatePlanner', requestData)
  emit('close')
}

function closeModal() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  position: absolute;
  width: 400px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  text-align: center;
  z-index: 210;
}

.modal h2 {
  margin-bottom: 15px;
  color: #0288d1;
}

.planner-form .form-group {
  margin-bottom: 16px;
}

.planner-form label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
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

.date-inline input[type='date'] {
  flex: 1;
}

.date-inline .arrow {
  font-size: 18px;
  color: #555;
}

.radio-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.locations-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.location-item input[readonly] {
  background: #f9f9f9;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  background-color: #4fc3f7;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #015f9b;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #4fc3f7;
  color: #4fc3f7;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #f0f6fa;
}
</style>