<!-- SignUpView.vue -->
<template>
  <main class="signup-container">
    <SignUpForm />
  </main>
</template>

<script setup>
import SignUpForm from '@/components/member/SignUpForm.vue'
</script>

<style scoped>
.signup-container {
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e0f7fa;
  overflow-y: auto;
}
</style>
