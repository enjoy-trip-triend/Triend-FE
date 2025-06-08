// index.js
import axios from 'axios'
import { useMemberStore } from '@/stores/member'

// 인증이 필요한 API 사용
const triendApi = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 1000,
})

triendApi.interceptors.request.use(
  async (config) => {
    console.log('[요청 발신]: ', config.method, config.url, config.data)

    const memberStore = useMemberStore()
    if (memberStore.tokens?.accessToken) {
      config.headers['Authorization'] = `Bearer ${memberStore.tokens.accessToken}`
    }
    // END
    return config
  },
  (error) => {
    console.log('[요청 실패]: ', error)
    return Promise.reject(error)
  },
)

triendApi.interceptors.response.use(
  (response) => {
    console.log('[응답 수신 1]: ', response.status, response.data)
    return response
  },
  async (error) => {
    console.log('[오류 수신 1]: ', error)

    // 로그인 실패시 refresh token으로 로그인 다시 시도
    if (error.status === 401 && error.response?.data.message === 'TOKEN_ERROR') {
      console.log('access tokens 만료')
      const originalRequest = error.config
      const memberStore = useMemberStore()
      try {
        await memberStore.refresh()
        return triendApi(originalRequest)
      } catch (e) {
        console.log(e)
        memberStore.logout()
      }
    }
    // END

    return Promise.reject(error)
  },
)

// 인증이 필요없는 API일 때 사용한다.
const triendApiNoAuth = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 1000,
})

triendApiNoAuth.interceptors.request.use(
  async (config) => {
    console.log('[요청 발신]: ', config.method, config.url, config.data)
    return config
  },
  (error) => {
    console.log('[요청 실패]: ', error)
    return Promise.reject(error)
  },
)

triendApiNoAuth.interceptors.response.use(
  (response) => {
    console.log('[응답 수신 2]: ', response.status, response.data)
    return response
  },
  async (error) => {
    console.log('[오류 수신 2]: ', error)
    return Promise.reject(error)
  },
)

export { triendApi, triendApiNoAuth }
