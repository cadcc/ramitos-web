import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig(({mode}) => {

    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [
          tanstackRouter({
            routesDirectory: './src/routes',
            generatedRouteTree: './src/routeTree.gen.ts',
            autoCodeSplitting: true,
          }),
          react(),
        ],
        server: {
          proxy: {
            "/api": {
                target: env.VITE_API_BASE_URL,
                changeOrigin: true
            }
          }
        }
    }
})
