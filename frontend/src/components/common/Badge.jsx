/**
 * Badge Component
 * Reusable badge/tag untuk status dan label
 */

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    rounded = 'full',
    dot = false,
    className = '',
}) => {
    // Variant styles
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-gray-100 text-gray-600',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        purple: 'bg-purple-100 text-purple-800',
        // Solid variants
        'solid-primary': 'bg-primary-600 text-white',
        'solid-success': 'bg-green-600 text-white',
        'solid-danger': 'bg-red-600 text-white',
        'solid-warning': 'bg-yellow-500 text-white',
        'solid-info': 'bg-blue-600 text-white',
    };

    // Size styles
    const sizes = {
        xs: 'px-1.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1 text-base',
    };

    // Rounded styles
    const roundedStyles = {
        none: 'rounded-none',
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    // Dot colors
    const dotColors = {
        default: 'bg-gray-500',
        primary: 'bg-primary-500',
        secondary: 'bg-gray-400',
        success: 'bg-green-500',
        danger: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
        purple: 'bg-purple-500',
    };

    const classes = `
        inline-flex items-center font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${roundedStyles[rounded]}
        ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
        <span className={classes}>
            {dot && (
                <span 
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant] || dotColors.default}`} 
                />
            )}
            {children}
        </span>
    );
};

// Preset badges untuk Asset Status
export const AssetStatusBadge = ({ status }) => {
    const statusConfig = {
        Available: { variant: 'success', label: 'Tersedia' },
        'In Use': { variant: 'info', label: 'Digunakan' },
        'Under Repair': { variant: 'warning', label: 'Perbaikan' },
        Disposed: { variant: 'danger', label: 'Dihapuskan' },
    };

    const config = statusConfig[status] || { variant: 'default', label: status };

    return (
        <Badge variant={config.variant} dot>
            {config.label}
        </Badge>
    );
};

// Preset badges untuk Transaction Type
export const TransactionTypeBadge = ({ type }) => {
    const typeConfig = {
        Register: { variant: 'primary', label: 'Registrasi' },
        Checkout: { variant: 'info', label: 'Checkout' },
        Checkin: { variant: 'success', label: 'Checkin' },
        Repair: { variant: 'warning', label: 'Perbaikan' },
        Dispose: { variant: 'danger', label: 'Dispose' },
        Relocate: { variant: 'purple', label: 'Pindah' },
    };

    const config = typeConfig[type] || { variant: 'default', label: type };

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
};

// Preset badges untuk User Role
export const UserRoleBadge = ({ role }) => {
    const roleConfig = {
        Admin: { variant: 'solid-primary', label: 'Admin' },
        Staff: { variant: 'secondary', label: 'Staff' },
    };

    const config = roleConfig[role] || { variant: 'default', label: role };

    return (
        <Badge variant={config.variant} size="sm">
            {config.label}
        </Badge>
    );
};

// Preset badges untuk Asset Condition
export const ConditionBadge = ({ condition }) => {
    const conditionConfig = {
        Excellent: { variant: 'success', label: 'Sangat Baik' },
        Good: { variant: 'info', label: 'Baik' },
        Fair: { variant: 'warning', label: 'Cukup' },
        Poor: { variant: 'danger', label: 'Buruk' },
    };

    const config = conditionConfig[condition] || { variant: 'default', label: condition || '-' };

    return (
        <Badge variant={config.variant} size="sm">
            {config.label}
        </Badge>
    );
};

// Preset badges untuk Transaction Status
export const TransactionStatusBadge = ({ status }) => {
    const statusConfig = {
        pending: { variant: 'warning', label: 'Pending' },
        completed: { variant: 'success', label: 'Selesai' },
        cancelled: { variant: 'danger', label: 'Dibatalkan' },
    };

    const config = statusConfig[status] || { variant: 'default', label: status || '-' };

    return (
        <Badge variant={config.variant} dot>
            {config.label}
        </Badge>
    );
};

export { Badge };
export default Badge;
