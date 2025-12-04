/**
 * Location API Service
 * API calls untuk manajemen lokasi
 */

import { axiosPrivate } from './axios';

const locationAPI = {
    /**
     * Get all locations with pagination
     * @param {Object} params - { page, limit, search, building, all }
     */
    getAll: async (params = {}) => {
        const response = await axiosPrivate.get('/locations', { params });
        return response.data;
    },

    /**
     * Get location by ID
     * @param {number} id
     */
    getById: async (id) => {
        const response = await axiosPrivate.get(`/locations/${id}`);
        return response.data;
    },

    /**
     * Create new location
     * @param {Object} locationData - { name, building, floor, description }
     */
    create: async (locationData) => {
        const response = await axiosPrivate.post('/locations', locationData);
        return response.data;
    },

    /**
     * Update location
     * @param {number} id
     * @param {Object} locationData - { name, building, floor, description }
     */
    update: async (id, locationData) => {
        const response = await axiosPrivate.put(`/locations/${id}`, locationData);
        return response.data;
    },

    /**
     * Delete location
     * @param {number} id
     */
    delete: async (id) => {
        const response = await axiosPrivate.delete(`/locations/${id}`);
        return response.data;
    },

    /**
     * Get all unique buildings for filter
     */
    getBuildings: async () => {
        const response = await axiosPrivate.get('/locations/buildings');
        return response.data;
    },

    /**
     * Get all locations for dropdown (no pagination)
     */
    getAllForDropdown: async () => {
        const response = await axiosPrivate.get('/locations', { params: { all: true } });
        return response.data;
    },

    /**
     * Get all locations without pagination (for filters)
     */
    getAllWithoutPagination: async () => {
        const response = await axiosPrivate.get('/locations', { params: { all: true } });
        return response.data;
    },
};

export default locationAPI;
