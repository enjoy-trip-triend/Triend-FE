<template>
  <div class="modal-overlay">
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
          <input type="text" v-model="form.name" required />
        </div>

        <!-- 지역 -->
        <div class="form-group" style="position: relative">
          <label>지역</label>
          <input type="text" v-model="form.location" required autocomplete="off" />
          <div class="autocomplete-items" v-if="showSuggestions">
            <div
              v-for="(suggestion, index) in filteredSuggestions"
              :key="index"
              @click="selectLocation(suggestion)"
            >
              {{ suggestion }}
            </div>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="button-group">
          <button type="submit" class="submit-btn">생성하기</button>
          <button type="button" class="cancel-btn" @click="$emit('close')">닫기</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { defineEmits } from 'vue'

const emit = defineEmits(['submit', 'close', 'showPlannerListModal', 'createPlanner'])

const form = ref({
  startDay: '',
  endDay: '',
  name: '',
  location: '',
})

const setEndMin = () => {
  if (form.value.endDay < form.value.startDay) {
    form.value.endDay = form.value.startDay
  }
}

// 예시 자동완성 리스트
const suggestions = ['서울', '부산', '제주', '강릉']
const showSuggestions = ref(false)

const filteredSuggestions = computed(() =>
  suggestions.filter((loc) => loc.includes(form.value.location)),
)

const selectLocation = (loc) => {
  form.value.location = loc
  showSuggestions.value = false
}

const createPlanner = () => {
  const requestData = {
    name: form.value.name,
    startDay: form.value.startDay,
    endDay: form.value.endDay,
    location: form.value.location,
  }
  emit('createPlanner', requestData)
}
</script>

<style scoped>
.modal h2 {
  margin-bottom: 15px;
  color: #0288d1;
}

.modal button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #4fc3f7;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  margin: 0px 3px;
}

/* 모달 공통 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 모달 본문 */
.modal {
  position: absolute;
  width: 400px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  padding: 30px;
  border-radius: 10px;
  min-width: 300px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 210; /* 모달을 다른 요소들 위로 올리기 위해 z-index 추가 */
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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

.autocomplete-items {
  position: absolute;
  border: 1px solid #ccc;
  background-color: #fff;
  z-index: 999;
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
}
.autocomplete-items div {
  padding: 8px;
  cursor: pointer;
}
.autocomplete-items div:hover {
  background-color: #f0f0f0;
}

.planner-form .form-group {
  margin-bottom: 16px;
}

.planner-form label {
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
  font-weight: 500;
}

.planner-form input,
.planner-form textarea {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
