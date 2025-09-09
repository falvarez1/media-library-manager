import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    port: 3015,
    strictPort: false,
    open: true,
  },
  
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_USE_REAL_API': JSON.stringify(process.env.VITE_USE_REAL_API || 'false'),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5005'),
    'process.env.VITE_MOCK_DELAY_MIN': JSON.stringify(process.env.VITE_MOCK_DELAY_MIN || '200'),
    'process.env.VITE_MOCK_DELAY_MAX': JSON.stringify(process.env.VITE_MOCK_DELAY_MAX || '800'),
    'process.env.VITE_MOCK_DELAY_FIXED': JSON.stringify(process.env.VITE_MOCK_DELAY_FIXED || ''),
    'process.env.VITE_MOCK_ERROR_RATE': JSON.stringify(process.env.VITE_MOCK_ERROR_RATE || '0.05'),
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})