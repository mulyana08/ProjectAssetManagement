/**
 * Location Routes
 * Routes untuk manajemen lokasi aset
 */

import express from 'express';
import {
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    getBuildings
} from '../controllers/LocationController.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { adminOnly, staffAndAdmin } from '../middleware/AuthorizeRole.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Location routes
router.get('/buildings', staffAndAdmin, getBuildings);
router.get('/', staffAndAdmin, getLocations);
router.get('/:id', staffAndAdmin, getLocationById);
router.post('/', adminOnly, createLocation);
router.put('/:id', adminOnly, updateLocation);
router.delete('/:id', adminOnly, deleteLocation);

export default router;
