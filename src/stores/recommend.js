import { defineStore } from 'pinia'

export const useRecommendStore = defineStore('recommend', {
  state: () => ({
    list: []  // 추천 장소 리스트를 저장합니다
  }),
  actions: {
    setList(places) {
      this.list = places
    },
    clear() {
      this.list = []
    }
  }
})
