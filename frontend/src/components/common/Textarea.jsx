/**
 * Textarea Component
 * Reusable textarea field
 */

import { forwardRef } from 'react';

const Textarea = forwardRef(({
    label,
    name,
    value,
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    readOnly = false,
    rows = 4,
    maxLength,
    showCount = false,
    className = '',
    textareaClassName = '',
    onChange,
    onBlur,
    ...props
}, ref) => {
    const baseTextareaStyles = `
        block w-full rounded-lg border transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        read-only:bg-gray-50
        px-4 py-2.5 text-sm resize-none
    `;

    const textareaStyles = `
        ${baseTextareaStyles}
        ${error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 hover:border-gray-400'
        }
        ${textareaClassName}
    `.trim().replace(/\s+/g, ' ');

    const currentLength = value?.length || 0;

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
            
            <textarea
                ref={ref}
                id={name}
                name={name}
                value={value}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                rows={rows}
                maxLength={maxLength}
                className={textareaStyles}
                onChange={onChange}
                onBlur={onBlur}
                {...props}
            />

            <div className="flex justify-between mt-1">
                <div>
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                    {helperText && !error && (
                        <p className="text-sm text-gray-500">{helperText}</p>
                    )}
                </div>
                
                {showCount && maxLength && (
                    <p className={`text-sm ${currentLength >= maxLength ? 'text-red-500' : 'text-gray-400'}`}>
                        {currentLength}/{maxLength}
                    </p>
                )}
            </div>
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
