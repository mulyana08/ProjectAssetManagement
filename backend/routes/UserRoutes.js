/**
 * User Routes
 * Routes untuk manajemen user
 */

import express from 'express';
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    changePassword
} from '../controllers/UserController.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { adminOnly } from '../middleware/AuthorizeRole.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// User routes
router.get('/', adminOnly, getUsers);
router.get('/:id', adminOnly, getUserById);
router.post('/', adminOnly, createUser);
router.put('/change-password', changePassword); // Any authenticated user
router.put('/:id', adminOnly, updateUser);
router.delete('/:id', adminOnly, deleteUser);

export default router;
