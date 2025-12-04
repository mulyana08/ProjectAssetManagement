import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Auth Pages
import Login from '../pages/auth/Login';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Assets Pages
import { AssetList, AssetForm, AssetDetail } from '../pages/assets';

// Transaction Pages
import { 
    TransactionList, 
    CheckoutForm, 
    CheckinForm, 
    RepairForm, 
    RelocateForm 
} from '../pages/transactions';

// Master Data Pages
import { CategoryList, LocationList, UserList } from '../pages/masterdata';

// Other Pages
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />

            {/* Assets */}
            <Route
                path="/assets"
                element={
                    <PrivateRoute>
                        <AssetList />
                    </PrivateRoute>
                }
            />
            <Route
                path="/assets/add"
                element={
                    <PrivateRoute>
                        <AssetForm />
                    </PrivateRoute>
                }
            />
            <Route
                path="/assets/:id"
                element={
                    <PrivateRoute>
                        <AssetDetail />
                    </PrivateRoute>
                }
            />
            <Route
                path="/assets/:id/edit"
                element={
                    <PrivateRoute>
                        <AssetForm />
                    </PrivateRoute>
                }
            />

            {/* Transactions */}
            <Route
                path="/transactions"
                element={
                    <PrivateRoute>
                        <TransactionList />
                    </PrivateRoute>
                }
            />
            <Route
                path="/transactions/checkout"
                element={
                    <PrivateRoute>
                        <CheckoutForm />
                    </PrivateRoute>
                }
            />
            <Route
                path="/transactions/checkin"
                element={
                    <PrivateRoute>
                        <CheckinForm />
                    </PrivateRoute>
                }
            />
            <Route
                path="/transactions/repair"
                element={
                    <PrivateRoute>
                        <RepairForm />
                    </PrivateRoute>
                }
            />
            <Route
                path="/transactions/relocate"
                element={
                    <PrivateRoute>
                        <RelocateForm />
                    </PrivateRoute>
                }
            />

            {/* Master Data - Admin Only */}
            <Route
                path="/master/categories"
                element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <CategoryList />
                    </PrivateRoute>
                }
            />
            <Route
                path="/master/locations"
                element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <LocationList />
                    </PrivateRoute>
                }
            />
            <Route
                path="/master/users"
                element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <UserList />
                    </PrivateRoute>
                }
            />

            {/* Unauthorized */}
            <Route
                path="/unauthorized"
                element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-800">403</h1>
                            <p className="text-gray-600 mt-2">Anda tidak memiliki akses ke halaman ini.</p>
                        </div>
                    </div>
                }
            />

            {/* 404 Not Found */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
};

export default AppRoutes;
