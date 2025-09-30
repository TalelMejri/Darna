   
// pages/user/UserDashboard.tsx
import { Link } from 'react-router-dom';
import { Search, Heart, Calendar, MessageSquare, TrendingUp } from 'lucide-react';

const UserDashboard = () => {
  const quickActions = [
    {
      name: 'Browse Properties',
      description: 'Find your perfect home',
      href: '/user/properties',
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'My Favorites',
      description: 'View saved properties',
      href: '/user/favorites',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      name: 'Reservations',
      description: 'Manage your bookings',
      href: '/user/reservations',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Messages',
      description: 'Contact property owners',
      href: '/user/messages',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
            <p className="text-gray-600 mt-1">Ready to find your next home?</p>
          </div>
          <Link
            to="/user/properties"
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Searching
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              to={action.href}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${action.bgColor}`}>
                  <Icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{action.name}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Browse Properties Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Find Your Perfect Home</h2>
            <p className="text-gray-600 mt-1">Browse through our available properties</p>
          </div>
          <TrendingUp className="w-6 h-6 text-green-500" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Why start your search now?</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                New properties added daily
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Competitive prices in great locations
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Verified property owners
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/user/properties"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">Browse All Properties</span>
            </Link>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Use our advanced filters to find exactly what you're looking for
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;