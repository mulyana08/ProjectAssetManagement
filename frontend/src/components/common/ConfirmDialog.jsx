/**
 * ConfirmDialog Component
 * Reusable confirmation dialog/modal
 */

import Modal from './Modal';
import Button from './Button';
import { HiExclamation, HiInformationCircle, HiCheckCircle, HiTrash } from 'react-icons/hi';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    message,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'warning', // warning, danger, info, success
    isLoading = false,
}) => {
    const variants = {
        warning: {
            icon: HiExclamation,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            buttonVariant: 'warning',
        },
        danger: {
            icon: HiTrash,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonVariant: 'danger',
        },
        info: {
            icon: HiInformationCircle,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            buttonVariant: 'primary',
        },
        success: {
            icon: HiCheckCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            buttonVariant: 'success',
        },
    };

    const config = variants[variant];
    const Icon = config.icon;

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            showCloseButton={false}
        >
            <div className="text-center">
                {/* Icon */}
                <div className={`mx-auto w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {title}
                </h3>

                {/* Message */}
                {message && (
                    <p className="text-sm text-gray-500 mb-6">
                        {message}
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={config.buttonVariant}
                        onClick={handleConfirm}
                        loading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
