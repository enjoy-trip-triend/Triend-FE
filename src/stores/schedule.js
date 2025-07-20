import { defineStore } from 'pinia'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    // 장바구니에 담긴 장소 목록
    selectedPlaces: [],
    // 일정표에 배치된 아이템 목록
    scheduleItems: [],
    // 일정표 뷰 토글 상태
    showTable: false,
  }),
  actions: {
    // 장소 추가 (중복 방지)
    addPlace(place) {
      if (!this.selectedPlaces.find(p => p.id === place.id)) {
        this.selectedPlaces.push(place)
      }
    },
    // 장소 제거
    removePlace(id) {
      this.selectedPlaces = this.selectedPlaces.filter(p => p.id !== id)
    },
    // 일정표 보기/지도 보기 토글
    toggleView() {
      this.showTable = !this.showTable
    },
    // 드래그앤드롭 후 일정 업데이트
    updateSchedule(items) {
      this.scheduleItems = items
    },
    updateSelectedPlaces(newList) {
      this.selectedPlaces = [...newList]
    }
  },
})
