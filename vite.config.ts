import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' 
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Permite conexiones externas
    port: 5173, // Puerto por defecto de Vite
    strictPort: true, // Falla si el puerto no está disponible
    hmr: {
      port: 5173
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true
  },

})