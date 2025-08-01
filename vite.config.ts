import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  build: {
    outDir: 'dist', // Ensure build outputs to dist/
    rollupOptions: {
      input: '/src/index.tsx' // Updated to assumed entry point
    }
  },
  server: {
    host: '0.0.0.0', // Bind to all interfaces for Render
    port: parseInt(process.env.PORT || '10000') // Use Render's port
  },
  preview: {
    host: '0.0.0.0', // Bind preview server to all interfaces
    port: parseInt(process.env.PORT || '10000'), // Match Render's port
    allowedHosts: ['terminalmind02.onrender.com'] // Allow Render's domain
  }
});
