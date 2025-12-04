import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Card, Button, Select, Textarea } from '../../components/common';
import { ContentLoading } from '../../components/common/Loading';
import { AssetStatusBadge, ConditionBadge } from '../../components/common/Badge';
import { transactionAPI, assetAPI } from '../../api';
import toast from 'react-hot-toast';
import { 
    HiOutlineArrowLeft, 
    HiOutlineArrowCircleLeft,
    HiOutlineSearch
} from 'react-icons/hi';

const CheckinForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedAssetId = searchParams.get('asset_id');

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [inUseAssets, setInUseAssets] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [errors, setErrors] = useState({});
    const [assetSearch, setAssetSearch] = useState('');
    
    const [formData, setFormData] = useState({
        asset_id: preselectedAssetId || '',
        condition: 'Good',
        notes: ''
    });

    const conditionOptions = [
        { value: 'Excellent', label: 'Excellent - Sangat Baik' },
        { value: 'Good', label: 'Good - Baik' },
        { value: 'Fair', label: 'Fair - Cukup' },
        { value: 'Poor', label: 'Poor - Buruk' }
    ];

    // Fetch assets in use
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setIsFetchingData(true);
                
                const response = await assetAPI.getAll({ status: 'In Use', limit: 100 });

                if (response.success) {
                    setInUseAssets(response.data);
                    
                    // If preselected asset
                    if (preselectedAssetId) {
                        const asset = response.data.find(a => a.id.toString() === preselectedAssetId);
                        if (asset) {
                            setSelectedAsset(asset);
                            setFormData(prev => ({ ...prev, condition: asset.condition }));
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching assets:', error);
                toast.error('Gagal memuat data aset');
            } finally {
                setIsFetchingData(false);
            }
        };

        fetchAssets();
    }, [preselectedAssetId]);

    const handleAssetSelect = (asset) => {
        setSelectedAsset(asset);
        setFormData(prev => ({ 
            ...prev, 
            asset_id: asset.id.toString(),
            condition: asset.condition 
        }));
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            toast.error('Mohon pilih aset terlebih dahulu');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                asset_id: parseInt(formData.asset_id),
                condition: formData.condition,
                notes: formData.notes || null
            };

            const response = await transactionAPI.checkin(payload);

            if (response.success) {
                toast.success('Checkin berhasil!');
                navigate('/transactions');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAssets = inUseAssets.filter(asset => 
        asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
        asset.asset_code.toLowerCase().includes(assetSearch.toLowerCase())
    );

    if (isFetchingData) {
        return (
            <MainLayout>
                <ContentLoading message="Memuat form checkin..." />
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
                        <h1 className="text-2xl font-bold text-gray-900">Checkin Aset</h1>
                        <p className="text-gray-600">
                            Terima kembali aset dari karyawan
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Asset Selection */}
                            <Card title="Pilih Aset yang Dikembalikan">
                                {selectedAsset ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
                                                {selectedAsset.current_user && (
                                                    <p className="text-sm text-gray-500">
                                                        Digunakan oleh: <strong>{selectedAsset.current_user.name}</strong>
                                                    </p>
                                                )}
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
                                                    Tidak ada aset yang sedang digunakan
                                                </p>
                                            ) : (
                                                filteredAssets.map(asset => (
                                                    <div
                                                        key={asset.id}
                                                        onClick={() => handleAssetSelect(asset)}
                                                        className="p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{asset.name}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {asset.asset_code} • {asset.category?.name}
                                                                </p>
                                                                {asset.current_user && (
                                                                    <p className="text-xs text-gray-400">
                                                                        Digunakan: {asset.current_user.name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <ConditionBadge condition={asset.condition} />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* Condition & Notes */}
                            <Card title="Kondisi Aset Saat Dikembalikan">
                                <div className="space-y-4">
                                    <Select
                                        label="Kondisi"
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleChange}
                                        options={conditionOptions}
                                    />
                                    <Textarea
                                        label="Catatan"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Catatan kondisi atau kerusakan (jika ada)..."
                                        rows={3}
                                    />
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
                                        <label className="text-sm text-gray-500">Dikembalikan Dari</label>
                                        <p className="font-medium text-gray-900">
                                            {selectedAsset?.current_user?.name || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Kondisi Baru</label>
                                        <div className="mt-1">
                                            <ConditionBadge condition={formData.condition} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Tipe Transaksi</label>
                                        <p className="font-medium text-green-600">Checkin</p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        isLoading={isLoading}
                                    >
                                        <HiOutlineArrowCircleLeft className="w-5 h-5" />
                                        Proses Checkin
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

export default CheckinForm;
