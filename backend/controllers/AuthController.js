/**
 * Auth Controller
 * Menangani autentikasi pengguna (login, register, logout, refresh token)
 */

import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { USER_ROLES } from '../utils/constants.js';

/**
 * Register new user (Admin only can register new users)
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role = USER_ROLES.STAFF } = req.body;

        // Validation
        if (!name || !email || !password) {
            return errorResponse(res, 'Nama, email, dan password harus diisi', 400);
        }

        // Check if email already exists
        const existingUser = await User.scope('full').findOne({
            where: { email }
        });

        if (existingUser) {
            return errorResponse(res, 'Email sudah terdaftar', 400);
        }

        // Hash password
        const hashedPassword = await argon2.hash(password);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role,
            is_active: true
        });

        // Return user data (without password)
        const userData = await User.findByPk(user.id);

        return successResponse(res, userData, 'User berhasil didaftarkan', 201);
    } catch (error) {
        console.error('Register error:', error);
        
        // Handle validation errors
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            return errorResponse(res, messages, 400);
        }
        
        return errorResponse(res, 'Terjadi kesalahan saat mendaftarkan user', 500);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return errorResponse(res, 'Email dan password harus diisi', 400);
        }

        // Find user with password
        const user = await User.scope('withPassword').findOne({
            where: { email }
        });

        if (!user) {
            return errorResponse(res, 'Email atau password salah', 401);
        }

        // Check if user is active
        if (!user.is_active) {
            return errorResponse(res, 'Akun Anda telah dinonaktifkan', 403);
        }

        // Verify password
        const validPassword = await argon2.verify(user.password, password);

        if (!validPassword) {
            return errorResponse(res, 'Email atau password salah', 401);
        }

        // Generate tokens
        const accessToken = jwt.sign(
            {
                userId: user.id,
                userEmail: user.email,
                userRole: user.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            {
                userId: user.id,
                userEmail: user.email,
                userRole: user.role
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // Save refresh token to database
        await User.update(
            { refresh_token: refreshToken },
            { where: { id: user.id } }
        );

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // Return user data and access token
        return successResponse(res, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            accessToken
        }, 'Login berhasil');
    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat login', 500);
    }
};

/**
 * Logout user
 * DELETE /api/auth/logout
 */
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return successResponse(res, null, 'Logout berhasil');
        }

        // Find user with this refresh token
        const user = await User.scope('withRefreshToken').findOne({
            where: { refresh_token: refreshToken }
        });

        if (user) {
            // Clear refresh token from database
            await User.update(
                { refresh_token: null },
                { where: { id: user.id } }
            );
        }

        // Clear cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return successResponse(res, null, 'Logout berhasil');
    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat logout', 500);
    }
};

/**
 * Refresh access token
 * GET /api/auth/token
 */
export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return errorResponse(res, 'Unauthorized', 401);
        }

        // Find user with this refresh token
        const user = await User.scope('withRefreshToken').findOne({
            where: { refresh_token: token }
        });

        if (!user) {
            return errorResponse(res, 'Unauthorized', 401);
        }

        // Verify refresh token
        jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) {
                    return errorResponse(res, 'Unauthorized', 401);
                }

                // Generate new access token
                const accessToken = jwt.sign(
                    {
                        userId: user.id,
                        userEmail: user.email,
                        userRole: user.role
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '15m' }
                );

                return successResponse(res, { accessToken }, 'Token berhasil diperbarui');
            }
        );
    } catch (error) {
        console.error('Refresh token error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat memperbarui token', 500);
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        if (!user) {
            return errorResponse(res, 'User tidak ditemukan', 404);
        }

        return successResponse(res, user, 'Data user berhasil diambil');
    } catch (error) {
        console.error('Get me error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data user', 500);
    }
};
