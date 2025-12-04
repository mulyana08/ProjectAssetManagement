/**
 * SearchBar Component
 * Reusable search input dengan debounce
 */

import { useState, useEffect } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';

const SearchBar = ({
    value = '',
    placeholder = 'Cari...',
    onSearch,
    debounceMs = 300,
    className = '',
}) => {
    const [inputValue, setInputValue] = useState(value);

    // Sync with external value
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch && inputValue !== value) {
                onSearch(inputValue);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [inputValue, debounceMs, onSearch, value]);

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleClear = () => {
        setInputValue('');
        if (onSearch) {
            onSearch('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (onSearch) {
                onSearch(inputValue);
            }
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
            </div>

            {/* Input */}
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="
                    block w-full pl-10 pr-10 py-2.5 
                    border border-gray-300 rounded-lg
                    text-sm text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    transition-colors duration-200
                "
            />

            {/* Clear Button */}
            {inputValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <HiX className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
