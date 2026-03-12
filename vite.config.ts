import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function getLucideChunkName(id: string) {
  if (id.includes('lucide-react/dynamicIconImports')) {
    return 'service-icons-runtime'
  }

  if (id.includes('lucide-react/dist/esm/shared')) {
    return 'lucide-core'
  }

  if (!id.includes('lucide-react/dist/esm/icons/')) {
    return null
  }

  const iconName = path.basename(id, '.js')
  const firstLetter = iconName[0]?.toLowerCase() ?? 'misc'

  if (firstLetter <= 'f') {
    return 'lucide-icons-a-f'
  }

  if (firstLetter <= 'l') {
    return 'lucide-icons-g-l'
  }

  if (firstLetter <= 'r') {
    return 'lucide-icons-m-r'
  }

  return 'lucide-icons-s-z'
}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const lucideChunkName = getLucideChunkName(id)
          if (lucideChunkName) {
            return lucideChunkName
          }

          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'react-vendor'
          }

          if (id.includes('react-router') || id.includes('@tanstack/react-query')) {
            return 'router-query'
          }

          if (id.includes('zustand')) {
            return 'state-vendor'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
