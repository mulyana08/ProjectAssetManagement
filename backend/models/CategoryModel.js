import { Sequelize } from 'sequelize';
import db from '../config/Database.js';

const { DataTypes } = Sequelize;

/**
 * Category Model
 * Menyimpan kategori/jenis aset (Laptop, Monitor, Printer, dll)
 */
const Category = db.define('categories', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'Nama kategori sudah ada'
        },
        validate: {
            notEmpty: {
                msg: 'Nama kategori tidak boleh kosong'
            },
            len: {
                args: [2, 100],
                msg: 'Nama kategori harus antara 2-100 karakter'
            }
        }
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

export default Category;
