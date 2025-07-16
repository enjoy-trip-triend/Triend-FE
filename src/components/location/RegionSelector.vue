<template>
  <div class="region-selector">
    <!-- 1) 시·도 선택 -->
    <select v-model="selectedProvince" @change="loadDistricts">
      <option value="" disabled>— 시·도 선택 —</option>
      <option v-for="p in provinces" :key="p.sidoCode" :value="p.sidoCode">
        {{ p.sidoName }}
      </option>
    </select>

    <!-- 2) 시·군·구 선택 -->
    <select v-model="selectedDistrict" :disabled="!districts.length" @change="emitRegion">
      <option value="" disabled>— 시·군·구 선택 —</option>
      <option v-for="d in districts" :key="d.gugunCode" :value="d.gugunCode">
        {{ d.gugunName }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { triendApi } from '@/axios/index.js'

const emit = defineEmits(['searchRegion'])

const provinces = ref([])
const districts = ref([])
const selectedProvince = ref('')
const selectedDistrict = ref('')

// 1) 시·도 조회 (내 DB 사용)
onMounted(async () => {
  try {
    const res = await triendApi({ url: '/api/locations/sidos', method: 'get' })
    // API 응답이 [{id, code, name}, ...] 형태이므로 매핑
    provinces.value = res.data.map(item => ({
      sidoCode: item.code,
      sidoName: item.name
    }))
  } catch (e) {
    console.error('시도 조회 실패', e)
  }
})

// 2) 시·도 선택 시 시·군·구 조회 (PathVariable 방식)
async function loadDistricts() {
  districts.value = []
  selectedDistrict.value = ''
  if (!selectedProvince.value) return

  try {
    const res = await triendApi({
      url: `/api/locations/sidos/${selectedProvince.value}/guguns`,
      method: 'get'
    })
    // 역시 [{id, code, name}, ...]
    districts.value = res.data.map(item => ({
      gugunCode: item.code,
      gugunName: item.name
    }))
  } catch (e) {
    console.error('시군구 조회 실패', e)
  }
}

// 3) 구군 선택 즉시 emit
function emitRegion() {
  const prov = provinces.value.find(p => p.sidoCode === selectedProvince.value)?.sidoName || ''
  const dist = districts.value.find(d => d.gugunCode === selectedDistrict.value)?.gugunName || ''
  const label = dist ? `${prov} ${dist}` : prov
  const regionCode = selectedDistrict.value || selectedProvince.value
  emit('searchRegion', {
    label,
    sidoCode: selectedProvince.value,
    gugunCode: selectedDistrict.value || null
  })
}
</script>

<style scoped>
.region-selector {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* 공통 스타일 */
.region-selector select {
  background-color: rgba(255, 255, 255, 0.85);
  color: #333;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.6rem 1rem;
  font-size: 14px;
  font-weight: 500;
  min-width: 150px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

/* select focus 강조 */
.region-selector select:focus {
  border-color: #7ec0e3;
  outline: none;
}
</style>