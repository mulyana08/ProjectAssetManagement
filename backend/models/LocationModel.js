import { Sequelize } from 'sequelize';
import db from '../config/Database.js';

const { DataTypes } = Sequelize;

/**
 * Location Model
 * Menyimpan data lokasi penempatan aset
 */
const Location = db.define('locations', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'Nama lokasi sudah ada'
        },
        validate: {
            notEmpty: {
                msg: 'Nama lokasi tidak boleh kosong'
            },
            len: {
                args: [2, 100],
                msg: 'Nama lokasi harus antara 2-100 karakter'
            }
        }
    },
    building: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Nama gedung (jika ada)'
    },
    floor: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Lantai (jika ada)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Location;
