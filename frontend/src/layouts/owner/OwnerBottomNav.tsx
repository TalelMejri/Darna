import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, List, User ,LucideAlignVerticalDistributeCenter} from 'lucide-react';

const OwnerBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/owner/annonces',
      icon: List,
      label: 'Properties',
      active: location.pathname === '/owner/annonces'
    },
    {
      path: '/owner/reservations',
      //icon for reservations
      icon: LucideAlignVerticalDistributeCenter,
      label: 'Reservations',
      active: location.pathname === '/owner/reservations'
    },
    {
      path: '/owner/profile',
      icon: User,
      label: 'Profile',
      active: location.pathname === '/owner/profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                item.active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OwnerBottomNav;