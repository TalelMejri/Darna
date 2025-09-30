// layouts/user/UserLayout.tsx
import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Heart, 
  MessageSquare, 
  User, 
  Settings,
  Menu,
  X,
  Bell,
  LogOut,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/AuthStore/AuthContext';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/services/notifService';

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { LogoutUser, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard', icon: Home },
    { name: 'Browse Properties', href: '/user/properties', icon: Search },
    { name: 'Favorites', href: '/user/favorites', icon: Heart },
    { name: 'Messages', href: '/user/messages', icon: MessageSquare },
    { name: 'My Reservations', href: '/user/reservations', icon: User },
    { name: 'Settings', href: '/user/settings', icon: Settings },
  ];

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isNotificationsOpen) {
      loadNotifications();
    }
  }, [isNotificationsOpen]);

  // Gestion des clics en dehors des dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
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

  const handleEditProfile = () => {
    navigate('/user/settings');
    setIsDropdownOpen(false);
  };

  // Gestion des notifications
  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notification.id ? { ...notif, is_read: true } : notif
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

    return date.toLocaleDateString('fr-FR');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Mail className="w-4 h-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(notif => !notif.is_read).length;
  const currentPage = navigation.find(item => item.href === location.pathname)?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">RentalApp</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`mr-4 h-6 w-6 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">RentalApp</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top header - Style Admin */}
        <header className="bg-white shadow-sm border-b px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Bouton menu mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 flex justify-end lg:justify-between items-center space-x-4">
              <h1 className="hidden lg:block text-xl font-semibold text-gray-900">
                {currentPage}
              </h1>

              <div className="flex items-center space-x-3">
                {/* Notifications avec dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {/* Dropdown des notifications */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-hidden flex flex-col">
                      {/* En-tête des notifications */}
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                              disabled={loading}
                            >
                              Tout marquer comme lu
                            </button>
                          )}
                          <button
                            onClick={loadNotifications}
                            className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                            disabled={loading}
                          >
                            {loading ? '...' : 'Actualiser'}
                          </button>
                        </div>
                      </div>

                      {/* Liste des notifications */}
                      <div className="overflow-y-auto flex-1">
                        {loading ? (
                          <div className="flex justify-center items-center py-8">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`relative group border-b border-gray-50 last:border-b-0 ${
                                !notification.is_read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <button
                                onClick={() => handleNotificationClick(notification)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatRelativeTime(notification.created_at)}
                                    </p>
                                  </div>
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                  )}
                                </div>
                              </button>

                              {/* Bouton supprimer */}
                              <button
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Supprimer la notification"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Aucune notification</p>
                          </div>
                        )}
                      </div>

                      {/* Pied des notifications */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500 text-center">
                            {unreadCount} non lue{unreadCount > 1 ? 's' : ''} • {notifications.length} total
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile avec dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-700">
                        {user?.name || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.role === 'student' ? 'Étudiant' : 'Utilisateur'}
                      </p>
                    </div>
                  </button>

                  {/* Dropdown menu du profil */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={handleEditProfile}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Éditer le profil
                      </button>
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

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;