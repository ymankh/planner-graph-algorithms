import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { fileURLToPath } from 'node:url'

const algorithmsPackagePath = fileURLToPath(
  new URL('../../packages/graph-planner-algorithms/src', import.meta.url),
)

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'graph-planner-algorithms': algorithmsPackagePath,
    },
  },
  build: {
    emptyOutDir: false,
  },
  publicDir: false,
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
