import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// PANO — bağımsız uygulama, apps/client'tan (KOMUTA) izole. Kendi portu (5174),
// kendi tasarım sistemi. komuta.css / apps/client'tan hiçbir şey import ETMEZ.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: parseInt(process.env.VITE_PORT || '5174'),
    strictPort: false,
  },
})
