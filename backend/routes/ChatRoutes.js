/**
 * Chat Routes
 * Routes for AI-powered natural language database queries
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken } from '../middleware/VerifyToken.js';
import { 
    handleQuery, 
    handleGetSuggestions, 
    handleHealthCheck 
} from '../controllers/ChatController.js';

const router = express.Router();

// Rate limiter for AI queries (more restrictive)
const chatRateLimiter = rateLimit({
    windowMs: parseInt(process.env.CHAT_RATE_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.CHAT_RATE_LIMIT) || 10, // 10 requests per minute
    message: {
        success: false,
        message: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Health check (public)
router.get('/health', handleHealthCheck);

// Protected routes (require authentication)
router.use(verifyToken);

// Get suggested queries
router.get('/suggestions', handleGetSuggestions);

// Process natural language query
router.post('/query', chatRateLimiter, handleQuery);

export default router;
