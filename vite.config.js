import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // ВАЖЛИВО: Робить шляхи відносними, щоб сайт працював на GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Прибирає карти коду для зменшення розміру
  }
});