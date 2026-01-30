import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './api/interceptors'

// 환경변수 강제 사용 (빌드에 포함시키기 위해)
const USE_PROXY = import.meta.env.VITE_USE_PROXY
const ENV_MODE = import.meta.env.VITE_ENV
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 환경변수 디버깅
console.log('=== Environment Variables ===')
console.log('VITE_USE_PROXY:', USE_PROXY)
console.log('VITE_ENV:', ENV_MODE)
console.log('VITE_API_BASE_URL:', API_BASE_URL)
console.log('MODE:', import.meta.env.MODE)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')