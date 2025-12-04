/**
 * AI Query Service
 * Service for processing natural language queries using Gemini AI
 */

import { getGeminiModel, isGeminiConfigured } from '../config/gemini.js';
import { getSystemPrompt } from '../utils/schemaContext.js';
import { validateSQL, mightContainSensitiveData } from '../utils/sqlValidator.js';
import db from '../config/Database.js';
import { QueryTypes } from 'sequelize';

/**
 * Process a natural language query and return results
 * @param {string} question - User's question in natural language
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Query result
 */
export const processQuery = async (question, options = {}) => {
    const startTime = Date.now();

    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
        throw new Error('Gemini API belum dikonfigurasi. Silakan set GEMINI_API_KEY di environment.');
    }

    // Validate input
    if (!question || typeof question !== 'string' || question.trim().length < 3) {
        throw new Error('Pertanyaan terlalu pendek atau tidak valid');
    }

    if (question.length > 500) {
        throw new Error('Pertanyaan terlalu panjang (maksimal 500 karakter)');
    }

    try {
        // Step 1: Generate SQL using Gemini
        const generatedSQL = await generateSQL(question);
        
        // Check if AI couldn't generate a query
        if (generatedSQL.startsWith('CANNOT_QUERY:')) {
            return {
                success: false,
                type: 'cannot_query',
                message: generatedSQL.replace('CANNOT_QUERY:', '').trim(),
                question,
                processingTime: Date.now() - startTime
            };
        }

        // Step 2: Validate the generated SQL
        const validation = validateSQL(generatedSQL);
        
        if (!validation.valid) {
            console.error('SQL Validation failed:', validation.error, 'SQL:', generatedSQL);
            return {
                success: false,
                type: 'validation_error',
                message: 'Query tidak dapat diproses karena alasan keamanan',
                question,
                processingTime: Date.now() - startTime
            };
        }

        // Step 3: Check for sensitive data
        if (mightContainSensitiveData(validation.sanitized)) {
            return {
                success: false,
                type: 'sensitive_data',
                message: 'Query mengakses data sensitif yang tidak diperbolehkan',
                question,
                processingTime: Date.now() - startTime
            };
        }

        // Step 4: Execute the query
        const results = await executeQuery(validation.sanitized);

        // Step 5: Generate natural language response
        const naturalResponse = await generateNaturalResponse(question, results);

        return {
            success: true,
            type: 'success',
            question,
            sql: validation.sanitized,
            data: results,
            totalRows: results.length,
            message: naturalResponse,
            processingTime: Date.now() - startTime
        };

    } catch (error) {
        console.error('AI Query Service Error:', error);
        
        // Handle specific error types
        if (error.message.includes('SAFETY')) {
            return {
                success: false,
                type: 'safety_block',
                message: 'Pertanyaan tidak dapat diproses karena alasan keamanan',
                question,
                processingTime: Date.now() - startTime
            };
        }

        if (error.message.includes('quota') || error.message.includes('rate')) {
            return {
                success: false,
                type: 'rate_limit',
                message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
                question,
                processingTime: Date.now() - startTime
            };
        }

        throw error;
    }
};

/**
 * Generate SQL from natural language using Gemini
 * @param {string} question - User's question
 * @returns {Promise<string>} Generated SQL
 */
const generateSQL = async (question) => {
    const model = getGeminiModel();
    const systemPrompt = getSystemPrompt();

    const prompt = `${systemPrompt}

User: "${question}"
Output:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean up the response (remove markdown code blocks if present)
    let cleanSQL = text
        .replace(/```sql\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^\s*sql\s*/i, '')
        .trim();

    return cleanSQL;
};

/**
 * Execute SQL query with timeout and row limit
 * @param {string} sql - Validated SQL query
 * @returns {Promise<Array>} Query results
 */
const executeQuery = async (sql) => {
    const timeout = parseInt(process.env.QUERY_TIMEOUT_MS) || 5000;
    const maxRows = parseInt(process.env.MAX_QUERY_ROWS) || 100;

    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), timeout);
    });

    // Execute query with timeout
    const queryPromise = db.query(sql, {
        type: QueryTypes.SELECT,
        raw: true,
        nest: true
    });

    const results = await Promise.race([queryPromise, timeoutPromise]);

    // Enforce row limit
    return results.slice(0, maxRows);
};

/**
 * Generate natural language response from query results
 * @param {string} question - Original question
 * @param {Array} results - Query results
 * @returns {Promise<string>} Natural language response
 */
const generateNaturalResponse = async (question, results) => {
    // For simple count queries
    if (results.length === 1 && Object.keys(results[0]).length <= 2) {
        const keys = Object.keys(results[0]);
        const values = Object.values(results[0]);
        
        if (keys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('total'))) {
            return `Ditemukan ${values[0]} hasil.`;
        }
        
        if (keys.some(k => k.toLowerCase().includes('sum') || k.toLowerCase().includes('total'))) {
            const value = values[0];
            if (typeof value === 'number') {
                return `Total: ${formatCurrency(value)}`;
            }
        }
    }

    // For empty results
    if (results.length === 0) {
        return 'Tidak ada data yang ditemukan untuk pertanyaan ini.';
    }

    // For list results
    if (results.length === 1) {
        return `Ditemukan 1 hasil.`;
    }

    return `Ditemukan ${results.length} hasil.`;
};

/**
 * Format number as Indonesian currency
 * @param {number} value 
 * @returns {string}
 */
const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

/**
 * Get suggested queries based on context
 * @returns {Array<Object>} Suggested queries
 */
export const getSuggestedQueries = () => {
    return [
        { text: 'Berapa total asset yang tersedia?', category: 'summary' },
        { text: 'Tampilkan asset yang garansinya akan expired bulan ini', category: 'asset' },
        { text: 'Asset mana yang paling sering dipinjam?', category: 'transaction' },
        { text: 'Berapa total nilai asset per kategori?', category: 'summary' },
        { text: 'Siapa user yang paling aktif?', category: 'user' },
        { text: 'Tampilkan semua asset di lokasi Ruang IT', category: 'asset' },
        { text: 'Berapa asset yang statusnya repair?', category: 'summary' },
        { text: 'Transaksi apa saja yang terjadi hari ini?', category: 'transaction' },
    ];
};

export default {
    processQuery,
    getSuggestedQueries
};
