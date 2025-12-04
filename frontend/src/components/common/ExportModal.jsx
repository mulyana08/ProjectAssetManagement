/**
 * Export Modal Component
 * Modal untuk pilihan export dan preview hasil
 */

import { useState } from 'react';
import { Modal, Button } from './index';
import { HiOutlineDownload, HiOutlineExternalLink, HiOutlineDocumentText, HiOutlineX } from 'react-icons/hi';

/**
 * Modal untuk konfirmasi export
 */
export const ExportConfirmModal = ({ 
    isOpen, 
    onClose, 
    onExport, 
    title = 'Export Data',
    description = 'Pilih format export yang diinginkan',
    isLoading = false 
}) => {
    const [format, setFormat] = useState('pdf');

    const handleExport = () => {
        onExport(format);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <p className="text-gray-600">{description}</p>
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Format Export
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="format"
                                value="pdf"
                                checked={format === 'pdf'}
                                onChange={(e) => setFormat(e.target.value)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">PDF</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="format"
                                value="csv"
                                checked={format === 'csv'}
                                onChange={(e) => setFormat(e.target.value)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">CSV</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button onClick={handleExport} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Mengexport...
                            </>
                        ) : (
                            <>
                                <HiOutlineDownload className="w-4 h-4 mr-2" />
                                Export
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

/**
 * Modal untuk hasil export (dengan opsi buka/download)
 */
export const ExportResultModal = ({ 
    isOpen, 
    onClose, 
    filename,
    onDownload,
    onOpen
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export Berhasil">
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0">
                        <HiOutlineDocumentText className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-900">
                            File berhasil di-export!
                        </p>
                        <p className="text-sm text-green-700 truncate">
                            {filename}
                        </p>
                    </div>
                </div>

                <p className="text-sm text-gray-600">
                    Pilih aksi yang ingin dilakukan:
                </p>

                <div className="flex flex-col gap-2">
                    <Button 
                        onClick={onOpen} 
                        className="w-full justify-center"
                    >
                        <HiOutlineExternalLink className="w-5 h-5 mr-2" />
                        Buka File
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={onDownload}
                        className="w-full justify-center"
                    >
                        <HiOutlineDownload className="w-5 h-5 mr-2" />
                        Download
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="w-full justify-center"
                    >
                        <HiOutlineX className="w-5 h-5 mr-2" />
                        Tutup
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default { ExportConfirmModal, ExportResultModal };
