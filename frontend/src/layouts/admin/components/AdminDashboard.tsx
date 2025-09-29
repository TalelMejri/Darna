import { useState } from 'react';
import {
  Users,
  Home,
  Flag,
  MessageSquare,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  ThumbsUp,
  Star,
} from 'lucide-react';

import type {
  LucideIcon
} from 'lucide-react';

// Définition des types
interface GrowthData {
  value: number;
  trend: 'up' | 'down';
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  growth?: GrowthData;
  className?: string;
}

const StatCard = ({ icon: Icon, label, value, growth, className = '' }: StatCardProps) => {
  const TrendIcon = growth?.trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {growth && (
            <div className={`flex items-center mt-2 text-xs sm:text-sm ${growth.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
              <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span>{growth.value}% this month</span>
            </div>
          )}
        </div>
        <div className="p-2 sm:p-3 bg-blue-50 rounded-lg ml-3 flex-shrink-0">
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');

  // Données statistiques
  const platformStats = {
    totalUsers: 1247,
    totalProperties: 563,
    totalReservations: 892,
    totalRevenue: 125430,
    activeListings: 423,
    pendingApprovals: 34,
    reportedContent: 67,
    averageRating: 4.7
  };

  const growthMetrics: Record<string, GrowthData> = {
    users: { value: 12.5, trend: 'up' },
    properties: { value: 8.3, trend: 'up' },
    reservations: { value: 15.2, trend: 'up' },
    revenue: { value: 22.1, trend: 'up' }
  };

  const userDistribution = [
    { role: 'Students', count: 645, percentage: 52, color: 'bg-green-500' },
    { role: 'Non-Students', count: 328, percentage: 26, color: 'bg-blue-500' },
    { role: 'Owners', count: 247, percentage: 20, color: 'bg-purple-500' },
    { role: 'Admins', count: 27, percentage: 2, color: 'bg-gray-500' }
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Registered as Student', time: '2 min ago', type: 'user' },
    { id: 2, user: 'Jane Smith', action: 'Listed new property', time: '5 min ago', type: 'property' },
    { id: 3, user: 'Mike Johnson', action: 'Made a reservation', time: '10 min ago', type: 'reservation' },
    { id: 4, user: 'Sarah Wilson', action: 'Left a 5-star review', time: '15 min ago', type: 'feedback' },
    { id: 5, user: 'Admin', action: 'Approved pending property', time: '20 min ago', type: 'admin' }
  ];

  const topProperties = [
    { id: 1, title: 'Modern Apartment Downtown', owner: 'Jane Smith', bookings: 45, rating: 4.9, revenue: 54000 },
    { id: 2, title: 'Cozy Studio Near Campus', owner: 'John Doe', bookings: 38, rating: 4.8, revenue: 30400 },
    { id: 3, title: 'Luxury Villa Beachfront', owner: 'Mike Johnson', bookings: 22, rating: 4.7, revenue: 55000 }
  ];

  const performanceMetrics = [
    { label: 'Conversion Rate', value: '3.2%', trend: 'up' as const, change: '+0.4%' },
    { label: 'Avg. Response Time', value: '2.4h', trend: 'down' as const, change: '-0.3h' },
    { label: 'User Satisfaction', value: '94%', trend: 'up' as const, change: '+2%' },
    { label: 'Platform Uptime', value: '99.9%', trend: 'stable' as const, change: '0%' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">Platform overview and analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 3 months</option>
                <option value="year">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={platformStats.totalUsers.toLocaleString()}
            growth={growthMetrics.users}
          />
          <StatCard
            icon={Home}
            label="Properties"
            value={platformStats.totalProperties.toLocaleString()}
            growth={growthMetrics.properties}
          />
          <StatCard
            icon={Calendar}
            label="Reservations"
            value={platformStats.totalReservations.toLocaleString()}
            growth={growthMetrics.reservations}
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`$${platformStats.totalRevenue.toLocaleString()}`}
            growth={growthMetrics.revenue}
          />
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={Eye}
            label="Active Listings"
            value={platformStats.activeListings.toLocaleString()}
          />
          <StatCard
            icon={Flag}
            label="Pending Approvals"
            value={platformStats.pendingApprovals.toLocaleString()}
            className="bg-yellow-50 border-yellow-200"
          />
          <StatCard
            icon={MessageSquare}
            label="Reports"
            value={platformStats.reportedContent.toLocaleString()}
            className="bg-red-50 border-red-200"
          />
          <StatCard
            icon={Star}
            label="Avg. Rating"
            value={platformStats.averageRating}
            className="bg-green-50 border-green-200"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* User Distribution & Performance Metrics */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
              <div className="space-y-3 sm:space-y-4">
                {userDistribution.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.role}</span>
                      <span className="text-sm text-gray-600">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-3 sm:space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{metric.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 text-sm">{metric.value}</span>
                      <span className={`text-xs ${metric.trend === 'up' ? 'text-green-600' :
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity & Top Properties */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'user' ? 'bg-green-100' :
                        activity.type === 'property' ? 'bg-blue-100' :
                          activity.type === 'reservation' ? 'bg-purple-100' :
                            activity.type === 'feedback' ? 'bg-yellow-100' :
                              'bg-gray-100'
                      }`}>
                      {activity.type === 'user' && <Users className="w-4 h-4 text-green-600" />}
                      {activity.type === 'property' && <Home className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'reservation' && <Calendar className="w-4 h-4 text-purple-600" />}
                      {activity.type === 'feedback' && <ThumbsUp className="w-4 h-4 text-yellow-600" />}
                      {activity.type === 'admin' && <BarChart3 className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Properties */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Properties</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {topProperties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{property.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">by {property.owner}</p>
                      <div className="flex items-center space-x-2 sm:space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{property.bookings} bookings</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{property.rating}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <p className="font-semibold text-green-600 text-sm sm:text-base">${property.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
            <div className="text-xl sm:text-2xl font-bold">{Math.round((platformStats.totalReservations / platformStats.totalUsers) * 100)}%</div>
            <div className="text-xs sm:text-sm opacity-90">Booking Rate</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 sm:p-6 text-white">
            <div className="text-xl sm:text-2xl font-bold">${Math.round(platformStats.totalRevenue / platformStats.totalReservations)}</div>
            <div className="text-xs sm:text-sm opacity-90">Avg. Booking Value</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
            <div className="text-xl sm:text-2xl font-bold">{Math.round((platformStats.activeListings / platformStats.totalProperties) * 100)}%</div>
            <div className="text-xs sm:text-sm opacity-90">Listing Activity</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 text-white">
            <div className="text-xl sm:text-2xl font-bold">24h</div>
            <div className="text-xs sm:text-sm opacity-90">Avg. Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;