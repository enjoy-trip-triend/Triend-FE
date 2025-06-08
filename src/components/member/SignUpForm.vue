<!-- src/components/SignUpForm.vue -->
<template>
  <section class="signup-box">
    <h1>회원가입</h1>
    <form @submit.prevent="onSubmit">
      <!-- 이메일 -->
      <div class="input-group">
        <label for="email">이메일</label>
        <div class="input-with-button">
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="example@domain.com"
          />
          <button type="button" @click="checkEmail">중복확인</button>
        </div>
        <div
          class="feedback"
          :style="{ color: emailAvailable === false ? 'red' : 'green' }"
        >
          {{ emailFeedback }}
        </div>
      </div>

      <!-- 비밀번호 -->
      <div class="input-group half">
        <div>
          <label for="password">비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
          />
        </div>
        <div>
          <label for="passwordConfirm">비밀번호 확인</label>
          <input
            type="password"
            id="passwordConfirm"
            v-model="passwordConfirm"
            required
          />
        </div>
      </div>

      <!-- 이름 -->
      <div class="input-group">
        <label for="name">이름</label>
        <input
          type="text"
          id="name"
          v-model="name"
          required
          placeholder="홍길동"
        />
      </div>

      <!-- 생일 -->
      <div class="input-group">
        <label for="birth">생년월일</label>
        <input
          type="date"
          id="birth"
          v-model="birth"
          required
          :max="today"
        />
      </div>

      <!-- MBTI -->
      <div class="input-group">
        <label for="mbti">MBTI</label>
        <select id="mbti" v-model="mbti" required>
          <option value="" disabled>MBTI를 선택하세요</option>
          <option v-for="type in mbtiList" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <!-- 성격 -->
      <div class="input-group">
        <label>성격</label>
        <div class="character-checkbox-container">
          <div v-for="character in characters" :key="character.id">
            <input
              type="checkbox"
              :id="`character-${character.id}`"
              :value="character.id"
              v-model="selectedCharacters"
              :disabled="
                selectedCharacters.length >= 3 &&
                !selectedCharacters.includes(character.id)
              "
            />
            <label :for="`character-${character.id}`">
              {{ character.name }}
            </label>
          </div>
        </div>
        <div class="instruction">
          성격을 선택하시면 더 나은 여행 추천을 받을 수 있습니다! (최대 3개)
        </div>
      </div>

      <button type="submit" class="btn-submit">가입하기</button>

      <div class="login-link">
        이미 계정이 있으신가요?
        <router-link to="/member/login-form">로그인</router-link>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { triendApiNoAuth } from '@/axios'

const router = useRouter()

const email = ref('')
const emailFeedback = ref('')
const emailAvailable = ref(null)

const password = ref('')
const passwordConfirm = ref('')
const name = ref('')

const birth = ref('')
const today = computed(() => new Date().toISOString().split('T')[0])

const mbti = ref('')
const selectedCharacters = ref([])

const mbtiList = [
  'ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP',
  'ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'
]

const characters = ref([])

onMounted(async () => {
  try {
    const res = await triendApiNoAuth.get('/api/member/characters')
    characters.value = res.data
  } catch (err) {
    console.error('성격 목록 불러오기 실패:', err)
    alert('성격 목록을 불러오지 못했습니다.')
  }
})

async function checkEmail() {
  if (!email.value) {
    alert('이메일을 입력하세요.')
    return
  }
  try {
    const res = await triendApiNoAuth.get('/api/member/check-email', {
      params: { email: email.value }
    })
    emailAvailable.value = res.data.available
    emailFeedback.value = emailAvailable.value
      ? '사용 가능한 이메일입니다.'
      : '이미 사용 중인 이메일입니다.'
  } catch (err) {
    console.error('이메일 중복 확인 실패:', err)
    alert('이메일 중복 확인 중 문제가 발생했습니다.')
  }
}

async function onSubmit() {
  if (emailAvailable.value === false) {
    alert('다른 이메일을 사용해주세요.')
    return
  }
  if (password.value !== passwordConfirm.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }
  if (selectedCharacters.value.length === 0) {
    alert('최소 하나의 성격을 선택해주세요.')
    return
  }

  const payload = {
    email: email.value,
    password: password.value,
    name: name.value,
    birth: birth.value,
    mbti: mbti.value,
    characters: selectedCharacters.value
  }

  try {
    await triendApiNoAuth.post('/api/member/signup', payload)
    alert('회원가입이 완료되었습니다!')
    router.push('/member/login-form')
  } catch (err) {
    console.error('회원가입 실패:', err)
    alert('회원가입 중 오류가 발생했습니다.')
  }
}
</script>


<style scoped>
/* 기존 스타일 그대로 유지 */
.signup-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  padding: 40px 30px;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
}

.input-group {
  margin-bottom: 15px;
}

.input-group.half {
  display: flex;
  gap: 10px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
}

.input-with-button {
  display: flex;
}

.input-with-button input {
  flex: 1;
}

.input-with-button button {
  margin-left: 8px;
  padding: 0 12px;
  background: #007c91;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-with-button button:hover {
  background: #005f6b;
}

.feedback {
  margin-top: 4px;
  font-size: 13px;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: #007c91;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 17px;
  cursor: pointer;
  margin-top: 10px;
}

.btn-submit:hover {
  background: #005f6b;
}

.login-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.login-link a {
  color: #007c91;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.character-checkbox-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.character-checkbox-container input[type="checkbox"] {
  display: none;
}

.character-checkbox-container label {
  display: inline-block;
  padding: 8px 20px;
  border: 2px solid #ccc;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, border-color 0.3s;
}

.character-checkbox-container input[type="checkbox"]:checked + label {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.character-checkbox-container label:hover {
  border-color: #007bff;
}

.instruction {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}
</style>
