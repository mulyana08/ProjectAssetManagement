/**
 * Auth API Service
 * API calls untuk autentikasi
 */

import { axiosPublic, axiosPrivate } from './axios';

const authAPI = {
    /**
     * Login user
     * @param {string} email
     * @param {string} password
     */
    login: async (email, password) => {
        const response = await axiosPublic.post('/auth/login', { email, password });
        return response.data;
    },

    /**
     * Register new user (Admin only)
     * @param {Object} userData - { name, email, password, role }
     */
    register: async (userData) => {
        const response = await axiosPrivate.post('/auth/register', userData);
        return response.data;
    },

    /**
     * Logout user
     */
    logout: async () => {
        const response = await axiosPrivate.delete('/auth/logout');
        return response.data;
    },

    /**
     * Refresh access token
     */
    refreshToken: async () => {
        const response = await axiosPublic.get('/auth/token');
        return response.data;
    },

    /**
     * Get current user profile
     */
    getMe: async () => {
        const response = await axiosPrivate.get('/auth/me');
        return response.data;
    },
};

export default authAPI;
