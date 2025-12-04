import { useState, useEffect, useCallback } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { 
    Button, 
    Table, 
    Pagination, 
    SearchBar, 
    Modal,
    Input,
    Textarea,
    ConfirmDialog,
    EmptyState
} from '../../components/common';
import { ContentLoading } from '../../components/common/Loading';
import { locationAPI } from '../../api';
import toast from 'react-hot-toast';
import { 
    HiOutlinePlus, 
    HiOutlinePencil, 
    HiOutlineTrash,
    HiOutlineLocationMarker
} from 'react-icons/hi';

const LocationList = () => {
    // State
    const [locations, setLocations] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [formModal, setFormModal] = useState({ open: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, location: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        building: '',
        floor: '',
        room_number: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    // Fetch locations
    const fetchLocations = useCallback(async () => {
        try {
            setIsLoading(true);
            
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search
            };

            const response = await locationAPI.getAll(params);
            
            if (response.success) {
                setLocations(response.data);
                if (response.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.meta.total_records || 0,
                        totalPages: response.meta.total_pages || 1
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            toast.error('Gagal memuat data lokasi');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, search]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const handleSearch = (value) => {
        setSearch(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Form handlers
    const openAddModal = () => {
        setFormData({ name: '', building: '', floor: '', room_number: '', description: '' });
        setErrors({});
        setFormModal({ open: true, data: null });
    };

    const openEditModal = (location) => {
        setFormData({
            name: location.name || '',
            building: location.building || '',
            floor: location.floor || '',
            room_number: location.room_number || '',
            description: location.description || ''
        });
        setErrors({});
        setFormModal({ open: true, data: location });
    };

    const closeFormModal = () => {
        setFormModal({ open: false, data: null });
        setFormData({ name: '', building: '', floor: '', room_number: '', description: '' });
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Nama lokasi wajib diisi';
        }
        if (!formData.building.trim()) {
            newErrors.building = 'Nama gedung wajib diisi';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        setIsSubmitting(true);

        try {
            let response;
            if (formModal.data) {
                response = await locationAPI.update(formModal.data.id, formData);
            } else {
                response = await locationAPI.create(formData);
            }

            if (response.success) {
                toast.success(formModal.data ? 'Lokasi berhasil diperbarui' : 'Lokasi berhasil ditambahkan');
                closeFormModal();
                fetchLocations();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.location) return;

        setIsDeleting(true);

        try {
            const response = await locationAPI.delete(deleteModal.location.id);
            if (response.success) {
                toast.success('Lokasi berhasil dihapus');
                setDeleteModal({ open: false, location: null });
                fetchLocations();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus lokasi');
        } finally {
            setIsDeleting(false);
        }
    };

    // Table columns
    const columns = [
        {
            key: 'name',
            label: 'Nama Lokasi'
        },
        {
            key: 'building',
            label: 'Gedung',
            render: (value) => (
                <span className="font-medium">{value}</span>
            )
        },
        {
            key: 'floor',
            label: 'Lantai',
            render: (value) => value || '-'
        },
        {
            key: 'room_number',
            label: 'No. Ruangan',
            render: (value) => value || '-'
        },
        {
            key: 'asset_count',
            label: 'Jumlah Aset',
            render: (value) => (
                <span className="text-gray-600">{value || 0} aset</span>
            )
        }
    ];

    const actions = [
        {
            icon: HiOutlinePencil,
            label: 'Edit',
            onClick: openEditModal
        },
        {
            icon: HiOutlineTrash,
            label: 'Hapus',
            onClick: (row) => setDeleteModal({ open: true, location: row }),
            className: 'text-red-600 hover:text-red-700'
        }
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lokasi</h1>
                        <p className="text-gray-600">
                            Kelola lokasi penyimpanan aset
                        </p>
                    </div>
                    <Button onClick={openAddModal}>
                        <HiOutlinePlus className="w-5 h-5" />
                        Tambah Lokasi
                    </Button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <SearchBar
                        value={search}
                        onChange={handleSearch}
                        placeholder="Cari lokasi..."
                    />
                </div>

                {/* Content */}
                {isLoading ? (
                    <ContentLoading message="Memuat data lokasi..." />
                ) : locations.length === 0 ? (
                    <EmptyState
                        icon={HiOutlineLocationMarker}
                        title={search ? 'Lokasi tidak ditemukan' : 'Belum ada lokasi'}
                        description={
                            search 
                                ? 'Coba ubah kata kunci pencarian'
                                : 'Mulai dengan menambahkan lokasi pertama'
                        }
                        action={
                            !search && (
                                <Button onClick={openAddModal}>
                                    <HiOutlinePlus className="w-5 h-5" />
                                    Tambah Lokasi
                                </Button>
                            )
                        }
                    />
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={locations}
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

            {/* Add/Edit Modal */}
            <Modal
                isOpen={formModal.open}
                onClose={closeFormModal}
                title={formModal.data ? 'Edit Lokasi' : 'Tambah Lokasi'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nama Lokasi"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="Contoh: Ruang IT"
                            required
                        />
                        <Input
                            label="Gedung"
                            name="building"
                            value={formData.building}
                            onChange={handleChange}
                            error={errors.building}
                            placeholder="Contoh: Gedung A"
                            required
                        />
                        <Input
                            label="Lantai"
                            name="floor"
                            value={formData.floor}
                            onChange={handleChange}
                            placeholder="Contoh: 2"
                        />
                        <Input
                            label="Nomor Ruangan"
                            name="room_number"
                            value={formData.room_number}
                            onChange={handleChange}
                            placeholder="Contoh: 201"
                        />
                    </div>
                    <Textarea
                        label="Deskripsi"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Deskripsi lokasi (opsional)"
                        rows={3}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={closeFormModal}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            isLoading={isSubmitting}
                        >
                            {formModal.data ? 'Simpan Perubahan' : 'Tambah'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, location: null })}
                onConfirm={handleDelete}
                title="Hapus Lokasi"
                message={
                    <>
                        Apakah Anda yakin ingin menghapus lokasi{' '}
                        <strong>{deleteModal.location?.name}</strong>?
                        Lokasi tidak dapat dihapus jika masih memiliki aset.
                    </>
                }
                confirmText="Hapus"
                variant="danger"
                isLoading={isDeleting}
            />
        </MainLayout>
    );
};

export default LocationList;
