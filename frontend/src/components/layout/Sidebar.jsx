import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    HiOutlineHome,
    HiOutlineDesktopComputer,
    HiOutlineSwitchHorizontal,
    HiOutlineTag,
    HiOutlineLocationMarker,
    HiOutlineUsers,
    HiOutlineX
} from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const location = useLocation();

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/',
            icon: HiOutlineHome,
            roles: ['admin', 'staff']
        },
        {
            name: 'Assets',
            path: '/assets',
            icon: HiOutlineDesktopComputer,
            roles: ['admin', 'staff']
        },
        {
            name: 'Transactions',
            path: '/transactions',
            icon: HiOutlineSwitchHorizontal,
            roles: ['admin', 'staff']
        },
        {
            name: 'Categories',
            path: '/master/categories',
            icon: HiOutlineTag,
            roles: ['admin']
        },
        {
            name: 'Locations',
            path: '/master/locations',
            icon: HiOutlineLocationMarker,
            roles: ['admin']
        },
        {
            name: 'Users',
            path: '/master/users',
            icon: HiOutlineUsers,
            roles: ['admin']
        }
    ];

    // Filter menu items based on user role
    const filteredMenuItems = menuItems.filter(
        item => item.roles.includes(user?.role)
    );

    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <HiOutlineDesktopComputer className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-800">ITAM</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
                    >
                        <HiOutlineX className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {filteredMenuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`
                                flex items-center space-x-3 px-4 py-3 rounded-lg
                                transition-colors duration-200
                                ${isActivePath(item.path)
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        IT Asset Management v1.0
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
