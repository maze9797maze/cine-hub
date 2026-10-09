import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base：网站部署的「子路径」。
  // 因为线上地址是 https://maze9797maze.github.io/cine-hub/（不是域名根目录），
  // 必须告诉 Vite：所有资源（js/css/图片）都要拼上 /cine-hub/ 这个前缀，
  // 否则部署后浏览器会去根目录找资源，导致 404 白屏。
  base: '/cine-hub/',
})
