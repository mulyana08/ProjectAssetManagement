/**
 * Models Index
 * Central file untuk mengatur semua models dan associations
 */

import db from '../config/Database.js';
import User from './UserModel.js';
import Category from './CategoryModel.js';
import Location from './LocationModel.js';
import Asset from './AssetModel.js';
import Transaction from './TransactionModel.js';

// =====================
// Model Associations
// =====================

// Category <-> Asset (One-to-Many)
Category.hasMany(Asset, {
    foreignKey: 'category_id',
    as: 'assets',
    onDelete: 'RESTRICT', // Prevent deletion if assets exist
    onUpdate: 'CASCADE'
});
Asset.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
});

// Location <-> Asset (One-to-Many)
Location.hasMany(Asset, {
    foreignKey: 'location_id',
    as: 'assets',
    onDelete: 'SET NULL', // Set to null if location deleted
    onUpdate: 'CASCADE'
});
Asset.belongsTo(Location, {
    foreignKey: 'location_id',
    as: 'location'
});

// Asset <-> Transaction (One-to-Many)
Asset.hasMany(Transaction, {
    foreignKey: 'asset_id',
    as: 'transactions',
    onDelete: 'CASCADE', // Delete transactions if asset deleted
    onUpdate: 'CASCADE'
});
Transaction.belongsTo(Asset, {
    foreignKey: 'asset_id',
    as: 'asset'
});

// User <-> Transaction (One-to-Many)
User.hasMany(Transaction, {
    foreignKey: 'user_id',
    as: 'transactions',
    onDelete: 'RESTRICT', // Prevent deletion if user has transactions
    onUpdate: 'CASCADE'
});
Transaction.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Transaction -> Location (Previous Location)
Transaction.belongsTo(Location, {
    foreignKey: 'previous_location_id',
    as: 'previousLocation'
});

// Transaction -> Location (New Location)
Transaction.belongsTo(Location, {
    foreignKey: 'new_location_id',
    as: 'newLocation'
});

// =====================
// Sync Database Function
// =====================

/**
 * Sync semua model ke database
 * @param {Object} options - Sequelize sync options
 * @param {boolean} options.force - Drop tables if exist
 * @param {boolean} options.alter - Alter tables to match model
 */
const syncDatabase = async (options = {}) => {
    try {
        await db.sync(options);
        console.log('✅ Database synced successfully');
    } catch (error) {
        console.error('❌ Error syncing database:', error.message);
        throw error;
    }
};

// =====================
// Export
// =====================

export {
    db,
    User,
    Category,
    Location,
    Asset,
    Transaction,
    syncDatabase
};

export default {
    db,
    User,
    Category,
    Location,
    Asset,
    Transaction,
    syncDatabase
};
