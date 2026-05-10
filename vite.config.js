import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** GitHub Pages 프로젝트 사이트는 https://<user>.github.io/<저장소이름>/ 형태라 base가 필요함 */
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
})
