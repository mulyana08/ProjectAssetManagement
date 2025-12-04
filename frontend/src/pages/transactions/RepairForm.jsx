import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Card, Button, Input, Textarea } from '../../components/common';
import { ContentLoading } from '../../components/common/Loading';
import { AssetStatusBadge } from '../../components/common/Badge';
import { transactionAPI, assetAPI } from '../../api';
import toast from 'react-hot-toast';
import { 
    HiOutlineArrowLeft, 
    HiOutlineCog,
    HiOutlineSearch
} from 'react-icons/hi';

const RepairForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedAssetId = searchParams.get('asset_id');

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [availableAssets, setAvailableAssets] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [errors, setErrors] = useState({});
    const [assetSearch, setAssetSearch] = useState('');
    
    const [formData, setFormData] = useState({
        asset_id: preselectedAssetId || '',
        repair_vendor: '',
        estimated_cost: '',
        expected_completion: '',
        notes: ''
    });

    // Fetch assets (not disposed or already under repair)
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setIsFetchingData(true);
                
                // Fetch Available and In Use assets
                const [availableRes, inUseRes] = await Promise.all([
                    assetAPI.getAll({ status: 'Available', limit: 100 }),
                    assetAPI.getAll({ status: 'In Use', limit: 100 })
                ]);

                const allAssets = [
                    ...(availableRes.success ? availableRes.data : []),
                    ...(inUseRes.success ? inUseRes.data : [])
                ];

                setAvailableAssets(allAssets);
                
                // If preselected asset
                if (preselectedAssetId) {
                    const asset = allAssets.find(a => a.id.toString() === preselectedAssetId);
                    if (asset) {
                        setSelectedAsset(asset);
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
        if (!formData.notes.trim()) {
            newErrors.notes = 'Deskripsi kerusakan wajib diisi';
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
                repair_vendor: formData.repair_vendor || null,
                estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
                expected_completion: formData.expected_completion || null,
                notes: formData.notes
            };

            const response = await transactionAPI.repair(payload);

            if (response.success) {
                toast.success('Aset berhasil dikirim untuk perbaikan!');
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
                <ContentLoading message="Memuat form perbaikan..." />
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
                        <h1 className="text-2xl font-bold text-gray-900">Kirim untuk Perbaikan</h1>
                        <p className="text-gray-600">
                            Ubah status aset menjadi dalam perbaikan
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
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                                                    Lokasi: {selectedAsset.location?.name}
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
                                                    Tidak ada aset ditemukan
                                                </p>
                                            ) : (
                                                filteredAssets.map(asset => (
                                                    <div
                                                        key={asset.id}
                                                        onClick={() => handleAssetSelect(asset)}
                                                        className="p-3 border border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{asset.name}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {asset.asset_code} • {asset.category?.name}
                                                                </p>
                                                            </div>
                                                            <AssetStatusBadge status={asset.status} />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* Repair Info */}
                            <Card title="Informasi Perbaikan">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Vendor / Teknisi"
                                        name="repair_vendor"
                                        value={formData.repair_vendor}
                                        onChange={handleChange}
                                        placeholder="Nama vendor atau teknisi"
                                    />
                                    <Input
                                        label="Estimasi Biaya (Rp)"
                                        name="estimated_cost"
                                        type="number"
                                        value={formData.estimated_cost}
                                        onChange={handleChange}
                                        placeholder="0"
                                    />
                                    <Input
                                        label="Estimasi Selesai"
                                        name="expected_completion"
                                        type="date"
                                        value={formData.expected_completion}
                                        onChange={handleChange}
                                    />
                                    <div className="md:col-span-2">
                                        <Textarea
                                            label="Deskripsi Kerusakan"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            error={errors.notes}
                                            placeholder="Jelaskan kerusakan atau masalah pada aset..."
                                            rows={4}
                                            required
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
                                        <label className="text-sm text-gray-500">Status Baru</label>
                                        <p className="font-medium text-yellow-600">Under Repair</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Tipe Transaksi</label>
                                        <p className="font-medium text-yellow-600">Repair</p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full bg-yellow-500 hover:bg-yellow-600"
                                        isLoading={isLoading}
                                    >
                                        <HiOutlineCog className="w-5 h-5" />
                                        Kirim untuk Perbaikan
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

export default RepairForm;
