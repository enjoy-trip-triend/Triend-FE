// src/stores/category.js
import { defineStore } from 'pinia'
import { triendApi } from '@/axios'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    list: []
  }),
  getters: {
    hasLoaded: (state) => state.list.length > 0
  },
  actions: {
    async fetchCategories() {
      if (this.hasLoaded) return  // 이미 불러온 적 있으면 스킵
      try {
        const res = await triendApi.get('/api/myplace/get-category-list')
        this.list = res.data
      } catch (e) {
        console.error('카테고리 로드 실패:', e)
      }
    }
  }
})
