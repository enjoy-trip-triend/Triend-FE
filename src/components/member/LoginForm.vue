<template>
  <section class="login-box">
    <h2>로그인</h2>
    <div v-if="hasError" class="error-msg">아이디 또는 비밀번호가 올바르지 않습니다.</div>
    <form @submit.prevent="onLogin" class="login-form">
      <div class="input-group">
        <label for="email">이메일</label>
        <input type="text" id="email" v-model="email" placeholder="example@domain.com" required />
      </div>
      <div class="input-group">
        <label for="password">비밀번호</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div class="options">
        <label>
          <input type="checkbox" v-model="rememberMe" />
          아이디 기억하기
        </label>
        <a href="#" class="forgot">비밀번호 찾기</a>
      </div>
      <button type="submit" class="btn-login">로그인</button>
    </form>
    <div class="signup-link">
      아직 계정이 없으신가요?
      <router-link to="/signup">회원가입</router-link>
    </div>
  </section>
</template>

<script setup>
import { useMemberStore } from '@/stores/member'
import { ref } from 'vue'
import { useRouter} from 'vue-router'

const memberStore = useMemberStore()
const router = useRouter()
const email = ref(localStorage.getItem('rememberedEmail') || '')
const password = ref('')
const rememberMe = ref(!!email.value)
const hasError = ref(false)

async function onLogin() {
  if (!email.value || !password.value) {
    alert('이메일과 비밀번호를 모두 입력해주세요.')
    return
  }

  try {
    await memberStore.login({ email: email.value, password: password.value })

    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', email.value)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    // role 기반 라우팅
    const role = memberStore.loginUser?.role
    console.log('로그인 성공, 사용자 역할:', role)
    if (role === 'ADMIN') {
      router.replace('/admin/api/stats') // 관리자
    } else {
      router.replace('/') // 일반 사용자
    }
  } catch (err) {
    console.error(err)
    hasError.value = true
  }
}
</script>

<style scoped>
.login-box {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 30px 20px;
}

.login-box h2 {
  color: #007c91;
  text-align: center;
  margin-bottom: 20px;
}

.error-msg {
  background: #ffcdd2;
  color: #b71c1c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
}

.login-form .input-group {
  margin-bottom: 15px;
}

.login-form label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.login-form input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
}

.login-form input:focus {
  border-color: #007c91;
  outline: none;
}

.options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0 20px;
  font-size: 14px;
  flex-wrap: nowrap;
}

.options label {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
}

.options label input[type='checkbox'] {
  margin-right: 6px;
}

.options .forgot {
  text-decoration: none;
  color: #007c91;
}

.options .forgot:hover {
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: #007c91;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 17px;
  cursor: pointer;
}

.btn-login:hover {
  background: #005f6b;
}

.signup-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.signup-link a {
  color: #007c91;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
