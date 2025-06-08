<template>
  <div class="search-bar">
    <h2>검색</h2>
    <input
      class="search-input"
      type="text"
      v-model="query"
      :placeholder="placeholder"
      @keyup.enter="onSearch"
    />
    <button class="search-button" @click="onSearch">검색</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  searchType: String,
  placeholder: {
    type: String,
    default: '여행지 입력',
  },
})

const emit = defineEmits(['search'])
const query = ref('')
const onSearch = () => {
  emit('search', {
    type: props.searchType,
    query: query.value,
  })
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.search-bar h2 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #0277bd;
}
.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  border: 1px solid #81d4fa;
  border-radius: 5px;
  background-color: white;
}

.search-button {
  width: 100%;
  padding: 10px;
  background-color: #4fc3f7;
  border: none;
  color: white;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
