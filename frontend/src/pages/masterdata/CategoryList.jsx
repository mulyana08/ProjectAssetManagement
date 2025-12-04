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
import { categoryAPI } from '../../api';
import toast from 'react-hot-toast';
import { 
    HiOutlinePlus, 
    HiOutlinePencil, 
    HiOutlineTrash,
    HiOutlineTag
} from 'react-icons/hi';

const CategoryList = () => {
    // State
    const [categories, setCategories] = useState([]);
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
    const [deleteModal, setDeleteModal] = useState({ open: false, category: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search
            };

            const response = await categoryAPI.getAll(params);
            
            if (response.success) {
                setCategories(response.data);
                if (response.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.meta.total_records || 0,
                        totalPages: response.meta.total_pages || 1
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Gagal memuat data kategori');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, search]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSearch = (value) => {
        setSearch(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Form handlers
    const openAddModal = () => {
        setFormData({ name: '', code: '', description: '' });
        setErrors({});
        setFormModal({ open: true, data: null });
    };

    const openEditModal = (category) => {
        setFormData({
            name: category.name || '',
            code: category.code || '',
            description: category.description || ''
        });
        setErrors({});
        setFormModal({ open: true, data: category });
    };

    const closeFormModal = () => {
        setFormModal({ open: false, data: null });
        setFormData({ name: '', code: '', description: '' });
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
            newErrors.name = 'Nama kategori wajib diisi';
        }
        if (!formData.code.trim()) {
            newErrors.code = 'Kode kategori wajib diisi';
        } else if (formData.code.length > 10) {
            newErrors.code = 'Kode maksimal 10 karakter';
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
                response = await categoryAPI.update(formModal.data.id, formData);
            } else {
                response = await categoryAPI.create(formData);
            }

            if (response.success) {
                toast.success(formModal.data ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan');
                closeFormModal();
                fetchCategories();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.category) return;

        setIsDeleting(true);

        try {
            const response = await categoryAPI.delete(deleteModal.category.id);
            if (response.success) {
                toast.success('Kategori berhasil dihapus');
                setDeleteModal({ open: false, category: null });
                fetchCategories();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus kategori');
        } finally {
            setIsDeleting(false);
        }
    };

    // Table columns
    const columns = [
        {
            key: 'code',
            label: 'Kode',
            render: (value) => (
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                    {value}
                </span>
            )
        },
        {
            key: 'name',
            label: 'Nama Kategori'
        },
        {
            key: 'description',
            label: 'Deskripsi',
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
            onClick: (row) => setDeleteModal({ open: true, category: row }),
            className: 'text-red-600 hover:text-red-700'
        }
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kategori Aset</h1>
                        <p className="text-gray-600">
                            Kelola kategori untuk klasifikasi aset
                        </p>
                    </div>
                    <Button onClick={openAddModal}>
                        <HiOutlinePlus className="w-5 h-5" />
                        Tambah Kategori
                    </Button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <SearchBar
                        value={search}
                        onChange={handleSearch}
                        placeholder="Cari kategori..."
                    />
                </div>

                {/* Content */}
                {isLoading ? (
                    <ContentLoading message="Memuat data kategori..." />
                ) : categories.length === 0 ? (
                    <EmptyState
                        icon={HiOutlineTag}
                        title={search ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
                        description={
                            search 
                                ? 'Coba ubah kata kunci pencarian'
                                : 'Mulai dengan menambahkan kategori pertama'
                        }
                        action={
                            !search && (
                                <Button onClick={openAddModal}>
                                    <HiOutlinePlus className="w-5 h-5" />
                                    Tambah Kategori
                                </Button>
                            )
                        }
                    />
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={categories}
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
                title={formModal.data ? 'Edit Kategori' : 'Tambah Kategori'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Kode Kategori"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        error={errors.code}
                        placeholder="Contoh: LAPTOP"
                        required
                        maxLength={10}
                    />
                    <Input
                        label="Nama Kategori"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        placeholder="Contoh: Laptop & Notebook"
                        required
                    />
                    <Textarea
                        label="Deskripsi"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Deskripsi kategori (opsional)"
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
                onClose={() => setDeleteModal({ open: false, category: null })}
                onConfirm={handleDelete}
                title="Hapus Kategori"
                message={
                    <>
                        Apakah Anda yakin ingin menghapus kategori{' '}
                        <strong>{deleteModal.category?.name}</strong>?
                        Kategori tidak dapat dihapus jika masih memiliki aset.
                    </>
                }
                confirmText="Hapus"
                variant="danger"
                isLoading={isDeleting}
            />
        </MainLayout>
    );
};

export default CategoryList;
