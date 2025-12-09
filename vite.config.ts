import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This ensures assets are loaded relatively (./) instead of absolutely (/)
  // which fixes 404 errors when hosting on GitHub Pages subdirectories.
  base: './', 
});