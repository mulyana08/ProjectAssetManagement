/**
 * Response Helper - Standarisasi format response API
 */

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Optional metadata (pagination, etc)
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    if (meta !== null) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

/**
 * Error Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 400)
 * @param {String} errorCode - Custom error code
 * @param {Array} errors - Validation errors array
 */
export const errorResponse = (res, message, statusCode = 400, errorCode = null, errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errorCode !== null) {
        response.error_code = errorCode;
    }

    if (errors !== null) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Pagination Meta
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} totalRecords - Total records count
 */
export const paginationMeta = (page, limit, totalRecords) => {
    const totalPages = Math.ceil(totalRecords / limit);
    
    return {
        page: parseInt(page),
        limit: parseInt(limit),
        total_records: totalRecords,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
    };
};
