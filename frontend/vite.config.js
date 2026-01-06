// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { // כל בקשה שתתחיל ב-/api תופנה לשרת ה-Backend
        target: 'http://localhost:5000', // כתובת שרת ה-Backend שלך
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // מסיר את '/api' מהנתיב לפני שליחה ל-Backend
      },
    },
  },
});