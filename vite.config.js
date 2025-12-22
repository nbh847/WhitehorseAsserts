import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
   server: {
    host: '0.0.0.0', // 设置主机地址为 0.0.0.0
    port: 5174,       // 设置端口号为 8080（你可以根据需要更改）
    open: false,      // 是否在启动时自动打开浏览器
    // proxy: {          // 可选：代理配置
      // '/api': {
        // target: 'http://your-backend-server.com',
        // changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      // }
    // }
  },
  plugins: [vue()],
})