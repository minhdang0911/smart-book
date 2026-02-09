import axios from 'axios';

export const API_BASE = 'https://smartbook-backend.tranminhdang.cloud/api';

export const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
