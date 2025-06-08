<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>플랜 수정</h2>
        <button class="delete-button" @click="deletePlans">🗑️ 삭제</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="updatePlans" class="planner-form">
          <table class="modal-plan-table">
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
              <tr v-for="plan in editablePlans" :key="plan.id">
                <td>
                  <input
                    type="date"
                    v-model="plan.date"
                    :min="planner.startDay"
                    :max="planner.endDay"
                  />
                </td>
                <td>
                  <div style="display: flex; gap: 4px">
                    <input type="time" v-model="plan.startTime" />
                    <span>~</span>
                    <input type="time" v-model="plan.endTime" />
                  </div>
                </td>
                <td><input type="text" v-model="plan.placeName" /></td>
                <td><input type="text" v-model="plan.address" /></td>
                <td><input type="text" v-model="plan.content" /></td>
                <td>
                  <input type="checkbox" v-model="selectedPlanIds" :value="plan.id" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>

      <div class="button-group">
        <button class="submit-btn" @click="modifyPlans">수정하기</button>
        <button class="cancel-btn" @click="$emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { triendApi } from '@/axios/index.js'

const props = defineProps({
  plans: Array,
  planner: Object,
})

const emit = defineEmits(['close', 'updatePlans', 'deletePlans']) // 🧩 updatePlans: 최종 갱신 반영용

const editablePlans = ref(props.plans.map((p) => ({ ...p })))
const selectedPlanIds = ref([])
const selectAll = ref(false)

watch(selectAll, (checked) => {
  selectedPlanIds.value = checked ? editablePlans.value.map((p) => p.id) : []
})
const modifyPlans = async () => {
  if (!validatePlanTimeOverlap()) return
  try {
    await triendApi({
      url: `/api/planners/${props.planner.id}/plans`,
      method: 'put',
      data: editablePlans.value,
    })

    emit('updatePlans', editablePlans.value)
    alert('수정이 완료되었습니다.')
  } catch (err) {
    console.log(`플랜 수정 실패`, err)
  }
}

const deletePlans = async () => {
  if (selectedPlanIds.value.length === 0) {
    alert('삭제할 항목을 선택해주세요.')
    return
  }

  const confirmDelete = window.confirm(`정말 삭제하시겠습니까?`)
  if (!confirmDelete) return

  const plansToDelete = [...selectedPlanIds.value]

  try {
    await triendApi({
      url: `/api/planners/${props.planner.id}/plans`,
      method: 'DELETE',
      data: plansToDelete,
    })

    // 🔁 삭제된 플랜 UI에서 제거
    editablePlans.value = editablePlans.value.filter((plan) => !plansToDelete.includes(plan.id))
    selectedPlanIds.value = []
    selectAll.value = false

    alert('삭제가 완료되었습니다.')

    // 🧩 부모 컴포넌트도 갱신
    emit('updatePlans', editablePlans.value)
  } catch (err) {
    console.error('플랜 삭제 실패:', err)
    alert('삭제 중 오류 발생')
  }
}

const validatePlanTimeOverlap = () => {
  const grouped = {}

  for (const plan of editablePlans.value) {
    const { date, startTime, endTime } = plan
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
.modal-plan-table {
  width: 100%;
  border-collapse: collapse;
}
.modal-plan-table th,
.modal-plan-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
  font-size: 14px;
}
.modal-plan-table input {
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
