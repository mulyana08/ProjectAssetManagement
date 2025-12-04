/**
 * Gemini AI Configuration
 * Setup for Google Generative AI (Gemini 2.0 Flash)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model configuration
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

/**
 * Get Gemini model instance
 * @returns {GenerativeModel} Gemini model
 */
export const getGeminiModel = () => {
    return genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        generationConfig: {
            temperature: 0.1,      // Low temperature for consistent SQL generation
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
        },
    });
};

/**
 * Check if Gemini is configured
 * @returns {boolean}
 */
export const isGeminiConfigured = () => {
    return !!process.env.GEMINI_API_KEY;
};

export default {
    getGeminiModel,
    isGeminiConfigured,
    MODEL_NAME
};
