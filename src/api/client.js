// src/api/client.js
import axios from 'axios';
import {store} from '@/Store/store';   // <-- the Redux store, NOT a hook

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token =localStorage.getItem('token') || store.getState().auth?.user?.token;   // direct state read
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;