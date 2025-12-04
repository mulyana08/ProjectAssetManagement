import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Card, Button, Select, Textarea } from '../../components/common';
import { ContentLoading } from '../../components/common/Loading';
import { AssetStatusBadge } from '../../components/common/Badge';
import { transactionAPI, assetAPI, locationAPI } from '../../api';
import toast from 'react-hot-toast';
import { 
    HiOutlineArrowLeft, 
    HiOutlineLocationMarker,
    HiOutlineSearch
} from 'react-icons/hi';

const RelocateForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedAssetId = searchParams.get('asset_id');

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [assets, setAssets] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [errors, setErrors] = useState({});
    const [assetSearch, setAssetSearch] = useState('');
    
    const [formData, setFormData] = useState({
        asset_id: preselectedAssetId || '',
        new_location_id: '',
        notes: ''
    });

    // Fetch assets and locations
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsFetchingData(true);
                
                const [availableRes, inUseRes, locRes] = await Promise.all([
                    assetAPI.getAll({ status: 'Available', limit: 100 }),
                    assetAPI.getAll({ status: 'In Use', limit: 100 }),
                    locationAPI.getAllWithoutPagination()
                ]);

                const allAssets = [
                    ...(availableRes.success ? availableRes.data : []),
                    ...(inUseRes.success ? inUseRes.data : [])
                ];

                setAssets(allAssets);
                
                if (locRes.success) {
                    setLocations([
                        { value: '', label: 'Pilih Lokasi Baru' },
                        ...locRes.data.map(l => ({ 
                            value: l.id.toString(), 
                            label: `${l.name} - ${l.building}` 
                        }))
                    ]);
                }
                
                // If preselected asset
                if (preselectedAssetId) {
                    const asset = allAssets.find(a => a.id.toString() === preselectedAssetId);
                    if (asset) {
                        setSelectedAsset(asset);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Gagal memuat data');
            } finally {
                setIsFetchingData(false);
            }
        };

        fetchData();
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
        if (!formData.new_location_id) {
            newErrors.new_location_id = 'Lokasi baru wajib dipilih';
        }
        if (selectedAsset && formData.new_location_id === selectedAsset.location_id?.toString()) {
            newErrors.new_location_id = 'Lokasi baru harus berbeda dari lokasi saat ini';
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
                new_location_id: parseInt(formData.new_location_id),
                notes: formData.notes || null
            };

            const response = await transactionAPI.relocate(payload);

            if (response.success) {
                toast.success('Aset berhasil dipindahkan!');
                navigate('/transactions');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAssets = assets.filter(asset => 
        asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
        asset.asset_code.toLowerCase().includes(assetSearch.toLowerCase())
    );

    // Filter out current location from options
    const filteredLocations = selectedAsset 
        ? locations.filter(l => l.value !== selectedAsset.location_id?.toString())
        : locations;

    if (isFetchingData) {
        return (
            <MainLayout>
                <ContentLoading message="Memuat form pemindahan..." />
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
                        <h1 className="text-2xl font-bold text-gray-900">Pindahkan Lokasi Aset</h1>
                        <p className="text-gray-600">
                            Ubah lokasi penyimpanan aset
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
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <HiOutlineLocationMarker className="w-4 h-4" />
                                                    Lokasi saat ini: <strong>{selectedAsset.location?.name}</strong> ({selectedAsset.location?.building})
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
                                                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{asset.name}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {asset.asset_code} • {asset.location?.name}
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

                            {/* New Location */}
                            <Card title="Lokasi Tujuan">
                                <div className="space-y-4">
                                    <Select
                                        label="Pilih Lokasi Baru"
                                        name="new_location_id"
                                        value={formData.new_location_id}
                                        onChange={handleChange}
                                        error={errors.new_location_id}
                                        options={filteredLocations}
                                        required
                                    />
                                    <Textarea
                                        label="Catatan"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Alasan pemindahan..."
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
                                        <label className="text-sm text-gray-500">Lokasi Asal</label>
                                        <p className="font-medium text-gray-900">
                                            {selectedAsset?.location?.name || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Lokasi Tujuan</label>
                                        <p className="font-medium text-blue-600">
                                            {filteredLocations.find(l => l.value === formData.new_location_id)?.label?.split(' - ')[0] || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Tipe Transaksi</label>
                                        <p className="font-medium text-blue-600">Relocate</p>
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
                                        <HiOutlineLocationMarker className="w-5 h-5" />
                                        Pindahkan Aset
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

export default RelocateForm;
