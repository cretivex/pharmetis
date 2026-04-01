import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      /** Design reference: images and SVGs live under reference_User_Ui/assets */
      '@reference': path.resolve(__dirname, '../reference_User_Ui'),
    },
  },
})
