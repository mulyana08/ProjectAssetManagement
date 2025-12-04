import { useState, useEffect, useCallback } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { 
    Button, 
    Table, 
    Pagination, 
    SearchBar, 
    Modal,
    Input,
    Select,
    ConfirmDialog,
    EmptyState
} from '../../components/common';
import { ContentLoading } from '../../components/common/Loading';
import { Badge } from '../../components/common/Badge';
import { userAPI } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
    HiOutlinePlus, 
    HiOutlinePencil, 
    HiOutlineTrash,
    HiOutlineUserGroup
} from 'react-icons/hi';

const UserList = () => {
    const { user: currentUser } = useAuth();

    // State
    const [users, setUsers] = useState([]);
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
    const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        department: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});

    const roleOptions = [
        { value: 'admin', label: 'Administrator' },
        { value: 'staff', label: 'Staff' }
    ];

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search
            };

            const response = await userAPI.getAll(params);
            
            if (response.success) {
                setUsers(response.data);
                if (response.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.meta.total_records || 0,
                        totalPages: response.meta.total_pages || 1
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Gagal memuat data pengguna');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (value) => {
        setSearch(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Form handlers
    const openAddModal = () => {
        setFormData({ 
            name: '', 
            email: '', 
            password: '', 
            role: 'staff', 
            department: '', 
            phone: '' 
        });
        setErrors({});
        setFormModal({ open: true, data: null });
    };

    const openEditModal = (user) => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '', // Don't prefill password
            role: user.role || 'staff',
            department: user.department || '',
            phone: user.phone || ''
        });
        setErrors({});
        setFormModal({ open: true, data: user });
    };

    const closeFormModal = () => {
        setFormModal({ open: false, data: null });
        setFormData({ name: '', email: '', password: '', role: 'staff', department: '', phone: '' });
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
            newErrors.name = 'Nama wajib diisi';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        
        // Password required only for new users
        if (!formModal.data && !formData.password) {
            newErrors.password = 'Password wajib diisi';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const payload = { ...formData };
            
            // Remove password if editing and empty
            if (formModal.data && !payload.password) {
                delete payload.password;
            }

            let response;
            if (formModal.data) {
                response = await userAPI.update(formModal.data.id, payload);
            } else {
                response = await userAPI.create(payload);
            }

            if (response.success) {
                toast.success(formModal.data ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil ditambahkan');
                closeFormModal();
                fetchUsers();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.user) return;

        setIsDeleting(true);

        try {
            const response = await userAPI.delete(deleteModal.user.id);
            if (response.success) {
                toast.success('Pengguna berhasil dihapus');
                setDeleteModal({ open: false, user: null });
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus pengguna');
        } finally {
            setIsDeleting(false);
        }
    };

    // Table columns
    const columns = [
        {
            key: 'name',
            label: 'Nama',
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                            {value?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{value}</p>
                        <p className="text-sm text-gray-500">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            label: 'Role',
            render: (value) => (
                <Badge 
                    variant={value === 'admin' ? 'purple' : 'default'}
                >
                    {value === 'admin' ? 'Admin' : 'Staff'}
                </Badge>
            )
        },
        {
            key: 'department',
            label: 'Departemen',
            render: (value) => value || '-'
        },
        {
            key: 'phone',
            label: 'Telepon',
            render: (value) => value || '-'
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
            onClick: (row) => setDeleteModal({ open: true, user: row }),
            className: 'text-red-600 hover:text-red-700',
            // Disable delete for current user
            disabled: (row) => row.id === currentUser?.id
        }
    ];

    // Only admin can access this page
    if (currentUser?.role !== 'admin') {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Anda tidak memiliki akses ke halaman ini</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
                        <p className="text-gray-600">
                            Kelola akun pengguna sistem
                        </p>
                    </div>
                    <Button onClick={openAddModal}>
                        <HiOutlinePlus className="w-5 h-5" />
                        Tambah Pengguna
                    </Button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <SearchBar
                        value={search}
                        onChange={handleSearch}
                        placeholder="Cari pengguna..."
                    />
                </div>

                {/* Content */}
                {isLoading ? (
                    <ContentLoading message="Memuat data pengguna..." />
                ) : users.length === 0 ? (
                    <EmptyState
                        icon={HiOutlineUserGroup}
                        title={search ? 'Pengguna tidak ditemukan' : 'Belum ada pengguna'}
                        description={
                            search 
                                ? 'Coba ubah kata kunci pencarian'
                                : 'Mulai dengan menambahkan pengguna pertama'
                        }
                        action={
                            !search && (
                                <Button onClick={openAddModal}>
                                    <HiOutlinePlus className="w-5 h-5" />
                                    Tambah Pengguna
                                </Button>
                            )
                        }
                    />
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={users}
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
                title={formModal.data ? 'Edit Pengguna' : 'Tambah Pengguna'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nama Lengkap"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="Nama lengkap"
                            required
                        />
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="email@example.com"
                            required
                        />
                        <Input
                            label={formModal.data ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Minimal 6 karakter"
                            required={!formModal.data}
                        />
                        <Select
                            label="Role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            options={roleOptions}
                        />
                        <Input
                            label="Departemen"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="Contoh: IT Department"
                        />
                        <Input
                            label="Telepon"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Contoh: 081234567890"
                        />
                    </div>
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
                onClose={() => setDeleteModal({ open: false, user: null })}
                onConfirm={handleDelete}
                title="Hapus Pengguna"
                message={
                    <>
                        Apakah Anda yakin ingin menghapus pengguna{' '}
                        <strong>{deleteModal.user?.name}</strong>?
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

export default UserList;
