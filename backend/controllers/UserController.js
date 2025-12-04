/**
 * User Controller
 * Handles CRUD operations for users
 */

import argon2 from 'argon2';
import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { successResponse, errorResponse, paginationMeta } from '../utils/responseHelper.js';
import { PAGINATION, USER_ROLES } from '../utils/constants.js';

/**
 * Get all users with pagination and search
 * GET /api/users
 */
export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
        const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const isActive = req.query.is_active;

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role && Object.values(USER_ROLES).includes(role)) {
            whereClause.role = role;
        }

        if (isActive !== undefined) {
            whereClause.is_active = isActive === 'true';
        }

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return successResponse(
            res,
            users,
            'Data user berhasil diambil',
            200,
            paginationMeta(count, page, limit)
        );
    } catch (error) {
        console.error('Get users error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data user', 500);
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return errorResponse(res, 'User tidak ditemukan', 404);
        }

        return successResponse(res, user, 'Data user berhasil diambil');
    } catch (error) {
        console.error('Get user by ID error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data user', 500);
    }
};

/**
 * Create new user (Admin only)
 * POST /api/users
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role = USER_ROLES.STAFF, is_active = true } = req.body;

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
            role,
            is_active
        });

        // Return user data (without password)
        const userData = await User.findByPk(user.id);

        return successResponse(res, userData, 'User berhasil dibuat', 201);
    } catch (error) {
        console.error('Create user error:', error);

        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            return errorResponse(res, messages, 400);
        }

        return errorResponse(res, 'Terjadi kesalahan saat membuat user', 500);
    }
};

/**
 * Update user
 * PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, is_active } = req.body;

        const user = await User.scope('full').findByPk(id);

        if (!user) {
            return errorResponse(res, 'User tidak ditemukan', 404);
        }

        // Check if email is taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.scope('full').findOne({
                where: { email }
            });

            if (existingUser) {
                return errorResponse(res, 'Email sudah digunakan user lain', 400);
            }
        }

        // Prepare update data
        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (is_active !== undefined) updateData.is_active = is_active;

        // Hash new password if provided
        if (password) {
            updateData.password = await argon2.hash(password);
        }

        await user.update(updateData);

        // Return updated user (without password)
        const updatedUser = await User.findByPk(id);

        return successResponse(res, updatedUser, 'User berhasil diupdate');
    } catch (error) {
        console.error('Update user error:', error);

        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            return errorResponse(res, messages, 400);
        }

        return errorResponse(res, 'Terjadi kesalahan saat mengupdate user', 500);
    }
};

/**
 * Delete user (soft delete - set is_active to false)
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return errorResponse(res, 'User tidak ditemukan', 404);
        }

        // Prevent deleting self
        if (parseInt(id) === req.userId) {
            return errorResponse(res, 'Tidak dapat menghapus akun sendiri', 400);
        }

        // Soft delete - just deactivate
        await user.update({ is_active: false });

        return successResponse(res, null, 'User berhasil dinonaktifkan');
    } catch (error) {
        console.error('Delete user error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat menghapus user', 500);
    }
};

/**
 * Change password for current user
 * PUT /api/users/change-password
 */
export const changePassword = async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;

        // Validation
        if (!current_password || !new_password || !confirm_password) {
            return errorResponse(res, 'Semua field password harus diisi', 400);
        }

        if (new_password !== confirm_password) {
            return errorResponse(res, 'Password baru dan konfirmasi tidak cocok', 400);
        }

        if (new_password.length < 6) {
            return errorResponse(res, 'Password baru minimal 6 karakter', 400);
        }

        // Get user with password
        const user = await User.scope('withPassword').findByPk(req.userId);

        if (!user) {
            return errorResponse(res, 'User tidak ditemukan', 404);
        }

        // Verify current password
        const validPassword = await argon2.verify(user.password, current_password);

        if (!validPassword) {
            return errorResponse(res, 'Password saat ini salah', 400);
        }

        // Hash and update new password
        const hashedPassword = await argon2.hash(new_password);
        await user.update({ password: hashedPassword });

        return successResponse(res, null, 'Password berhasil diubah');
    } catch (error) {
        console.error('Change password error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengubah password', 500);
    }
};
