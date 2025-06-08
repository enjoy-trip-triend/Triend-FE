<template>
  <section class="plan-table">
    <div class="table-header">
      <h3>📅 여행 계획표</h3>
      <button class="edit-btn" @click="openUpdatePlansModal">수정</button>
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
        <template v-for="([date, plans], index) in groupedPlans" :key="date">
          <tr
            v-for="(plan, idx) in plans"
            :key="plan.id"
            :id="`row-${plan.id}`"
            :class="{ selected: plan.id === selectedPlan?.id }"
            @click="$emit('selectPlan', plan)"
          >
            <td
              v-if="idx === 0"
              :rowspan="plans.length"
              class="date-group"
              :class="{ odd: index % 2 === 0, even: index % 2 !== 0 }"
            >
              {{ index + 1 }}일차<br />({{ date }})
            </td>
            <td>{{ formatTime(plan.startTime) }} ~ {{ formatTime(plan.endTime) }}</td>
            <td>
              <a v-if="plan.placeUrl" class="place-url" :href="plan.placeUrl" target="_blank">
                {{ plan.placeName }}
              </a>
              <span v-else>{{ plan.placeName }}</span>
            </td>
            <td>{{ plan.address }}</td>
            <td>{{ plan.content }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { computed, watch, nextTick } from 'vue'

const props = defineProps({
  plans: Array,
  selectedPlan: Object,
})

const emit = defineEmits(['openUpdatePlansModal', 'selectPlan'])

watch(
  () => props.selectedPlan,
  async (plan) => {
    if (!plan) return
    await nextTick()
    const el = document.getElementById(`row-${plan.id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  },
)

const openUpdatePlansModal = () => {
  emit('openUpdatePlansModal')
}

// ✅ 날짜 기준 그룹핑
const groupedPlans = computed(() => {
  const map = new Map()
  props.plans.forEach((plan) => {
    if (!map.has(plan.date)) {
      map.set(plan.date, [])
    }
    map.get(plan.date).push(plan)
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
.plan-table {
  flex: 1;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 100%;
}

.plan-table h3 {
  margin-bottom: 15px;
  color: #0288d1;
}

.plan-table table {
  width: 100%;
  border-collapse: collapse;
}

.plan-table th,
.plan-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.plan-table th {
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
