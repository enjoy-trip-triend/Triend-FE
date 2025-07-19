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
import { usePlaceSearch } from '@/utils/kakao/usePlaceSearch'
import { useMemberStore } from '@/stores/member'
import MyPlaceButton from '@/components/myplace/MyPlaceButton.vue'
import HotPlaceButton from '@/components/hotplace/HotPlaceButton.vue'

const router = useRouter()
const memberStore = useMemberStore()

const props = defineProps({
  searchQuery: String,
  regionCode: String,
})

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
        (place_url, placeName, address, lon, lat, kakaoId) => {
          if (!memberStore.isLoggedIn) {
            alert('로그인 후 이용 가능한 기능입니다.')
            return router.push({ name: 'LoginView' })
          }
          emit('showPlannerListModal', place_url, placeName, address, lon, lat, kakaoId)
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
    console.log('🔍 searchQuery changed → searchPlaces:', newQuery)
    if (newQuery && props.regionCode && typeof searchPlaces === 'function') {
      _clearMarkers()
      searchPlaces(newQuery, props.regionCode)
    }
  }
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
