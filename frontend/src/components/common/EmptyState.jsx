/**
 * EmptyState Component
 * Reusable empty state display
 */

import { HiOutlineInbox, HiOutlineDocumentAdd, HiOutlineSearch } from 'react-icons/hi';
import Button from './Button';

const EmptyState = ({
    icon: CustomIcon,
    title = 'Tidak ada data',
    description,
    actionLabel,
    onAction,
    variant = 'default', // default, search, create
    className = '',
}) => {
    const variants = {
        default: {
            icon: HiOutlineInbox,
            defaultTitle: 'Tidak ada data',
            defaultDescription: 'Belum ada data yang tersedia.',
        },
        search: {
            icon: HiOutlineSearch,
            defaultTitle: 'Tidak ditemukan',
            defaultDescription: 'Tidak ada hasil yang cocok dengan pencarian Anda.',
        },
        create: {
            icon: HiOutlineDocumentAdd,
            defaultTitle: 'Belum ada data',
            defaultDescription: 'Mulai dengan menambahkan data baru.',
        },
    };

    const config = variants[variant];
    const Icon = CustomIcon || config.icon;
    const displayTitle = title || config.defaultTitle;
    const displayDescription = description || config.defaultDescription;

    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-medium text-gray-900 mb-1">
                {displayTitle}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
                {displayDescription}
            </p>

            {/* Action Button */}
            {actionLabel && onAction && (
                <Button onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
