import axios from 'axios';

// ดึง Base URL แบบไดนามิก เพื่อให้เทสข้ามเครื่อง (มือถือ) ได้
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // ถ้าเปิดจากมือถือ (192.168.x.x) ให้ยิงไปที่ IP นั้น Port 3001
    return `http://${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001'; // Default สำหรับ Server-side หรือเปิดในเครื่อง
};

// สร้าง Axios instance
export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor สำหรับแนบ JWT Token ทุกครั้งก่อนส่ง Request
api.interceptors.request.use(
  (config) => {
    // ดึง token จาก LocalStorage (ฝั่ง Client)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
