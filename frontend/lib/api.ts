import axios from 'axios';

// สร้าง Axios instance
export const api = axios.create({
  baseURL: 'http://localhost:3001',
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
