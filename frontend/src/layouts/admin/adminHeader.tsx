import { useAuth } from '@/AuthStore/AuthContext';
import { Search, Bell, User, Menu, LogOut, Settings, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import ajouté

interface AdminHeaderProps {
  onMenuClick: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // Hook de navigation

  // Données de démonstration pour les notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Nouvel utilisateur',
      message: 'John Doe s\'est inscrit sur la plateforme',
      time: 'Il y a 5 min',
      type: 'info',
      read: false
    },
    {
      id: 2,
      title: 'Paiement réussi',
      message: 'Paiement de 150€ traité avec succès',
      time: 'Il y a 1 heure',
      type: 'success',
      read: false
    },
    {
      id: 3,
      title: 'Alerte système',
      message: 'Haute utilisation du CPU détectée',
      time: 'Il y a 2 heures',
      type: 'warning',
      read: true
    },
    {
      id: 4,
      title: 'Message reçu',
      message: 'Vous avez un nouveau message de support',
      time: 'Il y a 3 heures',
      type: 'info',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(notif => !notif.read).length;

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

  const { LogoutUser } = useAuth();

  const handleLogout = () => {
    LogoutUser();
    localStorage.removeItem('token');
    setIsDropdownOpen(false);
    navigate('/login'); // Redirection vers la page de login
  };

  const handleEditProfile = () => {
    console.log('Édition du profil...');
    setIsDropdownOpen(false);
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Mail className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Bouton menu mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1 flex justify-end lg:justify-between items-center space-x-4">
          <h1 className="hidden lg:block text-xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>

          <div className="flex items-center space-x-3">
            {/* Bouton search mobile */}
            <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="w-4 h-4 text-gray-600" />
            </button>

            {/* Notifications avec dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-4 h-4" />
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
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>

                  {/* Liste des notifications */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!notification.read ? 'bg-blue-50' : ''
                            }`}
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
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucune notification</p>
                      </div>
                    )}
                  </div>

                  {/* Pied des notifications */}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2 transition-colors">
                      Voir toutes les notifications
                    </button>
                  </div>
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
                <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
              </button>

              {/* Dropdown menu du profil */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
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

export default AdminHeader;