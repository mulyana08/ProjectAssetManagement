/**
 * Comprehensive Dummy Data Seeder
 * Script untuk mengisi data dummy lengkap ke database
 * Termasuk: Users, Categories, Locations, Assets, Transactions
 */

import argon2 from 'argon2';
import { User, Category, Location, Asset, Transaction, syncDatabase } from '../models/index.js';
import { USER_ROLES, ASSET_STATUS, TRANSACTION_TYPES } from '../utils/constants.js';
import dotenv from 'dotenv';

dotenv.config();

// =====================
// USER DUMMY DATA
// =====================
const seedUsers = async () => {
    const users = [
        {
            name: 'Administrator',
            email: 'admin@company.com',
            password: await argon2.hash('admin123'),
            role: USER_ROLES.ADMIN,
            is_active: true
        },
        {
            name: 'Staff IT',
            email: 'staff@company.com',
            password: await argon2.hash('staff123'),
            role: USER_ROLES.STAFF,
            is_active: true
        },
        {
            name: 'Budi Santoso',
            email: 'budi.santoso@company.com',
            password: await argon2.hash('user123'),
            role: USER_ROLES.EMPLOYEE,
            is_active: true
        },
        {
            name: 'Siti Rahayu',
            email: 'siti.rahayu@company.com',
            password: await argon2.hash('user123'),
            role: USER_ROLES.EMPLOYEE,
            is_active: true
        },
        {
            name: 'Ahmad Wijaya',
            email: 'ahmad.wijaya@company.com',
            password: await argon2.hash('user123'),
            role: USER_ROLES.STAFF,
            is_active: true
        },
        {
            name: 'Dewi Putri',
            email: 'dewi.putri@company.com',
            password: await argon2.hash('user123'),
            role: USER_ROLES.EMPLOYEE,
            is_active: false
        },
        {
            name: 'Eko Prasetyo',
            email: 'eko.prasetyo@company.com',
            password: await argon2.hash('user123'),
            role: USER_ROLES.EMPLOYEE,
            is_active: true
        },
        {
            name: 'Rina Wati',
            email: 'rina.wati@company.com',
            password: await argon2.hash('user123'),
            role: USER_ROLES.STAFF,
            is_active: true
        }
    ];

    const createdUsers = [];
    for (const userData of users) {
        const [user, created] = await User.findOrCreate({
            where: { email: userData.email },
            defaults: userData
        });
        createdUsers.push(user);
        
        if (created) {
            console.log(`✅ User created: ${userData.name} (${userData.email})`);
        } else {
            console.log(`⏭️  User exists: ${userData.email}`);
        }
    }
    return createdUsers;
};

// =====================
// CATEGORY DUMMY DATA
// =====================
const seedCategories = async () => {
    const categories = [
        { name: 'Laptop', description: 'Komputer portabel untuk keperluan kerja' },
        { name: 'Desktop PC', description: 'Komputer desktop untuk keperluan kantor' },
        { name: 'Monitor', description: 'Layar monitor komputer' },
        { name: 'Printer', description: 'Perangkat printer dan scanner' },
        { name: 'Networking', description: 'Perangkat jaringan seperti router, switch, access point' },
        { name: 'Server', description: 'Server dan perangkat data center' },
        { name: 'Storage', description: 'Perangkat penyimpanan data eksternal' },
        { name: 'Peripherals', description: 'Keyboard, mouse, headset, webcam, dll' },
        { name: 'Mobile Device', description: 'Smartphone dan tablet perusahaan' },
        { name: 'Software', description: 'Lisensi software dan aplikasi' },
        { name: 'Projector', description: 'Proyektor untuk presentasi' },
        { name: 'UPS', description: 'Uninterruptible Power Supply' }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
        const [category, created] = await Category.findOrCreate({
            where: { name: categoryData.name },
            defaults: categoryData
        });
        createdCategories.push(category);

        if (created) {
            console.log(`✅ Category created: ${categoryData.name}`);
        } else {
            console.log(`⏭️  Category exists: ${categoryData.name}`);
        }
    }
    return createdCategories;
};

// =====================
// LOCATION DUMMY DATA
// =====================
const seedLocations = async () => {
    const locations = [
        { name: 'Ruang Server', building: 'Gedung Utama', floor: 'Lantai 1', description: 'Data center dan server room' },
        { name: 'IT Department', building: 'Gedung Utama', floor: 'Lantai 2', description: 'Ruangan departemen IT' },
        { name: 'Ruang Meeting A', building: 'Gedung Utama', floor: 'Lantai 3', description: 'Ruang meeting utama' },
        { name: 'Ruang Meeting B', building: 'Gedung Utama', floor: 'Lantai 3', description: 'Ruang meeting kecil' },
        { name: 'Finance Department', building: 'Gedung Utama', floor: 'Lantai 2', description: 'Ruangan departemen keuangan' },
        { name: 'HR Department', building: 'Gedung Utama', floor: 'Lantai 2', description: 'Ruangan Human Resources' },
        { name: 'Reception', building: 'Gedung Utama', floor: 'Lantai 1', description: 'Area resepsionis' },
        { name: 'Warehouse', building: 'Gedung Gudang', floor: 'Lantai 1', description: 'Gudang penyimpanan aset' },
        { name: 'Branch Office A', building: 'Kantor Cabang A', floor: 'Lantai 1', description: 'Kantor cabang A' },
        { name: 'Branch Office B', building: 'Kantor Cabang B', floor: 'Lantai 1', description: 'Kantor cabang B' },
        { name: 'Training Room', building: 'Gedung Utama', floor: 'Lantai 4', description: 'Ruang pelatihan karyawan' },
        { name: 'Executive Room', building: 'Gedung Utama', floor: 'Lantai 5', description: 'Ruang eksekutif dan direksi' }
    ];

    const createdLocations = [];
    for (const locationData of locations) {
        const [location, created] = await Location.findOrCreate({
            where: { name: locationData.name },
            defaults: locationData
        });
        createdLocations.push(location);

        if (created) {
            console.log(`✅ Location created: ${locationData.name}`);
        } else {
            console.log(`⏭️  Location exists: ${locationData.name}`);
        }
    }
    return createdLocations;
};

// =====================
// ASSET DUMMY DATA
// =====================
const seedAssets = async (categories, locations) => {
    // Get category IDs by name for easier reference
    const getCategoryId = (name) => categories.find(c => c.name === name)?.id;
    const getLocationId = (name) => locations.find(l => l.name === name)?.id;

    const assets = [
        // LAPTOPS
        {
            asset_code: 'AST-2024-0001',
            name: 'MacBook Pro 14 M3',
            category_id: getCategoryId('Laptop'),
            location_id: getLocationId('IT Department'),
            brand: 'Apple',
            model: 'MacBook Pro 14 M3 Pro',
            serial_number: 'SN-MBP-001234',
            specifications: 'M3 Pro, 18GB RAM, 512GB SSD, 14" Liquid Retina XDR',
            purchase_date: '2024-01-15',
            purchase_price: 35000000.00,
            warranty_expiry: '2025-01-15',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Laptop untuk developer senior'
        },
        {
            asset_code: 'AST-2024-0002',
            name: 'ThinkPad X1 Carbon Gen 11',
            category_id: getCategoryId('Laptop'),
            location_id: getLocationId('Finance Department'),
            brand: 'Lenovo',
            model: 'ThinkPad X1 Carbon Gen 11',
            serial_number: 'SN-TPX1-002345',
            specifications: 'Intel i7-1365U, 16GB RAM, 512GB SSD, 14" 2.8K OLED',
            purchase_date: '2024-02-20',
            purchase_price: 28000000.00,
            warranty_expiry: '2027-02-20',
            status: ASSET_STATUS.ASSIGNED,
            notes: 'Digunakan oleh Finance Manager'
        },
        {
            asset_code: 'AST-2024-0003',
            name: 'Dell Latitude 5540',
            category_id: getCategoryId('Laptop'),
            location_id: getLocationId('HR Department'),
            brand: 'Dell',
            model: 'Latitude 5540',
            serial_number: 'SN-DLAT-003456',
            specifications: 'Intel i5-1345U, 16GB RAM, 256GB SSD, 15.6" FHD',
            purchase_date: '2024-03-10',
            purchase_price: 18000000.00,
            warranty_expiry: '2027-03-10',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Laptop standar HR'
        },
        {
            asset_code: 'AST-2023-0004',
            name: 'HP EliteBook 840 G9',
            category_id: getCategoryId('Laptop'),
            location_id: getLocationId('Warehouse'),
            brand: 'HP',
            model: 'EliteBook 840 G9',
            serial_number: 'SN-HPEB-004567',
            specifications: 'Intel i5-1235U, 8GB RAM, 256GB SSD, 14" FHD',
            purchase_date: '2023-06-15',
            purchase_price: 15000000.00,
            warranty_expiry: '2026-06-15',
            status: ASSET_STATUS.REPAIR,
            notes: 'Keyboard rusak, sedang diperbaiki'
        },
        {
            asset_code: 'AST-2022-0005',
            name: 'ASUS ZenBook 14',
            category_id: getCategoryId('Laptop'),
            location_id: null,
            brand: 'ASUS',
            model: 'ZenBook 14 UX425',
            serial_number: 'SN-ASZB-005678',
            specifications: 'Intel i7-1165G7, 16GB RAM, 512GB SSD, 14" FHD',
            purchase_date: '2022-08-20',
            purchase_price: 16000000.00,
            warranty_expiry: '2024-08-20',
            status: ASSET_STATUS.RETIRED,
            notes: 'Garansi habis, sudah tidak layak pakai'
        },

        // DESKTOP PCs
        {
            asset_code: 'AST-2024-0006',
            name: 'Dell OptiPlex 7090',
            category_id: getCategoryId('Desktop PC'),
            location_id: getLocationId('IT Department'),
            brand: 'Dell',
            model: 'OptiPlex 7090 Tower',
            serial_number: 'SN-DOPT-006789',
            specifications: 'Intel i7-11700, 32GB RAM, 1TB SSD + 2TB HDD, NVIDIA RTX 3060',
            purchase_date: '2024-01-05',
            purchase_price: 25000000.00,
            warranty_expiry: '2027-01-05',
            status: ASSET_STATUS.ASSIGNED,
            notes: 'Workstation untuk Video Editing'
        },
        {
            asset_code: 'AST-2024-0007',
            name: 'HP ProDesk 400 G7',
            category_id: getCategoryId('Desktop PC'),
            location_id: getLocationId('Reception'),
            brand: 'HP',
            model: 'ProDesk 400 G7 SFF',
            serial_number: 'SN-HPPD-007890',
            specifications: 'Intel i5-10500, 8GB RAM, 256GB SSD',
            purchase_date: '2024-02-01',
            purchase_price: 12000000.00,
            warranty_expiry: '2027-02-01',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'PC untuk resepsionis'
        },
        {
            asset_code: 'AST-2023-0008',
            name: 'Lenovo ThinkCentre M90q',
            category_id: getCategoryId('Desktop PC'),
            location_id: getLocationId('Branch Office A'),
            brand: 'Lenovo',
            model: 'ThinkCentre M90q Gen 3',
            serial_number: 'SN-LTCM-008901',
            specifications: 'Intel i5-12400T, 16GB RAM, 512GB SSD',
            purchase_date: '2023-09-15',
            purchase_price: 14000000.00,
            warranty_expiry: '2026-09-15',
            status: ASSET_STATUS.ASSIGNED,
            notes: 'PC untuk kantor cabang A'
        },

        // MONITORS
        {
            asset_code: 'AST-2024-0009',
            name: 'LG UltraWide 34WN80C',
            category_id: getCategoryId('Monitor'),
            location_id: getLocationId('IT Department'),
            brand: 'LG',
            model: 'UltraWide 34WN80C-B',
            serial_number: 'SN-LGUW-009012',
            specifications: '34" WQHD 3440x1440, IPS, USB-C, HDR10',
            purchase_date: '2024-01-15',
            purchase_price: 8500000.00,
            warranty_expiry: '2027-01-15',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Monitor ultrawide untuk development'
        },
        {
            asset_code: 'AST-2024-0010',
            name: 'Dell P2422H',
            category_id: getCategoryId('Monitor'),
            location_id: getLocationId('Finance Department'),
            brand: 'Dell',
            model: 'P2422H',
            serial_number: 'SN-DLLM-010123',
            specifications: '24" FHD 1920x1080, IPS, USB Hub',
            purchase_date: '2024-02-20',
            purchase_price: 3500000.00,
            warranty_expiry: '2027-02-20',
            status: ASSET_STATUS.ASSIGNED,
            notes: 'Monitor standar finance'
        },
        {
            asset_code: 'AST-2023-0011',
            name: 'Samsung Odyssey G5',
            category_id: getCategoryId('Monitor'),
            location_id: getLocationId('Training Room'),
            brand: 'Samsung',
            model: 'Odyssey G5 27"',
            serial_number: 'SN-SMOD-011234',
            specifications: '27" QHD 2560x1440, VA, 144Hz, Curved',
            purchase_date: '2023-07-10',
            purchase_price: 5500000.00,
            warranty_expiry: '2026-07-10',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Monitor untuk training room'
        },

        // PRINTERS
        {
            asset_code: 'AST-2024-0012',
            name: 'HP LaserJet Pro M404dn',
            category_id: getCategoryId('Printer'),
            location_id: getLocationId('Finance Department'),
            brand: 'HP',
            model: 'LaserJet Pro M404dn',
            serial_number: 'SN-HPLJ-012345',
            specifications: 'Monochrome, 40ppm, Duplex, Network',
            purchase_date: '2024-01-20',
            purchase_price: 5800000.00,
            warranty_expiry: '2025-01-20',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Printer utama departemen finance'
        },
        {
            asset_code: 'AST-2024-0013',
            name: 'Epson EcoTank L3250',
            category_id: getCategoryId('Printer'),
            location_id: getLocationId('HR Department'),
            brand: 'Epson',
            model: 'EcoTank L3250',
            serial_number: 'SN-EPET-013456',
            specifications: 'Color, WiFi, Print/Scan/Copy, Ink Tank',
            purchase_date: '2024-03-05',
            purchase_price: 3200000.00,
            warranty_expiry: '2026-03-05',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Printer warna untuk HR'
        },
        {
            asset_code: 'AST-2023-0014',
            name: 'Canon imageCLASS MF746Cx',
            category_id: getCategoryId('Printer'),
            location_id: getLocationId('IT Department'),
            brand: 'Canon',
            model: 'imageCLASS MF746Cx',
            serial_number: 'SN-CNIC-014567',
            specifications: 'Color Laser, 27ppm, Duplex, WiFi, ADF',
            purchase_date: '2023-11-15',
            purchase_price: 12000000.00,
            warranty_expiry: '2026-11-15',
            status: ASSET_STATUS.ASSIGNED,
            notes: 'Printer multifungsi IT'
        },

        // NETWORKING
        {
            asset_code: 'AST-2024-0015',
            name: 'Cisco Catalyst 2960-X',
            category_id: getCategoryId('Networking'),
            location_id: getLocationId('Ruang Server'),
            brand: 'Cisco',
            model: 'Catalyst 2960-X 24 Port',
            serial_number: 'SN-CSCO-015678',
            specifications: '24 Port Gigabit, 4 SFP+, Layer 2+',
            purchase_date: '2024-01-10',
            purchase_price: 45000000.00,
            warranty_expiry: '2027-01-10',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Core switch utama'
        },
        {
            asset_code: 'AST-2024-0016',
            name: 'Ubiquiti UniFi Dream Machine',
            category_id: getCategoryId('Networking'),
            location_id: getLocationId('Ruang Server'),
            brand: 'Ubiquiti',
            model: 'UniFi Dream Machine Pro',
            serial_number: 'SN-UBNT-016789',
            specifications: 'Gateway, Switch 8-Port, UniFi Controller',
            purchase_date: '2024-02-15',
            purchase_price: 8500000.00,
            warranty_expiry: '2026-02-15',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Router dan controller WiFi'
        },
        {
            asset_code: 'AST-2023-0017',
            name: 'TP-Link EAP245',
            category_id: getCategoryId('Networking'),
            location_id: getLocationId('IT Department'),
            brand: 'TP-Link',
            model: 'EAP245 AC1750',
            serial_number: 'SN-TPLK-017890',
            specifications: 'Wireless AC1750, PoE, Ceiling Mount',
            purchase_date: '2023-05-20',
            purchase_price: 1500000.00,
            warranty_expiry: '2026-05-20',
            status: ASSET_STATUS.MISSING,
            notes: 'Access point hilang dari gudang'
        },

        // SERVERS
        {
            asset_code: 'AST-2024-0018',
            name: 'Dell PowerEdge R750',
            category_id: getCategoryId('Server'),
            location_id: getLocationId('Ruang Server'),
            brand: 'Dell',
            model: 'PowerEdge R750',
            serial_number: 'SN-DLPE-018901',
            specifications: '2x Xeon Gold 6330, 256GB RAM, 8x 1.92TB SSD, RAID',
            purchase_date: '2024-01-05',
            purchase_price: 250000000.00,
            warranty_expiry: '2027-01-05',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Server utama produksi'
        },
        {
            asset_code: 'AST-2023-0019',
            name: 'HPE ProLiant DL380 Gen10',
            category_id: getCategoryId('Server'),
            location_id: getLocationId('Ruang Server'),
            brand: 'HPE',
            model: 'ProLiant DL380 Gen10',
            serial_number: 'SN-HPEP-019012',
            specifications: '2x Xeon Silver 4214, 128GB RAM, 4x 1.2TB SAS',
            purchase_date: '2023-03-15',
            purchase_price: 180000000.00,
            warranty_expiry: '2026-03-15',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Server backup dan development'
        },

        // STORAGE
        {
            asset_code: 'AST-2024-0020',
            name: 'Synology DS1821+',
            category_id: getCategoryId('Storage'),
            location_id: getLocationId('Ruang Server'),
            brand: 'Synology',
            model: 'DS1821+',
            serial_number: 'SN-SYNL-020123',
            specifications: '8-Bay NAS, 4GB RAM, 4x 8TB HDD RAID',
            purchase_date: '2024-02-01',
            purchase_price: 35000000.00,
            warranty_expiry: '2027-02-01',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'NAS untuk backup data'
        },

        // PERIPHERALS
        {
            asset_code: 'AST-2024-0021',
            name: 'Logitech MX Master 3S',
            category_id: getCategoryId('Peripherals'),
            location_id: getLocationId('IT Department'),
            brand: 'Logitech',
            model: 'MX Master 3S',
            serial_number: 'SN-LGMX-021234',
            specifications: 'Wireless Mouse, USB-C, 8000 DPI',
            purchase_date: '2024-01-20',
            purchase_price: 1500000.00,
            warranty_expiry: '2026-01-20',
            status: ASSET_STATUS.ASSIGNED,
            notes: 'Mouse untuk developer'
        },
        {
            asset_code: 'AST-2024-0022',
            name: 'Keychron K3 Pro',
            category_id: getCategoryId('Peripherals'),
            location_id: getLocationId('IT Department'),
            brand: 'Keychron',
            model: 'K3 Pro',
            serial_number: 'SN-KYCH-022345',
            specifications: 'Mechanical Keyboard, Low Profile, Wireless',
            purchase_date: '2024-02-10',
            purchase_price: 1800000.00,
            warranty_expiry: '2025-02-10',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Keyboard mekanik untuk developer'
        },

        // MOBILE DEVICES
        {
            asset_code: 'AST-2024-0023',
            name: 'iPhone 15 Pro',
            category_id: getCategoryId('Mobile Device'),
            location_id: getLocationId('Executive Room'),
            brand: 'Apple',
            model: 'iPhone 15 Pro 256GB',
            serial_number: 'SN-APIP-023456',
            specifications: 'A17 Pro, 256GB, Titanium Blue',
            purchase_date: '2024-01-25',
            purchase_price: 22000000.00,
            warranty_expiry: '2025-01-25',
            status: ASSET_STATUS.ASSIGNED,
            notes: 'Smartphone untuk direktur'
        },
        {
            asset_code: 'AST-2024-0024',
            name: 'Samsung Galaxy Tab S9',
            category_id: getCategoryId('Mobile Device'),
            location_id: getLocationId('Ruang Meeting A'),
            brand: 'Samsung',
            model: 'Galaxy Tab S9 256GB',
            serial_number: 'SN-SMGT-024567',
            specifications: 'Snapdragon 8 Gen 2, 256GB, S Pen included',
            purchase_date: '2024-02-15',
            purchase_price: 14000000.00,
            warranty_expiry: '2025-02-15',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Tablet untuk meeting room'
        },

        // PROJECTOR
        {
            asset_code: 'AST-2024-0025',
            name: 'Epson EB-X51',
            category_id: getCategoryId('Projector'),
            location_id: getLocationId('Ruang Meeting A'),
            brand: 'Epson',
            model: 'EB-X51',
            serial_number: 'SN-EPPJ-025678',
            specifications: '3800 lumens, XGA, HDMI, WiFi',
            purchase_date: '2024-01-30',
            purchase_price: 7500000.00,
            warranty_expiry: '2026-01-30',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Projector untuk presentasi'
        },
        {
            asset_code: 'AST-2023-0026',
            name: 'BenQ MH560',
            category_id: getCategoryId('Projector'),
            location_id: getLocationId('Training Room'),
            brand: 'BenQ',
            model: 'MH560',
            serial_number: 'SN-BNQP-026789',
            specifications: '3800 lumens, Full HD, HDMI',
            purchase_date: '2023-08-20',
            purchase_price: 9000000.00,
            warranty_expiry: '2026-08-20',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Projector untuk training room'
        },

        // UPS
        {
            asset_code: 'AST-2024-0027',
            name: 'APC Smart-UPS 3000VA',
            category_id: getCategoryId('UPS'),
            location_id: getLocationId('Ruang Server'),
            brand: 'APC',
            model: 'Smart-UPS SMT3000RMI2U',
            serial_number: 'SN-APCU-027890',
            specifications: '3000VA/2700W, Rack Mount, LCD',
            purchase_date: '2024-01-10',
            purchase_price: 18000000.00,
            warranty_expiry: '2027-01-10',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'UPS untuk server rack'
        },
        {
            asset_code: 'AST-2023-0028',
            name: 'Eaton 5P 1550',
            category_id: getCategoryId('UPS'),
            location_id: getLocationId('IT Department'),
            brand: 'Eaton',
            model: '5P 1550i',
            serial_number: 'SN-EATN-028901',
            specifications: '1550VA/1100W, Tower, USB',
            purchase_date: '2023-06-10',
            purchase_price: 4500000.00,
            warranty_expiry: '2026-06-10',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'UPS untuk workstation IT'
        },

        // SOFTWARE LICENSES
        {
            asset_code: 'AST-2024-0029',
            name: 'Microsoft 365 Business',
            category_id: getCategoryId('Software'),
            location_id: getLocationId('IT Department'),
            brand: 'Microsoft',
            model: 'Microsoft 365 Business Premium',
            serial_number: 'LIC-MS365-029012',
            specifications: '50 user licenses, Annual subscription',
            purchase_date: '2024-01-01',
            purchase_price: 50000000.00,
            warranty_expiry: '2025-01-01',
            status: ASSET_STATUS.AVAILABLE,
            notes: 'Lisensi tahunan MS 365'
        },
        {
            asset_code: 'AST-2024-0030',
            name: 'Adobe Creative Cloud',
            category_id: getCategoryId('Software'),
            location_id: getLocationId('IT Department'),
            brand: 'Adobe',
            model: 'Creative Cloud All Apps',
            serial_number: 'LIC-ADOBE-030123',
            specifications: '10 user licenses, Annual subscription',
            purchase_date: '2024-02-01',
            purchase_price: 35000000.00,
            warranty_expiry: '2025-02-01',
            status: ASSET_STATUS.ASSIGNED,
            notes: 'Lisensi untuk tim design'
        }
    ];

    const createdAssets = [];
    for (const assetData of assets) {
        try {
            const [asset, created] = await Asset.findOrCreate({
                where: { asset_code: assetData.asset_code },
                defaults: assetData
            });
            createdAssets.push(asset);

            if (created) {
                console.log(`✅ Asset created: ${assetData.name} (${assetData.asset_code})`);
            } else {
                console.log(`⏭️  Asset exists: ${assetData.asset_code}`);
            }
        } catch (error) {
            console.error(`❌ Error creating asset ${assetData.asset_code}:`, error.message);
        }
    }
    return createdAssets;
};

// =====================
// TRANSACTION DUMMY DATA
// =====================
const seedTransactions = async (assets, users, locations) => {
    const getAssetId = (code) => assets.find(a => a.asset_code === code)?.id;
    const getUserId = (email) => users.find(u => u.email === email)?.id;
    const getLocationId = (name) => locations.find(l => l.name === name)?.id;

    const transactions = [
        // Checkout transactions
        {
            asset_id: getAssetId('AST-2024-0002'),
            user_id: getUserId('admin@company.com'),
            type: TRANSACTION_TYPES.CHECKOUT,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.ASSIGNED,
            notes: 'Dipinjamkan ke Finance Manager untuk pekerjaan sehari-hari',
            transaction_date: new Date('2024-02-25')
        },
        {
            asset_id: getAssetId('AST-2024-0006'),
            user_id: getUserId('staff@company.com'),
            type: TRANSACTION_TYPES.CHECKOUT,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.ASSIGNED,
            notes: 'Workstation untuk tim video editing',
            transaction_date: new Date('2024-01-10')
        },
        {
            asset_id: getAssetId('AST-2023-0008'),
            user_id: getUserId('admin@company.com'),
            type: TRANSACTION_TYPES.CHECKOUT,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.ASSIGNED,
            previous_location_id: getLocationId('Warehouse'),
            new_location_id: getLocationId('Branch Office A'),
            notes: 'Distribusi PC ke kantor cabang A',
            transaction_date: new Date('2023-09-20')
        },
        {
            asset_id: getAssetId('AST-2024-0010'),
            user_id: getUserId('staff@company.com'),
            type: TRANSACTION_TYPES.CHECKOUT,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.ASSIGNED,
            notes: 'Monitor untuk Finance Manager',
            transaction_date: new Date('2024-02-25')
        },
        {
            asset_id: getAssetId('AST-2023-0014'),
            user_id: getUserId('ahmad.wijaya@company.com'),
            type: TRANSACTION_TYPES.CHECKOUT,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.ASSIGNED,
            notes: 'Printer multifungsi untuk IT Department',
            transaction_date: new Date('2023-11-20')
        },
        {
            asset_id: getAssetId('AST-2024-0021'),
            user_id: getUserId('staff@company.com'),
            type: TRANSACTION_TYPES.CHECKOUT,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.ASSIGNED,
            notes: 'Mouse untuk developer Budi',
            transaction_date: new Date('2024-01-25')
        },
        {
            asset_id: getAssetId('AST-2024-0023'),
            user_id: getUserId('admin@company.com'),
            type: TRANSACTION_TYPES.CHECKOUT,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.ASSIGNED,
            notes: 'iPhone untuk Direktur Utama',
            transaction_date: new Date('2024-01-28')
        },
        {
            asset_id: getAssetId('AST-2024-0030'),
            user_id: getUserId('admin@company.com'),
            type: TRANSACTION_TYPES.CHECKOUT,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.ASSIGNED,
            notes: 'Lisensi Adobe untuk tim design',
            transaction_date: new Date('2024-02-05')
        },

        // Repair transactions
        {
            asset_id: getAssetId('AST-2023-0004'),
            user_id: getUserId('staff@company.com'),
            type: TRANSACTION_TYPES.REPAIR_START,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.REPAIR,
            previous_location_id: getLocationId('IT Department'),
            new_location_id: getLocationId('Warehouse'),
            notes: 'Keyboard rusak, dikirim untuk perbaikan ke vendor',
            transaction_date: new Date('2024-11-20')
        },

        // Dispose transaction
        {
            asset_id: getAssetId('AST-2022-0005'),
            user_id: getUserId('admin@company.com'),
            type: TRANSACTION_TYPES.DISPOSE,
            previous_status: ASSET_STATUS.REPAIR,
            new_status: ASSET_STATUS.RETIRED,
            notes: 'Laptop sudah tidak layak pakai, garansi habis, biaya perbaikan tinggi',
            transaction_date: new Date('2024-09-15')
        },

        // Missing report
        {
            asset_id: getAssetId('AST-2023-0017'),
            user_id: getUserId('ahmad.wijaya@company.com'),
            type: TRANSACTION_TYPES.REPORT_MISSING,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.MISSING,
            notes: 'Access point tidak ditemukan saat stock opname',
            transaction_date: new Date('2024-10-05')
        },

        // Checkin example (returned laptop)
        {
            asset_id: getAssetId('AST-2024-0001'),
            user_id: getUserId('staff@company.com'),
            type: TRANSACTION_TYPES.CHECKOUT,
            previous_status: ASSET_STATUS.AVAILABLE,
            new_status: ASSET_STATUS.ASSIGNED,
            notes: 'Dipinjamkan ke developer untuk project',
            transaction_date: new Date('2024-05-01')
        },
        {
            asset_id: getAssetId('AST-2024-0001'),
            user_id: getUserId('staff@company.com'),
            type: TRANSACTION_TYPES.CHECKIN,
            previous_status: ASSET_STATUS.ASSIGNED,
            new_status: ASSET_STATUS.AVAILABLE,
            notes: 'Dikembalikan setelah project selesai, kondisi baik',
            transaction_date: new Date('2024-08-01')
        }
    ];

    for (const txData of transactions) {
        if (!txData.asset_id || !txData.user_id) {
            console.log(`⏭️  Skipping transaction - missing asset or user reference`);
            continue;
        }

        try {
            const [transaction, created] = await Transaction.findOrCreate({
                where: {
                    asset_id: txData.asset_id,
                    type: txData.type,
                    transaction_date: txData.transaction_date
                },
                defaults: txData
            });

            if (created) {
                console.log(`✅ Transaction created: ${txData.type} for asset ${txData.asset_id}`);
            } else {
                console.log(`⏭️  Transaction exists: ${txData.type} for asset ${txData.asset_id}`);
            }
        } catch (error) {
            console.error(`❌ Error creating transaction:`, error.message);
        }
    }
};

// =====================
// RUN ALL SEEDERS
// =====================
const runDummyDataSeeders = async () => {
    try {
        console.log('\n🌱 Starting comprehensive dummy data seeding...\n');
        console.log('================================================\n');
        
        // Sync database first
        console.log('📊 Syncing database schema...');
        await syncDatabase({ alter: true });
        console.log('');

        // Run seeders in order
        console.log('👤 Seeding users...');
        const users = await seedUsers();
        console.log(`   Total: ${users.length} users\n`);

        console.log('📁 Seeding categories...');
        const categories = await seedCategories();
        console.log(`   Total: ${categories.length} categories\n`);

        console.log('📍 Seeding locations...');
        const locations = await seedLocations();
        console.log(`   Total: ${locations.length} locations\n`);

        console.log('💻 Seeding assets...');
        const assets = await seedAssets(categories, locations);
        console.log(`   Total: ${assets.length} assets\n`);

        console.log('📝 Seeding transactions...');
        await seedTransactions(assets, users, locations);
        console.log('');

        console.log('================================================');
        console.log('✅ Dummy data seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Categories: ${categories.length}`);
        console.log(`   - Locations: ${locations.length}`);
        console.log(`   - Assets: ${assets.length}`);
        console.log('   - Transactions: 13 records\n');
        console.log('🔐 Default credentials:');
        console.log('   Admin: admin@company.com / admin123');
        console.log('   Staff: staff@company.com / staff123');
        console.log('   Users: [name]@company.com / user123\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Run seeders
runDummyDataSeeders();
