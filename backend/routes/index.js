/**
 * Routes Index
 * Central file untuk mengatur semua routes
 */

import AuthRoutes from './AuthRoutes.js';
import UserRoutes from './UserRoutes.js';
import CategoryRoutes from './CategoryRoutes.js';
import LocationRoutes from './LocationRoutes.js';
import AssetRoutes from './AssetRoutes.js';
import TransactionRoutes from './TransactionRoutes.js';
import ChatRoutes from './ChatRoutes.js';

/**
 * Register all routes to Express app
 * @param {Express} app - Express application instance
 */
const registerRoutes = (app) => {
    // API prefix
    const apiPrefix = '/api';

    // Register routes
    app.use(`${apiPrefix}/auth`, AuthRoutes);
    app.use(`${apiPrefix}/users`, UserRoutes);
    app.use(`${apiPrefix}/categories`, CategoryRoutes);
    app.use(`${apiPrefix}/locations`, LocationRoutes);
    app.use(`${apiPrefix}/assets`, AssetRoutes);
    app.use(`${apiPrefix}/transactions`, TransactionRoutes);
    app.use(`${apiPrefix}/chat`, ChatRoutes);

    // Log registered routes
    console.log('📍 Routes registered:');
    console.log('   /api/auth');
    console.log('   /api/users');
    console.log('   /api/categories');
    console.log('   /api/locations');
    console.log('   /api/assets');
    console.log('   /api/transactions');
    console.log('   /api/chat');
};

export default registerRoutes;
