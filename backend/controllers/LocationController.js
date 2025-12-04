/**
 * Location Controller
 * Handles CRUD operations for locations
 */

import { Op } from 'sequelize';
import { Location, Asset } from '../models/index.js';
import { successResponse, errorResponse, paginationMeta } from '../utils/responseHelper.js';
import { PAGINATION } from '../utils/constants.js';

/**
 * Get all locations with pagination
 * GET /api/locations
 */
export const getLocations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
        const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const building = req.query.building || '';
        const all = req.query.all === 'true'; // Get all without pagination

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { building: { [Op.like]: `%${search}%` } },
                { floor: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (building) {
            whereClause.building = { [Op.like]: `%${building}%` };
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

        const { count, rows: locations } = await Location.findAndCountAll(options);

        // Add asset count to each location
        const locationsWithCount = locations.map(loc => ({
            ...loc.toJSON(),
            asset_count: loc.assets ? loc.assets.length : 0,
            assets: undefined // Remove assets array from response
        }));

        if (all) {
            return successResponse(res, locationsWithCount, 'Data lokasi berhasil diambil');
        }

        return successResponse(
            res,
            locationsWithCount,
            'Data lokasi berhasil diambil',
            200,
            paginationMeta(count, page, limit)
        );
    } catch (error) {
        console.error('Get locations error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data lokasi', 500);
    }
};

/**
 * Get location by ID
 * GET /api/locations/:id
 */
export const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;

        const location = await Location.findByPk(id, {
            include: [
                {
                    model: Asset,
                    as: 'assets',
                    attributes: ['id', 'asset_code', 'name', 'status']
                }
            ]
        });

        if (!location) {
            return errorResponse(res, 'Lokasi tidak ditemukan', 404);
        }

        return successResponse(res, location, 'Data lokasi berhasil diambil');
    } catch (error) {
        console.error('Get location by ID error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data lokasi', 500);
    }
};

/**
 * Create new location
 * POST /api/locations
 */
export const createLocation = async (req, res) => {
    try {
        const { name, building, floor, description } = req.body;

        // Validation
        if (!name) {
            return errorResponse(res, 'Nama lokasi harus diisi', 400);
        }

        // Check if location name already exists
        const existingLocation = await Location.findOne({
            where: { name }
        });

        if (existingLocation) {
            return errorResponse(res, 'Nama lokasi sudah ada', 400);
        }

        // Create location
        const location = await Location.create({
            name,
            building,
            floor,
            description
        });

        return successResponse(res, location, 'Lokasi berhasil dibuat', 201);
    } catch (error) {
        console.error('Create location error:', error);

        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            return errorResponse(res, messages, 400);
        }

        return errorResponse(res, 'Terjadi kesalahan saat membuat lokasi', 500);
    }
};

/**
 * Update location
 * PUT /api/locations/:id
 */
export const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, building, floor, description } = req.body;

        const location = await Location.findByPk(id);

        if (!location) {
            return errorResponse(res, 'Lokasi tidak ditemukan', 404);
        }

        // Check if new name is taken by another location
        if (name && name !== location.name) {
            const existingLocation = await Location.findOne({
                where: { name }
            });

            if (existingLocation) {
                return errorResponse(res, 'Nama lokasi sudah digunakan', 400);
            }
        }

        // Update location
        await location.update({
            name: name || location.name,
            building: building !== undefined ? building : location.building,
            floor: floor !== undefined ? floor : location.floor,
            description: description !== undefined ? description : location.description
        });

        return successResponse(res, location, 'Lokasi berhasil diupdate');
    } catch (error) {
        console.error('Update location error:', error);

        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            return errorResponse(res, messages, 400);
        }

        return errorResponse(res, 'Terjadi kesalahan saat mengupdate lokasi', 500);
    }
};

/**
 * Delete location
 * DELETE /api/locations/:id
 */
export const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;

        const location = await Location.findByPk(id, {
            include: [
                {
                    model: Asset,
                    as: 'assets',
                    attributes: ['id']
                }
            ]
        });

        if (!location) {
            return errorResponse(res, 'Lokasi tidak ditemukan', 404);
        }

        // Check if location has assets
        if (location.assets && location.assets.length > 0) {
            return errorResponse(
                res,
                `Lokasi tidak dapat dihapus karena masih memiliki ${location.assets.length} aset`,
                400
            );
        }

        await location.destroy();

        return successResponse(res, null, 'Lokasi berhasil dihapus');
    } catch (error) {
        console.error('Delete location error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat menghapus lokasi', 500);
    }
};

/**
 * Get unique buildings for filter dropdown
 * GET /api/locations/buildings
 */
export const getBuildings = async (req, res) => {
    try {
        const locations = await Location.findAll({
            attributes: ['building'],
            where: {
                building: {
                    [Op.ne]: null
                }
            },
            group: ['building'],
            order: [['building', 'ASC']]
        });

        const buildings = locations.map(loc => loc.building).filter(Boolean);

        return successResponse(res, buildings, 'Data gedung berhasil diambil');
    } catch (error) {
        console.error('Get buildings error:', error);
        return errorResponse(res, 'Terjadi kesalahan saat mengambil data gedung', 500);
    }
};
