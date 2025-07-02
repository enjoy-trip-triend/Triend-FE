// src/stores/member.js
import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { triendApi } from '@/axios'
import router from '@/router'

export const useMemberStore = defineStore(
  'member',
  () => {
    const isLoggedIn = ref(false)
    const loginUser = ref({ name: '', email: '', role: '' })
    const tokens = ref({})

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
        isLoggedIn.value = true
        tokens.value = response.data
        const decoded = jwtDecode(tokens.value.accessToken)
        loginUser.value = {
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        }
      } catch (e) {
        throw 'id/pass 확인' + e.name
      }
    }

    const refresh = async () => {
      tokens.value.accessToken = null
      const response = await triendApi({
        url: '/api/auth/refresh',
        method: 'post',
        headers: {
          'Refresh-Token': tokens.value.refreshToken,
        },
      })
      tokens.value = response.data.data
    }

    const logout = async () => {
      try {
        tokens.value.accessToken = null
        await triendApi({
          url: '/api/auth/logout',
          method: 'post',
          headers: {
            'Refresh-Token': tokens.value.refreshToken,
          },
        })
      } finally {
        loginUser.value = {}
        isLoggedIn.value = false
        tokens.value = {}
        localStorage.removeItem('accessToken')
        router.push({ name: 'home' })
      }
    }

    const setLoginUser = (user) => {
      loginUser.value = {
        name: user.name,
        email: user.email,
        role: user.role,
      }
      isLoggedIn.value = true
    }

    return {
      isLoggedIn,
      loginUser,
      tokens,
      login,
      logout,
      refresh,
      setLoginUser,
    }
  },
  {
    persist: {
      paths: ['isLoggedIn', 'loginUser', 'tokens'],
      storage: localStorage,
    },
  },
)
