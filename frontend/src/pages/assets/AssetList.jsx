import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { 
    Button, 
    Table, 
    Pagination, 
    SearchBar, 
    ConfirmDialog,
    EmptyState,
    Select
} from '../../components/common';
import { ContentLoading } from '../../components/common/Loading';
import { AssetStatusBadge, ConditionBadge } from '../../components/common/Badge';
import { assetAPI, categoryAPI, locationAPI } from '../../api';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { 
    HiOutlinePlus, 
    HiOutlineEye, 
    HiOutlinePencil, 
    HiOutlineTrash,
    HiOutlineFilter,
    HiOutlineX,
    HiOutlineDownload,
    HiOutlineDesktopComputer
} from 'react-icons/hi';

const AssetList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [assets, setAssets] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ open: false, asset: null });
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter State
    const [showFilters, setShowFilters] = useState(false);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category_id: searchParams.get('category_id') || '',
        location_id: searchParams.get('location_id') || '',
        status: searchParams.get('status') || '',
        condition: searchParams.get('condition') || ''
    });

    const statusOptions = [
        { value: '', label: 'Semua Status' },
        { value: 'Available', label: 'Tersedia' },
        { value: 'In Use', label: 'Digunakan' },
        { value: 'Under Repair', label: 'Dalam Perbaikan' },
        { value: 'Disposed', label: 'Dihapuskan' }
    ];

    const conditionOptions = [
        { value: '', label: 'Semua Kondisi' },
        { value: 'Excellent', label: 'Excellent' },
        { value: 'Good', label: 'Good' },
        { value: 'Fair', label: 'Fair' },
        { value: 'Poor', label: 'Poor' }
    ];

    // Fetch categories and locations for filters
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [catRes, locRes] = await Promise.all([
                    categoryAPI.getAllWithoutPagination(),
                    locationAPI.getAllWithoutPagination()
                ]);
                
                if (catRes.success) {
                    setCategories([
                        { value: '', label: 'Semua Kategori' },
                        ...catRes.data.map(c => ({ value: c.id.toString(), label: c.name }))
                    ]);
                }
                
                if (locRes.success) {
                    setLocations([
                        { value: '', label: 'Semua Lokasi' },
                        ...locRes.data.map(l => ({ value: l.id.toString(), label: `${l.name} - ${l.building}` }))
                    ]);
                }
            } catch (error) {
                console.error('Error fetching filter data:', error);
            }
        };
        fetchFilterData();
    }, []);

    // Fetch assets
    const fetchAssets = useCallback(async () => {
        try {
            setIsLoading(true);
            
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([, v]) => v !== '')
                )
            };

            const response = await assetAPI.getAll(params);
            
            if (response.success) {
                setAssets(response.data);
                if (response.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.meta.total_records || 0,
                        totalPages: response.meta.total_pages || 1
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
            toast.error('Gagal memuat data aset');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

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
            category_id: '',
            location_id: '',
            status: '',
            condition: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleDelete = async () => {
        if (!deleteModal.asset) return;
        
        setIsDeleting(true);
        try {
            const response = await assetAPI.delete(deleteModal.asset.id);
            if (response.success) {
                toast.success('Aset berhasil dihapus');
                setDeleteModal({ open: false, asset: null });
                fetchAssets();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus aset');
        } finally {
            setIsDeleting(false);
        }
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    // Table columns
    const columns = [
        {
            key: 'asset_code',
            label: 'Kode Aset',
            render: (value, row) => (
                <div>
                    <p className="font-medium text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{row.name}</p>
                </div>
            )
        },
        {
            key: 'category',
            label: 'Kategori',
            render: (value) => value?.name || '-'
        },
        {
            key: 'location',
            label: 'Lokasi',
            render: (value) => value ? `${value.name} (${value.building})` : '-'
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => <AssetStatusBadge status={value} />
        },
        {
            key: 'condition',
            label: 'Kondisi',
            render: (value) => <ConditionBadge condition={value} />
        },
        {
            key: 'purchase_price',
            label: 'Harga',
            render: (value) => formatCurrency(value)
        },
        {
            key: 'purchase_date',
            label: 'Tgl Beli',
            render: (value) => formatDateShort(value)
        }
    ];

    const actions = [
        {
            icon: HiOutlineEye,
            label: 'Detail',
            onClick: (row) => navigate(`/assets/${row.id}`)
        },
        {
            icon: HiOutlinePencil,
            label: 'Edit',
            onClick: (row) => navigate(`/assets/${row.id}/edit`)
        },
        {
            icon: HiOutlineTrash,
            label: 'Hapus',
            onClick: (row) => setDeleteModal({ open: true, asset: row }),
            className: 'text-red-600 hover:text-red-700'
        }
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daftar Aset</h1>
                        <p className="text-gray-600">
                            Kelola semua aset IT organisasi
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => {/* Export functionality */}}
                        >
                            <HiOutlineDownload className="w-5 h-5" />
                            Export
                        </Button>
                        <Link to="/assets/add">
                            <Button>
                                <HiOutlinePlus className="w-5 h-5" />
                                Tambah Aset
                            </Button>
                        </Link>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Select
                                    label="Kategori"
                                    value={filters.category_id}
                                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                    options={categories}
                                />
                                <Select
                                    label="Lokasi"
                                    value={filters.location_id}
                                    onChange={(e) => handleFilterChange('location_id', e.target.value)}
                                    options={locations}
                                />
                                <Select
                                    label="Status"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    options={statusOptions}
                                />
                                <Select
                                    label="Kondisi"
                                    value={filters.condition}
                                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                                    options={conditionOptions}
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
                    <ContentLoading message="Memuat data aset..." />
                ) : assets.length === 0 ? (
                    <EmptyState
                        icon={HiOutlineDesktopComputer}
                        title={hasActiveFilters ? 'Tidak ada aset ditemukan' : 'Belum ada aset'}
                        description={
                            hasActiveFilters 
                                ? 'Coba ubah filter atau kata kunci pencarian'
                                : 'Mulai dengan menambahkan aset pertama Anda'
                        }
                        action={
                            !hasActiveFilters && (
                                <Link to="/assets/add">
                                    <Button>
                                        <HiOutlinePlus className="w-5 h-5" />
                                        Tambah Aset
                                    </Button>
                                </Link>
                            )
                        }
                    />
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={assets}
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

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, asset: null })}
                onConfirm={handleDelete}
                title="Hapus Aset"
                message={
                    <>
                        Apakah Anda yakin ingin menghapus aset{' '}
                        <strong>{deleteModal.asset?.name}</strong> ({deleteModal.asset?.asset_code})?
                        Tindakan ini tidak dapat dibatalkan.
                    </>
                }
                confirmText="Hapus"
                variant="danger"
                isLoading={isDeleting}
            />
        </MainLayout>
    );
};

export default AssetList;
