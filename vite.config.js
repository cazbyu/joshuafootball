import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const SUPABASE_HOST = 'https://wyipyiahvjcvnwoxwttd.supabase.co'

export default defineConfig({
  // Dev-only: the project is previewed from outside its folder in this setup,
  // so relax Vite's filesystem allow-list. No effect on `vite build`.
  server: {
    fs: { strict: false },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Joshua Football',
        short_name: 'Playbook',
        description: "Joshua's pass-game playbook quiz",
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Keep plays available offline across sessions: cache the Supabase REST GETs.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.href.startsWith(`${SUPABASE_HOST}/rest/`),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-rest',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
