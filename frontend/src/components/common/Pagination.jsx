/**
 * Pagination Component
 * Reusable pagination dengan info dan navigation
 */

import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    showInfo = true,
    className = '',
}) => {
    // Calculate displayed range
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            if (currentPage > 3) {
                pages.push('...');
            }
            
            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (currentPage < totalPages - 2) {
                pages.push('...');
            }
            
            // Always show last page
            pages.push(totalPages);
        }
        
        return pages;
    };

    if (totalPages <= 1) {
        return showInfo ? (
            <div className={`text-sm text-gray-500 ${className}`}>
                Menampilkan {startItem}-{endItem} dari {totalItems} data
            </div>
        ) : null;
    }

    return (
        <div className={`flex items-center justify-between ${className}`}>
            {/* Info */}
            {showInfo && (
                <div className="text-sm text-gray-500">
                    Menampilkan <span className="font-medium">{startItem}</span>-
                    <span className="font-medium">{endItem}</span> dari{' '}
                    <span className="font-medium">{totalItems}</span> data
                </div>
            )}

            {/* Navigation */}
            <nav className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`
                        p-2 rounded-lg border transition-colors
                        ${currentPage === 1
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                    `}
                >
                    <HiChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-2 text-gray-500"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`
                                min-w-[40px] px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                                ${currentPage === page
                                    ? 'border-primary-600 bg-primary-600 text-white'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }
                            `}
                        >
                            {page}
                        </button>
                    )
                ))}

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`
                        p-2 rounded-lg border transition-colors
                        ${currentPage === totalPages
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                    `}
                >
                    <HiChevronRight className="w-5 h-5" />
                </button>
            </nav>
        </div>
    );
};

export default Pagination;
