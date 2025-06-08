<!-- src/components/myplace/EditPlaceModal.vue -->
<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h3>장소 수정</h3>

      <!-- 설명 입력 -->
      <div class="field">
        <label for="desc">설명</label>
        <textarea
          id="desc"
          v-model="form.description"
          rows="3"
        />
      </div>

      <!-- 카테고리 선택 -->
      <div class="field">
        <label for="cat">카테고리</label>
        <select
          id="cat"
          v-model.number="form.categoryId"
        >
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="actions">
        <button class="btn-cancel" @click="emit('close')">
          취소
        </button>
        <button class="btn-save" @click="save">
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { triendApi } from '@/axios'

// 1) defineEmits로 emit 함수 꺼내오기
const emit = defineEmits([ 'save', 'close' ])

// 2) 초기 props 받고, 폼 객체 만들기
const props = defineProps({
  initial: { type: Object, required: true }
})
const form = reactive({
  id:           props.initial.id,
  description:  props.initial.description,
  categoryId:   props.initial.categoryId
})

// 3) 부모가 initial을 바꿀 때마다 폼 동기화
watch(
  () => props.initial,
  v => {
    form.id          = v.id
    form.description = v.description
    form.categoryId  = v.categoryId
  },
  { immediate: true }
)

const categories = ref([])

// 4) 카테고리 로드
async function loadCategories() {
  try {
    const res = await triendApi.get('/api/myplace/get-category-list')
    categories.value = res.data
  } catch (e) {
    console.error('카테고리 목록 조회 실패', e)
    alert('카테고리 로드에 실패했습니다.')
  }
}
onMounted(loadCategories)

// 5) 저장 처리 시 emit 호출
function save() {
  if (!form.description.trim()) {
    alert('설명을 입력해주세요.')
    return
  }
  emit('save', {
    id:          form.id,
    description: form.description,
    categoryId:  form.categoryId
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.4);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 360px;
}
.field {
  margin-bottom: 16px;
}
.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}
.field textarea,
.field select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn-cancel,
.btn-save {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-cancel {
  background: #eee;
}
.btn-save {
  background: #42a5f5;
  color: #fff;
}
.btn-save:hover {
  background: #1e88e5;
}
</style>
