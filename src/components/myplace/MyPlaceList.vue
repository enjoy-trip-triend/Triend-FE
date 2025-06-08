<template>
  <div class="myplace-list">
    <div class="myplace-list-header">
      <h2>나만의 장소</h2>

        <!-- 검색 입력 필드 -->
        <input
          type="text"
          v-model="searchQuery"
          placeholder="검색 키워드 입력하세요"
          class="search-input"
        />

      <button
        class="delete-selected"
        :disabled="!selectedIds.length"
        @click="deleteSelected"
      >
        선택 삭제 ({{ selectedIds.length }})
      </button>
    </div>

    <div v-if="filteredPlaces.length" class="card-list">
      <div
        v-for="place in filteredPlaces"
        :key="place.id"
        class="place-card"
      >
        <!-- 체크박스 -->
        <input
          type="checkbox"
          class="select-box"
          :value="place.id"
          v-model="selectedIds"
        />

        <!-- 카드 내용 -->
        <div class="place-content">
          <div class="place-title">{{ place.locationName }}</div>
          <div class="place-row">
            <span class="place-label">주소</span>
            <span class="place-value">{{ place.address }}</span>
          </div>
          <div class="place-row">
            <span class="place-label">카테고리</span>
            <span class="place-value">{{ place.categoryName }}</span>
          </div>
          <div class="place-row">
            <span class="place-label">설명</span>
            <span class="place-value">{{ place.description }}</span>
          </div>
        </div>

        <!-- 수정 버튼 -->
        <button class="edit-btn" @click="openEditModal(place)">수정</button>
      </div>
    </div>

    <p v-else class="no-data">등록된 장소가 없습니다.</p>
        <!-- EditPlaceModal: v-if로 토글, initial에 place 전달 -->
    <EditPlaceModal
      v-if="showEditModal"
      :key="currentPlace.id"
      :initial="currentPlace"
      @save="onEditSave"
      @close="showEditModal = false"
    />
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { triendApi } from '@/axios'
import EditPlaceModal from '@/components/member/mypage/EditPlaceModal.vue'

const places       = ref([])
const selectedIds  = ref([])
const showEditModal = ref(false)
const currentPlace = ref(null)
const searchQuery = ref('');

const filteredPlaces = computed(() => {
  return places.value.filter(place => {
    const searchTerm = searchQuery.value.toLowerCase();
    return (
      place.locationName.toLowerCase().includes(searchTerm) || // 장소 이름
      place.address.toLowerCase().includes(searchTerm) ||      // 주소
      place.categoryName.toLowerCase().includes(searchTerm) || // 카테고리
      place.description?.toLowerCase().includes(searchTerm)    // 설명
    );
  });
});

async function loadPlaces() {
  try {
    const res = await triendApi.get('/api/myplace/get-myplace-list')
    places.value = res.data
    console.log("장소: ", places.value);
  } catch (e) {
    console.error('내 장소 조회 실패:', e)
    alert('장소 목록을 불러오는데 실패했습니다.')
  }
}

// 여러 개 삭제
async function deleteSelected() {
  if (!selectedIds.value.length) return

  if (!confirm(`${selectedIds.value.length}개 장소를 삭제하시겠습니까?`)) {
    return
  }

  try {
    // DELETE with JSON body
    await triendApi.request({
      method: 'post',
      url: '/api/myplace/delete-myplace',
      data: selectedIds.value,
    })
    alert('선택한 장소가 삭제되었습니다.')
    // 리셋 & 재조회
    selectedIds.value = []
    await loadPlaces()
  } catch (e) {
    console.error('장소 삭제 실패:', e)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

function openEditModal(place) {
  // place 객체를 복사해서 넘기면 안전
  currentPlace.value = { ...place }
  showEditModal.value = true
}

// 수정
async function onEditSave(updatedDto) {
  try {
    await triendApi.post('/api/myplace/update-myplace', updatedDto)
    alert('장소 정보가 수정되었습니다.')
    showEditModal.value = false
    await loadPlaces()
  } catch (e) {
    console.error('장소 수정 실패:', e)
    alert('수정 중 오류가 발생했습니다.')
  }
}

onMounted(loadPlaces)
</script>

<style scoped>
.myplace-list {
  padding: 16px 0 24px;
  max-width: 660px;
  margin: 0 auto;
}
.myplace-list-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  width: 100%;
}
.myplace-list h2 {
  font-size: 1.6em;
  color: #1b81c6;
  font-weight: bold;
  flex: 1;
}
.delete-selected {
  background-color: #e53935;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.delete-selected:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.delete-selected:hover:not(:disabled) {
  background-color: #c62828;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
/* 카드 전체를 감싸는 컨테이너 */
.place-card {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 2px 12px rgba(30, 65, 165, 0.12);
  padding: 16px 36px 18px;
  position: relative;
}
.edit-btn {
  background: #42a5f5;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  align-self: flex-start;
  margin-left: 16px;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #1e88e5;
}

/* 체크박스 위치 */
.select-box {
  margin-right: 16px;
  margin-top: 8px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
/* 카드 내용 영역 */
.place-content {
  flex: 1;
}
.place-title {
  font-size: 1.22em;
  font-weight: 700;
  margin-bottom: 16px;
  color: #2986cc;
}
.place-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.place-label {
  min-width: 78px;
  font-weight: 600;
  color: #3391e4;
}
.place-value {
  color: #222;
  word-break: break-all;
}
.no-data {
  color: #999;
  margin-top: 36px;
  text-align: center;
  font-size: 1.18em;
}

.search-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-right: 16px;
  flex: 1;
}

</style>
