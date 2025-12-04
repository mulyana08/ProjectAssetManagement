import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import { TRANSACTION_TYPES } from '../utils/constants.js';

const { DataTypes } = Sequelize;

/**
 * Transaction Model
 * Menyimpan riwayat perubahan status aset
 */
const Transaction = db.define('transactions', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    asset_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'assets',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'Asset ID harus diisi'
            }
        }
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'User yang melakukan transaksi'
    },
    type: {
        type: DataTypes.ENUM(...Object.values(TRANSACTION_TYPES)),
        allowNull: false,
        validate: {
            isIn: {
                args: [Object.values(TRANSACTION_TYPES)],
                msg: 'Tipe transaksi tidak valid'
            }
        }
    },
    previous_status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Status sebelum transaksi'
    },
    new_status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Status setelah transaksi'
    },
    previous_location_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'locations',
            key: 'id'
        },
        comment: 'Lokasi sebelum transaksi (untuk relocate)'
    },
    new_location_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'locations',
            key: 'id'
        },
        comment: 'Lokasi setelah transaksi (untuk relocate)'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Catatan/keterangan transaksi'
    },
    transaction_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Tanggal dan waktu transaksi'
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Transactions are immutable, no update needed
    indexes: [
        {
            fields: ['asset_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['type']
        },
        {
            fields: ['transaction_date']
        }
    ]
});

export default Transaction;
