import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import MainLayout from '../../components/layout/MainLayout';
import { StatsCard } from '../../components/common/Card';
import { AssetStatusBadge, TransactionTypeBadge } from '../../components/common/Badge';
import { ContentLoading } from '../../components/common/Loading';
import { assetAPI, transactionAPI } from '../../api';
import toast from 'react-hot-toast';
import { 
    HiOutlineDesktopComputer, 
    HiOutlineCheckCircle, 
    HiOutlineUserGroup,
    HiOutlineCog,
    HiOutlineExclamationCircle,
    HiOutlineCurrencyDollar,
    HiOutlinePlus,
    HiOutlineArrowRight,
    HiOutlineArrowLeft,
    HiOutlineClipboardList
} from 'react-icons/hi';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch stats and recent transactions in parallel
            const [statsResponse, transactionsResponse] = await Promise.all([
                assetAPI.getStats(),
                transactionAPI.getAll({ limit: 5 })
            ]);

            if (statsResponse.success) {
                setStats(statsResponse.data);
            }

            if (transactionsResponse.success) {
                setRecentTransactions(transactionsResponse.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Gagal memuat data dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <ContentLoading message="Memuat dashboard..." />
            </MainLayout>
        );
    }

    const statsCards = [
        {
            title: 'Total Aset',
            value: stats?.total_assets || 0,
            icon: HiOutlineDesktopComputer,
            color: 'info',
            subtitle: stats?.recent_assets > 0 ? `+${stats.recent_assets} minggu ini` : null
        },
        {
            title: 'Tersedia',
            value: stats?.by_status?.Available || 0,
            icon: HiOutlineCheckCircle,
            color: 'success',
        },
        {
            title: 'Digunakan',
            value: stats?.by_status?.['In Use'] || 0,
            icon: HiOutlineUserGroup,
            color: 'primary',
        },
        {
            title: 'Dalam Perbaikan',
            value: stats?.by_status?.['Under Repair'] || 0,
            icon: HiOutlineCog,
            color: 'warning',
        },
        {
            title: 'Dihapuskan',
            value: stats?.by_status?.Disposed || 0,
            icon: HiOutlineExclamationCircle,
            color: 'danger',
        },
        {
            title: 'Total Nilai Aset',
            value: formatCurrency(stats?.total_value || 0),
            icon: HiOutlineCurrencyDollar,
            color: 'purple',
        }
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
                    <h1 className="text-2xl font-bold">
                        Selamat datang, {user?.name || 'User'}! 👋
                    </h1>
                    <p className="mt-1 text-primary-100">
                        Berikut ringkasan kondisi aset IT Anda hari ini.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statsCards.map((stat) => (
                        <StatsCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            subtitle={stat.subtitle}
                        />
                    ))}
                </div>

                {/* Quick Actions & Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Aksi Cepat
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link 
                                to="/assets/add" 
                                className="flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg py-3 px-4 hover:bg-primary-700 transition-colors"
                            >
                                <HiOutlinePlus className="w-5 h-5" />
                                <span>Tambah Aset</span>
                            </Link>
                            <Link 
                                to="/transactions?action=checkout" 
                                className="flex items-center justify-center gap-2 border border-primary-600 text-primary-600 rounded-lg py-3 px-4 hover:bg-primary-50 transition-colors"
                            >
                                <HiOutlineArrowRight className="w-5 h-5" />
                                <span>Checkout</span>
                            </Link>
                            <Link 
                                to="/transactions?action=checkin" 
                                className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors"
                            >
                                <HiOutlineArrowLeft className="w-5 h-5" />
                                <span>Checkin</span>
                            </Link>
                            <Link 
                                to="/assets" 
                                className="flex items-center justify-center gap-2 bg-gray-600 text-white rounded-lg py-3 px-4 hover:bg-gray-700 transition-colors"
                            >
                                <HiOutlineClipboardList className="w-5 h-5" />
                                <span>Lihat Semua</span>
                            </Link>
                        </div>

                        {/* Warranty Alert */}
                        {stats?.expiring_warranty > 0 && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-800">
                                    <HiOutlineExclamationCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        {stats.expiring_warranty} aset memiliki garansi yang akan berakhir dalam 30 hari
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Transaksi Terbaru
                            </h2>
                            <Link 
                                to="/transactions" 
                                className="text-sm text-primary-600 hover:text-primary-700"
                            >
                                Lihat semua
                            </Link>
                        </div>

                        {recentTransactions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <HiOutlineClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                <p>Belum ada transaksi</p>
                                <p className="text-sm mt-1">Transaksi akan muncul di sini</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentTransactions.map((transaction) => (
                                    <div 
                                        key={transaction.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {transaction.asset?.name || 'Unknown Asset'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {transaction.asset?.asset_code} • {formatDateTime(transaction.transaction_date)}
                                            </p>
                                        </div>
                                        <TransactionTypeBadge type={transaction.type} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Assets by Category */}
                {stats?.by_category && stats.by_category.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Aset per Kategori
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {stats.by_category.map((cat) => (
                                <div 
                                    key={cat.category_id} 
                                    className="text-center p-4 bg-gray-50 rounded-lg"
                                >
                                    <p className="text-2xl font-bold text-gray-900">{cat.count}</p>
                                    <p className="text-sm text-gray-600 truncate">{cat.category_name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* System Info */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">
                        Terhubung sebagai: <span className="font-medium">{user?.email}</span> ({user?.role})
                    </p>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
