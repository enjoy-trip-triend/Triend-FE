<template>
  <div class="admin-stats-container">
    <h2 class="page-title">API 통계 대시보드</h2>

    <div class="control-panel-horizontal">
      <!-- 통계 유형 선택 -->
      <div class="option-picker">
        <label>통계 유형:</label>
        <select v-model="selectedStat">
          <option value="counts">API별 호출 횟수</option>
          <option value="status-rate">API별 응답 성공/실패율</option>
          <option value="latency">API별 평균 응답 속도</option>
        </select>
      </div>

      <!-- 📅 날짜 선택 -->
      <div class="date-picker">
        <label>시작일시:</label>
        <input type="datetime-local" v-model="fromDate" :max="maxFromDate" />
        <label>종료일시:</label>
        <input type="datetime-local" v-model="toDate" :min="minToDate" />
      </div>
    </div>

    <!-- 📌 멤버 검색 영역 (counts일 경우에만 표시) -->
    <div v-if="selectedStat === 'counts'" class="member-search">
      <label>멤버 검색:</label>
      <div class="input-wrapper">
        <input
          type="text"
          v-model="memberKeyword"
          placeholder="이메일 검색"
          @focus="isInputFocused = true"
          @blur="handleBlur"
        />
        <button v-if="memberKeyword" @click="clearMember" class="clear-btn">✕</button>
        <ul v-if="filteredMembers.length > 0 && isInputFocused" class="search-results">
          <li
            v-for="member in filteredMembers"
            :key="member.id"
            @mousedown.prevent="selectMember(member)"
          >
            ID: {{ member.id }} // Email: {{ member.email }} // Name: {{ member.name }}
          </li>
        </ul>
      </div>
      <div v-if="selectedMember">✅ 선택된 멤버: {{ selectedMember.email }}</div>
    </div>

    <!-- 📈 차트 -->
    <section class="stat-section">
      <h3>{{ statTitle }}</h3>
      <BarChart :data="chartData" :label="chartLabel" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BarChart from '@/components/admin/BarChart.vue'
import { triendApi } from '@/axios/index.js'

const fromDate = ref('')
const toDate = ref('')
const selectedStat = ref('counts')
const chartData = ref([])
const chartLabel = ref('')
const isInputFocused = ref(false)

function toLocalDateTimeInputValue(date) {
  const offset = date.getTimezoneOffset() * 60000
  const localISOTime = new Date(date.getTime() - offset).toISOString()
  return localISOTime.slice(0, 16)
}

const statTitle = computed(() => {
  switch (selectedStat.value) {
    case 'counts':
      return '1. API별 호출 횟수'
    case 'status-rate':
      return '2. API 응답 성공률'
    case 'latency':
      return '3. API 평균 응답 속도 (ms)'
    default:
      return ''
  }
})

const allMembers = ref([])
const memberKeyword = ref('')
const selectedMember = ref(null)

const filteredMembers = computed(() =>
  allMembers.value.filter((m) => m.email.toLowerCase().includes(memberKeyword.value.toLowerCase()))
)

const selectMember = (member) => {
  selectedMember.value = member
  memberKeyword.value = member.email
  isInputFocused.value = false
}

const clearMember = () => {
  selectedMember.value = null
  memberKeyword.value = ''
}

const handleBlur = () => {
  setTimeout(() => {
    isInputFocused.value = false
  }, 150)
}

const fetchStats = async () => {
  try {
    const params = {
      from: fromDate.value,
      to: toDate.value,
    }

    let url = `/api/logs/stats/counts`
    if (selectedStat.value === 'counts') {
      if (selectedMember.value && memberKeyword.value === selectedMember.value.email) {
        params['member-id'] = selectedMember.value.id
      }
    } else if (selectedStat.value === 'status-rate') {
      url = `/api/logs/stats/status-rate`
    } else if (selectedStat.value === 'latency') {
      url = `/api/logs/stats/latency`
    }

    const { data } = await triendApi.get(url, { params })

    chartData.value = data.map((item) => ({
      endpoint: item.endpoint,
      httpMethod: item.httpMethod,
      value:
        selectedStat.value === 'status-rate'
          ? (item.successRate ?? 0)
          : selectedStat.value === 'latency'
            ? (item.averageLatencyMs ?? 0)
            : item.count,
    }))

    chartLabel.value =
      selectedStat.value === 'counts'
        ? '호출 횟수'
        : selectedStat.value === 'status-rate'
          ? '성공률 (%)'
          : '평균 응답시간 (ms)'
  } catch (err) {
    console.error('API 통계 불러오기 실패', err)
  }
}

onMounted(async () => {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  fromDate.value = toLocalDateTimeInputValue(oneHourAgo)
  toDate.value = toLocalDateTimeInputValue(now)

  try {
    const { data } = await triendApi.get('/api/member')
    allMembers.value = data
  } catch (e) {
    console.error('전체 멤버 로딩 실패', e)
  }

  fetchStats()
})

const minToDate = computed(() => fromDate.value || '')
const maxFromDate = computed(() => toDate.value || '')

watch([fromDate, toDate, selectedStat, selectedMember], ([from, to]) => {
  if (to < from) {
    alert('종료일시는 시작일시보다 늦어야 합니다.')
    toDate.value = from
    return
  }
  fetchStats()
})
</script>

<style scoped>
.admin-stats-container {
  margin-top: 60px;
  padding: 24px;
  overflow-y: auto;
}

.page-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
}

.control-panel-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.date-picker,
.option-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  padding: 10px 14px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  font-size: 0.95rem;
}

.date-picker label,
.option-picker label {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.date-picker input[type='datetime-local'],
.option-picker select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.date-picker input[type='datetime-local']:focus,
.option-picker select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
}

.option-picker select {
  cursor: pointer;
  background-color: #fafafa;
}

.option-picker select:hover,
.date-picker input[type='datetime-local']:hover {
  border-color: #1976d2;
}

.stat-section {
  margin-top: 20px;
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.stat-section h3 {
  margin-bottom: 12px;
  color: #01579b;
}

.member-search {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 400px;
}

.member-search input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.search-results {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
}

.search-results li {
  padding: 8px;
  cursor: pointer;
}
.search-results li:hover {
  background-color: #f0f0f0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  flex-direction: column;
}

.input-wrapper input {
  width: 100%;
  padding-right: 28px;
}

.clear-btn {
  position: absolute;
  right: 6px;
  top: 6px;
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
}

.search-results li {
  padding: 8px;
  cursor: pointer;
}

.search-results li:hover {
  background-color: #f0f0f0;
}

.clear-btn {
  position: absolute;
  right: 6px;
  top: 6px;
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: red;
  font-weight: bold;
}
</style>
