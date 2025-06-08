<template>
  <div>
    <!-- 챗봇 열기 버튼 -->
    <button class="chatbot-button" @click="handleChatbotOpen">💬</button>

    <!-- 챗봇 창 -->
    <div class="chatbot-window" v-show="isOpen">
      <div class="chatbot-header">
        <span>여행 챗봇</span>
        <button class="close-chatbot" @click="hideChatbot">✕</button>
      </div>
      <div class="chatbot-messages" ref="messages">
        <div class="bot-message message-bubble">
          안녕하세요! 여행 계획 도우미입니다 😊
        </div>
        <div
          v-for="(msg, i) in chatHistory"
          :key="i"
          :class="[msg.type + '-message', 'message-bubble']"
          v-html="msg.text"
        ></div>
        <div v-if="loading" class="bot-message message-bubble loading">
          응답 중
        </div>
      </div>

      <div class="chatbot-input">
        <input
          type="text"
          v-model="input"
          @keydown.enter.exact.prevent="sendMessage"
          placeholder="여행 관련 질문을 입력하세요..."
        />
        <button class="send-chat" @click="sendMessage">➤</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useMemberStore } from '@/stores/member'
import { useRecommendStore } from '@/stores/recommend.js'
import { triendApi } from '@/axios'

const memberStore = useMemberStore()
const router = useRouter()
const recommendStore = useRecommendStore()

const isOpen = ref(false)
const input = ref('')
const chatHistory = ref([])
const loading = ref(false)
const messages = ref(null)

function handleChatbotOpen() {
  if (!memberStore.isLoggedIn) {
    alert('로그인 후 이용 가능한 기능입니다.')
    router.push({ name: 'LoginView' })
  } else {
    isOpen.value = true
  }
}

function hideChatbot() {
  isOpen.value = false
}

async function sendMessage() {
  // 추천 스토어 초기화
  recommendStore.clear()

  const userText = input.value.trim()
  if (!userText) return

  // 사용자 메시지 추가
  chatHistory.value.push({ type: 'user', text: userText })
  input.value = ''
  loading.value = true
  await nextTick(scrollToBottom)

  let aiReply = ''
  try {
    const res = await triendApi.post(
      '/api/ai/chat',
      { message: userText },
      { responseType: 'text', timeout: 60000 }
    )
    aiReply = DOMPurify.sanitize(marked.parse(res.data))
    chatHistory.value.push({ type: 'bot', text: aiReply })
  } catch {
    chatHistory.value.push({ type: 'bot', text: '⚠️ 오류가 발생했습니다.' })
  } finally {
    loading.value = false
    await nextTick(scrollToBottom)
  }

  // MBTI 기반 추천
  if (/mbti/.test(userText.toLowerCase())) {
    try {
      const { data: dtos } = await triendApi.get(
        '/api/ai/recommend/places/mbti'
      )
      const list = await fetchByKakaoId(dtos)
      recommendStore.setList(list)
    } catch (e) {
      console.error('MBTI 추천 API 오류:', e)
      recommendStore.clear()
    }
  }

  // 성향 기반 추천
  if (/성향/.test(userText) || /character/i.test(userText)) {
    try {
      const { data: dtos } = await triendApi.get(
        '/api/ai/recommend/places/characters'
      )
      const list = await fetchByKakaoId(dtos)
      recommendStore.setList(list)
    } catch (e) {
      console.error('성향 추천 API 오류:', e)
      recommendStore.clear()
    }
  }
}

async function fetchByKakaoId(data) {
  const REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY
  return Promise.all(
    data.map(async place => {
      try {
        const query = encodeURIComponent(place.address || place.locationName)
        const res = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}`,
          { headers: { Authorization: `KakaoAK ${REST_KEY}` } }
        )
        const kakaoData = await res.json()
        const docs = kakaoData.documents || []

        if (docs.length) {
          const info = docs.find(d => d.id === place.kakaoId) || docs[0]
          return {
            ...place,
            phone:            info.phone || '',
            place_url:        info.place_url || '',
            categoryName:     info.category_name || '',
            road_address_name: info.road_address_name || info.address_name || place.address,
            lat:              info.y || place.lat,
            lon:              info.x || place.lon
          }
        }
      } catch (e) {
        console.warn('Kakao API 조회 실패', place, e)
      }
      return {
        ...place,
        phone:            '',
        place_url:        '',
        categoryName:     '',
        road_address_name: place.address,
        lat:              place.lat,
        lon:              place.lon
      }
    })
  )
}

function scrollToBottom() {
  if (messages.value) {
    messages.value.scrollTop = messages.value.scrollHeight
  }
}
</script>

<style scoped>
.chatbot-button {
  position: fixed;
  bottom: 100px;
  right: 40px;
  width: 60px;
  height: 60px;
  background-color: #0288d1;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 28px;
  z-index: 1000;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.chatbot-window {
  position: fixed;
  bottom: 180px;
  right: 40px;
  width: 480px;
  max-width: 95vw;
  height: 520px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
}

.chatbot-header {
  background-color: #0288d1;
  color: white;
  padding: 12px 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chatbot-messages {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  background-color: #f0f0f0;
}

.message-bubble {
  position: relative;
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.user-message {
  align-self: flex-end;
  background-color: #e1f5fe;
  color: #01579b;
}

.user-message::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: -8px;
  border-width: 8px 0 0 8px;
  border-style: solid;
  border-color: #e1f5fe transparent;
}

.bot-message {
  align-self: flex-start;
  background-color: #fff9c4;
  color: #5d4037;
}

.bot-message::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: -8px;
  border-width: 8px 8px 0 0;
  border-style: solid;
  border-color: #fff9c4 transparent;
}

.chatbot-input {
  display: flex;
  align-items: center;
  border-top: 1px solid #ddd;
  padding: 12px;
}

.chatbot-input input {
  flex: 1;
  min-width: 0;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  outline: none;
  border-radius: 20px;
  background-color: #ffffff;
}

.chatbot-input button {
  margin-left: 8px;
  background-color: #0288d1;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 50%;
  cursor: pointer;
}

.bot-message.loading::after {
  content: '   •';
  animation: loadingDots 1s infinite steps(3, end);
}

@keyframes loadingDots {
  0% { content: '   •'; }
  33% { content: '   ••'; }
  66% { content: '   •••'; }
  100% { content: '   •'; }
}
</style>
