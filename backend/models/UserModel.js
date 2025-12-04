import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import { USER_ROLES } from '../utils/constants.js';

const { DataTypes } = Sequelize;

/**
 * User Model
 * Menyimpan data pengguna sistem (Admin & Staff)
 */
const User = db.define('users', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Nama tidak boleh kosong'
            },
            len: {
                args: [2, 100],
                msg: 'Nama harus antara 2-100 karakter'
            }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'Email sudah terdaftar'
        },
        validate: {
            notEmpty: {
                msg: 'Email tidak boleh kosong'
            },
            isEmail: {
                msg: 'Format email tidak valid'
            }
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Password tidak boleh kosong'
            },
            len: {
                args: [6, 255],
                msg: 'Password minimal 6 karakter'
            }
        }
    },
    role: {
        type: DataTypes.ENUM(...Object.values(USER_ROLES)),
        allowNull: false,
        defaultValue: USER_ROLES.STAFF,
        validate: {
            isIn: {
                args: [Object.values(USER_ROLES)],
                msg: 'Role tidak valid'
            }
        }
    },
    refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // Exclude password and refresh_token from default queries
    defaultScope: {
        attributes: {
            exclude: ['password', 'refresh_token']
        }
    },
    scopes: {
        // Scope untuk login (include password)
        withPassword: {
            attributes: {
                exclude: ['refresh_token']
            }
        },
        // Scope untuk refresh token validation
        withRefreshToken: {
            attributes: {
                include: ['refresh_token']
            }
        },
        // Scope untuk semua data
        full: {
            attributes: {}
        }
    }
});

export default User;
