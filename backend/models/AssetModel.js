import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import { ASSET_STATUS } from '../utils/constants.js';

const { DataTypes } = Sequelize;

/**
 * Asset Model
 * Menyimpan data aset IT
 */
const Asset = db.define('assets', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    asset_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
            msg: 'Kode aset sudah digunakan'
        },
        validate: {
            notEmpty: {
                msg: 'Kode aset tidak boleh kosong'
            }
        },
        comment: 'Kode unik aset (contoh: AST-2024-0001)'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Nama aset tidak boleh kosong'
            },
            len: {
                args: [2, 100],
                msg: 'Nama aset harus antara 2-100 karakter'
            }
        }
    },
    category_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'Kategori harus dipilih'
            }
        }
    },
    location_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'locations',
            key: 'id'
        },
        comment: 'Lokasi saat ini, null jika disposed'
    },
    brand: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Merek aset'
    },
    model: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Model/tipe aset'
    },
    serial_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: {
            msg: 'Serial number sudah terdaftar'
        },
        comment: 'Nomor seri dari pabrikan'
    },
    specifications: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Spesifikasi teknis (dalam format JSON string atau plain text)'
    },
    purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'Format tanggal pembelian tidak valid'
            }
        },
        comment: 'Tanggal pembelian'
    },
    purchase_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        validate: {
            isDecimal: {
                msg: 'Harga pembelian harus berupa angka'
            },
            min: {
                args: [0],
                msg: 'Harga pembelian tidak boleh negatif'
            }
        },
        comment: 'Harga pembelian dalam Rupiah'
    },
    warranty_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'Format tanggal garansi tidak valid'
            }
        },
        comment: 'Tanggal berakhir garansi'
    },
    status: {
        type: DataTypes.ENUM(...Object.values(ASSET_STATUS)),
        allowNull: false,
        defaultValue: ASSET_STATUS.AVAILABLE,
        validate: {
            isIn: {
                args: [Object.values(ASSET_STATUS)],
                msg: 'Status tidak valid'
            }
        }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Catatan tambahan'
    },
    image_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
            isUrl: {
                msg: 'Format URL gambar tidak valid'
            }
        },
        comment: 'URL gambar aset'
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['category_id']
        },
        {
            fields: ['location_id']
        },
        {
            fields: ['asset_code']
        }
    ]
});

// Virtual field untuk menghitung apakah garansi masih aktif
Asset.prototype.isWarrantyActive = function() {
    if (!this.warranty_expiry) return false;
    return new Date(this.warranty_expiry) > new Date();
};

// Method untuk generate asset code
Asset.generateAssetCode = async function(prefix = 'AST') {
    const year = new Date().getFullYear();
    const lastAsset = await Asset.findOne({
        where: {
            asset_code: {
                [Sequelize.Op.like]: `${prefix}-${year}-%`
            }
        },
        order: [['id', 'DESC']]
    });

    let sequence = 1;
    if (lastAsset) {
        const lastCode = lastAsset.asset_code;
        const lastSequence = parseInt(lastCode.split('-').pop(), 10);
        sequence = lastSequence + 1;
    }

    return `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`;
};

export default Asset;
