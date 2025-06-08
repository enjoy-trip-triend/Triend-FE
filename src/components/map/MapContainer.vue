<template>
  <div class="map-continer">
    <div id="map" ref="mapRef"></div>
    <div class="map-controls">
      <MyPlaceButton v-if="kakaoMap" :map="kakaoMap" />
      <HotPlaceButton v-if="kakaoMap" :map="kakaoMap" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
// import { triendApi } from '@/axios'
import { usePlaceSearch } from '@/utils/kakao/usePlaceSearch'
import { useMemberStore } from '@/stores/member'
import MyPlaceButton from '@/components/myplace/MyPlaceButton.vue'
import HotPlaceButton from '@/components/hotplace/HotPlaceButton.vue'
import axios from 'axios'

const router = useRouter()
const memberStore = useMemberStore()

const props = defineProps({
  searchQuery: String,
  adminCode: String,
})

let boundaryPolygons = []
watch(
  () => props.adminCode,
  async (newCode) => {
    console.log('⚙️ adminCode changed → drawBoundary:', newCode)
    if (newCode) {
      await drawBoundary(newCode)
    }
  },
)

// 2) drawBoundary 함수 추가
async function drawBoundary(code) {
  // 1) 데이터셋 결정: 2자리면 시·도, 5자리면 시·군·구
  const isProvince = code.length <= 2
  const dataset = isProvince ? 'LT_C_ADSIDO_INFO' : 'LT_C_ADSIGG_INFO'
  const filterKey = isProvince
    ? 'ctprvn_cd' // 시·도 코드 속성명
    : 'sig_cd' // 시·군·구 코드 속성명

  // 2) URL 조립 (geometry=true)
  const url =
    `/vworld/req/data?service=data` +
    `&request=GetFeature&version=2.0` +
    `&data=${dataset}` +
    `&key=${import.meta.env.VITE_VWORLD_KEY}&domain=${import.meta.env.VITE_VWORLD_DOMAIN}` +
    `&format=json&geometry=true` +
    `&attrFilter=${filterKey}:IN:${code}`

  // 3) API 호출
  const { data } = await axios.get(url)
  if (data.response.status !== 'OK') {
    console.warn('경계 조회 실패', code, data.response.error)
    return
  }

  const features = data.response.result.featureCollection.features
  if (!features.length) return
  const coords = features[0].geometry.coordinates // MultiPolygon

  // 1) 기존에 그려둔 폴리곤 모두 제거
  boundaryPolygons.forEach((poly) => poly.setMap(null))
  boundaryPolygons = []

  // 2) MultiPolygon 각 그룹(섬/본섬)마다 Polygon 생성
  coords.forEach((polygonGroup) => {
    // polygonGroup: [outerRing, hole1?, hole2?, …]
    const outerRing = polygonGroup[0]
    // LatLng 배열로 변환
    const path = outerRing.map((pt) => new window.kakao.maps.LatLng(pt[1], pt[0]))

    // 각 섬/본섬 별로 Polygon 생성
    const poly = new window.kakao.maps.Polygon({
      path,
      strokeWeight: 3,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      fillColor: '#FFCCCC',
      fillOpacity: 0.2,
    })
    poly.setMap(kakaoMap.value)
    boundaryPolygons.push(poly)
  })

  // 3) 모든 경계가 보이도록 지도 범위 확대
  const bounds = new window.kakao.maps.LatLngBounds()
  boundaryPolygons.forEach((poly) => {
    poly.getPath().forEach((latlng) => bounds.extend(latlng))
  })
  kakaoMap.value.setBounds(bounds)
}

const emit = defineEmits(['showPlannerListModal'])

const mapRef = ref(null)
const kakaoMap = ref(null)
let searchPlaces = () => {}
let handleMapClick = () => {}

// 1) 실제 clearMarkers, displayMarker를 담아 둘 변수 (초기엔 빈 함수)
let _clearMarkers = () => {}
let _displayMarker = (place, idx) => {}

// 2) 부모에게는 항상 최신 버전 함수를 호출하는 래퍼를 expose
defineExpose({
  clearSearchMarkers() {
    return _clearMarkers()
  },
  displayMarker(place, idx) {
    return _displayMarker(place, idx)
  },
})

onMounted(() => {
  loadKakaoMap(mapRef.value)
})

const loadKakaoMap = (container) => {
  const script = document.createElement('script')
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&libraries=services&autoload=false`
  script.async = true

  script.onload = () => {
    window.kakao.maps.load(() => {
      kakaoMap.value = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
        // maxLevel: 10,
      })

      // usePlaceSearch 유틸 호출
      const searchUtil = usePlaceSearch(
        kakaoMap.value,
        (place_url, placeName, address, lon, lat) => {
          if (!memberStore.isLoggedIn) {
            alert('로그인 후 이용 가능한 기능입니다.')
            return router.push({ name: 'LoginView' })
          }
          emit('showPlannerListModal', place_url, placeName, address, lon, lat)
        },
        router,
      )
      searchPlaces = searchUtil.searchPlaces
      handleMapClick = searchUtil.handleMapClick

      _clearMarkers = searchUtil.clearMarkers
      _displayMarker = searchUtil.displayMarker

      // 지도 클릭 이벤트 등록 (클릭하면 클릭 좌표 주소 검색 및 마커/오버레이 표시)
      window.kakao.maps.event.addListener(kakaoMap.value, 'click', (mouseEvent) => {
        handleMapClick(mouseEvent.latLng)
      })

      // 초기 검색어가 있으면 바로 검색
      console.log('props.searchQuery: ', props.searchQuery)
      if (props.searchQuery) {
        searchPlaces(props.searchQuery)
      }
    })
  }

  document.head.appendChild(script)
}

watch(
  () => props.searchQuery,
  (newQuery) => {
    if (newQuery && searchPlaces) {
      searchPlaces(newQuery)
    }
  },
)
</script>

<style scoped>
.map-continer {
  flex: 1;
  position: relative;
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  margin: 0;
  padding: 0;
  z-index: 1;
}

.title a {
  text-decoration: none;
  color: inherit; /* 일반 텍스트처럼 보이게 */
  transition:
    color 0.3s,
    text-decoration 0.3s;
}

.title a:hover {
  color: #0288d1; /* 예: 하늘색으로 변경 */
  text-decoration: underline; /* 밑줄 추가 */
}
</style>
