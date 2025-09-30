import { Search, Bell, User, Menu, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/AuthStore/AuthContext';

interface OwnerHeaderProps {
    onMenuClick: () => void;
}

const OwnerHeader = ({ onMenuClick }: OwnerHeaderProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { LogoutUser, user } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        LogoutUser();
        localStorage.removeItem('token');
        setIsDropdownOpen(false);
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b px-4 sm:px-6 py-4 lg:ml-64"> {/* Margin for desktop sidebar */}
            <div className="flex items-center justify-between">
                {/* Bouton menu mobile */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex-1 flex justify-end lg:justify-between items-center space-x-4">
                    {/* Titre - caché sur mobile petit */}
                    <h1 className="hidden lg:block text-xl font-semibold text-gray-900">
                        Owner Dashboard
                    </h1>

                    <div className="flex items-center space-x-3">
                        {/* Search bar - cachée sur mobile très petit */}
                        <div className="hidden sm:block relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-48 lg:w-64"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Profile avec dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-gray-700">
                                    {user?.name} {user?.name}
                                </span>
                            </button>

                            {/* Dropdown menu du profil */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-600">{user?.email}</p>
                                    </div>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 mr-3" />
                                        Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default OwnerHeader;