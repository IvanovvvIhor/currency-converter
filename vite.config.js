import { defineConfig } from 'vite';

export default defineConfig({
  // 👇 ЗАМІНИ 'currency-converter' НА НАЗВУ ТВОГО РЕПОЗИТОРІЮ З URL
  base: '/currency-converter/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  }
});