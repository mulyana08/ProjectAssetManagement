/**
 * Chat API Service
 * Handles API calls for AI Chat Query feature
 */

import axios from './axios';

/**
 * Send a natural language query to the AI
 * @param {string} question - The natural language question
 * @returns {Promise<Object>} Query result with SQL, data, and metadata
 */
export const sendQuery = async (question) => {
    const response = await axios.post('/chat/query', { question });
    return response.data;
};

/**
 * Get suggested queries for the chat
 * @returns {Promise<Array>} List of suggested queries
 */
export const getSuggestions = async () => {
    const response = await axios.get('/chat/suggestions');
    return response.data;
};

/**
 * Check AI Chat service health
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
    const response = await axios.get('/chat/health');
    return response.data;
};

export default {
    sendQuery,
    getSuggestions,
    checkHealth
};
