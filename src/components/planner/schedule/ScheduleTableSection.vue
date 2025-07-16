<template>
  <section class="schedule-table">
    <div class="table-header">
      <h3>📅 여행 계획표</h3>
      <button v-if="isEditable" class="edit-btn" @click="openUpdateSchedulesModal">수정</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>일차</th>
          <th>시간</th>
          <th>장소</th>
          <th>주소</th>
          <th>메모</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="([date, schedules], index) in groupedSchedules" :key="date">
          <tr
            v-for="(schedule, idx) in schedules"
            :key="schedule.id"
            :id="`row-${schedule.id}`"
            :class="{ selected: schedule.id === selectedSchedule?.id }"
            @click="$emit('update:selectedSchedule', schedule)"
          >
            <td
              v-if="idx === 0"
              :rowspan="schedules.length"
              class="date-group"
              :class="{ odd: index % 2 === 0, even: index % 2 !== 0 }"
            >
              {{ index + 1 }}일차<br />({{ date }})
            </td>
            <td>{{ formatTime(schedule.startTime) }}</td>
            <td>
              <a v-if="schedule.place" class="place-url" :href="`http://place.map.kakao.com/` + schedule.place?.kakaoId" target="_blank">
                {{ schedule.place?.placeName }}
              </a>
              <span v-else>{{ schedule.place?.placeName }}</span>
            </td>
            <td>{{ schedule.place?.addressName }}</td>
            <td>{{ schedule.content }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { computed, watch, nextTick } from 'vue'

const props = defineProps({
  schedules: Array,
  selectedSchedule: Object,
  isEditable: Boolean,
})

const emit = defineEmits(['openUpdateSchedulesModal', 'update:selectedSchedule'])

watch(
  () => props.selectedSchedule,
  async (schedule) => {
    if (!schedule) return
    await nextTick()
    const el = document.getElementById(`row-${schedule.id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  },
)

const openUpdateSchedulesModal = () => {
  emit('openUpdateSchedulesModal')
}

// ✅ 날짜 기준 그룹핑
const groupedSchedules = computed(() => {
  const map = new Map()
  props.schedules.forEach((schedule) => {
    if (!map.has(schedule.date)) {
      map.set(schedule.date, [])
    }
    map.get(schedule.date).push(schedule)
  })
  return Array.from(map.entries())
})

// ⏰ 시간 포맷
const formatTime = (isoString) => {
  const date = new Date(`1970-01-01T${isoString}`)
  return date.toTimeString().slice(0, 5)
}
</script>

<style scoped>
.schedule-table {
  flex: 1;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 100%;
}

.schedule-table h3 {
  margin-bottom: 15px;
  color: #0288d1;
}

.schedule-table table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table th,
.schedule-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.schedule-table th {
  background-color: #e1f5fe;
}

/* 일차 셀 스타일 */
.date-group {
  font-weight: bold;
  vertical-align: middle;
  white-space: nowrap;
  padding: 8px;
  font-size: 14px;
}

.date-group.odd {
  background-color: #b8e1f5;
}

.date-group.even {
  background-color: #9bd7f0;
}

.edit-btn {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn:hover {
  background-color: #135ba1;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.place-url {
  color: inherit;
  text-decoration: none;
}

.place-url:hover {
  color: #0288d1;
  text-decoration: underline;
}

.selected {
  background-color: #d1ecf1;
}
</style>
