import { createApp } from 'vue'
import './style.css'
import './utils/setRem'
import router from './router'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
