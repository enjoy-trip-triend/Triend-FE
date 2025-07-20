<template>
  <div class="schedule-edit-grid pt-16">
    <!-- 좌측: 영역 선택 + 검색 + 지도 -->
    <div class="map-area">
      <div class="controls" v-if="!store.showTable">
        <RegionSelector @search-region="onRegionSelect" />
        <SearchBar v-model="keyword" @search="onSearch" />
      </div>

      <MapContainer
        v-if="!store.showTable"
        :searchQuery="keyword"
        :regionCode="selectedRegion?.regionCode"
        @showPlannerListModal="onPlannerClick"
      />

      <ScheduleEditTable
        v-else
        :items="store.scheduleItems"
        @update="store.updateSchedule"
      />

      <button class="floating-btn" @click="store.toggleView">
        {{ store.showTable ? '🗺️' : '📋' }}
      </button>
    </div>

    <!-- 우측: 담은 장소 리스트 & 일정표 -->
    <div class="sidebar">
      <SidebarList
        :places="store.selectedPlaces"
        @remove="store.removePlace"
        @reorder="store.updateSelectedPlaces"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import RegionSelector from '@/components/location/RegionSelector.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import MapContainer from '@/components/map/MapContainer.vue'
import SidebarList from '@/components/planner/schedule/SideBarList.vue'
import ScheduleEditTable from '@/components/planner/schedule/ScheduleEditTable.vue'

const store = useScheduleStore()

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
</script>

<style scoped>
.schedule-edit-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  height: calc(100vh - 64px);
  padding-top: 64px;
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
  position: relative;
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: background-color 0.3s;
  z-index: 10;
}

.floating-btn:hover {
  background-color: #2563eb;
}
</style>
