/**
 * Category Routes
 * Routes untuk manajemen kategori aset
 */

import express from 'express';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/CategoryController.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { adminOnly, staffAndAdmin } from '../middleware/AuthorizeRole.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Category routes
router.get('/', staffAndAdmin, getCategories);
router.get('/:id', staffAndAdmin, getCategoryById);
router.post('/', adminOnly, createCategory);
router.put('/:id', adminOnly, updateCategory);
router.delete('/:id', adminOnly, deleteCategory);

export default router;
