import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      include: /\.(jsx|js)$/, // Add this to process both .js and .jsx as JSX
    }),
    tailwindcss(),
  ],
  server: {
    port: 5174,
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  }
})