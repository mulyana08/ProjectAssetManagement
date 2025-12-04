/**
 * Button Component
 * Reusable button dengan berbagai variant dan size
 */

import { forwardRef } from 'react';

const Button = forwardRef(({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    onClick,
    ...props
}, ref) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Variant styles
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        'outline-danger': 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        link: 'text-primary-600 hover:underline focus:ring-primary-500 p-0',
    };

    // Size styles
    const sizes = {
        xs: 'px-2.5 py-1.5 text-xs',
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3 text-base',
        xl: 'px-6 py-3.5 text-lg',
    };

    // Icon sizes
    const iconSizes = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
        xl: 'w-6 h-6',
    };

    const classes = `
        ${baseStyles}
        ${variants[variant]}
        ${variant !== 'link' ? sizes[size] : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
    `.trim().replace(/\s+/g, ' ');

    const iconClass = `${iconSizes[size]} ${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}`;

    return (
        <button
            ref={ref}
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <>
                    <svg
                        className={`animate-spin ${iconClass}`}
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
                    {children && <span>Loading...</span>}
                </>
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon className={iconClass} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon className={iconClass} />}
                </>
            )}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
