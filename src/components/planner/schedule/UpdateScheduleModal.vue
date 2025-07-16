<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>플랜 수정</h2>
        <button class="delete-button" @click="deleteSchedules">🗑️ 삭제</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="updateSchedules" class="planner-form">
          <table class="modal-schedule-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>시간</th>
                <th>장소</th>
                <th>주소</th>
                <th>메모</th>
                <th>
                  <input type="checkbox" v-model="selectAll" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="schedule in editableSchedules" :key="schedule.id">
                <td>
                  <input
                    type="date"
                    v-model="schedule.date"
                    :min="planner.startDay"
                    :max="planner.endDay"
                  />
                </td>
                <td>
                  <div style="display: flex; gap: 4px">
                    <input type="time" v-model="schedule.startTime" />
                  </div>
                </td>
                <td><input type="text" v-model="schedule.placeName" /></td>
                <td><input type="text" v-model="schedule.address" /></td>
                <td><input type="text" v-model="schedule.content" /></td>
                <td>
                  <input type="checkbox" v-model="selectedScheduleIds" :value="schedule.id" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>

      <div class="button-group">
        <button class="submit-btn" @click="modifySchedules">수정하기</button>
        <button class="cancel-btn" @click="$emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { triendApi } from '@/axios/index.js'
import { sendScheduleUpdate, sendScheduleDelete } from '@/utils/websocket'

const props = defineProps({
  schedules: Array,
  planner: Object,
})

const emit = defineEmits(['close', 'updateSchedules', 'deleteSchedules'])

const editableSchedules = ref(props.schedules.map((p) => ({ ...p })))
const selectedScheduleIds = ref([])
const selectAll = ref(false)

watch(selectAll, (checked) => {
  selectedScheduleIds.value = checked ? editableSchedules.value.map((p) => p.id) : []
})
const modifySchedules = async () => {
  if (!validateScheduleTimeOverlap()) return
  try {
    await triendApi({
      url: `/api/planners/${props.planner.id}/schedules`,
      method: 'put',
      data: editableSchedules.value,
    })

    // 웹소켓 브로드캐스트
    editableSchedules.value.forEach(schedule => sendScheduleUpdate(schedule))

    emit('updateSchedules', editableSchedules.value)
    alert('수정이 완료되었습니다.')
  } catch (err) {
    console.log(`플랜 수정 실패`, err)
  }
}

const deleteSchedules = async () => {
  if (selectedScheduleIds.value.length === 0) {
    alert('삭제할 항목을 선택해주세요.')
    return
  }

  const confirmDelete = window.confirm(`정말 삭제하시겠습니까?`)
  if (!confirmDelete) return

  const schedulesToDelete = [...selectedScheduleIds.value]

  try {
    await triendApi({
      url: `/api/planners/${props.planner.id}/schedules`,
      method: 'DELETE',
      data: schedulesToDelete,
    })

    // 🔁 삭제된 플랜 UI에서 제거
    editableSchedules.value = editableSchedules.value.filter((schedule) => !schedulesToDelete.includes(schedule.id))
    selectedScheduleIds.value = []
    selectAll.value = false

    alert('삭제가 완료되었습니다.')

    // 웹소켓 브로드캐스트
    schedulesToDelete.forEach(id => {
      sendScheduleDelete(id, props.planner.id)
    })

    // 🧩 부모 컴포넌트도 갱신
    emit('updateSchedules', editableSchedules.value)
  } catch (err) {
    console.error('플랜 삭제 실패:', err)
    alert('삭제 중 오류 발생')
  }
}

const validateScheduleTimeOverlap = () => {
  const grouped = {}

  for (const schedule of editableSchedules.value) {
    const { date, startTime, endTime } = schedule
    if (!grouped[date]) grouped[date] = []
    grouped[date].push({ start: startTime, end: endTime })
  }

  for (const date in grouped) {
    const times = grouped[date].sort((a, b) => a.start.localeCompare(b.start))
    for (let i = 1; i < times.length; i++) {
      if (times[i].start < times[i - 1].end) {
        alert(
          `${date}의 시간 겹침: ${times[i - 1].start}~${times[i - 1].end} vs ${times[i].start}~${times[i].end}`,
        )
        return false
      }
    }
  }

  return true
}
</script>

<style scoped>
.modal {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  max-width: 80vw;
  max-height: 80vh;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 210;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.modal-body {
  flex: 1;
  overflow-y: auto;
}
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
.modal-schedule-table {
  width: 100%;
  border-collapse: collapse;
}
.modal-schedule-table th,
.modal-schedule-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
  font-size: 14px;
}
.modal-schedule-table input {
  width: 100%;
  padding: 4px;
  box-sizing: border-box;
}
.delete-button {
  padding: 6px 12px;
  background: #e57373;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.submit-btn,
.cancel-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.submit-btn {
  background: #4fc3f7;
  color: white;
}
.cancel-btn {
  background: #ccc;
  color: black;
}
</style>
