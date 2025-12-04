/**
 * SQL Validator
 * Security utility to validate and sanitize AI-generated SQL queries
 */

// Blocked SQL keywords that could modify data or structure
const BLOCKED_KEYWORDS = [
    // Data Modification
    'INSERT', 'UPDATE', 'DELETE', 'REPLACE', 'TRUNCATE', 'MERGE',
    // DDL
    'CREATE', 'ALTER', 'DROP', 'RENAME', 'MODIFY',
    // DCL
    'GRANT', 'REVOKE', 'DENY',
    // Transaction Control
    'COMMIT', 'ROLLBACK', 'SAVEPOINT',
    // Other dangerous
    'EXEC', 'EXECUTE', 'CALL', 'INTO OUTFILE', 'INTO DUMPFILE',
    'LOAD_FILE', 'LOAD DATA', 'BENCHMARK', 'SLEEP',
    // Stored procedures
    'PROCEDURE', 'FUNCTION', 'TRIGGER', 'EVENT',
    // System
    'SHUTDOWN', 'KILL', 'FLUSH', 'RESET', 'PURGE',
];

// Blocked patterns (regex)
const BLOCKED_PATTERNS = [
    /;\s*--/gi,              // SQL comment injection
    /\/\*.*\*\//gi,          // Block comments
    /--\s*$/gm,              // Line comments at end
    /xp_\w+/gi,              // SQL Server extended procs
    /sp_\w+/gi,              // SQL Server stored procs
    /0x[0-9a-f]+/gi,         // Hex values (potential injection)
    /CHAR\s*\(/gi,           // CHAR function (bypass attempts)
    /CONCAT\s*\(.+--/gi,     // CONCAT with comment
    /UNION\s+ALL\s+SELECT/gi, // Union injection (allow regular UNION)
    /OR\s+1\s*=\s*1/gi,      // Classic injection
    /OR\s+'[^']*'\s*=\s*'[^']*'/gi, // String comparison injection
    /;\s*SELECT/gi,          // Multiple statements
    /;\s*DROP/gi,            // Statement chaining with DROP
    /;\s*DELETE/gi,          // Statement chaining with DELETE
    /@@\w+/gi,               // System variables
    /INFORMATION_SCHEMA\.\w*USER/gi, // User info access
];

// Allowed tables (whitelist)
const ALLOWED_TABLES = [
    'users', 'categories', 'locations', 'assets', 'transactions'
];

/**
 * Validate SQL query for safety
 * @param {string} sql - The SQL query to validate
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
export const validateSQL = (sql) => {
    if (!sql || typeof sql !== 'string') {
        return { valid: false, error: 'Query kosong atau tidak valid' };
    }

    // Trim and normalize whitespace
    let normalizedSQL = sql.trim().replace(/\s+/g, ' ');
    
    // Check if it starts with SELECT
    if (!normalizedSQL.toUpperCase().startsWith('SELECT')) {
        return { valid: false, error: 'Hanya query SELECT yang diperbolehkan' };
    }

    // Check for multiple statements (semicolon not at end)
    const statements = normalizedSQL.split(';').filter(s => s.trim());
    if (statements.length > 1) {
        return { valid: false, error: 'Multiple statements tidak diperbolehkan' };
    }

    // Remove trailing semicolon for validation
    normalizedSQL = normalizedSQL.replace(/;+$/, '').trim();
    const upperSQL = normalizedSQL.toUpperCase();

    // Check blocked keywords
    for (const keyword of BLOCKED_KEYWORDS) {
        // Use word boundary to avoid false positives (e.g., "UPDATED_AT" shouldn't match "UPDATE")
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (regex.test(upperSQL)) {
            return { valid: false, error: `Keyword '${keyword}' tidak diperbolehkan` };
        }
    }

    // Check blocked patterns
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(normalizedSQL)) {
            return { valid: false, error: 'Query mengandung pola yang tidak diperbolehkan' };
        }
    }

    // Verify only allowed tables are accessed (basic check)
    const fromMatch = upperSQL.match(/FROM\s+(\w+)/gi);
    const joinMatch = upperSQL.match(/JOIN\s+(\w+)/gi);
    
    const extractTableName = (match) => {
        if (!match) return [];
        return match.map(m => m.replace(/FROM\s+|JOIN\s+/gi, '').toLowerCase());
    };

    const usedTables = [
        ...extractTableName(fromMatch),
        ...extractTableName(joinMatch)
    ];

    for (const table of usedTables) {
        if (!ALLOWED_TABLES.includes(table)) {
            return { valid: false, error: `Tabel '${table}' tidak diperbolehkan` };
        }
    }

    // Check for LIMIT (add if missing)
    if (!upperSQL.includes('LIMIT')) {
        normalizedSQL += ' LIMIT 100';
    } else {
        // Ensure LIMIT is not too high
        const limitMatch = normalizedSQL.match(/LIMIT\s+(\d+)/i);
        if (limitMatch && parseInt(limitMatch[1]) > 100) {
            normalizedSQL = normalizedSQL.replace(/LIMIT\s+\d+/i, 'LIMIT 100');
        }
    }

    return { 
        valid: true, 
        sanitized: normalizedSQL 
    };
};

/**
 * Check if query result might contain sensitive data
 * @param {string} sql - The SQL query
 * @returns {boolean}
 */
export const mightContainSensitiveData = (sql) => {
    const upperSQL = sql.toUpperCase();
    
    // Check for password-related columns
    if (upperSQL.includes('PASSWORD') || upperSQL.includes('REFRESH_TOKEN')) {
        return true;
    }

    // Check for selecting all columns from users
    if (upperSQL.includes('SELECT *') && upperSQL.includes('USERS')) {
        return true;
    }

    return false;
};

/**
 * Get safe columns for users table
 * @returns {string[]}
 */
export const getSafeUserColumns = () => {
    return ['id', 'name', 'email', 'role', 'is_active', 'created_at', 'updated_at'];
};

export default {
    validateSQL,
    mightContainSensitiveData,
    getSafeUserColumns
};
