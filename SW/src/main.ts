import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify' // 引入設定檔

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify) // 掛載 Vuetify

app.mount('#app')