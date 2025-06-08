<template>
  <div class="home-container">
    <SideBar>
      <SearchBar placeholder="여행지를 입력하세요" searchType="trip" @search="handleSearch" />

      <!-- 추천 리스트 영역 -->
      <div v-if="recommendStore.list.length" class="recommend-container">
        <h3 class="recommend-title">
          <i class="mdi mdi-thumb-up-outline"></i> Triend 추천 장소
        </h3>
        <RecommendList :places="recommendStore.list" @select="onRecommendSelect"/>
      </div>

      <!-- 검색 결과 -->
      <ul v-else id="placesList" class="places-list"></ul>
    </SideBar>
    <MapContainer
      ref="mapComp"
      :searchQuery="searchQuery"
      :adminCode="adminCode"
      @showPlannerListModal="handleOpenPlannerListModal"
    />

    <SelectPlannersModal
      v-if="plannerListVisible"
      :planners="planners"
      :plannerListVisible="plannerListVisible"
      @selectPlanner="selectPlanner"
      @close="handleClosePlannerListModal"
      @showCreatePlannerModal="handleOpenCreatePlannerModal"
    />
    <CreatePlannerModal
      v-if="createPlannerVisible"
      @createPlanner="handleCreatePlanner"
      @close="handleCloseCreatePlannerModal"
    />
    <CreatePlanModal
      v-if="createPlanVisible"
      :planner="currentPlanner"
      :place="place"
      @showPlannerListModal="handleOpenPlannerListModal"
      @close="handleCloseCreatePlanModal"
      @createPlan="creatPlan"
    />
    <PlannerDetailModal
      :planners="planners"
      :currentPlanner="currentPlanner"
      :currentPlans="currentPlans"
    />
  </div>
</template>

<script setup>
import SideBar from '@/components/common/SideBar.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import MapContainer from '@/components/map/MapContainer.vue'
import RecommendList from '@/components/chat/RecommendList.vue'
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SelectPlannersModal from '@/components/planner/SelectPlannersModal.vue'
import CreatePlannerModal from '@/components/planner/CreatePlannerModal.vue'
import CreatePlanModal from '@/components/planner/plan/CreatePlanModal.vue'
import { triendApi } from '@/axios/index.js'
import PlannerDetailModal from '@/components/planner/PlannerDetailModal.vue'
import { useMemberStore } from '@/stores/member.js'
import { useRecommendStore } from '@/stores/recommend.js'

const recommendStore = useRecommendStore() 
const mapComp = ref(null)

const searchQuery = ref('')
const adminCode = ref('')
const plannerListVisible = ref(false)
const createPlannerVisible = ref(false)
const createPlanVisible = ref(false)
const place = ref({
  placeName: '',
  address: '',
  lat: '',
  lon: '',
  placeUrl: '',
})

const route = useRoute()
const planners = ref([])
const memberStore = useMemberStore()
const currentPlanner = ref({})
const currentPlans = ref([])

// onMounted시에 쿼리 파라미터가 있으면 초기 searchQuery로 설정
const fetchPlanners = async () => {
  console.log('fetchPlanners() 호출됨')

  try {
    const response = await triendApi({
      url: '/api/planners',
      method: 'get',
    })

    planners.value = response.data
  } catch (err) {
    console.error('플래너 불러오기 실패:', err)
  }
}

onMounted(() => {
  const place = route.query.place
  const code = route.query.code
  if (place) searchQuery.value = place
  if (code) adminCode.value = code

  if (memberStore.isLoggedIn) {
    // 로그인 상태라면 플래너 목록을 불러옴
    fetchPlanners()
  } else {
    // 비로그인 상태에서는 플래너 목록을 불러오지 않음
    planners.value = []
  }
  console.log('planners', planners.value)
})

// 라우트가 바뀔 때도 반영
watch(
  () => route.query,
  (q) => {
    if (q.place) searchQuery.value = q.place
    if (q.code) adminCode.value = q.code
  },
)


// PlannerList 모달 컨트롤
const handleOpenPlannerListModal = (url, name, adr, x, y) => {
  plannerListVisible.value = true
  place.value = {
    placeName: name,
    address: adr,
    lat: y,
    lon: x,
    placeUrl: url,
  }
}

const handleClosePlannerListModal = () => {
  plannerListVisible.value = false
}

// CreatePlanner 모달 컨트롤
const handleOpenCreatePlannerModal = () => {
  createPlannerVisible.value = true
}

const handleCloseCreatePlannerModal = () => {
  createPlannerVisible.value = false
}

async function handleCreatePlanner(requestData) {
  try {
    await triendApi({
      url: '/api/planners',
      method: 'post',
      data: requestData,
    })

    fetchPlanners()
    createPlannerVisible.value = false
    plannerListVisible.value = true
  } catch (err) {
    console.error('플래너너 생성 실패:', err)
    alert('오류 발생: ' + (err.response?.data?.message || err.message))
  }
}

const handleSearch = ({ type, query }) => {
  recommendStore.clear()
  if (type === 'trip') {
    searchQuery.value = query
  }
}

const handleCloseCreatePlanModal = () => {
  createPlanVisible.value = false
}

const selectPlanner = (planner) => {
  console.log('로그인 상태:', memberStore.isLoggedIn)
  currentPlanner.value = planner
  console.log('선택된 플래너:', currentPlanner.value)
  createPlanVisible.value = true
  fetchPlans(currentPlanner.value.id)
}

const fetchPlans = async (plannerId) => {
  if (!currentPlanner.value) return
  try {
    const { data } = await triendApi.get(`/api/planners/${plannerId}/plans`)
    console.log('불러온 플랜 데이터:', data)
    currentPlans.value = data
  } catch (err) {
    console.error('플랜 불러오기 실패:', err)
    alert('플랜 데이터를 불러오지 못했습니다.')
  }
}

const creatPlan = (requestData) => {
  currentPlans.value.push(requestData)
}


function onRecommendSelect(dto) {
  console.log('▶ onRecommendSelect 호출, dto=', dto)
  console.log('▶ mapComp.value=', mapComp.value);

// 1) 기존 마커들 지우기
  mapComp.value.clearSearchMarkers()

  // 2) DTO → Kakao Places 형식으로 변환
  const place = {
    id:                 dto.kakaoId,
    place_name:         dto.locationName,
    place_url:          dto.place_url || '',
    road_address_name:  dto.address,
    address_name:       dto.address,
    category_name:      dto.categoryName || '',
    phone:              dto.phone || '',
    x:                  dto.lon,
    y:                  dto.lat
  }

  // 3) 맵에 마커 표시 (인덱스 0)
  mapComp.value.displayMarker(place, 0)
}

</script>

<style scoped>
html,
body {
  overflow: hidden;
  height: 100%;
}
.home-container {
  display: flex;
  flex: 1;
  margin-top: 60px;
  overflow: hidden;
  height: calc(100vh - 60px); /* 예: 헤더 높이 감안 */
}

.home-container > *:first-child {
  width: 300px;
  flex-direction: column;
  width: 300px;
  border-right: 1px solid #ddd;
}

.home-container > *:last-child {
  flex: 1; /* 남은 공간 모두 차지 */
}

.places-list {
  max-height:70vh;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 999;
  border-radius: 8px;
  margin-top: 10px;
}
.place-item {
  transition: background 0.2s;
}
.place-item:hover {
  background: #f8f8f8;
}

/* HomeView.vue <style scoped> */
.recommend-container {
  margin-top: 16px;
  padding: 12px;
  border: 2px solid #0288d1;
  border-radius: 8px;
  background-color: #e3f2fd; /* 연한 하늘색 백그라운드 */
}
.recommend-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #01579b;
}
.recommend-title .mdi {
  margin-right: 6px;
  font-size: 1.2rem;
}

</style>
