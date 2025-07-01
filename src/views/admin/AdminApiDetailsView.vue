<template>
  <div class="admin-api-container">
    <h2 class="page-title">API 상세 정보</h2>

    <div class="control-panel-horizontal">
      <!-- 📅 날짜 선택 -->
      <div class="date-picker">
        <label>시작일시:</label>
        <input type="datetime-local" v-model="fromDate" :max="maxFromDate" />
        <label>종료일시:</label>
        <input type="datetime-local" v-model="toDate" :min="minToDate" />
      </div>
    </div>

    <!-- 📌 멤버 기준 선택 시 검색 영역 -->
    <div class="member-search">
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
      </div>
      <ul v-if="filteredMembers.length > 0 && isInputFocused" class="search-results">
        <li
          v-for="member in filteredMembers"
          :key="member.id"
          @mousedown.prevent="selectMember(member)"
        >
          ID: {{ member.id }} // Email: {{ member.email }} // Name: {{ member.name }}
        </li>
      </ul>
      <div v-if="selectedMember">✅ 선택된 멤버: {{ selectedMember.email }}</div>
    </div>

    <!-- 📋 API 상세 테이블 -->
    <section class="table-section">
      <div class="table-scroll-wrapper">
        <table class="api-table">
          <thead>
            <tr>
              <th>HTTP Method</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th>응답 시간 (ms)</th>
              <th>IP 주소</th>
              <th>User Agent</th>
              <th>요청 바디</th>
              <th>멤버</th>
              <th>요청 시각</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in apiLogs" :key="index">
              <td>{{ row.httpMethod }}</td>
              <td>{{ row.endpoint }}</td>
              <td>{{ row.statusCode }}</td>
              <td>{{ row.responseTimeMs }}</td>
              <td>{{ row.ipAddress }}</td>
              <td>{{ row.userAgent }}</td>
              <td>{{ row.requestBody || '없음' }}</td>
              <td>{{ row.member?.email }}</td>
              <td>{{ row.createdAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { triendApi } from '@/axios'

const fromDate = ref('')
const toDate = ref('')
const allMembers = ref([])
const memberKeyword = ref('')
const selectedMember = ref(null)
const isInputFocused = ref(false)
const apiLogs = ref([])

function toLocalDateTimeInputValue(date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const minToDate = computed(() => fromDate.value || '')
const maxFromDate = computed(() => toDate.value || '')

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

const fetchLogs = async () => {
  if (toDate.value < fromDate.value) return
  const params = {
    from: fromDate.value,
    to: toDate.value,
  }
  if (selectedMember.value && memberKeyword.value === selectedMember.value.email) {
    params['member-id'] = selectedMember.value.id
  }
  try {
    const { data } = await triendApi.get('/api/logs', { params })
    apiLogs.value = data
    console.log('fetchLogs 실행')
  } catch (e) {
    console.error('API 로그 불러오기 실패', e)
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
    console.error('멤버 로딩 실패', e)
  }

  fetchLogs()
})

watch([fromDate, toDate, selectedMember], ([from, to]) => {
  if (to < from) {
    alert('종료일시는 시작일시보다 늦어야 합니다.')
    toDate.value = from
    return
  }
  fetchLogs()
})
</script>

<style scoped>
.admin-api-container {
  margin-top: 60px;
  padding: 24px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 24px;
  color: #333;
}

.control-panel-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.date-picker {
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

.date-picker label {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.date-picker input[type='datetime-local'] {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.date-picker input[type='datetime-local']:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
}

.member-search {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  max-width: 360px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding-right: 28px;
}

.clear-btn {
  position: absolute;
  right: 6px;
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: red;
  font-weight: bold;
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

.table-section {
  margin-top: 20px;
}

.table-scroll-wrapper {
  overflow-x: auto;
}

.api-table {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.api-table th,
.api-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 0.95rem;
  vertical-align: top;
  word-break: break-word;
}

.api-table th {
  background-color: #f2f2f2;
  font-weight: 600;
  color: #01579b;
}
</style>
