<template>
  <div class="myplaces-control">
    <!-- 토글 버튼 -->
    <button class="myplace-button" @click="toggleControl">
      🧡 나만의 장소
    </button>

    <!-- 카테고리 필터 버튼들 -->
    <div v-if="showControl" class="category-buttons">
      <!-- 전체조회 버튼 -->
   <button
     class="category-button"
     :class="{ selected: selectedCategory === null }"
     :style="{ backgroundColor: colorMap['전체조회'] }"
     @click="selectCategory(null)"
   >
     {{ emojiMap['전체조회'] }} 전체조회
   </button>

      <!-- 개별 카테고리 버튼 -->
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-button"
        :class="{ selected: selectedCategory === cat.id }"
        :style="{ backgroundColor: colorMap[cat.name] }"
        @click="selectCategory(cat.id)"
      >
        {{ emojiMap[cat.name] }} {{ cat.name }}
      </button>
    </div>

    <!-- 모달 -->
    <MyPlaceModal
      v-if="showMyPlaceModal"
      :initial="newPlaceInfo"
      @submit="onSubmitMyPlace"
      @close="showMyPlaceModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, createApp, h } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { useMemberStore } from '@/stores/member'
import { useRouter } from 'vue-router'
import { triendApi } from '@/axios'
import heartIconUrl from '@/assets/img/myplace-heart-marker.png'
import MyPlaceModal from '@/components/myplace/MyPlaceModal.vue'
import MyPlaceInfoWindow from '@/components/myplace/MyPlaceInfoWindow.vue'

let openedInfoWindow = null

const router = useRouter();

// `map` 인스턴스를 prop으로 받아옵니다.
const props = defineProps({
  map: { type: Object, required: true }
})
const map = props.map

// 상태
const showControl      = ref(false)
const categories       = ref([])
const selectedCategory = ref(null)
const myPlaceMarkers   = ref([])
const showMyPlaceModal = ref(false)
const newPlaceInfo     = ref({})

// 이모지·색상 매핑
 const emojiMap = {
  '전체조회': '🔍',
   음식:   '🍽️',
   카페:   '☕',
   관광지: '🗺️',
   쇼핑:   '🛍️',
 }
 const colorMap = {
  '전체조회': '#DDDDDD',
   음식:   '#FFA07A',
   카페:   '#FFD700',
   관광지: '#87CEEB',
   쇼핑:   '#FFB6C1',
 }

// 카테고리 로드
const categoryStore = useCategoryStore()
onMounted(async () => {
  await categoryStore.fetchCategories()
  categories.value = categoryStore.list
})

// 모달 열기 (MapContainer에서 window.openMyPlaceModal 호출)
window.openMyPlaceModal = (place) => {
  newPlaceInfo.value     = place
  showMyPlaceModal.value = true
  console.log("새로운 장소 정보!!!!: ", newPlaceInfo.value)
}

// 토글 버튼 핸들러
function toggleControl() {
  if (!useMemberStore().isLoggedIn) {
    alert('로그인 후 이용 가능한 기능입니다.')
    router.push({name : 'LoginView'})
    return
  }
  clearMarkers()
  showControl.value = !showControl.value
  if (!showControl.value) selectedCategory.value = null
}


// 기존 마커 제거
function clearMarkers() {
  myPlaceMarkers.value.forEach(m => m.setMap(null))
  myPlaceMarkers.value = []
}

// --- 헬퍼: 카테고리별(또는 전체) 장소 불러와 마커 찍기 ---
async function fetchPlaces(categoryId = null) {
  // 1) 내 장소 리스트 API 호출
  const { data } = await triendApi.get('/api/myplace/get-myplace-list', {
    params: categoryId != null ? { categoryId } : {}
  });

  if (!data.length) {
    alert('등록된 장소가 없습니다.');
    return;
  }

  // 2) Kakao API로 추가 정보(phone, url, category 등) 조회
  const enriched = await Promise.all(
    data.map(async place => {
      try {
        // 장소명 + 주소를 키워드로 검색
        console.log("place: ", place)
        const query = encodeURIComponent(`${place.address}`);
        console.log("query: ", query);
        const resK = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}`,
          { headers: { Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}` } }
        );
        const kakaoData = await resK.json();
        console.log("나만의 장소 kakaoData: ", kakaoData)
        if (kakaoData.documents?.length) {
          const info = kakaoData.documents.find(d => d.id === place.kakaoId)
                       || kakaoData.documents[0];
          console.log("나만의 장소 지금 info: ", info);
          return {
            ...place,
            phone:            info.phone,
            place_url:        info.place_url,
            categoryName:     info.category_name,
            road_address_name: info.road_address_name,
            lat:              info.y,
            lon:              info.x
          };
        }
      } catch (e) {
        console.warn('Kakao API 조회 실패', e);
      }
      // 실패 시 기본값 채우기
      return {
        ...place,
        phone: '',
        place_url: '',
        categoryName: '',
        road_address_name: place.address,
        lat: place.lat,
        lon: place.lon
      };
    })
  );

  // 3) enriched 데이터로 마커 찍기
  clearMarkers();
  const bounds = new window.kakao.maps.LatLngBounds();
  enriched.forEach(place => {
    const pos = new window.kakao.maps.LatLng(place.lat, place.lon);
    const marker = new window.kakao.maps.Marker({
      position: pos,
      map,
      image: new window.kakao.maps.MarkerImage(
        heartIconUrl,
        new window.kakao.maps.Size(32, 32),
        { offset: new window.kakao.maps.Point(16, 40) }
      )
    });
    myPlaceMarkers.value.push(marker);
    bounds.extend(pos);

    window.kakao.maps.event.addListener(marker, 'click', () => {
      if (openedInfoWindow) openedInfoWindow.setMap(null);

      // InfoWindow 컴포넌트 마운트
      const container = document.createElement('div');
      createApp({
        render: () =>
          h(MyPlaceInfoWindow, {
            place,
            onClose: () => openedInfoWindow.setMap(null),
          })
      }).mount(container);

      const infoWindow = new window.kakao.maps.CustomOverlay({
        content: container,
        position: pos,
        xAnchor: 0.5,
        yAnchor: 1.2
      });
      infoWindow.setMap(map);
      openedInfoWindow = infoWindow;
    });
  });
  map.setBounds(bounds);
}


// 카테고리 선택
async function selectCategory(id) {

   // 전체조회 토글 처리
   if (id === null) {
     const showingAll = selectedCategory.value === null && myPlaceMarkers.value.length > 0
     clearMarkers()
     if (!showingAll) {
       // 전체조회 ON
       selectedCategory.value = null
       await fetchPlaces(null)
     } else {
       // 전체조회 OFF
       selectedCategory.value = undefined  // 토글 해제
     }
     return
   }

  // 같은 버튼 다시 누르면 해제
  if (selectedCategory.value === id) {
    selectedCategory.value = null
    clearMarkers()
    return
  }

  // 새 카테고리(또는 전체) 선택
  selectedCategory.value = id
  clearMarkers()
  await fetchPlaces(id)
}

// 모달 submit 핸들러
async function onSubmitMyPlace({ description, categoryId }) {
  try {
    await triendApi.post('/api/myplace/create-myplace', {
      ...newPlaceInfo.value,
      description,
      categoryId,
    })
    alert('장소가 추가되었습니다!')
    showMyPlaceModal.value = false
    // 현재 선택된 카테고리가 있으면 다시 불러오기
    if (selectedCategory.value !== null) {
      selectCategory(selectedCategory.value)
    }
  } catch (err) {
    if(err.response?.status === 409) {
      alert('이미 추가한 장소입니다.')
    } else {
      console.error('장소 추가 실패: ', err);
      alert('장소 추가에 실패했습니다.')
    }
  }
}
</script>

<style scoped>
.myplaces-control {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}
.category-buttons {
  margin-top: 8px;
  display: flex;
  flex-direction: column;    /* ← 세로 정렬 */
  align-items: flex-start;   /* ← 왼쪽 정렬 유지 */
  gap: 6px;
}
.category-button {
  padding: 6px 12px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.1s;
}
.category-button.selected {
  transform: scale(1.1);
}
.myplace-button {
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  background: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  cursor: pointer;
}
.myplace-button:hover {
  background: #fef9f4;
}
</style>
