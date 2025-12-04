import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    HiOutlineMenu,
    HiOutlineBell,
    HiOutlineUser,
    HiOutlineLogout,
    HiOutlineCog
} from 'react-icons/hi';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'staff':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4">
                {/* Left side - Menu button (mobile) */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                    <HiOutlineMenu className="w-6 h-6 text-gray-600" />
                </button>

                {/* Left side - Title (desktop) */}
                <div className="hidden lg:block">
                    <h1 className="text-lg font-semibold text-gray-800">
                        IT Asset Management
                    </h1>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg hover:bg-gray-100">
                        <HiOutlineBell className="w-6 h-6 text-gray-600" />
                        {/* Notification badge */}
                        {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
                    </button>

                    {/* User dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <HiOutlineUser className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-800">
                                    {user?.name || 'User'}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                                    {user?.role || 'Guest'}
                                </span>
                            </div>
                        </button>

                        {/* Dropdown menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-800">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user?.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        // Navigate to settings if implemented
                                    }}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <HiOutlineCog className="w-4 h-4" />
                                    <span>Settings</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <HiOutlineLogout className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
