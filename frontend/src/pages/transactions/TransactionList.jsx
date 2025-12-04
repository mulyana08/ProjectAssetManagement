import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { 
    Button, 
    Table, 
    Pagination, 
    SearchBar, 
    Select,
    EmptyState,
    ExportConfirmModal,
    ExportResultModal
} from '../../components/common';
import { ContentLoading } from '../../components/common/Loading';
import { TransactionTypeBadge, TransactionStatusBadge } from '../../components/common/Badge';
import { transactionAPI } from '../../api';
import { formatDateTime } from '../../utils/formatters';
import { exportTransactionsToPDF, downloadFile, openInNewTab } from '../../utils/pdfExporter';
import toast from 'react-hot-toast';
import { 
    HiOutlinePlus, 
    HiOutlineEye, 
    HiOutlineFilter,
    HiOutlineX,
    HiOutlineDownload,
    HiOutlineClipboardList,
    HiOutlineArrowRight,
    HiOutlineArrowLeft
} from 'react-icons/hi';

const TransactionList = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    // Export modal states
    const [showExportModal, setShowExportModal] = useState(false);
    const [showExportResult, setShowExportResult] = useState(false);
    const [exportResult, setExportResult] = useState({ filename: '', url: '', blob: null });

    // Filter State
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || '',
        status: searchParams.get('status') || '',
        asset_id: searchParams.get('asset_id') || ''
    });

    const typeOptions = [
        { value: '', label: 'Semua Tipe' },
        { value: 'Checkout', label: 'Checkout' },
        { value: 'Checkin', label: 'Checkin' },
        { value: 'Repair', label: 'Perbaikan' },
        { value: 'Dispose', label: 'Penghapusan' },
        { value: 'Relocate', label: 'Pemindahan' }
    ];

    const statusOptions = [
        { value: '', label: 'Semua Status' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Completed', label: 'Selesai' },
        { value: 'Cancelled', label: 'Dibatalkan' }
    ];

    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoading(true);
            
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([, v]) => v !== '')
                )
            };

            const response = await transactionAPI.getAll(params);
            
            if (response.success) {
                setTransactions(response.data);
                if (response.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.meta.total_records || 0,
                        totalPages: response.meta.total_pages || 1
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Gagal memuat data transaksi');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Update URL params when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            type: '',
            status: '',
            asset_id: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    // Handle export - buka modal pilihan
    const handleExportClick = () => {
        setShowExportModal(true);
    };

    // Handle export berdasarkan format
    const handleExport = async (format) => {
        try {
            setIsExporting(true);
            setShowExportModal(false);

            if (format === 'pdf') {
                // Fetch all data for export (tanpa pagination)
                const response = await transactionAPI.getAll({ 
                    ...filters, 
                    limit: 1000 // Get all data
                });
                
                // Response structure: { success, message, data: [] }
                const allTransactions = response?.data || [];
                
                console.log('Transactions for PDF:', allTransactions);
                
                if (!allTransactions || allTransactions.length === 0) {
                    toast.error('Tidak ada data untuk diexport');
                    return;
                }

                // Generate PDF
                const result = await exportTransactionsToPDF(allTransactions, {
                    title: 'Laporan Transaksi Aset IT',
                    subtitle: hasActiveFilters ? 'Data Terfilter' : 'Semua Data'
                });

                setExportResult(result);
                setShowExportResult(true);
                toast.success('PDF berhasil dibuat!');
            } else {
                // Export CSV (existing functionality)
                await transactionAPI.exportCSV(filters);
                toast.success('CSV berhasil diexport');
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Gagal mengexport data: ' + (error.message || 'Unknown error'));
        } finally {
            setIsExporting(false);
        }
    };

    // Handle download file
    const handleDownload = () => {
        if (exportResult.blob && exportResult.filename) {
            downloadFile(exportResult.blob, exportResult.filename);
        }
        setShowExportResult(false);
    };

    // Handle buka file
    const handleOpenFile = () => {
        if (exportResult.url) {
            openInNewTab(exportResult.url);
        }
    };

    // Table columns
    const columns = [
        {
            key: 'transaction_date',
            label: 'Tanggal',
            render: (value) => formatDateTime(value)
        },
        {
            key: 'asset',
            label: 'Aset',
            render: (value) => (
                <div>
                    <p className="font-medium text-gray-900">{value?.name || '-'}</p>
                    <p className="text-sm text-gray-500">{value?.asset_code}</p>
                </div>
            )
        },
        {
            key: 'type',
            label: 'Tipe',
            render: (value) => <TransactionTypeBadge type={value} />
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => <TransactionStatusBadge status={value} />
        },
        {
            key: 'user',
            label: 'Dilakukan Oleh',
            render: (value) => value?.name || '-'
        },
        {
            key: 'assigned_to',
            label: 'Ditugaskan Ke',
            render: (value) => value?.name || '-'
        },
        {
            key: 'notes',
            label: 'Catatan',
            render: (value) => (
                <span className="text-gray-600 truncate max-w-xs block">
                    {value || '-'}
                </span>
            )
        }
    ];

    const actions = [
        {
            icon: HiOutlineEye,
            label: 'Detail',
            onClick: () => {/* Navigate to detail - TODO */}
        }
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
                        <p className="text-gray-600">
                            Riwayat transaksi aset IT
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleExportClick}
                            disabled={isExporting}
                        >
                            <HiOutlineDownload className="w-5 h-5" />
                            {isExporting ? 'Mengexport...' : 'Export'}
                        </Button>
                        <div className="flex gap-2">
                            <Link to="/transactions/checkout">
                                <Button>
                                    <HiOutlineArrowRight className="w-5 h-5" />
                                    Checkout
                                </Button>
                            </Link>
                            <Link to="/transactions/checkin">
                                <Button variant="secondary">
                                    <HiOutlineArrowLeft className="w-5 h-5" />
                                    Checkin
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <SearchBar
                                value={filters.search}
                                onChange={handleSearch}
                                placeholder="Cari nama atau kode aset..."
                            />
                        </div>
                        <Button
                            variant={showFilters ? 'primary' : 'secondary'}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <HiOutlineFilter className="w-5 h-5" />
                            Filter
                            {hasActiveFilters && (
                                <span className="ml-1 bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded text-xs">
                                    Aktif
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Select
                                    label="Tipe Transaksi"
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    options={typeOptions}
                                />
                                <Select
                                    label="Status"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    options={statusOptions}
                                />
                            </div>
                            {hasActiveFilters && (
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        <HiOutlineX className="w-4 h-4" />
                                        Reset Filter
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                {isLoading ? (
                    <ContentLoading message="Memuat data transaksi..." />
                ) : transactions.length === 0 ? (
                    <EmptyState
                        icon={HiOutlineClipboardList}
                        title={hasActiveFilters ? 'Tidak ada transaksi ditemukan' : 'Belum ada transaksi'}
                        description={
                            hasActiveFilters 
                                ? 'Coba ubah filter atau kata kunci pencarian'
                                : 'Transaksi akan muncul di sini setelah Anda melakukan checkout atau checkin'
                        }
                        action={
                            !hasActiveFilters && (
                                <Link to="/transactions/checkout">
                                    <Button>
                                        <HiOutlinePlus className="w-5 h-5" />
                                        Buat Transaksi
                                    </Button>
                                </Link>
                            )
                        }
                    />
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={transactions}
                            actions={actions}
                        />
                        
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>

            {/* Export Modals */}
            <ExportConfirmModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={handleExport}
                title="Export Transaksi"
                description="Pilih format export untuk data transaksi"
                isLoading={isExporting}
            />

            <ExportResultModal
                isOpen={showExportResult}
                onClose={() => setShowExportResult(false)}
                filename={exportResult.filename}
                fileUrl={exportResult.url}
                onDownload={handleDownload}
                onOpen={handleOpenFile}
            />
        </MainLayout>
    );
};

export default TransactionList;
