<template>
  <div class="hotplace-control">
    <button class="hotplace-button" @click="toggleList">
      🔥 핫플레이스
    </button>

    <div v-if="showList" class="hotplace-carousel">
      <div class="card-view">
        <!-- ◀ 왼쪽 화살표 -->
        <button
          class="arrow-btn left"
          @click="prev"
          :disabled="currentIndex === 0"
        >◀</button>

        <!-- 카드 한 장 -->
        <div v-if="hotPlaces.length" class="hotplace-card" @click="selectCurrent">
          <!-- 👑 랭킹 배지 -->
          <div class="rank-badge">👑 {{ currentIndex + 1 }}</div>

          <h4 class="hotplace-title">
            {{ hotPlaces[currentIndex].place_name }}
          </h4>
          <p class="location">{{ hotPlaces[currentIndex].address }}</p>
          <p>
            <span class="hotplace-label">도로명:</span>
            {{ hotPlaces[currentIndex].road_address_name }}
          </p>
          <p>
            <span class="hotplace-label">카테고리:</span>
            {{ hotPlaces[currentIndex].category_name }}
          </p>
          <p>
            <span class="hotplace-label">전화:</span>
            {{ hotPlaces[currentIndex].phone || '-' }}
          </p>
            <p class="count">
            <!-- 1) 이모지만 감쌀 span 추가 -->
            <span
              class="flame-emoji"
              :style="{ fontSize: emojiSize + 'px' }"
            >🔥</span>
            {{ currentCount }}명
          </p>
        </div>

        <div v-else class="no-data">인기 장소가 없습니다.</div>

        <!-- ▶ 오른쪽 화살표 -->
        <button
          class="arrow-btn right"
          @click="next"
          :disabled="currentIndex === hotPlaces.length - 1"
        >▶</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import fireIconUrl from '@/assets/img/hotplace-marker.png'
import { ref, computed } from 'vue'
import { triendApi } from '@/axios'

const kakao = window.kakao

const fireMarkerImage = new kakao.maps.MarkerImage(
  fireIconUrl,
  new kakao.maps.Size(32, 32),
  { offset: new kakao.maps.Point(16, 32) }
)

const props = defineProps({
  map: { type: Object, required: true }
})

const showList = ref(false)
const hotPlaces = ref([])
const currentIndex = ref(0)

const currentCount = computed(() => {
  const place = hotPlaces.value[currentIndex.value]
  return place?.count || 0
})

const emojiSize = computed(() => {
  const base = 16                // 최소 크기
  const scalePerUser = 4         // 사용자 1명당 늘어나는 픽셀
  const maxSize = 40             // 클램핑(최대)
  return Math.min(base + currentCount.value * scalePerUser, maxSize)
})

// 컴포넌트 내에서 쓰일 마커 참조
let hotPlaceMarker = null

// 리스트 토글
function toggleList() {
  showList.value = !showList.value
  if (showList.value && !hotPlaces.value.length) {
    fetchHotPlaces()
  }
}

async function fetchHotPlaces() {
  try {
    // 1) 백엔드에서 kakaoId, address, count 를 가져온다
    const res = await triendApi.get('/api/myplace/get-hotplace-list')
    const list = res.data  // [{ kakaoId, address, count }, …]
    currentIndex.value = 0

    // 2) 각각을 카카오 키워드검색 후, id 가 일치하는 문서를 찾아 상세정보 병합
    hotPlaces.value = await Promise.all(
      list.map(async (item) => {
        // 기본 DTO 필드 복제
        let placeInfo = { ...item }

        try {
          // 주소를 키워드로 검색
          const query = encodeURIComponent(item.address)
          const kakaoRes = await fetch(
            `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}`,
            { headers: { Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}` } }
          )
          const kakaoData = await kakaoRes.json()

          if (kakaoData.documents?.length) {
            // 1) id 가 정확히 일치하는 문서 찾기
            const matched = kakaoData.documents.find(d => d.id === item.kakaoId)
            // 2) 없으면 우선순위로 첫 번째 문서 사용
            const info = matched || kakaoData.documents[0]

            // 3) placeInfo 에 상세 필드 합치기
            placeInfo = {
              ...placeInfo,
              place_name:        info.place_name,
              phone:             info.phone || '-',
              place_url:         info.place_url,
              category_name:     info.category_name,
              road_address_name: info.road_address_name,
              lat:               info.y,
              lon:               info.x
            }
          }
        } catch (e) {
          console.error('카카오 API 조회 실패', e)
          alert('핫플레이스 상세 정보 조회 중 오류가 발생했습니다.')
        }

        return placeInfo
      })
    )
  } catch (e) {
    console.error('핫플레이스 API 조회 실패', e)
    alert('핫플레이스 목록 조회 중 오류가 발생했습니다.')
  }
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}
function next() {
  if (currentIndex.value < hotPlaces.value.length - 1) currentIndex.value++
}

 function selectCurrent() {
   const place = hotPlaces.value[currentIndex.value]
   if (!place?.lat || !place?.lon) return

   const latlng = new kakao.maps.LatLng(place.lat, place.lon)

   if (!hotPlaceMarker) {
     // 최초 호출 시에만 마커 생성
     hotPlaceMarker = new kakao.maps.Marker({
       map:      props.map,
       position: latlng,
       image:    fireMarkerImage
     })
   } else {
     // 두 번째 이후에는 위치만 이동
     hotPlaceMarker.setPosition(latlng)
   }

   // 지도의 중심만 갱신
   props.map.setCenter(latlng)
 }

</script>

<style scoped>
.hotplace-control {
  position: absolute;
  top: 20px;
  left: 160px;
  z-index: 1001;
}

.arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,0.15);
  font-size: 16px;
  color: #ff7043;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}
.arrow-btn:disabled {
  opacity: 0.3;
  cursor: default;
}
.arrow-btn.left {
  left: 8px;
}
.arrow-btn.right {
  right: 8px;
}

.hotplace-carousel {
  margin-top: 10px;
}
.card-view {
  position: relative;
  width: 360px;    /* 카드 너비에 맞춤 */
  margin: 0 auto;
}

.hotplace-button {
  padding: 8px 18px;
  border: none;
  border-radius: 18px;
  background: #fff3e0;
  color: #ff5722;
  font-weight: bold;
  font-size: 17px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  margin-bottom: 10px;
  cursor: pointer;
  transition: background 0.16s;
}
.hotplace-button:hover {
  background: #ffe0c3;
}

/* 리스트 박스 스타일 */
.hotplace-list-box {
  display: flex;
  flex-direction: row;      /* 가로 방향 */
  gap: 16px;                /* 카드 간 여백 */
  overflow-x: auto;         /* 가로 스크롤 */
  overflow-y: hidden;       /* 세로 스크롤 숨김 */
  padding: 18px 12px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(255, 87, 34, 0.11);
  max-width: 100%;
  z-index: 1002;
}

/* 개별 카드 */
.hotplace-card {
  position: relative;
  background: #fff8f4;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(255, 87, 34, 0.08);
  padding: 32px 56px 18px 56px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hotplace-card:hover {
  box-shadow: 0 8px 20px rgba(255,87,34,0.16);
  transform: translateY(-2px) scale(1.015);
}

.hotplace-title {
  font-weight: 700;
  font-size: 1.12em;
  margin-bottom: 3px;
  color: #7028e4;
}
.place-link {
  color: #7028e4;
  text-decoration: none;
  transition: color 0.13s;
  font-weight: 700;
  font-size: 1.13em;
}
.place-link:hover {
  color: #fe8c00;
  text-decoration: underline;
}

.hotplace-row {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #444;
  gap: 7px;
  margin-bottom: 1px;
}

.hotplace-label {
  font-weight: 600;
  color: #ff7043;
  min-width: 60px;
  font-size: 1em;
  border-radius: 7px;
}

.hotplace-row:last-child {
  margin-top: 7px;
  font-size: 1.08em;
  color: #ff5722;
  font-weight: 600;
  justify-content: flex-end;
}

.no-data {
  color: #aaa;
  padding: 14px;
  text-align: center;
  font-size: 1.08em;
}

/* 랭킹 배지 */
.rank-badge {
  position: absolute;
  top: 8px;
  left: 16px;
  background: #ffe0b2;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 0.85em;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  z-index: 3;
}

.hotplace-list-box::-webkit-scrollbar {
  height: 6px;
}
.hotplace-list-box::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 3px;
}

.count {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-weight: 600;
  color: #ff5722;
  align-self: flex-end;
}

.flame-emoji {
  display: inline-block;
  line-height: 1;
  margin-right: 4px;
  /* font-size는 inline style로 제어됨 */
}

@media (max-width: 520px) {
  .hotplace-list-box {
    width: 98vw;
    left: -12vw;
    padding: 15px 7vw 13px 7vw;
  }
  .hotplace-card { padding: 13px 8px 10px 10px; }
}

</style>
