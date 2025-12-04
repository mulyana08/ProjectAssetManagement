/**
 * Asset API Service
 * API calls untuk manajemen aset
 */

import { axiosPrivate } from './axios';

const assetAPI = {
    /**
     * Get all assets with pagination, search, and filters
     * @param {Object} params - { page, limit, search, status, category_id, location_id, sort_by, sort_order }
     */
    getAll: async (params = {}) => {
        const response = await axiosPrivate.get('/assets', { params });
        return response.data;
    },

    /**
     * Get asset by ID with transaction history
     * @param {number} id
     */
    getById: async (id) => {
        const response = await axiosPrivate.get(`/assets/${id}`);
        return response.data;
    },

    /**
     * Create new asset
     * @param {Object} assetData
     */
    create: async (assetData) => {
        const response = await axiosPrivate.post('/assets', assetData);
        return response.data;
    },

    /**
     * Update asset
     * @param {number} id
     * @param {Object} assetData
     */
    update: async (id, assetData) => {
        const response = await axiosPrivate.put(`/assets/${id}`, assetData);
        return response.data;
    },

    /**
     * Delete asset (only if disposed)
     * @param {number} id
     */
    delete: async (id) => {
        const response = await axiosPrivate.delete(`/assets/${id}`);
        return response.data;
    },

    /**
     * Get asset statistics for dashboard
     */
    getStats: async () => {
        const response = await axiosPrivate.get('/assets/stats');
        return response.data;
    },

    /**
     * Generate preview asset code
     * @param {string} prefix
     */
    generateCode: async (prefix = 'AST') => {
        const response = await axiosPrivate.get('/assets/generate-code', { params: { prefix } });
        return response.data;
    },
};

export default assetAPI;
