/**
 * Transaction Routes
 * Routes untuk transaksi aset
 */

import express from 'express';
import {
    getTransactions,
    getTransactionById,
    checkoutAsset,
    checkinAsset,
    sendToRepair,
    completeRepair,
    disposeAsset,
    relocateAsset,
    getTransactionsByAsset,
    exportTransactions
} from '../controllers/TransactionController.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { adminOnly, staffAndAdmin } from '../middleware/AuthorizeRole.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Transaction routes - Read
router.get('/', staffAndAdmin, getTransactions);
router.get('/export', staffAndAdmin, exportTransactions);
router.get('/:id', staffAndAdmin, getTransactionById);
router.get('/asset/:assetId', staffAndAdmin, getTransactionsByAsset);

// Transaction routes - Actions (Staff can checkout/checkin, Admin for others)
router.post('/checkout', staffAndAdmin, checkoutAsset);
router.post('/checkin', staffAndAdmin, checkinAsset);
router.post('/relocate', staffAndAdmin, relocateAsset);

// Admin only actions
router.post('/repair', adminOnly, sendToRepair);
router.post('/complete-repair', adminOnly, completeRepair);
router.post('/dispose', adminOnly, disposeAsset);

export default router;
