import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ⭐ เปิดให้ทุก IP เข้าได้ (สำหรับ Radmin VPN)
    port: 5173
  }
});

