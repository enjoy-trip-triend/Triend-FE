<template>
  <div class="region-selector">
    <!-- 1) 시·도 선택 -->
    <select v-model="selectedProvince" @change="loadDistricts">
      <option value="" disabled>— 시·도 선택 —</option>
      <option v-for="p in provinces" :key="p.admCode" :value="p.admCode">
        {{ p.admKorNm }}
      </option>
    </select>

    <!-- 2) 시·군·구 선택 -->
    <select v-model="selectedDistrict" :disabled="!districts.length">
      <option value="" disabled>— 시·군·구 선택 —</option>
      <option v-for="d in districts" :key="d.admCode" :value="d.admCode">
        {{ d.lowestAdmCodeNm }}
      </option>
    </select>

    <!-- 3) 검색 버튼 -->
    <button @click="onSearch" :disabled="!selectedProvince">
      검색
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['searchRegion'])

// vWorld NED API (프록시 '/vworld/ned/data' 사용)
const NED_BASE = '/vworld/ned/data'
const KEY       = import.meta.env.VITE_VWORLD_KEY
const DOMAIN    = import.meta.env.VITE_VWORLD_DOMAIN

const provinces       = ref([])
const districts       = ref([])
const selectedProvince = ref('')
const selectedDistrict = ref('')

// 공통 파라미터 함수
function nedParams(extra = {}) {
  return {
    key:    KEY,
    domain: DOMAIN,
    format: 'json',
    numOfRows: 100,
    ...extra
  }
}

// 1) 시·도 조회
onMounted(async () => {
  try {
    const { data } = await axios.get(`${NED_BASE}/admCodeList`, {
      params: nedParams()
    })
    //  console.log(data)
    // data.admVOList.admVOList 배열에 시·도 목록
    console.log('리스트 조회: ',data.admVOList.admVOList);
    provinces.value = data.admVOList.admVOList.map(item => ({
      admCode: item.admCode,
      admKorNm: item.admCodeNm
    }))
    // console.log("provinces.value", provinces.value)
  } catch (e) {
    console.error('시도 조회 실패', e)
  }
})

// 2) 시·도 선택 시 시·군·구 조회
async function loadDistricts() {
  districts.value = []
  selectedDistrict.value = ''
  if (!selectedProvince.value) return

  try {
    const { data } = await axios.get(`${NED_BASE}/admSiList`, {
      params: nedParams({ admCode: selectedProvince.value })
    })
    // console.log("loadDistricts: ",data)
    districts.value = data.admVOList.admVOList
    // console.log("districts value: ", districts.value)
  } catch (e) {
    console.error('시군구 조회 실패', e)
  }
}

// 3) 선택 완료 후 emit
function onSearch() {
  const prov = provinces.value.find(p => p.admCode === selectedProvince.value)?.admKorNm || ''
  const dist = districts.value.find(d => d.admCode === selectedDistrict.value)?.lowestAdmCodeNm || ''
  const label    = dist ? `${prov} ${dist}` : prov
  const admCode  = selectedDistrict.value || selectedProvince.value
  console.log(`코드: ${admCode} label: ${label}`)
  emit('searchRegion', { label, admCode })
}
</script>

<style scoped>
.region-selector {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* 공통 스타일 */
.region-selector select,
.region-selector button {
  background-color: rgba(255, 255, 255, 0.85);
  color: #333;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.6rem 1rem;
  font-size: 14px;
  font-weight: 500;
  min-width: 150px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

/* 셀렉트 드롭다운 화살표를 위한 여유 */
.region-selector select {
  padding-right: 2.5rem;
}

/* 버튼 전용 스타일 */
.region-selector button {
  background-color: #a6d7ef;
  color: #222;
  border-color: #98c8e6;
}

/* 버튼 hover/focus */
.region-selector button:hover,
.region-selector button:focus {
  background-color: #7ec0e3;
  border-color: #6cb0d4;
  color: #111;
}

/* select focus 강조 */
.region-selector select:focus {
  border-color: #7ec0e3;
  outline: none;
}

/* disabled 상태 */
.region-selector button:disabled {
  background-color: #eee;
  color: #888;
  cursor: not-allowed;
  box-shadow: none;
}

/* placeholder option 스타일 */
.region-selector select option[value=""] {
  color: #888;
}
</style>