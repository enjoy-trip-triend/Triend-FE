<template>
  <div class="plan-map-section">
    <!-- 🗕️ 날짜 선택 UI -->
    <div class="date-selector-ui">
      <label for="date-select">🗕️ 날짜 선택: </label>
      <select id="date-select" v-model="selectedDateLocal">
        <option v-for="date in uniqueDates" :key="date" :value="date">
          {{ date }}
        </option>
      </select>
    </div>

    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script>
const routeCache = new Map() // cache
</script>

<script setup>
import { onMounted, ref, watch, computed, nextTick } from 'vue'
import axios from 'axios'

const emit = defineEmits(['updateDate', 'selectPlan', 'update:selectedDate'])

const props = defineProps({
  plans: Array,
  selectedDate: String,
  selectedPlan: Object,
})

const mapContainer = ref(null)
const selectedDateLocal = ref(props.selectedDate)
const markerMap = new Map()

const uniqueDates = computed(() => {
  const dateSet = new Set(props.plans.map((p) => p.date))
  return [...dateSet].sort()
})

const filteredPlans = computed(() => {
  return props.plans.filter((p) => p.date === selectedDateLocal.value)
})

const map = ref(null)
let polylineList = []
let markers = []
let infoWindows = []

watch(
  () => props.selectedPlan,
  (plan) => {
    if (!plan) return
    const marker = markerMap.get(plan.id)
    if (marker) {
      window.kakao.maps.event.trigger(marker, 'click')
    }
  },
)

watch(
  () => props.selectedDate,
  async (val) => {
    selectedDateLocal.value = val
    await nextTick()
    loadMap()
  },
)

watch(selectedDateLocal, (newVal) => {
  emit('update:selectedDate', newVal) // ✅ 변경
  loadMap()
})

watch(
  () => props.plans,
  async () => {
    await nextTick()
    if (uniqueDates.value.length && !uniqueDates.value.includes(selectedDateLocal.value)) {
      selectedDateLocal.value = uniqueDates.value[0]
    }
    await nextTick()
    loadMap()
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  if (window.kakao && window.kakao.maps) {
    window.kakao.maps.load(() => {
      loadMap()
    })
  } else {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false&libraries=services`
    script.onload = () => {
      window.kakao.maps.load(() => {
        loadMap()
      })
    }
    document.head.appendChild(script)
  }
})

function loadMap() {
  if (!window.kakao || !window.kakao.maps) return
  const plans = filteredPlans.value
  if (plans.length === 0 || !mapContainer.value) return

  const bounds = new window.kakao.maps.LatLngBounds()
  plans.forEach((p) => bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lon)))

  map.value = new window.kakao.maps.Map(mapContainer.value, {
    center: new window.kakao.maps.LatLng(plans[0].lat, plans[0].lon),
    level: 5,
  })

  map.value.setBounds(bounds)

  drawPlansOnMap(plans)
  requestDirectionsForSegments(plans)
}

const overlayStates = ref([])

function drawPlansOnMap(plans) {
  overlayStates.value = plans.map(() => false)
  // 기존 마커, 오버레이 제거
  markers.forEach((m) => m.setMap(null))
  infoWindows.forEach((w) => w.setMap(null))
  markers = []
  infoWindows = []

  plans.forEach((plan, index) => {
    const position = new window.kakao.maps.LatLng(plan.lat, plan.lon)

    // ✅ 마커 번호 이미지 설정 (스프라이트 방식)
    const imageSrc =
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png'
    const imageSize = new window.kakao.maps.Size(36, 37)
    const spriteY = index * 46 + 10 // 최대 index = 14까지만 가능
    const imgOptions = {
      spriteSize: new window.kakao.maps.Size(36, 691),
      spriteOrigin: new window.kakao.maps.Point(0, spriteY),
      offset: new window.kakao.maps.Point(13, 37),
    }
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions)

    // ✅ 마커 생성
    const marker = new window.kakao.maps.Marker({
      position,
      map: map.value,
      image: markerImage,
    })
    markers.push(marker)
    markerMap.set(plan.id, marker)
    // ✅ 커스텀 오버레이 내용 생성
    const content = document.createElement('div')
    content.className = 'custom-overlay'
    content.innerHTML = `
      <div class="overlay-header">${index + 1}. ${plan.placeName}</div>
      <div class="overlay-body">
        <p><strong>🕒 ${plan.startTime} ~ ${plan.endTime}</strong></p>
        <p>📝 ${plan.content.replace(/\n/g, '<br>')}</p>
        <button class="close-btn">✖</button>
      </div>
    `

    // ✅ 오버레이 생성
    const overlay = new window.kakao.maps.CustomOverlay({
      content,
      position,
      yAnchor: 1, // ✅ 1이면 하단 기준점 → 마커 위에 떠야 함
      xAnchor: 0.5,
      clickable: true,
    })
    infoWindows.push(overlay)

    window.kakao.maps.event.addListener(marker, 'click', () => {
      const content = document.createElement('div')
      content.className = 'custom-overlay'
      content.innerHTML = `
    <div class="overlay-header">${index + 1}. ${plan.placeName}</div>
    <div class="overlay-body">
       <p><strong>🕒 ${plan.startTime.slice(0, 5)} ~ ${plan.endTime.slice(0, 5)}</strong></p>
      <p>📝 ${plan.content.replace(/\n/g, '<br>')}</p>
      <button class="close-btn">✖</button>
    </div>
  `

      const newOverlay = new window.kakao.maps.CustomOverlay({
        content,
        position,
        yAnchor: 1, // ✅ 1이면 하단 기준점 → 마커 위에 떠야 함
        xAnchor: 0.5,
        clickable: true,
      })

      newOverlay.setMap(map.value)

      // 닫기 버튼
      const closeBtn = content.querySelector('.close-btn')
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          newOverlay.setMap(null)
        })
      }

      emit('selectPlan', plan)
    })

    const closeBtn = content.querySelector('.close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.setMap(null)
        overlayStates.value[index] = false
      })
    }
  })
}

async function requestDirectionsForSegments(plans) {
  if (plans.length < 2) return

  polylineList.forEach((line) => line.setMap(null))
  polylineList = []

  for (let i = 0; i < plans.length - 1; i++) {
    const origin = plans[i]
    const destination = plans[i + 1]
    const cacheKey = `${origin.lon},${origin.lat}-${destination.lon},${destination.lat}`

    if (routeCache.has(cacheKey)) {
      const cachedPath = routeCache.get(cacheKey)
      drawPolyline(cachedPath)
      continue
    }

    try {
      const res = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
        headers: {
          Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}`,
        },
        params: {
          origin: `${origin.lon},${origin.lat}`,
          destination: `${destination.lon},${destination.lat}`,
          priority: 'RECOMMEND',
        },
      })

      const vertexes =
        res.data.routes?.[0]?.sections?.flatMap((section) =>
          section.roads?.flatMap((road) => road.vertexes || []),
        ) || []

      if (vertexes.length > 2) {
        const path = []
        for (let j = 0; j < vertexes.length; j += 2) {
          const lng = vertexes[j]
          const lat = vertexes[j + 1]
          path.push(new window.kakao.maps.LatLng(lat, lng))
        }

        routeCache.set(cacheKey, path)
        drawPolyline(path)
      }
    } catch (err) {
      console.error(`❌ 경로 요청 실패 [${i}]:`, err.response?.data || err.message)
    }
  }
}

function drawPolyline(path) {
  const polyline = new window.kakao.maps.Polyline({
    map: map.value,
    path,
    strokeWeight: 4,
    strokeColor: '#0288D1',
    strokeOpacity: 0.8,
    strokeStyle: 'solid',
  })

  polylineList.push(polyline)
}
</script>

<style scoped>
.plan-map-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.map-container {
  flex: 1;
  width: 100%;
  height: 100%;
}

.date-selector-ui {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.date-selector-ui select {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #bbb;
  font-size: 14px;
  background-color: #f9f9f9;
  cursor: pointer;
}

.date-selector-ui select:focus {
  outline: none;
  border-color: #0288d1;
}

.custom-overlay {
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  max-width: 250px;
  word-break: keep-all;
  white-space: normal;
  line-height: 1.5;
}

.custom-overlay .overlay-header {
  font-weight: bold;
  color: #0288d1;
  margin-bottom: 6px;
  font-size: 15px;
}

.custom-overlay .overlay-body {
  color: #444;
  font-size: 13px;
}

.custom-overlay p {
  margin: 4px 0;
}
</style>
<style>
/* scoped 삭제 */
.custom-overlay {
  background: white;
  border: 1px solid #ccc;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  max-width: 320px;
  word-break: break-word;
  line-height: 1.6;
  position: relative;
}
.custom-overlay {
  z-index: 9999 !important; /* 마커보다 위로 */
  transform: translateY(-40px); /* 추가로 위로 띄우기 */
}
.custom-overlay .overlay-header {
  font-weight: bold;
  color: #0288d1;
  margin-bottom: 8px;
  font-size: 16px;
}

.custom-overlay .overlay-body {
  color: #444;
  font-size: 14px;
}

.custom-overlay p {
  margin: 4px 0;
}

.custom-overlay .close-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #888;
  transition: color 0.2s ease;
}

.custom-overlay .close-btn:hover {
  color: #000;
}

.custom-overlay {
  writing-mode: horizontal-tb !important;
}
</style>
