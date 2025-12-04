/**
 * Authorize Role Middleware
 * Checks if user has required role(s) to access the route
 */

import { errorResponse } from "../utils/responseHelper.js";
import { USER_ROLES } from "../utils/constants.js";

/**
 * Creates middleware to check if user has one of the allowed roles
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user role exists (should be set by verifyToken middleware)
        if (!req.userRole) {
            return errorResponse(res, "User role not found. Please login again.", 403, "AUTH_004");
        }

        // Check if user's role is in the allowed roles
        if (!allowedRoles.includes(req.userRole)) {
            return errorResponse(
                res, 
                `Access denied. Required roles: ${allowedRoles.join(", ")}`, 
                403, 
                "AUTH_005"
            );
        }

        next();
    };
};

// Predefined role combinations for convenience
export const adminOnly = authorizeRoles(USER_ROLES.ADMIN);
export const staffAndAdmin = authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF);
export const allRoles = authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.EMPLOYEE);
