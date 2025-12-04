/**
 * Verify Token Middleware
 * Validates JWT access token from Authorization header
 */

import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/responseHelper.js";

export const verifyToken = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
        return errorResponse(res, "Access token is required", 401, "AUTH_001");
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.userRole;
        req.userEmail = decoded.userEmail;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return errorResponse(res, "Access token has expired", 401, "AUTH_002");
        }
        return errorResponse(res, "Invalid access token", 403, "AUTH_003");
    }
};
