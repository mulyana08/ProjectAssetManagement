/**
 * Asset Routes
 * Routes untuk manajemen aset
 */

import express from 'express';
import {
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetStats,
    generateAssetCode
} from '../controllers/AssetController.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { adminOnly, staffAndAdmin } from '../middleware/AuthorizeRole.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Asset routes
router.get('/stats', staffAndAdmin, getAssetStats);
router.get('/generate-code', staffAndAdmin, generateAssetCode);
router.get('/', staffAndAdmin, getAssets);
router.get('/:id', staffAndAdmin, getAssetById);
router.post('/', adminOnly, createAsset);
router.put('/:id', adminOnly, updateAsset);
router.delete('/:id', adminOnly, deleteAsset);

export default router;
