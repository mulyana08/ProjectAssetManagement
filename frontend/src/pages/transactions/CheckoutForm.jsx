import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Card, Button, Input, Select, Textarea } from '../../components/common';
import { ContentLoading } from '../../components/common/Loading';
import { AssetStatusBadge } from '../../components/common/Badge';
import { transactionAPI, assetAPI, userAPI } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { 
    HiOutlineArrowLeft, 
    HiOutlineSave,
    HiOutlineArrowRight,
    HiOutlineSearch
} from 'react-icons/hi';

const CheckoutForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedAssetId = searchParams.get('asset_id');

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [availableAssets, setAvailableAssets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [errors, setErrors] = useState({});
    const [assetSearch, setAssetSearch] = useState('');
    
    const [formData, setFormData] = useState({
        asset_id: preselectedAssetId || '',
        assigned_to: '',
        notes: '',
        expected_return_date: ''
    });

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsFetchingData(true);
                
                const [assetsRes, employeesRes] = await Promise.all([
                    assetAPI.getAll({ status: 'Available', limit: 100 }),
                    userAPI.getEmployees()
                ]);

                if (assetsRes.success) {
                    setAvailableAssets(assetsRes.data);
                    
                    // If preselected asset
                    if (preselectedAssetId) {
                        const asset = assetsRes.data.find(a => a.id.toString() === preselectedAssetId);
                        if (asset) {
                            setSelectedAsset(asset);
                        }
                    }
                }

                if (employeesRes.success) {
                    setEmployees([
                        { value: '', label: 'Pilih Karyawan' },
                        ...employeesRes.data.map(e => ({ 
                            value: e.id.toString(), 
                            label: `${e.name} (${e.email})` 
                        }))
                    ]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Gagal memuat data');
            } finally {
                setIsFetchingData(false);
            }
        };

        fetchInitialData();
    }, [preselectedAssetId]);

    const handleAssetSelect = (asset) => {
        setSelectedAsset(asset);
        setFormData(prev => ({ ...prev, asset_id: asset.id.toString() }));
        setAssetSearch('');
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
        
        if (!formData.asset_id) {
            newErrors.asset_id = 'Aset wajib dipilih';
        }
        if (!formData.assigned_to) {
            newErrors.assigned_to = 'Karyawan wajib dipilih';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            toast.error('Mohon lengkapi data yang wajib diisi');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                asset_id: parseInt(formData.asset_id),
                assigned_to: parseInt(formData.assigned_to),
                notes: formData.notes || null,
                expected_return_date: formData.expected_return_date || null
            };

            const response = await transactionAPI.checkout(payload);

            if (response.success) {
                toast.success('Checkout berhasil!');
                navigate('/transactions');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAssets = availableAssets.filter(asset => 
        asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
        asset.asset_code.toLowerCase().includes(assetSearch.toLowerCase())
    );

    if (isFetchingData) {
        return (
            <MainLayout>
                <ContentLoading message="Memuat form checkout..." />
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/transactions')}
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Checkout Aset</h1>
                        <p className="text-gray-600">
                            Serahkan aset kepada karyawan
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Asset Selection */}
                            <Card title="Pilih Aset">
                                {selectedAsset ? (
                                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">
                                                        {selectedAsset.name}
                                                    </span>
                                                    <AssetStatusBadge status={selectedAsset.status} />
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {selectedAsset.asset_code} • {selectedAsset.category?.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Lokasi: {selectedAsset.location?.name} ({selectedAsset.location?.building})
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedAsset(null);
                                                    setFormData(prev => ({ ...prev, asset_id: '' }));
                                                }}
                                            >
                                                Ganti
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Cari aset berdasarkan nama atau kode..."
                                                value={assetSearch}
                                                onChange={(e) => setAssetSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        
                                        {errors.asset_id && (
                                            <p className="text-sm text-red-500">{errors.asset_id}</p>
                                        )}

                                        <div className="max-h-64 overflow-y-auto space-y-2">
                                            {filteredAssets.length === 0 ? (
                                                <p className="text-center text-gray-500 py-4">
                                                    Tidak ada aset tersedia
                                                </p>
                                            ) : (
                                                filteredAssets.map(asset => (
                                                    <div
                                                        key={asset.id}
                                                        onClick={() => handleAssetSelect(asset)}
                                                        className="p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{asset.name}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {asset.asset_code} • {asset.category?.name}
                                                                </p>
                                                            </div>
                                                            <span className="text-sm text-gray-600">
                                                                {formatCurrency(asset.purchase_price)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* Assignment */}
                            <Card title="Informasi Penugasan">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="Serahkan Kepada"
                                        name="assigned_to"
                                        value={formData.assigned_to}
                                        onChange={handleChange}
                                        error={errors.assigned_to}
                                        options={employees}
                                        required
                                    />
                                    <Input
                                        label="Estimasi Tanggal Kembali"
                                        name="expected_return_date"
                                        type="date"
                                        value={formData.expected_return_date}
                                        onChange={handleChange}
                                    />
                                    <div className="md:col-span-2">
                                        <Textarea
                                            label="Catatan"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Catatan tambahan..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card title="Ringkasan">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500">Aset</label>
                                        <p className="font-medium text-gray-900">
                                            {selectedAsset?.name || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Diserahkan Kepada</label>
                                        <p className="font-medium text-gray-900">
                                            {employees.find(e => e.value === formData.assigned_to)?.label?.split(' (')[0] || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Tipe Transaksi</label>
                                        <p className="font-medium text-primary-600">Checkout</p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        isLoading={isLoading}
                                    >
                                        <HiOutlineArrowRight className="w-5 h-5" />
                                        Proses Checkout
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => navigate('/transactions')}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};

export default CheckoutForm;
