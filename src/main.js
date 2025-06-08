// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Vuetify from './plugins/vuetify'
import '@/assets/css/global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(Vuetify)
app.use(pinia)
app.use(router)

app.mount('#app')
