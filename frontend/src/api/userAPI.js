/**
 * User API Service
 * API calls untuk manajemen user
 */

import { axiosPrivate } from './axios';

const userAPI = {
    /**
     * Get all users with pagination
     * @param {Object} params - { page, limit, search, role, is_active }
     */
    getAll: async (params = {}) => {
        const response = await axiosPrivate.get('/users', { params });
        return response.data;
    },

    /**
     * Get user by ID
     * @param {number} id
     */
    getById: async (id) => {
        const response = await axiosPrivate.get(`/users/${id}`);
        return response.data;
    },

    /**
     * Create new user
     * @param {Object} userData - { name, email, password, role, is_active }
     */
    create: async (userData) => {
        const response = await axiosPrivate.post('/users', userData);
        return response.data;
    },

    /**
     * Update user
     * @param {number} id
     * @param {Object} userData - { name, email, password, role, is_active }
     */
    update: async (id, userData) => {
        const response = await axiosPrivate.put(`/users/${id}`, userData);
        return response.data;
    },

    /**
     * Delete user (soft delete)
     * @param {number} id
     */
    delete: async (id) => {
        const response = await axiosPrivate.delete(`/users/${id}`);
        return response.data;
    },

    /**
     * Change password for current user
     * @param {Object} passwordData - { current_password, new_password, confirm_password }
     */
    changePassword: async (passwordData) => {
        const response = await axiosPrivate.put('/users/change-password', passwordData);
        return response.data;
    },
};

export default userAPI;
