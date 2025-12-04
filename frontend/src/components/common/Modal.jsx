/**
 * Modal Component
 * Reusable modal dialog
 */

import { Fragment, useEffect } from 'react';
import { HiX } from 'react-icons/hi';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    footer,
    className = '',
}) => {
    // Size variants
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Fragment>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    {/* Modal Content */}
                    <div
                        className={`
                            relative w-full ${sizes[size]} 
                            bg-white rounded-xl shadow-xl 
                            transform transition-all duration-300
                            ${className}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                {title && (
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {title}
                                    </h3>
                                )}
                                {showCloseButton && (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <HiX className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        <div className="px-6 py-4">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Modal;
