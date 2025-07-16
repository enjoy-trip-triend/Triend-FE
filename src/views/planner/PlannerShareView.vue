<template>
  <div class="planner-share-view">
    <h2>공유된 플래너 보기</h2>

    <div v-if="!joined" class="password-section">
      <label>비밀번호를 입력하세요</label>
      <div class="input-group">
        <input v-model="password" type="password" placeholder="비밀번호 입력" @keyup.enter="verifyAndFetchPlanner" />
        <button @click="verifyAndFetchPlanner">확인</button>
      </div>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>

    <div v-else class="planner-info">
      <div class="participation-section">
        <template v-if="isLoggedIn && isEditable">
          <p>✏️ 플랜 수정이 가능합니다.</p>
        </template>

        <template v-else-if="isLoggedIn && !isEditable">
          <p>✅ 플랜에 참여하고 함께 수정해보세요!</p>
          <button @click="joinPlanner">참여하기</button>
        </template>

        <template v-else>
          <p>🔒 로그인 후 더 많은 서비스를 경험해보세요!</p>
          <button @click="goLogin">로그인 하기</button>
        </template>
      </div>

      <!-- 편집자 목록 출력 -->
      <div class="editor-info" v-if="editors.length > 0">
        <h4>✍️ 현재 편집 중인 사용자</h4>
        <ul>
          <li
            v-for="editor in editors"
            :key="editor.sessionId"
            :class="{ me: isMe(editor.sessionId) }"
          >
            {{ editor.name }}
            <span v-if="isMe(editor.sessionId)"> (me)</span>
          </li>
        </ul>
      </div>

      <h3>{{ planner.name }}</h3>
      <div class="planner-meta">
        <div class="meta-item">
          <span class="meta-label">지역:</span>
          <span class="meta-value">{{ planner.location }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">날짜:</span>
          <span class="meta-value">{{ planner.startDay }} ~ {{ planner.endDay }}</span>
        </div>
      </div>

      <!-- Map / Table / Card 뷰 -->
      <div class="planner-sections">
        <div class="left-section">
          <ScheduleTableSection
            v-if="currentView === 'table'"
            :isEditable="isEditable"
            :schedules="schedules"
            :selectedSchedule="selectedSchedule"
            @selectSchedule="selectedSchedule = $event"
            @openUpdateSchedulesModal="handleOpenUpdateSchedulesModal"
          />

          <ScheduleMapSection
            v-if="currentView === 'map' && schedules.length > 0"
            :schedules="schedules"
            :selectedSchedule="selectedSchedule"
            @selectSchedule="selectedSchedule = $event"
            v-model:selectedDate="selectedDate"
          />

          <button class="circle-toggle-btn" @click="toggleView">
            <span v-if="currentView === 'table'">🗺</span>
            <span v-else>📋</span>
          </button>
        </div>

        <div class="right-section">
          <ScheduleCardSection
            :schedules="schedules"
            :selectedSchedule="selectedSchedule"
            @selectSchedule="selectedSchedule = $event"
            v-model:selectedDate="selectedDate"
          />
        </div>
      </div>

      <UpdatePlanModal
        v-if="updateSchedulesVisible"
        :schedules="schedules"
        :planner="planner"
        @close="updateSchedulesVisible = false"
        @updateSchedules="handleSchedulesUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { triendApi } from '@/axios'

import { sendScheduleUpdate, connectWebSocket, disconnectWebSocket } from '@/utils/websocket'
import ScheduleTableSection from '@/components/planner/schedule/ScheduleTableSection.vue'
import ScheduleMapSection from '@/components/planner/schedule/ScheduleMapSection.vue'
import ScheduleCardSection from '@/components/planner/schedule/ScheduleCardSection.vue'
import UpdatePlanModal from '@/components/planner/schedule/UpdateScheduleModal.vue'

const route = useRoute()
const router = useRouter()
const plannerId = route.params.plannerId
const secretCode = route.params.secretCode

const password = ref('')
const planner = ref({})
const isEditable = ref(false)
const schedules = ref([])
const joined = ref(false)
const errorMsg = ref('')
const updateSchedulesVisible = ref(false)
const isLoggedIn = computed(() => {
  const memberStr = localStorage.getItem('member')
  if (!memberStr) return false
  try {
    const member = JSON.parse(memberStr)
    return member.isLoggedIn === true
  } catch (e) {
    return false
  }
})
const mySessionId = ref('');

const isMe = (sessionId: string) => {
  if (!sessionId || !mySessionId.value) return false;
  return sessionId.trim() === mySessionId.value.trim();
};

// 추가된 상태
const selectedSchedule = ref(null)
const selectedDate = ref('')
const currentView = ref('table')
const editors = ref([])

const toggleView = () => {
  if (currentView.value === 'table' && (!schedules.value || schedules.value.length === 0)) {
    alert('플랜이 없어서 지도를 표시할 수 없습니다.')
    return
  }
  currentView.value = currentView.value === 'table' ? 'map' : 'table'
}

const handleScheduleUpdate = (schedule) => {
  if (schedule.action === 'UPDATE') {
    const idx = schedules.value.findIndex(p => p.id === schedule.id)
    if (idx !== -1) {
      schedules.value[idx] = { ...schedules.value[idx], ...schedule }
    } else {
      schedules.value.push(schedule)
    }
  } else if (schedule.action === 'DELETE') {
    schedules.value = schedules.value.filter(p => p.id !== schedule.scheduleId)
  }
}

const handleEditorUpdate = (editorList) => {
  console.log('[📥 편집자 목록 수신]', editorList)
  editors.value = editorList
}

const verifyAndFetchPlanner = async () => {
  try {
    await triendApi({
      url: `/api/planners/${plannerId}/share/${secretCode}/verify`,
      method: 'post',
      data: { password: password.value },
    })

    const response = await triendApi({
      url: `/api/planners/${plannerId}/share/${secretCode}`,
      method: 'get',
    })

    planner.value = response.data.planner
    schedules.value = response.data.schedules
    isEditable.value = response.data.isEditable
    joined.value = true

    sessionStorage.setItem('plannerId', plannerId)
    connectWebSocket(handleScheduleUpdate, handleEditorUpdate, (sessionId) => {
      mySessionId.value = sessionId
    })
  } catch (err) {
    console.error('비밀번호 검증 실패', err)
    alert('비밀번호가 틀렸거나 잘못된 링크입니다.')
  }
}

const joinPlanner = async () => {
  try {
    await triendApi({
      url: `/api/planners/${plannerId}/share/${secretCode}/join`,
      method: 'post',
    })
    alert('참여가 완료되었습니다!')
    await verifyAndFetchPlanner()
  } catch (err) {
    console.error('참여 실패', err)
    alert('참여 중 오류가 발생했습니다.')
  }
}

const goLogin = () => {
  router.push({ name: 'LoginView' })
}

const handleOpenUpdateSchedulesModal = () => {
  updateSchedulesVisible.value = true
}

const handleSchedulesUpdate = (updatedSchedules) => {
  schedules.value = updatedSchedules
  updatedSchedules.forEach(schedule => {
    sendScheduleUpdate(schedule)
  })
}

onUnmounted(() => {
  disconnectWebSocket()
})

</script>

<style scoped>
.planner-share-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.planner-info {
  margin-top: 20px;
  background-color: #f9fbfd;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.participation-section {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 10px;
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
  text-align: center;
  align-items: center;
  justify-content: center;
}

.participation-section p {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
}

.participation-section button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.participation-section button:hover {
  background-color: #135ba1;
}

.password-section {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(200, 200, 200, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.password-section label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.input-group {
  display: flex;
  gap: 10px;
}

.input-group input[type='password'] {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.input-group button {
  padding: 12px 20px;
  font-size: 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.input-group button:hover {
  background-color: #135ba1;
}

.error-msg {
  margin-top: 8px;
  color: red;
  font-size: 14px;
}

.planner-info {
  margin-top: 20px;
}

.planner-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  gap: 8px;
}

.meta-label {
  font-weight: bold;
  color: #555;
}

.meta-value {
  color: #333;
}


.planner-sections {
  display: flex;
  width: 100%;
  gap: 20px;
}

.left-section {
  flex: 7;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f9fbfd;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.circle-toggle-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #0288d1;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s, transform 0.2s;
}

.circle-toggle-btn:hover {
  background-color: #015f9b;
  transform: scale(1.1);
}

.editor-info {
  background-color: #fffbe6;
  border: 1px solid #ffe082;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.editor-info h4 {
  font-weight: bold;
  margin-bottom: 8px;
}

.editor-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.editor-info li {
  font-size: 14px;
  color: #333;
}

.me {
  font-weight: bold;
  color: #1976d2;
}

</style>
