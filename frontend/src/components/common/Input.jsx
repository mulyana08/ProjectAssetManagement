/**
 * Input Component
 * Reusable input field dengan label dan error handling
 */

import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    type = 'text',
    name,
    value,
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    readOnly = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    inputClassName = '',
    onChange,
    onBlur,
    ...props
}, ref) => {
    const hasIcon = !!Icon;
    
    const baseInputStyles = `
        block w-full rounded-lg border transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        read-only:bg-gray-50
    `;

    const inputPadding = hasIcon
        ? iconPosition === 'left'
            ? 'pl-10 pr-4'
            : 'pl-4 pr-10'
        : 'px-4';

    const inputStyles = `
        ${baseInputStyles}
        ${inputPadding}
        py-2.5 text-sm
        ${error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 hover:border-gray-400'
        }
        ${inputClassName}
    `.trim().replace(/\s+/g, ' ');

    return (
        <div className={`${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative">
                {Icon && iconPosition === 'left' && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}

                <input
                    ref={ref}
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    readOnly={readOnly}
                    className={inputStyles}
                    onChange={onChange}
                    onBlur={onBlur}
                    {...props}
                />

                {Icon && iconPosition === 'right' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
