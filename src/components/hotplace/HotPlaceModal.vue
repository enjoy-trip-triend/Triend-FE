<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="hotplace-modal">
      <div class="modal-header">
        <span class="modal-title">🔥 인기 핫플레이스 TOP 10</span>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <ul v-if="places.length" class="hotplace-list">
          <li
            v-for="place in places"
            :key="place.address"
            class="hotplace-item"
            @click="select(place)"
          >
            <div class="place-rank">
              <span class="rank">{{ place.rank }}</span>
              <span class="count">+{{ place.count }}</span>
            </div>
            <div class="place-info">
              <div class="place-name">{{ place.locationName }}</div>
              <div class="place-addr">{{ place.address }}</div>
            </div>
          </li>
        </ul>
        <div v-else class="empty-msg">불러오는 중...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { triendApi } from '@/axios'

const emit = defineEmits(['close', 'place-select'])

const places = ref([])

function close() {
  emit('close')
}
function select(place) {
  emit('place-select', place)
  close()
}

// 모달 열리면 핫플 데이터 조회
onMounted(async () => {
  try {
    const { data } = await triendApi.get('/api/myplace/hot-place-top10')
    // 랭킹 번호 붙여서 리스트 저장
    places.value = data.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }))
  } catch (e) {
    places.value = []
    alert('🔥 핫플레이스 정보를 불러올 수 없습니다.')
  }
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 120px;
}

.hotplace-modal {
  background: #fff;
  border-radius: 18px;
  min-width: 370px;
  max-width: 90vw;
  box-shadow: 0 8px 36px rgba(30,65,165,0.12);
  padding: 0;
  animation: modal-fadein .19s;
}

@keyframes modal-fadein {
  from { transform: translateY(30px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 19px 22px 13px 22px;
  border-bottom: 1px solid #e0e0e0;
}
.modal-title {
  font-size: 1.2em;
  font-weight: bold;
  color: #f16522;
  letter-spacing: -1px;
}
.close-btn {
  border: none;
  background: none;
  font-size: 1.7em;
  color: #aaa;
  cursor: pointer;
  padding: 0 6px;
}

.modal-body {
  padding: 12px 22px 18px 22px;
  min-height: 120px;
}

.hotplace-list {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hotplace-item {
  display: flex;
  align-items: flex-start;
  gap: 17px;
  padding: 12px;
  background: #f8fbfd;
  border-radius: 12px;
  cursor: pointer;
  transition: box-shadow .12s;
  border: 1.5px solid transparent;
}
.hotplace-item:hover {
  background: #e3f0ff;
  box-shadow: 0 2px 8px rgba(30,65,165,0.06);
  border-color: #9acfff;
}
.place-rank {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 40px;
  margin-top: 2px;
}
.rank {
  font-size: 1.28em;
  font-weight: 700;
  color: #3783ea;
}
.count {
  font-size: 0.97em;
  color: #fe7235;
  font-weight: bold;
}
.place-info {
  flex: 1;
  min-width: 0;
}
.place-name {
  font-weight: 600;
  font-size: 1.1em;
  margin-bottom: 1px;
  color: #263e56;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.place-addr {
  font-size: 0.98em;
  color: #444;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.empty-msg {
  color: #999;
  text-align: center;
  font-size: 1.08em;
  padding: 20px 0;
}
</style>
