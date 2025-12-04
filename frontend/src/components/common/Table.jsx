/**
 * Table Component
 * Reusable table dengan sorting dan actions
 */

import { HiChevronUp, HiChevronDown, HiSelector } from 'react-icons/hi';

const Table = ({
    columns,
    data,
    actions = [],
    sortBy,
    sortOrder,
    onSort,
    isLoading = false,
    emptyMessage = 'Tidak ada data',
    className = '',
}) => {
    const handleSort = (column) => {
        if (!column.sortable || !onSort) return;

        const newOrder = sortBy === column.key && sortOrder === 'ASC' ? 'DESC' : 'ASC';
        onSort(column.key, newOrder);
    };

    const renderSortIcon = (column) => {
        if (!column.sortable) return null;

        if (sortBy === column.key) {
            return sortOrder === 'ASC' ? (
                <HiChevronUp className="w-4 h-4" />
            ) : (
                <HiChevronDown className="w-4 h-4" />
            );
        }
        return <HiSelector className="w-4 h-4 text-gray-400" />;
    };

    // Determine if we need an actions column
    const hasActions = actions && actions.length > 0;
    const allColumns = hasActions
        ? [...columns, { key: '_actions', header: 'Aksi', width: '120px' }]
        : columns;

    return (
        <div className={`overflow-x-auto bg-white rounded-xl border border-gray-200 ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                {/* Table Head */}
                <thead className="bg-gray-50">
                    <tr>
                        {allColumns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={`
                                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
                                    ${column.className || ''}
                                `}
                                style={{ width: column.width }}
                                onClick={() => column.key !== '_actions' && handleSort(column)}
                            >
                                <div className="flex items-center gap-1">
                                    {column.header || column.label}
                                    {renderSortIcon(column)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                        // Loading skeleton
                        [...Array(5)].map((_, i) => (
                            <tr key={i}>
                                {allColumns.map((column) => (
                                    <td key={column.key} className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : data.length === 0 ? (
                        // Empty state
                        <tr>
                            <td
                                colSpan={allColumns.length}
                                className="px-6 py-12 text-center text-gray-500"
                            >
                                <div className="flex flex-col items-center">
                                    <svg
                                        className="w-12 h-12 text-gray-400 mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                        />
                                    </svg>
                                    <p>{emptyMessage}</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        // Data rows
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`px-6 py-4 whitespace-nowrap text-sm ${column.cellClassName || ''}`}
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row, rowIndex)
                                            : row[column.key]
                                        }
                                    </td>
                                ))}
                                {hasActions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            {actions.map((action, actionIndex) => {
                                                const Icon = action.icon;
                                                return (
                                                    <button
                                                        key={actionIndex}
                                                        onClick={() => action.onClick(row)}
                                                        className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${action.className || 'text-gray-600 hover:text-gray-800'}`}
                                                        title={action.label}
                                                    >
                                                        {Icon && <Icon className="w-4 h-4" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
