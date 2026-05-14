import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/proxy/8080': { target: 'http://localhost:8080', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/8080/, '') },
      '/proxy/8081': { target: 'http://localhost:8081', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/8081/, '') },
      '/proxy/8082': { target: 'http://localhost:8082', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/8082/, '') },
      '/proxy/8083': { target: 'http://localhost:8083', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/8083/, '') },
      '/proxy/8084': { target: 'http://localhost:8084', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/8084/, '') },
      '/proxy/8085': { target: 'http://localhost:8085', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/8085/, '') },
      '/proxy/8086': { target: 'http://localhost:8086', changeOrigin: true, rewrite: p => p.replace(/^\/proxy\/8086/, '') },
    }
  }
})