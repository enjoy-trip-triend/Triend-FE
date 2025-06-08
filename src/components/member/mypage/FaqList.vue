<template>
  <div class="faq-list">
    <h2>FAQ</h2>
    <div v-for="(faq, idx) in faqs" :key="idx" class="faq-item">
      <h3 @click="toggle(idx)">
        {{ faq.question }}
        <span>{{ openIndex === idx ? '−' : '+' }}</span>
      </h3>
      <p v-if="openIndex === idx">{{ faq.answer }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const faqs = [
  { question: 'Q1: 어떻게 사용하나요?', answer: 'A1: ...' },
  { question: 'Q2: 장소를 어떻게 추가하나요?', answer: 'A2: ...' },
  // 추가 FAQ
]
const openIndex = ref(null)

function toggle(i) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<style scoped>
.faq-list h2 {
  margin-bottom: 16px;
  color: #0277bd;
}
.faq-item h3 {
  cursor: pointer;
  margin: 12px 0;
  display: flex;
  justify-content: space-between;
}
.faq-item p {
  margin: 8px 0 0 0;
  padding-left: 12px;
}
</style>
