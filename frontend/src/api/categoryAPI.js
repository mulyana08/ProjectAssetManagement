/**
 * Category API Service
 * API calls untuk manajemen kategori
 */

import { axiosPrivate } from './axios';

const categoryAPI = {
    /**
     * Get all categories with pagination
     * @param {Object} params - { page, limit, search, all }
     */
    getAll: async (params = {}) => {
        const response = await axiosPrivate.get('/categories', { params });
        return response.data;
    },

    /**
     * Get category by ID
     * @param {number} id
     */
    getById: async (id) => {
        const response = await axiosPrivate.get(`/categories/${id}`);
        return response.data;
    },

    /**
     * Create new category
     * @param {Object} categoryData - { name, description }
     */
    create: async (categoryData) => {
        const response = await axiosPrivate.post('/categories', categoryData);
        return response.data;
    },

    /**
     * Update category
     * @param {number} id
     * @param {Object} categoryData - { name, description }
     */
    update: async (id, categoryData) => {
        const response = await axiosPrivate.put(`/categories/${id}`, categoryData);
        return response.data;
    },

    /**
     * Delete category
     * @param {number} id
     */
    delete: async (id) => {
        const response = await axiosPrivate.delete(`/categories/${id}`);
        return response.data;
    },

    /**
     * Get all categories for dropdown (no pagination)
     */
    getAllForDropdown: async () => {
        const response = await axiosPrivate.get('/categories', { params: { all: true } });
        return response.data;
    },

    /**
     * Get all categories without pagination (for filters)
     */
    getAllWithoutPagination: async () => {
        const response = await axiosPrivate.get('/categories', { params: { all: true } });
        return response.data;
    },
};

export default categoryAPI;
