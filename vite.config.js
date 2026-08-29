import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // host: true 绑定全部网卡（IPv4 + IPv6），
    // 避免 Node 只挑 ::1 导致浏览器走 127.0.0.1 时连接被拒
    host: true,
    port: 5173,
  },
})
