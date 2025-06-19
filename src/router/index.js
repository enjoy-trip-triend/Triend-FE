// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/member/LoginView.vue'
import SignUpView from '@/views/member/SignUpView.vue'
import LandingView from '@/views/LandingView.vue'
import MyPageView from '@/views/member/MyPageView.vue'
import PlannerView from '@/views/planner/PlannerView.vue'
import PlannerShareView from '@/views/planner/PlannerShareView.vue'

import { useMemberStore } from '@/stores/member'
import { triendApi } from '@/axios'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: () => import('@/views/HomeView.vue'),
      beforeEnter: (to, from, next) => {
        const hasVisitedLanding = sessionStorage.getItem('visitedLanding')
        if (!hasVisitedLanding) {
          sessionStorage.setItem('visitedLanding', 'true')
          next('/landing')
        } else {
          next()
        }
      },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/landing',
      name: 'landing',
      component: LandingView,
      meta: { hideLayout: true },
    },
    {
      path: '/planners',
      name: 'PlannerView',
      component: PlannerView,
    },
    {
      path: '/member/login-form',
      name: 'LoginView',
      component: LoginView,
    },
    {
      path: '/member/signup-form',
      name: 'SignUpView',
      component: SignUpView,
    },
    {
      path: '/member/mypage',
      name: 'MyPageView',
      component: MyPageView,
    },
    {
      path: '/planners/share/:secretCode',
      name: 'PlannerShareView',
      component: PlannerShareView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const memberStore = useMemberStore()
  const token = localStorage.getItem('accessToken')

  if (token && !memberStore.user) {
    memberStore.restoreToken(token)
    try {
      const res = await triendApi.get('/api/member/details')
      memberStore.restoreToken(token)
      memberStore.setUser(res.data)
    } catch (err) {
      memberStore.logout()
      console.log('자동 로그인 실패:', err)
    }
  }

  next()
})

export default router
