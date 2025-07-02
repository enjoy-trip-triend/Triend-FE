// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import Vuetify from './plugins/vuetify'
import '@/assets/css/global.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate )

app.use(Vuetify)
app.use(pinia)
app.use(router)

app.mount('#app')
