import { NavLink } from 'react-router-dom';
import { Users, Home, Flag, MessageSquare, BarChart3, Settings, X, Calendar } from 'lucide-react';

interface AdminSidebarProps {
  onClose?: () => void;
}

const AdminSidebar = ({ onClose }: AdminSidebarProps) => {
  const menuItems = [
    { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/annonces', icon: Calendar, label: 'Annonces' },
    { path: '/admin/reports', icon: Flag, label: 'Reports' },
    { path: '/admin/feedbacks', icon: MessageSquare, label: 'Feedbacks' },
  ];

  return (
    <div className="w-64 bg-white h-screen flex flex-col">
      {/* Header avec bouton fermer pour mobile */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
          <p className="text-xs text-gray-600 hidden lg:block">Darna Platform</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;