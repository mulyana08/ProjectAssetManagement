import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Card } from '../../components/common';
import { 
    Button, 
    Input, 
    Select, 
    Textarea 
} from '../../components/common';
import { ContentLoading } from '../../components/common/Loading';
import { assetAPI, categoryAPI, locationAPI } from '../../api';
import { formatDateForInput } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { 
    HiOutlineArrowLeft, 
    HiOutlineSave,
    HiOutlineRefresh
} from 'react-icons/hi';

const AssetForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        asset_code: '',
        name: '',
        description: '',
        category_id: '',
        location_id: '',
        purchase_date: '',
        purchase_price: '',
        supplier: '',
        warranty_expiry: '',
        status: 'Available',
        condition: 'Good',
        serial_number: '',
        specifications: ''
    });

    const statusOptions = [
        { value: 'Available', label: 'Tersedia' },
        { value: 'In Use', label: 'Digunakan' },
        { value: 'Under Repair', label: 'Dalam Perbaikan' },
        { value: 'Disposed', label: 'Dihapuskan' }
    ];

    const conditionOptions = [
        { value: 'Excellent', label: 'Excellent - Sangat Baik' },
        { value: 'Good', label: 'Good - Baik' },
        { value: 'Fair', label: 'Fair - Cukup' },
        { value: 'Poor', label: 'Poor - Buruk' }
    ];

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsFetchingData(true);
                
                const [catRes, locRes] = await Promise.all([
                    categoryAPI.getAllWithoutPagination(),
                    locationAPI.getAllWithoutPagination()
                ]);

                if (catRes.success) {
                    setCategories([
                        { value: '', label: 'Pilih Kategori' },
                        ...catRes.data.map(c => ({ value: c.id.toString(), label: c.name }))
                    ]);
                }

                if (locRes.success) {
                    setLocations([
                        { value: '', label: 'Pilih Lokasi' },
                        ...locRes.data.map(l => ({ value: l.id.toString(), label: `${l.name} - ${l.building}` }))
                    ]);
                }

                // If editing, fetch asset data
                if (isEditing) {
                    const assetRes = await assetAPI.getById(id);
                    if (assetRes.success) {
                        const asset = assetRes.data;
                        setFormData({
                            asset_code: asset.asset_code || '',
                            name: asset.name || '',
                            description: asset.description || '',
                            category_id: asset.category_id?.toString() || '',
                            location_id: asset.location_id?.toString() || '',
                            purchase_date: formatDateForInput(asset.purchase_date),
                            purchase_price: asset.purchase_price || '',
                            supplier: asset.supplier || '',
                            warranty_expiry: formatDateForInput(asset.warranty_expiry),
                            status: asset.status || 'Available',
                            condition: asset.condition || 'Good',
                            serial_number: asset.serial_number || '',
                            specifications: asset.specifications || ''
                        });
                    }
                } else {
                    // Generate new asset code
                    await generateAssetCode();
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Gagal memuat data');
            } finally {
                setIsFetchingData(false);
            }
        };

        fetchInitialData();
    }, [id, isEditing]);

    const generateAssetCode = async (categoryId = null) => {
        try {
            const params = categoryId ? { category_id: categoryId } : {};
            const response = await assetAPI.generateCode(params);
            if (response.success) {
                setFormData(prev => ({ ...prev, asset_code: response.data.code }));
            }
        } catch (error) {
            console.error('Error generating asset code:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Regenerate asset code when category changes (only for new assets)
        if (name === 'category_id' && !isEditing && value) {
            generateAssetCode(value);
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.asset_code.trim()) {
            newErrors.asset_code = 'Kode aset wajib diisi';
        }
        if (!formData.name.trim()) {
            newErrors.name = 'Nama aset wajib diisi';
        }
        if (!formData.category_id) {
            newErrors.category_id = 'Kategori wajib dipilih';
        }
        if (!formData.location_id) {
            newErrors.location_id = 'Lokasi wajib dipilih';
        }
        if (!formData.purchase_date) {
            newErrors.purchase_date = 'Tanggal pembelian wajib diisi';
        }
        if (!formData.purchase_price || parseFloat(formData.purchase_price) <= 0) {
            newErrors.purchase_price = 'Harga pembelian wajib diisi dan lebih dari 0';
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
                ...formData,
                category_id: parseInt(formData.category_id),
                location_id: parseInt(formData.location_id),
                purchase_price: parseFloat(formData.purchase_price),
                purchase_date: formData.purchase_date || null,
                warranty_expiry: formData.warranty_expiry || null
            };

            let response;
            if (isEditing) {
                response = await assetAPI.update(id, payload);
            } else {
                response = await assetAPI.create(payload);
            }

            if (response.success) {
                toast.success(isEditing ? 'Aset berhasil diperbarui' : 'Aset berhasil ditambahkan');
                navigate('/assets');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan';
            toast.error(errorMessage);
            
            // Handle validation errors from server
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingData) {
        return (
            <MainLayout>
                <ContentLoading message="Memuat form..." />
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
                        onClick={() => navigate('/assets')}
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditing ? 'Edit Aset' : 'Tambah Aset Baru'}
                        </h1>
                        <p className="text-gray-600">
                            {isEditing ? 'Perbarui informasi aset' : 'Isi form berikut untuk menambahkan aset baru'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <Card title="Informasi Dasar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Input
                                                label="Kode Aset"
                                                name="asset_code"
                                                value={formData.asset_code}
                                                onChange={handleChange}
                                                error={errors.asset_code}
                                                required
                                                disabled={isEditing}
                                            />
                                        </div>
                                        {!isEditing && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="mt-7"
                                                onClick={() => generateAssetCode(formData.category_id)}
                                                title="Generate ulang kode"
                                            >
                                                <HiOutlineRefresh className="w-5 h-5" />
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        label="Serial Number"
                                        name="serial_number"
                                        value={formData.serial_number}
                                        onChange={handleChange}
                                        placeholder="Nomor seri (opsional)"
                                    />
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Nama Aset"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            error={errors.name}
                                            required
                                            placeholder="Contoh: MacBook Pro 14 inch"
                                        />
                                    </div>
                                    <Select
                                        label="Kategori"
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        error={errors.category_id}
                                        options={categories}
                                        required
                                    />
                                    <Select
                                        label="Lokasi"
                                        name="location_id"
                                        value={formData.location_id}
                                        onChange={handleChange}
                                        error={errors.location_id}
                                        options={locations}
                                        required
                                    />
                                    <div className="md:col-span-2">
                                        <Textarea
                                            label="Deskripsi"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Deskripsi singkat tentang aset..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Purchase Info */}
                            <Card title="Informasi Pembelian">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Tanggal Pembelian"
                                        name="purchase_date"
                                        type="date"
                                        value={formData.purchase_date}
                                        onChange={handleChange}
                                        error={errors.purchase_date}
                                        required
                                    />
                                    <Input
                                        label="Harga Pembelian (Rp)"
                                        name="purchase_price"
                                        type="number"
                                        value={formData.purchase_price}
                                        onChange={handleChange}
                                        error={errors.purchase_price}
                                        required
                                        placeholder="0"
                                    />
                                    <Input
                                        label="Supplier"
                                        name="supplier"
                                        value={formData.supplier}
                                        onChange={handleChange}
                                        placeholder="Nama supplier (opsional)"
                                    />
                                    <Input
                                        label="Garansi Sampai"
                                        name="warranty_expiry"
                                        type="date"
                                        value={formData.warranty_expiry}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Card>

                            {/* Specifications */}
                            <Card title="Spesifikasi Teknis">
                                <Textarea
                                    label="Spesifikasi"
                                    name="specifications"
                                    value={formData.specifications}
                                    onChange={handleChange}
                                    placeholder="Contoh:&#10;CPU: Intel Core i7-12700H&#10;RAM: 16GB DDR5&#10;Storage: 512GB SSD"
                                    rows={5}
                                />
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status & Condition */}
                            <Card title="Status Aset">
                                <div className="space-y-4">
                                    <Select
                                        label="Status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        options={statusOptions}
                                    />
                                    <Select
                                        label="Kondisi"
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleChange}
                                        options={conditionOptions}
                                    />
                                </div>
                            </Card>

                            {/* Action Buttons */}
                            <Card>
                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        isLoading={isLoading}
                                    >
                                        <HiOutlineSave className="w-5 h-5" />
                                        {isEditing ? 'Simpan Perubahan' : 'Simpan Aset'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => navigate('/assets')}
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

export default AssetForm;
