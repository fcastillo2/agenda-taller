import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import jsconfigPaths from "vite-jsconfig-paths";

export default defineConfig({
  plugins: [react(), jsconfigPaths()],

  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@mui/material/Tooltip',
    ],
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:81',
        changeOrigin: true,

        rewrite: (ruta) =>
          ruta.replace(/^\/api/, '/agenda-taller'),
      },
    },
  },
})