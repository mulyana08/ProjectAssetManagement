import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Card, Button, ConfirmDialog, Modal } from '../../components/common';
import { ContentLoading } from '../../components/common/Loading';
import { AssetStatusBadge, ConditionBadge, TransactionTypeBadge } from '../../components/common/Badge';
import { assetAPI, transactionAPI } from '../../api';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { 
    HiOutlineArrowLeft, 
    HiOutlinePencil, 
    HiOutlineTrash,
    HiOutlineArrowRight,
    HiOutlineArrowCircleLeft,
    HiOutlineCog,
    HiOutlineLocationMarker,
    HiOutlineExclamationCircle,
    HiOutlineClipboardList,
    HiOutlineCalendar,
    HiOutlineCurrencyDollar,
    HiOutlineTag,
    HiOutlineDocumentText,
    HiOutlineQrcode
} from 'react-icons/hi';

const AssetDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // State
    const [asset, setAsset] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch asset data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                const [assetRes, transRes] = await Promise.all([
                    assetAPI.getById(id),
                    transactionAPI.getAll({ asset_id: id, limit: 10 })
                ]);

                if (assetRes.success) {
                    setAsset(assetRes.data);
                } else {
                    toast.error('Aset tidak ditemukan');
                    navigate('/assets');
                }

                if (transRes.success) {
                    setTransactions(transRes.data);
                }
            } catch (error) {
                console.error('Error fetching asset:', error);
                toast.error('Gagal memuat data aset');
                navigate('/assets');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await assetAPI.delete(id);
            if (response.success) {
                toast.success('Aset berhasil dihapus');
                navigate('/assets');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus aset');
        } finally {
            setIsDeleting(false);
            setDeleteModal(false);
        }
    };

    const getQuickActions = () => {
        if (!asset) return [];
        
        const actions = [];
        
        if (asset.status === 'Available') {
            actions.push({
                label: 'Checkout',
                icon: HiOutlineArrowRight,
                color: 'primary',
                onClick: () => navigate(`/transactions/checkout?asset_id=${id}`)
            });
        }
        
        if (asset.status === 'In Use') {
            actions.push({
                label: 'Checkin',
                icon: HiOutlineArrowCircleLeft,
                color: 'success',
                onClick: () => navigate(`/transactions/checkin?asset_id=${id}`)
            });
        }
        
        if (asset.status !== 'Under Repair' && asset.status !== 'Disposed') {
            actions.push({
                label: 'Perbaikan',
                icon: HiOutlineCog,
                color: 'warning',
                onClick: () => navigate(`/transactions/repair?asset_id=${id}`)
            });
        }

        if (asset.status !== 'Disposed') {
            actions.push({
                label: 'Pindah Lokasi',
                icon: HiOutlineLocationMarker,
                color: 'secondary',
                onClick: () => navigate(`/transactions/relocate?asset_id=${id}`)
            });
        }

        return actions;
    };

    if (isLoading) {
        return (
            <MainLayout>
                <ContentLoading message="Memuat detail aset..." />
            </MainLayout>
        );
    }

    if (!asset) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Aset tidak ditemukan</p>
                    <Link to="/assets" className="text-primary-600 hover:underline mt-2 inline-block">
                        Kembali ke daftar aset
                    </Link>
                </div>
            </MainLayout>
        );
    }

    const quickActions = getQuickActions();

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/assets')}
                        >
                            <HiOutlineArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
                                <AssetStatusBadge status={asset.status} />
                            </div>
                            <p className="text-gray-600 flex items-center gap-2">
                                <HiOutlineQrcode className="w-4 h-4" />
                                {asset.asset_code}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link to={`/assets/${id}/edit`}>
                            <Button variant="secondary">
                                <HiOutlinePencil className="w-5 h-5" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="danger"
                            onClick={() => setDeleteModal(true)}
                        >
                            <HiOutlineTrash className="w-5 h-5" />
                            Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card title="Informasi Dasar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Kategori</label>
                                    <p className="mt-1 text-gray-900 flex items-center gap-2">
                                        <HiOutlineTag className="w-4 h-4 text-gray-400" />
                                        {asset.category?.name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Lokasi</label>
                                    <p className="mt-1 text-gray-900 flex items-center gap-2">
                                        <HiOutlineLocationMarker className="w-4 h-4 text-gray-400" />
                                        {asset.location ? `${asset.location.name} (${asset.location.building})` : '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Kondisi</label>
                                    <div className="mt-1">
                                        <ConditionBadge condition={asset.condition} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Serial Number</label>
                                    <p className="mt-1 text-gray-900 font-mono">{asset.serial_number || '-'}</p>
                                </div>
                                {asset.description && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-500">Deskripsi</label>
                                        <p className="mt-1 text-gray-900">{asset.description}</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Purchase Info */}
                        <Card title="Informasi Pembelian">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Tanggal Pembelian</label>
                                    <p className="mt-1 text-gray-900 flex items-center gap-2">
                                        <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                                        {formatDate(asset.purchase_date)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Harga Pembelian</label>
                                    <p className="mt-1 text-gray-900 flex items-center gap-2">
                                        <HiOutlineCurrencyDollar className="w-4 h-4 text-gray-400" />
                                        {formatCurrency(asset.purchase_price)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Supplier</label>
                                    <p className="mt-1 text-gray-900">{asset.supplier || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Garansi Sampai</label>
                                    <p className="mt-1 text-gray-900 flex items-center gap-2">
                                        {asset.warranty_expiry ? (
                                            <>
                                                <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                                                {formatDate(asset.warranty_expiry)}
                                                {new Date(asset.warranty_expiry) < new Date() && (
                                                    <span className="text-red-500 text-sm">(Expired)</span>
                                                )}
                                            </>
                                        ) : '-'}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Specifications */}
                        {asset.specifications && (
                            <Card title="Spesifikasi Teknis">
                                <div className="flex items-start gap-2">
                                    <HiOutlineDocumentText className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <pre className="text-gray-900 font-mono text-sm whitespace-pre-wrap">
                                        {asset.specifications}
                                    </pre>
                                </div>
                            </Card>
                        )}

                        {/* Transaction History */}
                        <Card 
                            title="Riwayat Transaksi" 
                            subtitle={`${transactions.length} transaksi terakhir`}
                        >
                            {transactions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <HiOutlineClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                    <p>Belum ada riwayat transaksi</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.map((transaction) => (
                                        <div 
                                            key={transaction.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <TransactionTypeBadge type={transaction.type} />
                                                    <span className="text-sm text-gray-500">
                                                        oleh {transaction.user?.name || 'Unknown'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {transaction.notes || 'Tidak ada catatan'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatDateTime(transaction.transaction_date)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="pt-3 border-t">
                                        <Link 
                                            to={`/transactions?asset_id=${id}`}
                                            className="text-sm text-primary-600 hover:text-primary-700"
                                        >
                                            Lihat semua riwayat →
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        {quickActions.length > 0 && (
                            <Card title="Aksi Cepat">
                                <div className="space-y-2">
                                    {quickActions.map((action, index) => (
                                        <Button
                                            key={index}
                                            variant={action.color === 'primary' ? 'primary' : 'secondary'}
                                            className="w-full justify-start"
                                            onClick={action.onClick}
                                        >
                                            <action.icon className="w-5 h-5" />
                                            {action.label}
                                        </Button>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Current Assignment */}
                        {asset.current_user && (
                            <Card title="Pengguna Saat Ini">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                        <span className="text-primary-600 font-semibold">
                                            {asset.current_user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{asset.current_user.name}</p>
                                        <p className="text-sm text-gray-500">{asset.current_user.email}</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Warranty Alert */}
                        {asset.warranty_expiry && (
                            <WarrantyAlert expiryDate={asset.warranty_expiry} />
                        )}

                        {/* Meta Info */}
                        <Card title="Info Tambahan">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Dibuat</span>
                                    <span className="text-gray-900">{formatDateTime(asset.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Diperbarui</span>
                                    <span className="text-gray-900">{formatDateTime(asset.updated_at)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Aset"
                message={
                    <>
                        Apakah Anda yakin ingin menghapus aset{' '}
                        <strong>{asset.name}</strong> ({asset.asset_code})?
                        Semua riwayat transaksi akan ikut terhapus.
                    </>
                }
                confirmText="Hapus"
                type="danger"
                isLoading={isDeleting}
            />
        </MainLayout>
    );
};

// Warranty Alert Component
const WarrantyAlert = ({ expiryDate }) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    let alertType = 'info';
    let message = '';

    if (daysLeft < 0) {
        alertType = 'danger';
        message = 'Garansi sudah berakhir';
    } else if (daysLeft <= 30) {
        alertType = 'warning';
        message = `Garansi berakhir dalam ${daysLeft} hari`;
    } else if (daysLeft <= 90) {
        alertType = 'info';
        message = `Garansi berakhir dalam ${daysLeft} hari`;
    } else {
        return null; // Don't show alert if warranty is fine
    }

    const colors = {
        danger: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return (
        <div className={`p-4 rounded-lg border ${colors[alertType]}`}>
            <div className="flex items-center gap-2">
                <HiOutlineExclamationCircle className="w-5 h-5" />
                <div>
                    <p className="font-medium">{message}</p>
                    <p className="text-sm opacity-75">{formatDate(expiryDate)}</p>
                </div>
            </div>
        </div>
    );
};

export default AssetDetail;
