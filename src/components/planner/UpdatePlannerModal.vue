<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>플래너 수정</h2>
      <form @submit.prevent="updatePlanner" class="planner-form">
        <input type="hidden" v-model="form.id" />

        <div class="form-group date-range">
          <label>여행 기간</label>
          <div class="date-inline">
            <input type="date" v-model="form.startDay" required @change="setEndDateMin" />
            <span class="arrow">→</span>
            <input type="date" v-model="form.endDay" required />
          </div>
        </div>

        <div class="form-group">
          <label>플래너 이름</label>
          <input type="text" v-model="form.name" required />
        </div>

        <div class="form-group" style="position: relative">
          <label>지역</label>
          <input
            type="text"
            v-model="form.location"
            required
            autocomplete="off"
            @input="onLocationInput"
          />
        </div>

        <div class="button-group">
          <button type="submit" class="submit-btn">수정하기</button>
          <button type="button" class="cancel-btn" @click="closeModal">닫기</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  planner: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'updatePlanner'])

const form = reactive({
  id: props.planner.id,
  startDay: props.planner.startDay,
  endDay: props.planner.endDay,
  name: props.planner.name,
  location: props.planner.location,
})

const setEndDateMin = () => {
  // 필드 제약 조건 동기화
  if (form.endDay < form.startDay) {
    form.endDay = form.startDay
  }
}

const updatePlanner = () => {
  emit('updatePlanner', { ...form })
}

const closeModal = () => {
  emit('close')
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

.form-group {
  margin-bottom: 16px;
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
