<template>
  <div class="schedule-edit-grid">
    <!-- 좌측: 영역 선택 + 검색 + 지도/일정 -->
    <div class="map-area">
      <!-- 검색 영역 -->
      <div class="controls" v-if="!store.showTable">
        <RegionSelector @search-region="onRegionSelect" />
        <SearchBar v-model="keyword" @search="onSearch" />
      </div>

      <!-- 지도 or 일정 편집 -->
      <div class="main-box">
        <MapContainer v-if="!store.showTable" :searchQuery="keyword" :regionCode="selectedRegion?.regionCode"
          @showPlannerListModal="onPlannerClick" />

        <div v-else class="edit-box">
          <h3 class="section-title">📝 일정 편집</h3>
          <hr class="divider" />
          <ScheduleEditTable
            :items="store.scheduleItems"
            :startDate="planner.startDate"
            :endDate="planner.endDate"
            @update="store.updateSchedule"
          />

        </div>
      </div>

      <!-- 우하단 전환 버튼 -->
      <button class="floating-btn" @click="store.toggleView">
        {{ store.showTable ? '🗺️' : '📋' }}
      </button>
    </div>

    <!-- 우측: 담은 장소 리스트 -->
    <div class="sidebar">
      <SidebarList :places="store.selectedPlaces" @remove="store.removePlace" @reorder="store.updateSelectedPlaces" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useScheduleStore } from '@/stores/schedule'
import { triendApi } from '@/axios/index.js'
import RegionSelector from '@/components/location/RegionSelector.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import MapContainer from '@/components/map/MapContainer.vue'
import SidebarList from '@/components/planner/schedule/SideBarList.vue'
import ScheduleEditTable from '@/components/planner/schedule/ScheduleEditTable.vue'

const store = useScheduleStore()
const route = useRoute()

const plannerId = route.params.plannerId
const planner = history.state?.planner || {}

// 선택된 영역 정보
const selectedRegion = ref(null)
// 검색 키워드
const keyword = ref('')

// RegionSelector → 지역 선택 시 호출
function onRegionSelect(region) {
  selectedRegion.value = region
}

// SearchBar → 검색 버튼/엔터 시 호출
function onSearch(q) {
  if (!selectedRegion.value) {
    return alert('먼저 영역을 선택해주세요.')
  }
  keyword.value = `${selectedRegion.value.label} ${q.query}`
}

// MapContainer → 마커 클릭 시 주는 장소 데이터를 스토어에 추가
function onPlannerClick(placeUrl, placeName, address, lon, lat, kakaoId) {
  store.addPlace({
    id: kakaoId,
    place_url: placeUrl,
    title: placeName,
    address,
    x: lon,
    y: lat
  })
}

onMounted(async () => {
  if (!plannerId) {
    alert('유효하지 않은 플래너입니다.')
    return
  }
 try {
    const res = await triendApi({
      url: `/api/planners/${plannerId}/schedules`,
      method: 'get',
    })

    // 필요한 구조로 가공
    const grouped = {}
    res.data.forEach(item => {
      const date = item.date
      if (!grouped[date]) grouped[date] = []
      grouped[date].push({
        id: item.id,
        title: item.place?.placeName,
        time: item.startTime,
        ...item
      })
    })

    const formatted = Object.entries(grouped).map(([date, items]) => ({
      date,
      items
    }))

    store.updateSchedule(formatted)
  } catch (err) {
    console.error('스케줄 불러오기 실패:', err)
    alert('스케줄을 불러오는 데 실패했습니다.')
  }
})
</script>

<style scoped>
.schedule-edit-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  height: calc(100vh - 64px);
  padding-top: 64px;
  /*gap: 1rem;*/
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.controls>*:first-child {
  min-width: 150px;
}

.controls>*:last-child {
  flex: 1;
}

.map-area {
  padding: 1.5rem;
  background: #f9f9f9;
  position: relative;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 1.2rem;
  flex: 1;
  position: relative;
}

.inner-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 1.2rem;
  height: 100%;
}

.section-title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1d4ed8;
}

.divider {
  border: none;
  height: 1px;
  background-color: #ddd;
  margin-bottom: 1rem;
}

.toggle-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  padding: .5rem 1rem;
  border-radius: .25rem;
  background: #007aff;
  color: white;
}

.sidebar {
  padding: 1rem;
  background: #f9f9f9;
  overflow-y: auto;
}

.floating-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #1d4ed8;
  color: white;
  font-size: 22px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
  z-index: 999;
}

.floating-btn:hover {
  background-color: #2563eb;
}
</style>
