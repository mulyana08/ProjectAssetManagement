/**
 * Select Component
 * Reusable select/dropdown field
 */

import { forwardRef } from 'react';
import { HiChevronDown } from 'react-icons/hi';

const Select = forwardRef(({
    label,
    name,
    value,
    options = [],
    placeholder = 'Pilih...',
    error,
    helperText,
    required = false,
    disabled = false,
    className = '',
    selectClassName = '',
    onChange,
    onBlur,
    ...props
}, ref) => {
    const baseSelectStyles = `
        block w-full rounded-lg border transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        appearance-none bg-white
        pl-4 pr-10 py-2.5 text-sm
    `;

    const selectStyles = `
        ${baseSelectStyles}
        ${error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 hover:border-gray-400'
        }
        ${selectClassName}
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
                <select
                    ref={ref}
                    id={name}
                    name={name}
                    value={value}
                    required={required}
                    disabled={disabled}
                    className={selectStyles}
                    onChange={onChange}
                    onBlur={onBlur}
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option 
                            key={option.value} 
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <HiChevronDown className="h-5 w-5 text-gray-400" />
                </div>
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

Select.displayName = 'Select';

export default Select;
