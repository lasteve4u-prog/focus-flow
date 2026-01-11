import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['sounds/*.mp3'],
      manifest: {
        name: 'FocusFlow',
        short_name: 'FocusFlow',
        description: 'ADHD-friendly focus timer and task logger',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'zundamon-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'zundamon-icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'zundamon-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}']
      }
    })
  ],
  build: {
    assetsInlineLimit: 8192, // Increase inline limit to avoid small asset requests
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Ensure default splitting logic
      },
    },
  },
})
