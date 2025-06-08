<!-- src/components/member/MyPlaceModal.vue -->
<template>
  <teleport to="body">
  <transition name="modal" appear>
    <div class="modal-backdrop">
      <div class="modal">
        <!-- 헤더 -->
        <div class="modal-header">
          <h3>나만의 장소 추가</h3>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
        

        <!-- 본문 -->
        <div class="modal-body">
            <!-- 위치 정보 -->
          <p class="location-info">{{ initial.locationName }}</p>
          <p class="location-sub">{{ initial.address }}</p>
          <!-- 카테고리 (맨 위) -->
          <div class="field">
            <label>카테고리 선택</label>
            <select v-model="form.categoryId">
              <option disabled value="">선택해주세요</option>
              <option
                v-for="c in categoryStore.list"
                :key="c.id"
                :value="c.id"
              >{{ c.name }}</option>
            </select>
          </div>

          <!-- 설명 -->
          <div class="field">
            <label>설명</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="장소에 대한 설명을 추가해 보세요"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('close')">취소</button>
          <button class="btn-primary" @click="submit">추가</button>
        </div>
      </div>
    </div>
  </transition>
  </teleport>
</template>

<script setup>
import { reactive, onMounted, watch } from 'vue'
import { useCategoryStore } from '@/stores/category'

defineProps({
  initial: Object
})
const emit = defineEmits(['submit', 'close'])

const categoryStore = useCategoryStore()
onMounted(() => categoryStore.fetchCategories())

const form = reactive({
  description: '',
  categoryId: ''
})

watch(
  () => categoryStore.list,
  list => {
    if (list.length && form.categoryId === '') {
      form.categoryId = list[0].id
    }
  }
)

function submit() {
  if (!form.categoryId) {
    alert('카테고리는 필수입니다.')
     return
   }
   emit('submit', {
   name: form.name,
   description: form.description,
   categoryId: form.categoryId
 })
}
</script>

<style scoped>
/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* Backdrop & Modal */
.modal-backdrop {
  position: fixed;
  inset: 0; 
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 10000;
}
.modal {
  background: #fff;
  border-radius: 12px;
  width: 420px; max-width: 90%;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* Header */
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}
.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #0d47a1;
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

/* Body */
.modal-body {
  padding: 20px;
}
.location-info {
  font-size: 16px;
  font-weight: 600;
  color: #0d47a1;
  margin: 0 0 4px;
}
.location-sub {
  font-size: 14px;
  color: #555;
  margin: 0 0 16px;
}
.field {
  display: flex; flex-direction: column;
  margin-bottom: 16px;
}
.field label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}
.field input,
.field textarea,
.field select {
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s;
}
.field input::placeholder,
.field textarea::placeholder {
  color: #aaa;
}
.field textarea {
  resize: vertical;
}
.field input:focus,
.field textarea:focus,
.field select:focus {
  border-color: #0d47a1;
}

/* Footer */
.modal-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
}
.btn-secondary {
  background: #fafafa;
  border: 1px solid #ccc;
  color: #555;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-secondary:hover {
  background: #f0f0f0;
}
.btn-primary {
  background: #0d47a1;
  border: none;
  color: #fff;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-primary:hover {
  background: #08327b;
}
</style>
