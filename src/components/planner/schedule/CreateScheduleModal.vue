<template>
  <div class="modal-overlay" id="scheduleCreateModal">
    <div class="modal">
      <h2>일정 추가</h2>
      <form @submit.prevent="createSchedule" class="planner-form">
        <!-- 숨겨진 필드 -->
        <input type="hidden" v-model="form.plannerId" />
        <input type="hidden" v-model="form.lat" />
        <input type="hidden" v-model="form.lon" />
        <input type="hidden" v-model="form.placeUrl" />
        <!-- 일자 -->
        <div class="form-group">
          <label>일자</label>
          <input
            type="date"
            v-model="form.date"
            :min="props.planner?.startDay"
            :max="props.planner?.endDay"
          />
        </div>

        <!-- 시간 -->
        <div class="form-group date-range">
          <label>시간</label>
          <div class="date-inline">
            <input type="time" v-model="form.startTime" required @change="setMinEndTime" />
            <span class="arrow">→</span>
            <input type="time" v-model="form.endTime" required :min="form.startTime" />
          </div>
        </div>

        <!-- 장소명 -->
        <div class="form-group">
          <label>장소명</label>
          <input type="text" v-model="form.placeName" />
        </div>

        <!-- 주소 -->
        <div class="form-group">
          <label>주소</label>
          <input type="text" v-model="form.address" />
        </div>

        <!-- 참고사항 -->
        <div class="form-group">
          <label>메모</label>
          <textarea v-model="form.content" rows="3"></textarea>
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
import { ref } from 'vue'
import { defineEmits, defineProps } from 'vue'
import { triendApi } from '@/axios/index.js'
import { searchImage } from '@/utils/imageSearch.js'

const emit = defineEmits(['close', 'showPlannerListModal', 'createSchedule'])

const props = defineProps({
  planner: Object,
  place: Object,
})

const form = ref({
  plannerId: props.planner.id || '',
  date: props.planner?.startDay || '',
  startTime: '',
  endTime: '',
  content: '',
  lat: props.place.lat || '',
  lon: props.place.lon || '',
  placeName: props.place.placeName || '',
  address: props.place.address || '',
  placeUrl: props.place.placeUrl || '',
})

const setMinEndTime = () => {
  if (form.value.endTime < form.value.startTime) {
    form.value.endTime = form.value.startTime
  }
}
async function createSchedule() {
  // 1. 플랜 먼저 생성
  const requestData = {
    plannerId: form.value.plannerId,
    lat: form.value.lat,
    lon: form.value.lon,
    date: form.value.date,
    startTime: form.value.startTime,
    endTime: form.value.endTime,
    placeName: form.value.placeName,
    address: form.value.address,
    content: form.value.content,
    placeUrl: form.value.placeUrl,
  }

  let scheduleId
  try {
    const res = await triendApi.post('/api/schedules', requestData)
    scheduleId = res.data

    alert('성공적으로 생성되었습니다!')
    emit('close')
    emit('showPlannerListModal')
    emit('createSchedule', { ...requestData, id: scheduleId })
  } catch (err) {
    console.error('플랜 생성 실패:', err)
    alert('오류 발생: ' + (err.response?.data?.message || err.message))
    return
  }

  // 2. 이미지 검색 (플랜 생성 이후 실행)
  let imageUrls = []
  try {
    imageUrls = await searchImage(form.value.placeName)
    console.log('🔍 검색된 이미지 URL:', imageUrls)
  } catch (err) {
    console.error('이미지 검색 실패:', err)
    return
  }

  // 3. 이미지 업로드 요청 (비동기)
  triendApi
    .post(
      '/api/s3/proxy-upload',
      {
        scheduleId,
        imageUrls,
      },
      {
        timeout: 10000, // ✅ 10초 (단위: 밀리초)
      },
    )
    .then((res) => {
      console.log('✅ 이미지 업로드 완료:', res.data)
    })
    .catch((err) => {
      console.error('이미지 업로드 실패:', err)
    })
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

/* 플랜 추가 모달 style */
#scheduleCreateModal .modal {
  width: 400px;
  padding: 30px;
  border-radius: 10px;
  background-color: #fff;
  font-family: 'Noto Sans KR', sans-serif;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

#scheduleCreateModal .form-group {
  margin-bottom: 16px;
}

#scheduleCreateModal label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

#scheduleCreateModal input,
#scheduleCreateModal textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

#scheduleCreateModal .button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
