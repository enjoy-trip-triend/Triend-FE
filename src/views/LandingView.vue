<template>
  <div class="landing-page">
    <!-- 이미지 레이어 -->
    <div
      v-for="(img, i) in images"
      :key="i"
      class="bg-image"
      :style="{
        backgroundImage: `url(${img})`,
        opacity: currentIndex === i ? 1 : 0,
        transform: currentIndex === i ? 'scale(1.1)' : 'scale(1)'
      }"
    ></div>

    <!-- 어두운 오버레이 -->
    <div class="overlay"></div>

    <!-- 가운데 콘텐츠 -->
    <div class="content">
      <h1 class="slogan">
        당신의 여행을 도와줄 친구 <span class="highlight">Triend</span>
      </h1>

      <!-- CTA 버튼 + 둘러보기 텍스트 -->
      <transition name="fade">
        <div v-if="!showSearch" class="cta-area">
          <button class="cta-button" @click="showSearch = true">
            지금 Triend 시작하기
          </button>
          <div class="browse-text" @click="goBrowse">
            아니요, 그냥 둘러볼게요
          </div>
        </div>
      </transition>

      <!-- 검색창 -->
      <transition name="fade">
        <div v-if="showSearch" class="search-row">
          <RegionSelector @searchRegion="onSearchRegion" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import RegionSelector from '@/components/landing/RegionSelector.vue'

const router = useRouter()

const images = [
  new URL('@/assets/img/travel1.jpg', import.meta.url).href,
  new URL('@/assets/img/travel2.jpg', import.meta.url).href,
  new URL('@/assets/img/travel3.jpg', import.meta.url).href,
  new URL('@/assets/img/travel4.jpg', import.meta.url).href
]

const showSearch = ref(false)
const currentIndex = ref(0)
let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length
  }, 6000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})

function goBrowse() {
  router.push('/')
}

// RegionSelector 결과 처리
function onSearchRegion(payload) {
  // payload = { label: "...", admCode: "46230" }
  console.log("페이로드 라벨 값: ",payload.label);
  console.log("페이로드 admCode 값: ", payload.admCode)
  router.push({
    path: '/',
    query: { place: payload.label, code: payload.admCode }
  })
}
</script>

<style scoped>
.landing-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* 배경 이미지 */
.bg-image {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: opacity 1.5s ease-in-out, transform 5s ease-in-out;
  z-index: 0;
}

/* 어두운 배경 오버레이 */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

/* 중앙 콘텐츠 */
.content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
}

/* 슬로건 */
.slogan {
  font-size: 48px;
  font-weight: 900;
  margin-bottom: 24px;
}

.highlight {
  color: #a6d7ef;
  text-shadow:
    -1px -1px 0 #000,
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
}

/* CTA 영역 */
.cta-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* CTA 버튼 */
.cta-button {
  padding: 14px 32px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  background-color: #a6d7ef;
  color: #222;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.cta-button:hover {
  background-color: #fdd835;
}

/* “둘러보기” 텍스트 */
.browse-text {
  margin-top: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  opacity: 0.85;
  transition: opacity 0.2s;
}
.browse-text:hover {
  opacity: 1;
}

/* 검색창 */
.search-row {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  max-width: 600px;
  width: 100%;
  justify-content: center;
}

.search-row input {
  flex: 1;
  padding: 14px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.search-button {
  background-color: #a6d7ef;
  color: #222;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Fade 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
