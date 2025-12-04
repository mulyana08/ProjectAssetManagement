/**
 * Database Seeder
 * Script untuk mengisi data awal ke database
 */

import argon2 from 'argon2';
import { User, Category, Location, syncDatabase } from '../models/index.js';
import { USER_ROLES } from '../utils/constants.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seed data admin user
 */
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
        }
    ];

    for (const userData of users) {
        const [user, created] = await User.findOrCreate({
            where: { email: userData.email },
            defaults: userData
        });
        
        if (created) {
            console.log(`✅ User created: ${userData.name} (${userData.email})`);
        } else {
            console.log(`⏭️  User already exists: ${userData.email}`);
        }
    }
};

/**
 * Seed data kategori aset
 */
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
        { name: 'Software', description: 'Lisensi software dan aplikasi' }
    ];

    for (const categoryData of categories) {
        const [category, created] = await Category.findOrCreate({
            where: { name: categoryData.name },
            defaults: categoryData
        });

        if (created) {
            console.log(`✅ Category created: ${categoryData.name}`);
        } else {
            console.log(`⏭️  Category already exists: ${categoryData.name}`);
        }
    }
};

/**
 * Seed data lokasi
 */
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
        { name: 'Branch Office B', building: 'Kantor Cabang B', floor: 'Lantai 1', description: 'Kantor cabang B' }
    ];

    for (const locationData of locations) {
        const [location, created] = await Location.findOrCreate({
            where: { name: locationData.name },
            defaults: locationData
        });

        if (created) {
            console.log(`✅ Location created: ${locationData.name}`);
        } else {
            console.log(`⏭️  Location already exists: ${locationData.name}`);
        }
    }
};

/**
 * Run all seeders
 */
const runSeeders = async () => {
    try {
        console.log('\n🌱 Starting database seeding...\n');
        
        // Sync database first (create tables if not exist)
        console.log('📊 Syncing database schema...');
        await syncDatabase({ alter: true });
        console.log('');

        // Run seeders
        console.log('👤 Seeding users...');
        await seedUsers();
        console.log('');

        console.log('📁 Seeding categories...');
        await seedCategories();
        console.log('');

        console.log('📍 Seeding locations...');
        await seedLocations();
        console.log('');

        console.log('✅ Database seeding completed successfully!\n');
        console.log('Default credentials:');
        console.log('  Admin: admin@company.com / admin123');
        console.log('  Staff: staff@company.com / staff123\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Run seeders
runSeeders();
