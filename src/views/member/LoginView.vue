<template>
  <main class="login-container">
    <LoginForm />
  </main>
</template>

<script setup>
import LoginForm from '@/components/member/LoginForm.vue'
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body, html {
  height: 100%;
  margin: 0;
  background-color: #e0f7fa;
}

.login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 600px) {
  .login-container {
    max-width: 100%;
    padding: 0 10px;
  }
}
</style>
