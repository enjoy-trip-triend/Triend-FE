// src/stores/member.js
import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { triendApi } from '@/axios'
import router from '@/router'

export const useMemberStore = defineStore('member', () => {
  const _isLoggedIn = ref(false)
  const _loginUser = ref({ name: '', email: '', role: '' })

  const isLoggedIn = computed(() => _isLoggedIn.value)
  const loginUser = computed(() => _loginUser.value)

  const _tokens = ref({})
  const tokens = computed(() => _tokens.value)

  const login = async ({ email, password }) => {
    try {
      const response = await triendApi({
        url: '/api/auth/login',
        method: 'post',
        data: new URLSearchParams({ email, password }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      _isLoggedIn.value = true
      _tokens.value = response.data
      // 새로고침 시 로그인 유지되도록 localStorage에 저장
      localStorage.setItem('accessToken', response.data.accessToken)
      const decoded = jwtDecode(_tokens.value.accessToken)
      _loginUser.value = { name: decoded.name, email: decoded.email, role: decoded.role }
    } catch (e) {
      throw 'id/pass 확인' + e.name
    }
  }

  const refresh = async () => {
    _tokens.value.accessToken = null
    const response = await triendApi({
      url: '/api/auth/refresh',
      method: 'post',
      headers: {
        'Refresh-Token': _tokens.value.refreshToken,
      },
    })
    _tokens.value = response.data.data
  }

  const logout = async () => {
    try {
      _tokens.value.accessToken = null
      await triendApi({
        url: '/api/auth/logout',
        method: 'post',
        headers: {
          'Refresh-Token': _tokens.value.refreshToken,
        },
      })
    } finally {
      _loginUser.value = {}
      _isLoggedIn.value = false
      _tokens.value = {}
      localStorage.removeItem('accessToken')
      router.push({ name: 'home' })
    }
  }

  /**
   * 새로고침 후 자동 복원용 : 토큰만 세팅
   */
  const restoreToken = (token) => {
    _tokens.value.accessToken = token
  }

  // 유저 정보먼 세팅
  function setUser(user) {
    _loginUser.value = {
      name: user.name,
      email: user.email,
      role: user.role,
    }
    _isLoggedIn.value = true
  }

  return { isLoggedIn, loginUser, login, logout, tokens, restoreToken, setUser, refresh }
})
