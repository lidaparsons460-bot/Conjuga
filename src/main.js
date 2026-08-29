import { createApp } from 'vue'
import './styles/tokens.css'
import App from './App.vue'
import router from './router'
import { initLibrary } from './composables/useLibrary'
import { initMistakes } from './composables/useMistakes'
import { initNotes } from './composables/useNotes'

// IndexedDB 异步加载完成后再挂载，避免首帧渲染空数据闪烁
Promise.all([initLibrary(), initMistakes(), initNotes()]).then(() => {
  createApp(App).use(router).mount('#app')
})
