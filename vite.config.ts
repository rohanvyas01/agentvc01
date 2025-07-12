import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path' // Import the 'path' module with the required 'node:' prefix

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Define the '@' alias to point to the 'src' directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})
