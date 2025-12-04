/**
 * Chat Controller
 * Handles AI-powered natural language queries to the database
 */

import { processQuery, getSuggestedQueries } from '../services/AIQueryService.js';

/**
 * Process a natural language query
 * POST /api/chat/query
 */
export const handleQuery = async (req, res) => {
    try {
        const { question } = req.body;

        // Validate input
        if (!question || typeof question !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Pertanyaan harus diisi'
            });
        }

        const trimmedQuestion = question.trim();

        if (trimmedQuestion.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Pertanyaan terlalu pendek (minimal 3 karakter)'
            });
        }

        if (trimmedQuestion.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Pertanyaan terlalu panjang (maksimal 500 karakter)'
            });
        }

        // Process the query
        const result = await processQuery(trimmedQuestion, {
            userId: req.user?.id
        });

        // Log the query for analytics (optional)
        console.log(`[AI Query] User: ${req.user?.email || 'unknown'}, Question: "${trimmedQuestion}", Success: ${result.success}, Time: ${result.processingTime}ms`);

        return res.status(200).json({
            success: result.success,
            data: result
        });

    } catch (error) {
        console.error('Chat Query Error:', error);

        // Handle specific errors
        if (error.message.includes('API key')) {
            return res.status(503).json({
                success: false,
                message: 'Layanan AI tidak tersedia. Silakan hubungi administrator.'
            });
        }

        if (error.message.includes('timeout')) {
            return res.status(408).json({
                success: false,
                message: 'Query memakan waktu terlalu lama. Coba pertanyaan yang lebih spesifik.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memproses pertanyaan'
        });
    }
};

/**
 * Get suggested queries
 * GET /api/chat/suggestions
 */
export const handleGetSuggestions = async (req, res) => {
    try {
        const suggestions = getSuggestedQueries();

        return res.status(200).json({
            success: true,
            data: suggestions
        });

    } catch (error) {
        console.error('Get Suggestions Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil saran pertanyaan'
        });
    }
};

/**
 * Health check for AI service
 * GET /api/chat/health
 */
export const handleHealthCheck = async (req, res) => {
    try {
        const isConfigured = !!process.env.GEMINI_API_KEY;

        return res.status(200).json({
            success: true,
            data: {
                service: 'AI Chat Query',
                status: isConfigured ? 'ready' : 'not_configured',
                model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Health Check Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Health check failed'
        });
    }
};

export default {
    handleQuery,
    handleGetSuggestions,
    handleHealthCheck
};
