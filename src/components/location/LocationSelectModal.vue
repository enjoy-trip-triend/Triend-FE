<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <h2>장소 선택</h2>
        <!-- RegionSelector를 사용해 시도/구군 선택 -->
        <RegionSelector @search-region="onSelect" />
       <div class="button-group">
          <button type="button" class="submit-btn" @click="confirmSelection">선택</button>
          <button type="button" class="cancel-btn" @click="$emit('close')">취소</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'
import RegionSelector from '@/components/location/RegionSelector.vue'

const emit = defineEmits(['select', 'close'])
const selectedRegion = ref(null)

// RegionSelector에서 선택된 객체를 받음
function onSelect(region) {
    // region: { sidoCode, gugunCode, sidoName, gugunName }
    selectedRegion.value = region
}

// 선택 완료 시 부모로 emit
function confirmSelection() {
    if (selectedRegion.value) {
        emit('select', selectedRegion.value)
    }
    emit('close')
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal {
    background: #fff;
    padding: 30px;
    border-radius: 10px;
    width: 400px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    text-align: center;
}

.modal h2 {
  margin-bottom: 15px;
  color: #0288d1;
}

.button-group {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 10px;
}

.submit-btn {
    background: #4fc3f7;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
}

.cancel-btn {
    background: transparent;
    border: 1px solid #4fc3f7;
    color: #4fc3f7;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
}

.submit-btn:hover {
    background: #015f9b;
}

.cancel-btn:hover {
    background: #f0f0f0;
}
</style>
