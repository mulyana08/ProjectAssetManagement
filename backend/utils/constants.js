/**
 * Constants - Nilai konstanta yang digunakan di seluruh aplikasi
 */

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    EMPLOYEE: 'employee'
};

// Asset Status
export const ASSET_STATUS = {
    AVAILABLE: 'available',
    ASSIGNED: 'assigned',
    REPAIR: 'repair',
    RETIRED: 'retired',
    MISSING: 'missing'
};

// Transaction Action Types
export const TRANSACTION_TYPES = {
    CHECKOUT: 'checkout',
    CHECKIN: 'checkin',
    REPAIR_START: 'repair_start',
    REPAIR_COMPLETE: 'repair_complete',
    DISPOSE: 'dispose',
    REPORT_MISSING: 'report_missing',
    FOUND: 'found'
};

// Condition Status
export const CONDITION_STATUS = {
    NEW: 'new',
    GOOD: 'good',
    FAIR: 'fair',
    DAMAGED: 'damaged',
    LOST: 'lost'
};

// State Machine - Valid Transitions
export const VALID_TRANSITIONS = {
    [ASSET_STATUS.AVAILABLE]: [
        TRANSACTION_TYPES.CHECKOUT,      // -> assigned
        TRANSACTION_TYPES.REPAIR_START,  // -> repair
        TRANSACTION_TYPES.DISPOSE        // -> retired
    ],
    [ASSET_STATUS.ASSIGNED]: [
        TRANSACTION_TYPES.CHECKIN,       // -> available or repair
        TRANSACTION_TYPES.REPORT_MISSING // -> missing
    ],
    [ASSET_STATUS.REPAIR]: [
        TRANSACTION_TYPES.REPAIR_COMPLETE, // -> available
        TRANSACTION_TYPES.DISPOSE          // -> retired (BER)
    ],
    [ASSET_STATUS.MISSING]: [
        TRANSACTION_TYPES.FOUND,  // -> available
        TRANSACTION_TYPES.DISPOSE // -> retired (write-off)
    ],
    [ASSET_STATUS.RETIRED]: [] // Terminal state - no transitions allowed
};

// Pagination Defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};
