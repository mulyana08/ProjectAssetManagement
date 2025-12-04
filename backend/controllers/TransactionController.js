/**
 * Transaction Controller
 * Handles asset transactions: checkout, checkin, repair, dispose, relocate
 */

import { Op } from 'sequelize';
import { Transaction, Asset, User, Location, Category } from '../models/index.js';
import { successResponse, errorResponse, paginationMeta } from '../utils/responseHelper.js';
import { PAGINATION, ASSET_STATUS, TRANSACTION_TYPES, VALID_TRANSITIONS } from '../utils/constants.js';

/**
 * Helper function to validate status transition
 */
const isValidTransition = (currentStatus, newStatus) => {
    const validNextStatuses = VALID_TRANSITIONS[currentStatus];
    return validNextStatuses && validNextStatuses.includes(newStatus);
};

/**
 * Get all transactions with pagination
 * GET /api/transactions
 */
export const getTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
        const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
        const offset = (page - 1) * limit;
        const type = req.query.type || '';
        const assetId = req.query.asset_id || '';
        const userId = req.query.user_id || '';
        const startDate = req.query.start_date || '';
        const endDate = req.query.end_date || '';

        // Build where clause
        const whereClause = {};

        if (type && Object.values(TRANSACTION_TYPES).includes(type)) {
            whereClause.type = type;
        }

        if (assetId) {
            whereClause.asset_id = assetId;
        }

        if (userId) {
            whereClause.user_id = userId;
        }

        if (startDate && endDate) {
            whereClause.transaction_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        } else if (startDate) {
            whereClause.transaction_date = {
                [Op.gte]: new Date(startDate)
            };
        } else if (endDate) {
            whereClause.transaction_date = {
                [Op.lte]: new Date(endDate)
            };
        }

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['transaction_date', 'DESC']],
            include: [
                {
                    model: Asset,
                    as: 'asset',
                    attributes: ['id', 'asset_code', 'name'],
                    include: [
                        { model: Category, as: 'category', attributes: ['id', 'name'] }
                    ]
                },
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
        });

        return successResponse(
            res,
            transactions,
            'Data transaksi berhasil diambil',
            200,
            paginationMeta(count, page, limit)
        );
    } catch (error) {
        console.error('Get transactions error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data transaksi', 500);
    }
};

/**
 * Get transaction by ID
 * GET /api/transactions/:id
 */
export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findByPk(id, {
            include: [
                {
                    model: Asset,
                    as: 'asset',
                    include: [
                        { model: Category, as: 'category' },
                        { model: Location, as: 'location' }
                    ]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Location,
                    as: 'previousLocation'
                },
                {
                    model: Location,
                    as: 'newLocation'
                }
            ]
        });

        if (!transaction) {
            return errorResponse(res, 'Transaksi tidak ditemukan', 404);
        }

        return successResponse(res, transaction, 'Data transaksi berhasil diambil');
    } catch (error) {
        console.error('Get transaction by ID error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data transaksi', 500);
    }
};

/**
 * Checkout asset (Available -> In Use)
 * POST /api/transactions/checkout
 */
export const checkoutAsset = async (req, res) => {
    try {
        const { asset_id, notes } = req.body;

        if (!asset_id) {
            return errorResponse(res, 'Asset ID harus diisi', 400);
        }

        const asset = await Asset.findByPk(asset_id);

        if (!asset) {
            return errorResponse(res, 'Aset tidak ditemukan', 404);
        }

        // Validate transition
        if (!isValidTransition(asset.status, ASSET_STATUS.IN_USE)) {
            return errorResponse(
                res,
                `Tidak dapat checkout aset dengan status ${asset.status}`,
                400
            );
        }

        const previousStatus = asset.status;

        // Update asset status
        await asset.update({ status: ASSET_STATUS.IN_USE });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id,
            user_id: req.userId,
            type: TRANSACTION_TYPES.CHECKOUT,
            previous_status: previousStatus,
            new_status: ASSET_STATUS.IN_USE,
            notes,
            transaction_date: new Date()
        });

        // Fetch transaction with relations
        const createdTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                { model: Asset, as: 'asset', attributes: ['id', 'asset_code', 'name'] },
                { model: User, as: 'user', attributes: ['id', 'name'] }
            ]
        });

        return successResponse(res, createdTransaction, 'Aset berhasil di-checkout', 201);
    } catch (error) {
        console.error('Checkout asset error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat checkout aset', 500);
    }
};

/**
 * Checkin asset (In Use -> Available)
 * POST /api/transactions/checkin
 */
export const checkinAsset = async (req, res) => {
    try {
        const { asset_id, notes } = req.body;

        if (!asset_id) {
            return errorResponse(res, 'Asset ID harus diisi', 400);
        }

        const asset = await Asset.findByPk(asset_id);

        if (!asset) {
            return errorResponse(res, 'Aset tidak ditemukan', 404);
        }

        // Validate transition
        if (!isValidTransition(asset.status, ASSET_STATUS.AVAILABLE)) {
            return errorResponse(
                res,
                `Tidak dapat checkin aset dengan status ${asset.status}`,
                400
            );
        }

        const previousStatus = asset.status;

        // Update asset status
        await asset.update({ status: ASSET_STATUS.AVAILABLE });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id,
            user_id: req.userId,
            type: TRANSACTION_TYPES.CHECKIN,
            previous_status: previousStatus,
            new_status: ASSET_STATUS.AVAILABLE,
            notes,
            transaction_date: new Date()
        });

        // Fetch transaction with relations
        const createdTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                { model: Asset, as: 'asset', attributes: ['id', 'asset_code', 'name'] },
                { model: User, as: 'user', attributes: ['id', 'name'] }
            ]
        });

        return successResponse(res, createdTransaction, 'Aset berhasil di-checkin', 201);
    } catch (error) {
        console.error('Checkin asset error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat checkin aset', 500);
    }
};

/**
 * Send asset to repair (Available/In Use -> Under Repair)
 * POST /api/transactions/repair
 */
export const sendToRepair = async (req, res) => {
    try {
        const { asset_id, notes } = req.body;

        if (!asset_id) {
            return errorResponse(res, 'Asset ID harus diisi', 400);
        }

        const asset = await Asset.findByPk(asset_id);

        if (!asset) {
            return errorResponse(res, 'Aset tidak ditemukan', 404);
        }

        // Validate transition
        if (!isValidTransition(asset.status, ASSET_STATUS.UNDER_REPAIR)) {
            return errorResponse(
                res,
                `Tidak dapat mengirim aset dengan status ${asset.status} ke perbaikan`,
                400
            );
        }

        const previousStatus = asset.status;

        // Update asset status
        await asset.update({ status: ASSET_STATUS.UNDER_REPAIR });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id,
            user_id: req.userId,
            type: TRANSACTION_TYPES.REPAIR,
            previous_status: previousStatus,
            new_status: ASSET_STATUS.UNDER_REPAIR,
            notes,
            transaction_date: new Date()
        });

        // Fetch transaction with relations
        const createdTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                { model: Asset, as: 'asset', attributes: ['id', 'asset_code', 'name'] },
                { model: User, as: 'user', attributes: ['id', 'name'] }
            ]
        });

        return successResponse(res, createdTransaction, 'Aset berhasil dikirim ke perbaikan', 201);
    } catch (error) {
        console.error('Send to repair error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengirim aset ke perbaikan', 500);
    }
};

/**
 * Complete repair (Under Repair -> Available)
 * POST /api/transactions/complete-repair
 */
export const completeRepair = async (req, res) => {
    try {
        const { asset_id, notes } = req.body;

        if (!asset_id) {
            return errorResponse(res, 'Asset ID harus diisi', 400);
        }

        const asset = await Asset.findByPk(asset_id);

        if (!asset) {
            return errorResponse(res, 'Aset tidak ditemukan', 404);
        }

        // Only assets under repair can be completed
        if (asset.status !== ASSET_STATUS.UNDER_REPAIR) {
            return errorResponse(
                res,
                `Aset tidak sedang dalam perbaikan (status saat ini: ${asset.status})`,
                400
            );
        }

        const previousStatus = asset.status;

        // Update asset status
        await asset.update({ status: ASSET_STATUS.AVAILABLE });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id,
            user_id: req.userId,
            type: TRANSACTION_TYPES.CHECKIN, // Repair complete = checkin
            previous_status: previousStatus,
            new_status: ASSET_STATUS.AVAILABLE,
            notes: notes || 'Perbaikan selesai',
            transaction_date: new Date()
        });

        // Fetch transaction with relations
        const createdTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                { model: Asset, as: 'asset', attributes: ['id', 'asset_code', 'name'] },
                { model: User, as: 'user', attributes: ['id', 'name'] }
            ]
        });

        return successResponse(res, createdTransaction, 'Perbaikan aset berhasil diselesaikan', 201);
    } catch (error) {
        console.error('Complete repair error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat menyelesaikan perbaikan aset', 500);
    }
};

/**
 * Dispose asset (Available/Under Repair -> Disposed)
 * POST /api/transactions/dispose
 */
export const disposeAsset = async (req, res) => {
    try {
        const { asset_id, notes } = req.body;

        if (!asset_id) {
            return errorResponse(res, 'Asset ID harus diisi', 400);
        }

        const asset = await Asset.findByPk(asset_id);

        if (!asset) {
            return errorResponse(res, 'Aset tidak ditemukan', 404);
        }

        // Validate transition
        if (!isValidTransition(asset.status, ASSET_STATUS.DISPOSED)) {
            return errorResponse(
                res,
                `Tidak dapat dispose aset dengan status ${asset.status}`,
                400
            );
        }

        const previousStatus = asset.status;
        const previousLocationId = asset.location_id;

        // Update asset status and remove location
        await asset.update({
            status: ASSET_STATUS.DISPOSED,
            location_id: null
        });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id,
            user_id: req.userId,
            type: TRANSACTION_TYPES.DISPOSE,
            previous_status: previousStatus,
            new_status: ASSET_STATUS.DISPOSED,
            previous_location_id: previousLocationId,
            new_location_id: null,
            notes: notes || 'Aset dihapuskan',
            transaction_date: new Date()
        });

        // Fetch transaction with relations
        const createdTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                { model: Asset, as: 'asset', attributes: ['id', 'asset_code', 'name'] },
                { model: User, as: 'user', attributes: ['id', 'name'] }
            ]
        });

        return successResponse(res, createdTransaction, 'Aset berhasil di-dispose', 201);
    } catch (error) {
        console.error('Dispose asset error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat dispose aset', 500);
    }
};

/**
 * Relocate asset (change location)
 * POST /api/transactions/relocate
 */
export const relocateAsset = async (req, res) => {
    try {
        const { asset_id, new_location_id, notes } = req.body;

        if (!asset_id || !new_location_id) {
            return errorResponse(res, 'Asset ID dan lokasi baru harus diisi', 400);
        }

        const asset = await Asset.findByPk(asset_id);

        if (!asset) {
            return errorResponse(res, 'Aset tidak ditemukan', 404);
        }

        // Cannot relocate disposed assets
        if (asset.status === ASSET_STATUS.DISPOSED) {
            return errorResponse(res, 'Tidak dapat memindahkan aset yang sudah di-dispose', 400);
        }

        // Verify new location exists
        const newLocation = await Location.findByPk(new_location_id);
        if (!newLocation) {
            return errorResponse(res, 'Lokasi tujuan tidak ditemukan', 400);
        }

        // Check if actually moving to different location
        if (asset.location_id === new_location_id) {
            return errorResponse(res, 'Aset sudah berada di lokasi tersebut', 400);
        }

        const previousLocationId = asset.location_id;

        // Update asset location
        await asset.update({ location_id: new_location_id });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id,
            user_id: req.userId,
            type: TRANSACTION_TYPES.RELOCATE,
            previous_status: asset.status,
            new_status: asset.status, // Status doesn't change
            previous_location_id: previousLocationId,
            new_location_id,
            notes,
            transaction_date: new Date()
        });

        // Fetch transaction with relations
        const createdTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                { model: Asset, as: 'asset', attributes: ['id', 'asset_code', 'name'] },
                { model: User, as: 'user', attributes: ['id', 'name'] },
                { model: Location, as: 'previousLocation', attributes: ['id', 'name'] },
                { model: Location, as: 'newLocation', attributes: ['id', 'name'] }
            ]
        });

        return successResponse(res, createdTransaction, 'Aset berhasil dipindahkan', 201);
    } catch (error) {
        console.error('Relocate asset error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat memindahkan aset', 500);
    }
};

/**
 * Get transactions by asset ID
 * GET /api/transactions/asset/:assetId
 */
export const getTransactionsByAsset = async (req, res) => {
    try {
        const { assetId } = req.params;
        const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
        const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
        const offset = (page - 1) * limit;

        // Verify asset exists
        const asset = await Asset.findByPk(assetId);
        if (!asset) {
            return errorResponse(res, 'Aset tidak ditemukan', 404);
        }

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where: { asset_id: assetId },
            limit,
            offset,
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
        });

        return successResponse(
            res,
            transactions,
            'Data transaksi aset berhasil diambil',
            200,
            paginationMeta(count, page, limit)
        );
    } catch (error) {
        console.error('Get transactions by asset error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data transaksi', 500);
    }
};
