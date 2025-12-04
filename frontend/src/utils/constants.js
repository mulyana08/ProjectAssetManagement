/**
 * Application constants
 */

// Asset Status
export const ASSET_STATUS = {
    AVAILABLE: 'available',
    ASSIGNED: 'assigned',
    REPAIR: 'repair',
    RETIRED: 'retired',
    MISSING: 'missing'
};

// Asset Status Labels & Colors
export const ASSET_STATUS_CONFIG = {
    available: {
        label: 'Available',
        color: 'success',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
    },
    assigned: {
        label: 'Assigned',
        color: 'info',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
    },
    repair: {
        label: 'In Repair',
        color: 'warning',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800'
    },
    retired: {
        label: 'Retired',
        color: 'danger',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
    },
    missing: {
        label: 'Missing',
        color: 'neutral',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
    }
};

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    EMPLOYEE: 'employee'
};

// Condition Status
export const CONDITION_STATUS = {
    NEW: 'new',
    GOOD: 'good',
    FAIR: 'fair',
    DAMAGED: 'damaged',
    LOST: 'lost'
};

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LIMIT_OPTIONS: [10, 25, 50, 100]
};

// Navigation menu items
export const MENU_ITEMS = [
    {
        name: 'Dashboard',
        path: '/',
        icon: 'HiOutlineHome',
        roles: ['admin', 'staff']
    },
    {
        name: 'Assets',
        path: '/assets',
        icon: 'HiOutlineDesktopComputer',
        roles: ['admin', 'staff']
    },
    {
        name: 'Transactions',
        path: '/transactions',
        icon: 'HiOutlineSwitchHorizontal',
        roles: ['admin', 'staff']
    },
    {
        name: 'Categories',
        path: '/master/categories',
        icon: 'HiOutlineTag',
        roles: ['admin']
    },
    {
        name: 'Locations',
        path: '/master/locations',
        icon: 'HiOutlineLocationMarker',
        roles: ['admin']
    },
    {
        name: 'Users',
        path: '/master/users',
        icon: 'HiOutlineUsers',
        roles: ['admin']
    }
];
