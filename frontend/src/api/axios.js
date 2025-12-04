import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_URL = `${BASE_URL}/api`;

// Axios instance untuk request tanpa auth
export const axiosPublic = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Axios instance untuk request dengan auth
const axiosPrivate = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Untuk mengirim cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - tambahkan access token ke header
axiosPrivate.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle token refresh
axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Jika error 401 dan belum pernah retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Coba refresh token
                const response = await axios.get(`${BASE_URL}/api/auth/token`, {
                    withCredentials: true
                });

                const newAccessToken = response.data.accessToken;
                sessionStorage.setItem('accessToken', newAccessToken);

                // Update header dan retry request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosPrivate(originalRequest);
            } catch (refreshError) {
                // Refresh token gagal, redirect ke login
                sessionStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { axiosPrivate };
export default axiosPrivate;
