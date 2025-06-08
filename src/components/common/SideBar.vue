<template>
  <div class="side-bar" :style="{ width: width }">
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  width: {
    type: String,
    default: '300px',
  }
})
</script>

<style scoped>
.side-bar {
  background-color: #e1f5fe; /* 💙 살짝 밝은 하늘색 검색창 */
  padding: 20px;
  border-right: 1px solid #81d4fa;
  height: calc(100vh - 60px); /* 헤더(60px)를 뺀 전체 높이 */
  overflow-y: auto;  
  box-sizing: border-box;
}
</style>
