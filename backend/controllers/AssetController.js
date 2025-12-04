/**
 * Asset Controller
 * Handles CRUD operations for assets
 */

import { Op, fn, col, literal } from 'sequelize';
import { Asset, Category, Location, Transaction, User } from '../models/index.js';
import { successResponse, errorResponse, paginationMeta } from '../utils/responseHelper.js';
import { PAGINATION, ASSET_STATUS, TRANSACTION_TYPES, VALID_TRANSITIONS } from '../utils/constants.js';

/**
 * Get all assets with pagination, search, and filters
 * GET /api/assets
 */
export const getAssets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
        const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const categoryId = req.query.category_id || '';
        const locationId = req.query.location_id || '';
        const sortBy = req.query.sort_by || 'created_at';
        const sortOrder = req.query.sort_order || 'DESC';

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { asset_code: { [Op.like]: `%${search}%` } },
                { name: { [Op.like]: `%${search}%` } },
                { brand: { [Op.like]: `%${search}%` } },
                { model: { [Op.like]: `%${search}%` } },
                { serial_number: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status && Object.values(ASSET_STATUS).includes(status)) {
            whereClause.status = status;
        }

        if (categoryId) {
            whereClause.category_id = categoryId;
        }

        if (locationId) {
            whereClause.location_id = locationId;
        }

        // Valid sort columns
        const validSortColumns = ['asset_code', 'name', 'status', 'purchase_date', 'created_at'];
        const orderColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const { count, rows: assets } = await Asset.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[orderColumn, orderDirection]],
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Location,
                    as: 'location',
                    attributes: ['id', 'name', 'building', 'floor']
                }
            ]
        });

        return successResponse(
            res,
            assets,
            'Data aset berhasil diambil',
            200,
            paginationMeta(count, page, limit)
        );
    } catch (error) {
        console.error('Get assets error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data aset', 500);
    }
};

/**
 * Get asset by ID with full details
 * GET /api/assets/:id
 */
export const getAssetById = async (req, res) => {
    try {
        const { id } = req.params;

        const asset = await Asset.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Location,
                    as: 'location',
                    attributes: ['id', 'name', 'building', 'floor', 'description']
                },
                {
                    model: Transaction,
                    as: 'transactions',
                    limit: 10,
                    order: [['transaction_date', 'DESC']],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        },
                        {
                            model: Location,
                            as: 'previousLocation',
                            attributes: ['id', 'name']
                        },
                        {
                            model: Location,
                            as: 'newLocation',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        if (!asset) {
            return errorResponse(res, 'Aset tidak ditemukan', 404);
        }

        return successResponse(res, asset, 'Data aset berhasil diambil');
    } catch (error) {
        console.error('Get asset by ID error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data aset', 500);
    }
};

/**
 * Create new asset
 * POST /api/assets
 */
export const createAsset = async (req, res) => {
    try {
        const {
            name,
            category_id,
            location_id,
            brand,
            model,
            serial_number,
            specifications,
            purchase_date,
            purchase_price,
            warranty_expiry,
            notes,
            image_url
        } = req.body;

        // Validation
        if (!name || !category_id) {
            return errorResponse(res, 'Nama aset dan kategori harus diisi', 400);
        }

        // Verify category exists
        const category = await Category.findByPk(category_id);
        if (!category) {
            return errorResponse(res, 'Kategori tidak ditemukan', 400);
        }

        // Verify location exists if provided
        if (location_id) {
            const location = await Location.findByPk(location_id);
            if (!location) {
                return errorResponse(res, 'Lokasi tidak ditemukan', 400);
            }
        }

        // Check serial number uniqueness if provided
        if (serial_number) {
            const existingAsset = await Asset.findOne({
                where: { serial_number }
            });
            if (existingAsset) {
                return errorResponse(res, 'Serial number sudah terdaftar', 400);
            }
        }

        // Generate asset code
        const assetCode = await Asset.generateAssetCode();

        // Create asset
        const asset = await Asset.create({
            asset_code: assetCode,
            name,
            category_id,
            location_id,
            brand,
            model,
            serial_number,
            specifications,
            purchase_date,
            purchase_price,
            warranty_expiry,
            status: ASSET_STATUS.AVAILABLE,
            notes,
            image_url
        });

        // Create initial transaction
        await Transaction.create({
            asset_id: asset.id,
            user_id: req.userId,
            type: TRANSACTION_TYPES.REGISTER,
            previous_status: null,
            new_status: ASSET_STATUS.AVAILABLE,
            new_location_id: location_id,
            notes: 'Aset baru didaftarkan',
            transaction_date: new Date()
        });

        // Fetch created asset with relations
        const createdAsset = await Asset.findByPk(asset.id, {
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Location, as: 'location', attributes: ['id', 'name'] }
            ]
        });

        return successResponse(res, createdAsset, 'Aset berhasil didaftarkan', 201);
    } catch (error) {
        console.error('Create asset error:', error);

        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            return errorResponse(res, messages, 400);
        }

        return errorResponse(res, 'Terjadi kesalahan saat mendaftarkan aset', 500);
    }
};

/**
 * Update asset
 * PUT /api/assets/:id
 */
export const updateAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            category_id,
            brand,
            model,
            serial_number,
            specifications,
            purchase_date,
            purchase_price,
            warranty_expiry,
            notes,
            image_url
        } = req.body;

        const asset = await Asset.findByPk(id);

        if (!asset) {
            return errorResponse(res, 'Aset tidak ditemukan', 404);
        }

        // Verify category exists if provided
        if (category_id) {
            const category = await Category.findByPk(category_id);
            if (!category) {
                return errorResponse(res, 'Kategori tidak ditemukan', 400);
            }
        }

        // Check serial number uniqueness if changed
        if (serial_number && serial_number !== asset.serial_number) {
            const existingAsset = await Asset.findOne({
                where: { serial_number }
            });
            if (existingAsset) {
                return errorResponse(res, 'Serial number sudah terdaftar', 400);
            }
        }

        // Update asset
        await asset.update({
            name: name || asset.name,
            category_id: category_id || asset.category_id,
            brand: brand !== undefined ? brand : asset.brand,
            model: model !== undefined ? model : asset.model,
            serial_number: serial_number !== undefined ? serial_number : asset.serial_number,
            specifications: specifications !== undefined ? specifications : asset.specifications,
            purchase_date: purchase_date !== undefined ? purchase_date : asset.purchase_date,
            purchase_price: purchase_price !== undefined ? purchase_price : asset.purchase_price,
            warranty_expiry: warranty_expiry !== undefined ? warranty_expiry : asset.warranty_expiry,
            notes: notes !== undefined ? notes : asset.notes,
            image_url: image_url !== undefined ? image_url : asset.image_url
        });

        // Fetch updated asset with relations
        const updatedAsset = await Asset.findByPk(id, {
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Location, as: 'location', attributes: ['id', 'name'] }
            ]
        });

        return successResponse(res, updatedAsset, 'Aset berhasil diupdate');
    } catch (error) {
        console.error('Update asset error:', error);

        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            return errorResponse(res, messages, 400);
        }

        return errorResponse(res, 'Terjadi kesalahan saat mengupdate aset', 500);
    }
};

/**
 * Delete asset (only if disposed or no transactions)
 * DELETE /api/assets/:id
 */
export const deleteAsset = async (req, res) => {
    try {
        const { id } = req.params;

        const asset = await Asset.findByPk(id);

        if (!asset) {
            return errorResponse(res, 'Aset tidak ditemukan', 404);
        }

        // Only allow deletion if disposed
        if (asset.status !== ASSET_STATUS.DISPOSED) {
            return errorResponse(
                res,
                'Hanya aset dengan status Disposed yang dapat dihapus. Ubah status aset terlebih dahulu.',
                400
            );
        }

        // Delete all related transactions first
        await Transaction.destroy({
            where: { asset_id: id }
        });

        // Delete asset
        await asset.destroy();

        return successResponse(res, null, 'Aset berhasil dihapus');
    } catch (error) {
        console.error('Delete asset error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat menghapus aset', 500);
    }
};

/**
 * Get asset statistics for dashboard
 * GET /api/assets/stats
 */
export const getAssetStats = async (req, res) => {
    try {
        // Count by status
        const statusCounts = await Asset.findAll({
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['status']
        });

        // Format status counts
        const byStatus = {};
        Object.values(ASSET_STATUS).forEach(status => {
            byStatus[status] = 0;
        });
        statusCounts.forEach(item => {
            byStatus[item.status] = parseInt(item.getDataValue('count'));
        });

        // Count by category
        const categoryCounts = await Asset.findAll({
            attributes: [
                'category_id',
                [fn('COUNT', col('assets.id')), 'count']
            ],
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                }
            ],
            group: ['category_id', 'category.id', 'category.name']
        });

        const byCategory = categoryCounts.map(item => ({
            category_id: item.category_id,
            category_name: item.category?.name || 'Unknown',
            count: parseInt(item.getDataValue('count'))
        }));

        // Total assets
        const totalAssets = await Asset.count();

        // Total asset value
        const totalValue = await Asset.sum('purchase_price');

        // Recent assets (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentAssets = await Asset.count({
            where: {
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            }
        });

        // Assets with expiring warranty (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const expiringWarranty = await Asset.count({
            where: {
                warranty_expiry: {
                    [Op.between]: [new Date(), thirtyDaysFromNow]
                },
                status: {
                    [Op.notIn]: [ASSET_STATUS.DISPOSED]
                }
            }
        });

        return successResponse(res, {
            total_assets: totalAssets,
            total_value: totalValue || 0,
            recent_assets: recentAssets,
            expiring_warranty: expiringWarranty,
            by_status: byStatus,
            by_category: byCategory
        }, 'Statistik aset berhasil diambil');
    } catch (error) {
        console.error('Get asset stats error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil statistik aset', 500);
    }
};

/**
 * Generate new asset code preview
 * GET /api/assets/generate-code
 */
export const generateAssetCode = async (req, res) => {
    try {
        const prefix = req.query.prefix || 'AST';
        const code = await Asset.generateAssetCode(prefix);
        
        return successResponse(res, { asset_code: code }, 'Kode aset berhasil di-generate');
    } catch (error) {
        console.error('Generate asset code error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat generate kode aset', 500);
    }
};
