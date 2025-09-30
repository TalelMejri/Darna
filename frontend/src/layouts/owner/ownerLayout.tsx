import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import OwnerHeader from './OwnerHeader';
import OwnerBottomNav from './OwnerBottomNav';

const OwnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16"> {/* Padding bottom for mobile nav */}
      {/* Header */}
      <OwnerHeader onMenuClick={() => setSidebarOpen(true)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <div className="lg:hidden">
        <OwnerBottomNav />
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Owner Portal</h1>
        </div>
        <nav className="mt-6">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              location.pathname === '/owner/dashboard'
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/owner/annonces')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              location.pathname === '/owner/annonces'
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="font-medium">My Properties</span>
          </button>
          <button
            onClick={() => navigate('/owner/reservations')}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
              location.pathname === '/owner/reservations'
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="font-medium">Reservations</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default OwnerLayout;