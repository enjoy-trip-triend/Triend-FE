<template>
  <div class="schedule-map-section">
    <!-- 🗕️ 날짜 선택 UI -->
    <div class="date-selector-ui">
      <label for="date-select"> 날짜 선택: </label>
      <select id="date-select" v-model="selectedDateLocal">
        <option v-for="date in uniqueDates" :key="date" :value="date">
          {{ date }}
        </option>
      </select>
    </div>
    <div class="route-toggle-ui">
      <label><input type="radio" value="original" v-model="routeMode" /> 기존 경로</label>
      <label><input type="radio" value="recommended" v-model="routeMode" @change="handleRouteChange"/> 추천 경로</label>
    </div>

    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed, nextTick } from 'vue'
import axios from 'axios'

const emit = defineEmits(['update:selectedSchedule', 'update:selectedDate', 'clearRecommendedRoute'])

const props = defineProps({
  schedules: Array,
  selectedSchedule: Object,
  recommendedRoute: Object,
})

const mapContainer = ref(null)
const selectedDateLocal = ref(props.selectedDate)
const markerMap = new Map()

/*
   uniqueDates: 전달받은 schedules에서 날짜 목록을 추출하고 중복 제거
   filteredSchedules: 선택된 날짜에 해당하는 일정만 필터링
*/

const uniqueDates = computed(() => {
  const dateSet = new Set(props.schedules.map((p) => p.date))
  return [...dateSet].sort()
})

const filteredSchedules = computed(() => {
  return props.schedules.filter((p) => p.date === selectedDateLocal.value)
})

// ✅ 경로 모드에 따라 표시할 일정 순서 결정
const displaySchedules = computed(() => {
  const filtered = filteredSchedules.value
  
  if (routeMode.value === 'recommended' && props.recommendedRoute && props.recommendedRoute.length > 0) {
    // 추천 경로가 있으면 그 순서대로 반환
    console.log('추천 경로 표시:', props.recommendedRoute)
    return props.recommendedRoute.filter(schedule => schedule.date === selectedDateLocal.value)
  } else {
    // 기존 경로 (원래 순서)
    console.log('기존 경로 표시:', filtered)
    return filtered
  }
})

const map = ref(null)
let markers = []
let infoWindows = []
let activeOverlay = null // ✅ 현재 활성화된 오버레이 추적

/* 
  경로 그리기
*/
const routeMode = ref('original')
let polylineRecommended = null
let polylineOrigin = null
const overlayStates = ref([]) // 각 오버레이의 상태를 저장하는 배열

/*
  선택된 일정이 변경될 때마다 해당 일정의 마커를 클릭하여 오버레이 표시
*/
watch(
  () => props.selectedSchedule,
  (schedule) => {
    if (!schedule) return
    const marker = markerMap.get(schedule.id)
    if (marker) {
      window.kakao.maps.event.trigger(marker, 'click')
    }
  },
)

/*
  선택된 날짜가 변경될 때마다, 해당 날짜의 일정만 표시하고 맵을 다시 로드
*/
watch(selectedDateLocal, (newDate) => {
  routeMode.value = 'original' // ✅ 경로 모드 초기화
  emit('update:selectedDate', newDate) // ✅ 변경
  emit('clearRecommendedRoute') 
  polylineRecommended = null // ✅ 추천 경로 초기화
  loadMap()
})

/* 
  플래너가 변경될 때마다, 날짜 목록을 업데이트하고 맵을 다시 로드
*/
watch(
  () => props.schedules,
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

/*
  추천 경로가 변경될 때마다 마커와 경로를 다시 그리기
*/
watch(
  () => props.recommendedRoute,
  async (val) => {
    if (val && val.length >= 2) {
      await nextTick()
      routeMode.value = 'recommended' // ✅ 추천 경로 모드로 변경
      drawSchedulesOnMap(displaySchedules.value) // 현재 표시할 일정에 따라 마커 다시 그리기
      drawRecommendedRouteFromSchedules(val) 
    }
  },
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

// routeMode watch 함수 위에 추가
function handleRouteChange(event) {

  if (event.target.value === 'recommended') {
    // 추천 경로 데이터가 없거나 polyline이 없는 경우
    if (!props.recommendedRoute || props.recommendedRoute.length === 0 || !polylineRecommended) {
      alert('추천 경로가 없습니다.')
      // 라디오 버튼을 다시 원래대로 되돌림
      routeMode.value = 'original'
      return
    }
  }
}

function loadMap() {
  if (!window.kakao || !window.kakao.maps) return
  console.log('displaySchedules:', displaySchedules.value)
  const schedules = displaySchedules.value 
  if (schedules.length === 0 || !mapContainer.value) return

  const bounds = new window.kakao.maps.LatLngBounds()
  schedules.forEach((schedule) =>
    bounds.extend(
      new window.kakao.maps.LatLng(schedule.place?.latitude, schedule.place?.longitude),
    ),
  )

  map.value = new window.kakao.maps.Map(mapContainer.value, {
    center: new window.kakao.maps.LatLng(
      schedules[0].place?.latitude,
      schedules[0].place?.longitude,
    ),
    level: 5,
  })

  map.value.setBounds(bounds)

  // ✅ 지도 클릭 시 활성화된 오버레이 닫기
  window.kakao.maps.event.addListener(map.value, 'click', () => {
    if (activeOverlay) {
      activeOverlay.setMap(null)
      activeOverlay = null
    }
  })

  drawSchedulesOnMap(schedules)
  
  // ✅ 경로 그리기
  drawOriginalRouteFromSchedules(filteredSchedules.value) // 원본 일정으로 기존 경로 그리기
  drawRecommendedRouteFromSchedules(props.recommendedRoute?.filter(s => s.date === selectedDateLocal.value) || [])
}

// ✅ SVG로 커스텀 번호 마커 생성 함수
function createCustomNumberMarker(number, backgroundColor = '#0288D1') {
  const svg = `
    <svg width="36" height="42" viewBox="0 0 36 42" xmlns="http://www.w3.org/2000/svg">
      <!-- 마커 모양 (물방울 형태) -->
      <path d="M18 0C8.1 0 0 8.1 0 18c0 9.9 18 24 18 24s18-14.1 18-24C36 8.1 27.9 0 18 0z" fill="${backgroundColor}" stroke="white" stroke-width="2"/>
      <!-- 번호 표시용 원 -->
      <circle cx="18" cy="18" r="12" fill="white"/>
      <!-- 번호 텍스트 -->
      <text x="18" y="23" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${backgroundColor}">${number}</text>
    </svg>
  `;
  
  // SVG를 base64로 인코딩하여 data URI 생성
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function drawSchedulesOnMap(schedules) {
  overlayStates.value = schedules.map(() => false)

  // 기존 마커, 오버레이 제거
  console.log('기존 마커 제거', markers)
  console.log('맵: ', map.value)
  // markers.forEach((m) => m.setMap(null))
//   markers.forEach((m, idx) => {
//   try {
//     const currentMap = m.getMap?.()
//     console.log(`🔎 Marker [${idx}] 현재 연결된 지도:`, currentMap)

//     if (currentMap) {
//       m.setMap(null)
//     } else {
//       console.warn(`⚠️ Marker [${idx}]는 이미 map과 연결되지 않았습니다.`)
//     }
//   } catch (err) {
//     console.error(`❌ Marker [${idx}] 제거 중 오류`, err)
//   }
// })
  infoWindows.forEach((w) => w.setMap(null))
  
  // ✅ 활성화된 오버레이도 제거
  if (activeOverlay) {
    activeOverlay.setMap(null)
    activeOverlay = null
  }
  
  markers = []
  infoWindows = []
  markerMap.clear() // ✅ 마커 맵 초기화

  schedules.forEach((schedule, index) => {
    const position = new window.kakao.maps.LatLng(
      schedule.place?.latitude,
      schedule.place?.longitude,
    )

    // ✅ SVG 커스텀 마커 생성 (경로 모드에 따라 색깔 변경)
    const isRecommendedMode = routeMode.value === 'recommended'
    
    const markerNumber = index + 1
    const backgroundColor = isRecommendedMode ? '#d32f2f' : '#0288D1' // 빨간색 : 파란색
    const headerColor = isRecommendedMode ? '#d32f2f' : '#0288d1'
    const overlayBorderColor = isRecommendedMode ? '#f87171' : '#60a5fa'
    
    // SVG 커스텀 마커 생성
    const imageSrc = createCustomNumberMarker(markerNumber, backgroundColor)
    const imageSize = new window.kakao.maps.Size(36, 42)
    const imgOptions = {
      offset: new window.kakao.maps.Point(18, 42), // 마커의 뾰족한 끝 부분이 좌표에 맞도록
    }
    
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions)

    // ✅ 마커 생성
    const marker = new window.kakao.maps.Marker({
      position,
      map: map.value,
      image: markerImage,
    })
    markers.push(marker)
    markerMap.set(schedule.id, marker)

    window.kakao.maps.event.addListener(marker, 'click', () => {
      // ✅ 기존 활성화된 오버레이가 있으면 먼저 제거
      if (activeOverlay) {
        activeOverlay.setMap(null)
        activeOverlay = null
      }
      
      const content = document.createElement('div')
      content.className = isRecommendedMode ? 'custom-overlay recommended' : 'custom-overlay original'
      
      // 인라인 스타일로 배경색과 기본 스타일 강제 적용
      content.style.cssText = `
        background: #ffffff !important;
        border: 2px solid ${overlayBorderColor} !important;
        padding: 16px 20px !important;
        border-radius: 12px !important;
        font-size: 14px !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1) !important;
        max-width: 280px !important;
        word-break: break-word !important;
        line-height: 1.5 !important;
        position: relative !important;
        z-index: 9999 !important;
        transform: translateY(-50px) !important;
        writing-mode: horizontal-tb !important;
      `
      
      content.innerHTML = `
        <div class="overlay-header" style="color: ${headerColor}; font-weight: 700; margin-bottom: 12px; font-size: 16px; padding-right: 30px; position: relative;">
          ${schedule.place?.placeName}
        </div>
        <div class="overlay-body" style="color: #374151; font-size: 13px; line-height: 1.6;">
          <p style="margin: 8px 0; display: flex; align-items: flex-start; gap: 8px;">
            <strong style="color: #1f2937; font-weight: 600; min-width: fit-content;">🕒 ${schedule.startTime.slice(0, 5)}</strong>
          </p>
          <p style="margin: 8px 0; display: flex; align-items: flex-start; gap: 8px;">
            <strong style="color: #1f2937; font-weight: 600; min-width: fit-content;">📝</strong> 
            <span>${schedule.content.replace(/\n/g, '<br>')}</span>
          </p>
          <button class="close-btn" style="
            position: absolute; 
            top: 8px; 
            right: 8px; 
            background: #f3f4f6 !important; 
            border: 1px solid #d1d5db !important; 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            font-size: 12px; 
            cursor: pointer; 
            color: #6b7280; 
            transition: all 0.2s ease; 
            display: flex; 
            align-items: center; 
            justify-content: center;
          ">✖</button>
        </div>
      `
      
      // 말풍선 꼬리 부분 추가
      const tail = document.createElement('div')
      tail.style.cssText = `
        position: absolute !important;
        bottom: -10px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: 0 !important;
        height: 0 !important;
        border-left: 10px solid transparent !important;
        border-right: 10px solid transparent !important;
        border-top: 10px solid #ffffff !important;
        z-index: 1 !important;
      `
      content.appendChild(tail)
      
      const tailBorder = document.createElement('div')
      tailBorder.style.cssText = `
        position: absolute !important;
        bottom: -12px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: 0 !important;
        height: 0 !important;
        border-left: 12px solid transparent !important;
        border-right: 12px solid transparent !important;
        border-top: 12px solid ${overlayBorderColor} !important;
        z-index: 0 !important;
      `
      content.appendChild(tailBorder)

      const newOverlay = new window.kakao.maps.CustomOverlay({
        content,
        position,
        yAnchor: 1, // 오버레이 하단이 마커 위치에 맞도록 (CSS transform으로 위치 조정)
        xAnchor: 0.5,
        clickable: true,
      })

      // ✅ 새로운 오버레이를 활성화된 오버레이로 설정
      activeOverlay = newOverlay
      newOverlay.setMap(map.value)

      // ✅ 닫기 버튼 이벤트 및 호버 효과 (이벤트 버블링 방지)
      const closeBtn = content.querySelector('.close-btn')
      if (closeBtn) {
        closeBtn.addEventListener('click', (event) => {
          event.stopPropagation() // ✅ 이벤트 버블링 방지
          event.preventDefault()  // ✅ 기본 동작 방지
          
          // ✅ 확실하게 오버레이 제거
          if (activeOverlay) {
            activeOverlay.setMap(null)
            activeOverlay = null
          }
        })
        
        // 호버 효과 추가
        closeBtn.addEventListener('mouseenter', () => {
          closeBtn.style.background = '#ef4444 !important'
          closeBtn.style.color = 'white !important'
          closeBtn.style.borderColor = '#ef4444 !important'
        })
        
        closeBtn.addEventListener('mouseleave', () => {
          closeBtn.style.background = '#f3f4f6 !important'
          closeBtn.style.color = '#6b7280 !important'
          closeBtn.style.borderColor = '#d1d5db !important'
        })
      }

      emit('update:selectedSchedule', schedule)
    })
  })
}

// ✅ 경로 모드 변경 시 마커도 다시 그리기
watch(routeMode, async () => {
  if(polylineRecommended === null) return
  await nextTick()     // DOM 업데이트 완료 후 실행
  
  // ✅ 경로 모드 변경 시 활성화된 오버레이 제거
  if (activeOverlay) {
    activeOverlay.setMap(null)
    activeOverlay = null
  }
  
  // 마커 다시 그리기 (새로운 순서로)
  const schedules = displaySchedules.value
  if (schedules.length > 0) {
    drawSchedulesOnMap(schedules)
  }

  updateVisiblePolylines()
})

// 4. 기존 경로 그리기 함수들도 수정
async function drawOriginalRouteFromSchedules(schedules) {
  if (!window.kakao || schedules.length < 2) return

  // 기존 polyline 제거
  if (polylineOrigin !== null) {
    polylineOrigin.setMap(null)
  }

  const origin = schedules[0]
  const destination = schedules[schedules.length - 1]
  const waypoints = schedules.slice(1, -1).map((s, idx) => ({
    name: s.place?.placeName || `WP${idx}`,
    x: s.place?.longitude?.toString(),
    y: s.place?.latitude?.toString(),
  }))

  const vertexes = await fetchRouteFromWaypoints(origin, destination, waypoints)
  if (!vertexes || vertexes.length < 2) return

  const path = []
  for (let i = 0; i < vertexes.length; i += 2) {
    const lng = vertexes[i]
    const lat = vertexes[i + 1]
    path.push(new window.kakao.maps.LatLng(lat, lng))
  }

  drawPolyline(path, false)
  
  // 현재 모드가 original이면 바로 표시
  if (routeMode.value === 'original') {
    updateVisiblePolylines()
  }
}
async function drawRecommendedRouteFromSchedules(routeSchedules) {
  if (!window.kakao || !routeSchedules || routeSchedules.length < 2) return

  // 기존 polyline 제거
  if (polylineRecommended !== null) {
    polylineRecommended.setMap(null)
  }
  
  const origin = routeSchedules[0]
  const destination = routeSchedules[routeSchedules.length - 1]
  const waypoints = routeSchedules.slice(1, -1).map((s, idx) => ({
    name: s.place?.placeName || `WP${idx}`,
    x: s.place?.longitude?.toString(),
    y: s.place?.latitude?.toString(),
  }))

  const vertexes = await fetchRouteFromWaypoints(origin, destination, waypoints)
  if (!vertexes || vertexes.length < 2) return

  const path = []
  for (let i = 0; i < vertexes.length; i += 2) {
    const lng = vertexes[i]
    const lat = vertexes[i + 1]
    path.push(new window.kakao.maps.LatLng(lat, lng))
  }

  drawPolyline(path, true)
  
  // 현재 모드가 recommended면 바로 표시
  if (routeMode.value === 'recommended') {
    updateVisiblePolylines()
  }
}
async function fetchRouteFromWaypoints(origin, destination, waypoints) {
  try {
    const response = await axios.post(
      'https://apis-navi.kakaomobility.com/v1/waypoints/directions',
      {
        origin: {
          name: origin.place?.placeName || '출발지',
          x: origin.place?.longitude?.toString(),
          y: origin.place?.latitude?.toString(),
        },
        destination: {
          name: destination.place?.placeName || '목적지',
          x: destination.place?.longitude?.toString(),
          y: destination.place?.latitude?.toString(),
        },
        waypoints,
        priority: 'RECOMMEND',
        car_fuel: 'GASOLINE',
        car_hipass: false,
        alternatives: false,
        road_details: false,
        summary: false,
      },
      {
        headers: {
          Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data.routes?.[0]?.sections?.flatMap((section) =>
      section.roads?.flatMap((road) => road.vertexes || []),
    ) || []
  } catch (err) {
    console.error('경로 API 호출 실패:', err.response?.data || err.message)
    return null
  }
}

// 1. 전역 변수로 path 데이터를 저장
let originalPath = []
let recommendedPath = []

// 2. drawPolyline 함수 수정
function drawPolyline(path, isRecommended = false) {
  // path 데이터를 전역 변수에 저장
  if (isRecommended) {
    recommendedPath = [...path]
  } else {
    originalPath = [...path]
  }

  const polyline = new window.kakao.maps.Polyline({
    map: null,
    path,
    strokeWeight: 4,
    strokeColor: isRecommended ? '#d32f2f' : '#0288D1',
    strokeOpacity: 0.8,
    strokeStyle: 'solid',
  })

  if (isRecommended) polylineRecommended = polyline
  else polylineOrigin = polyline
}

function updateVisiblePolylines() {

  // 기존 polyline들 제거
  if (polylineOrigin) {
    polylineOrigin.setMap(null)
  }
  if (polylineRecommended) {
    polylineRecommended.setMap(null)
  }

  // 현재 모드에 따라 새로운 polyline 생성 및 표시
  if (routeMode.value === 'original' && originalPath.length > 0) {

    polylineOrigin = new window.kakao.maps.Polyline({
      map: map.value,
      path: originalPath,
      strokeWeight: 4,
      strokeColor: '#0288D1',
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
    })
  } else if (routeMode.value === 'recommended' && recommendedPath.length > 0) {

    polylineRecommended = new window.kakao.maps.Polyline({
      map: map.value,
      path: recommendedPath,
      strokeWeight: 4,
      strokeColor: '#d32f2f',
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
    })
  }
}
</script>

<style scoped>
.schedule-map-section {
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

/* 오버레이 기본 스타일 (인라인 스타일이 메인이므로 백업용) */
.custom-overlay {
  background: #ffffff !important;
  border: 2px solid #e5e7eb !important;
  padding: 16px 20px !important;
  border-radius: 12px !important;
  font-size: 14px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1) !important;
  max-width: 280px !important;
  word-break: break-word !important;
  line-height: 1.5 !important;
  position: relative !important;
  z-index: 9999 !important;
  transform: translateY(-50px) !important;
  writing-mode: horizontal-tb !important;
}

.route-toggle-ui {
  position: absolute;
  top: 70px;
  right: 20px;
  background: white;
  border: 1px solid #ccc;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  gap: 10px;
  z-index: 10;
}
</style>