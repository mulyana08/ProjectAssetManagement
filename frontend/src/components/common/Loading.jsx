/**
 * Loading Components
 * Berbagai loading indicators
 */

// Spinner Loading
export const Spinner = ({
    size = 'md',
    color = 'primary',
    className = '',
}) => {
    const sizes = {
        xs: 'w-4 h-4',
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const colors = {
        primary: 'text-primary-600',
        white: 'text-white',
        gray: 'text-gray-400',
    };

    return (
        <svg
            className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
};

// Full Page Loading
export const PageLoading = ({
    message = 'Memuat...',
}) => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
            <div className="text-center">
                <Spinner size="xl" />
                <p className="mt-4 text-gray-600 font-medium">{message}</p>
            </div>
        </div>
    );
};

// Content Loading
export const ContentLoading = ({
    message = 'Memuat data...',
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
            <Spinner size="lg" />
            <p className="mt-4 text-gray-500">{message}</p>
        </div>
    );
};

// Skeleton Loading
export const Skeleton = ({
    width,
    height = '1rem',
    rounded = 'md',
    className = '',
}) => {
    const roundedStyles = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
    };

    return (
        <div
            className={`bg-gray-200 animate-pulse ${roundedStyles[rounded]} ${className}`}
            style={{
                width: width || '100%',
                height,
            }}
        />
    );
};

// Table Skeleton
export const TableSkeleton = ({
    rows = 5,
    columns = 4,
}) => {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-t-lg">
                {[...Array(columns)].map((_, i) => (
                    <Skeleton key={i} height="1rem" />
                ))}
            </div>
            
            {/* Rows */}
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-gray-100">
                    {[...Array(columns)].map((_, j) => (
                        <Skeleton key={j} height="1rem" />
                    ))}
                </div>
            ))}
        </div>
    );
};

// Card Skeleton
export const CardSkeleton = ({
    hasImage = false,
    lines = 3,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            {hasImage && (
                <Skeleton height="8rem" rounded="lg" />
            )}
            <div className="space-y-2">
                <Skeleton height="1.25rem" width="60%" />
                {[...Array(lines)].map((_, i) => (
                    <Skeleton key={i} height="1rem" />
                ))}
            </div>
        </div>
    );
};

// Default export as Spinner
const Loading = Spinner;
export default Loading;
