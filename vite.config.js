import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // 当部署到 GitHub Pages 时，base 需要设置为 /<repo-name>/
  base: process.env.NODE_ENV === 'production' ? '/chat-vue/' : '/',
  plugins: [vue()],
  build: {
    outDir: 'dist'
  }
})
