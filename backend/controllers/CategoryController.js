/**
 * Category Controller
 * Handles CRUD operations for categories
 */

import { Op } from 'sequelize';
import { Category, Asset } from '../models/index.js';
import { successResponse, errorResponse, paginationMeta } from '../utils/responseHelper.js';
import { PAGINATION } from '../utils/constants.js';

/**
 * Get all categories with pagination
 * GET /api/categories
 */
export const getCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
        const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const all = req.query.all === 'true'; // Get all without pagination

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        // Options for query
        const options = {
            where: whereClause,
            order: [['name', 'ASC']],
            include: [
                {
                    model: Asset,
                    as: 'assets',
                    attributes: ['id'],
                    required: false
                }
            ]
        };

        if (!all) {
            options.limit = limit;
            options.offset = offset;
        }

        const { count, rows: categories } = await Category.findAndCountAll(options);

        // Add asset count to each category
        const categoriesWithCount = categories.map(cat => ({
            ...cat.toJSON(),
            asset_count: cat.assets ? cat.assets.length : 0,
            assets: undefined // Remove assets array from response
        }));

        if (all) {
            return successResponse(res, categoriesWithCount, 'Data kategori berhasil diambil');
        }

        return successResponse(
            res,
            categoriesWithCount,
            'Data kategori berhasil diambil',
            200,
            paginationMeta(count, page, limit)
        );
    } catch (error) {
        console.error('Get categories error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data kategori', 500);
    }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id, {
            include: [
                {
                    model: Asset,
                    as: 'assets',
                    attributes: ['id', 'asset_code', 'name', 'status']
                }
            ]
        });

        if (!category) {
            return errorResponse(res, 'Kategori tidak ditemukan', 404);
        }

        return successResponse(res, category, 'Data kategori berhasil diambil');
    } catch (error) {
        console.error('Get category by ID error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data kategori', 500);
    }
};

/**
 * Create new category
 * POST /api/categories
 */
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name) {
            return errorResponse(res, 'Nama kategori harus diisi', 400);
        }

        // Check if category name already exists
        const existingCategory = await Category.findOne({
            where: { name }
        });

        if (existingCategory) {
            return errorResponse(res, 'Nama kategori sudah ada', 400);
        }

        // Create category
        const category = await Category.create({
            name,
            description
        });

        return successResponse(res, category, 'Kategori berhasil dibuat', 201);
    } catch (error) {
        console.error('Create category error:', error);

        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            return errorResponse(res, messages, 400);
        }

        return errorResponse(res, 'Terjadi kesalahan saat membuat kategori', 500);
    }
};

/**
 * Update category
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findByPk(id);

        if (!category) {
            return errorResponse(res, 'Kategori tidak ditemukan', 404);
        }

        // Check if new name is taken by another category
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                where: { name }
            });

            if (existingCategory) {
                return errorResponse(res, 'Nama kategori sudah digunakan', 400);
            }
        }

        // Update category
        await category.update({
            name: name || category.name,
            description: description !== undefined ? description : category.description
        });

        return successResponse(res, category, 'Kategori berhasil diupdate');
    } catch (error) {
        console.error('Update category error:', error);

        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            return errorResponse(res, messages, 400);
        }

        return errorResponse(res, 'Terjadi kesalahan saat mengupdate kategori', 500);
    }
};

/**
 * Delete category
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id, {
            include: [
                {
                    model: Asset,
                    as: 'assets',
                    attributes: ['id']
                }
            ]
        });

        if (!category) {
            return errorResponse(res, 'Kategori tidak ditemukan', 404);
        }

        // Check if category has assets
        if (category.assets && category.assets.length > 0) {
            return errorResponse(
                res,
                `Kategori tidak dapat dihapus karena masih memiliki ${category.assets.length} aset`,
                400
            );
        }

        await category.destroy();

        return successResponse(res, null, 'Kategori berhasil dihapus');
    } catch (error) {
        console.error('Delete category error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat menghapus kategori', 500);
    }
};
