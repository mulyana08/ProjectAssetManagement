/**
 * Transaction API Service
 * API calls untuk transaksi aset
 */

import { axiosPrivate } from './axios';

const transactionAPI = {
    /**
     * Get all transactions with pagination and filters
     * @param {Object} params - { page, limit, type, asset_id, user_id, start_date, end_date }
     */
    getAll: async (params = {}) => {
        const response = await axiosPrivate.get('/transactions', { params });
        return response.data;
    },

    /**
     * Get transaction by ID
     * @param {number} id
     */
    getById: async (id) => {
        const response = await axiosPrivate.get(`/transactions/${id}`);
        return response.data;
    },

    /**
     * Get transactions by asset ID
     * @param {number} assetId
     * @param {Object} params - { page, limit }
     */
    getByAsset: async (assetId, params = {}) => {
        const response = await axiosPrivate.get(`/transactions/asset/${assetId}`, { params });
        return response.data;
    },

    /**
     * Export transactions to CSV
     * @param {Object} params - { type, start_date, end_date }
     */
    exportCSV: async (params = {}) => {
        const response = await axiosPrivate.get('/transactions/export', {
            params,
            responseType: 'blob'
        });
        return response;
    },

    /**
     * Checkout asset (Available -> In Use)
     * @param {Object} data - { asset_id, notes }
     */
    checkout: async (data) => {
        const response = await axiosPrivate.post('/transactions/checkout', data);
        return response.data;
    },

    /**
     * Checkin asset (In Use -> Available)
     * @param {Object} data - { asset_id, notes }
     */
    checkin: async (data) => {
        const response = await axiosPrivate.post('/transactions/checkin', data);
        return response.data;
    },

    /**
     * Send asset to repair (Available/In Use -> Under Repair)
     * @param {Object} data - { asset_id, notes }
     */
    sendToRepair: async (data) => {
        const response = await axiosPrivate.post('/transactions/repair', data);
        return response.data;
    },

    /**
     * Complete repair (Under Repair -> Available)
     * @param {Object} data - { asset_id, notes }
     */
    completeRepair: async (data) => {
        const response = await axiosPrivate.post('/transactions/complete-repair', data);
        return response.data;
    },

    /**
     * Dispose asset (Available/Under Repair -> Disposed)
     * @param {Object} data - { asset_id, notes }
     */
    dispose: async (data) => {
        const response = await axiosPrivate.post('/transactions/dispose', data);
        return response.data;
    },

    /**
     * Relocate asset (change location)
     * @param {Object} data - { asset_id, new_location_id, notes }
     */
    relocate: async (data) => {
        const response = await axiosPrivate.post('/transactions/relocate', data);
        return response.data;
    },
};

export default transactionAPI;
