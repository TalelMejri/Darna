import { useState } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, UserX, UserCheck } from 'lucide-react';

const FeedBackAdmin = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student', status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'owner', status: 'pending', joinDate: '2024-01-14' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'non-student', status: 'active', joinDate: '2024-01-13' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'student', status: 'suspended', joinDate: '2024-01-12' },
  ]);

  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' }
        : user
    ));
  };

  const deleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Header avec titre et contrôles */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">FeedBack Management</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Manage all platform feedback</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex-1"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="non-student">Non-Student</option>
              <option value="owner">Owner</option>
            </select>
            
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex-1"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Join Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'student' ? 'bg-green-100 text-green-800' :
                      user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{user.joinDate}</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800 p-1 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-1 rounded transition-colors ${
                          user.status === 'suspended' 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-red-600 hover:text-red-800'
                        }`}
                      >
                        {user.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards mobile */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base">{user.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'student' ? 'bg-green-100 text-green-800' :
                    user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-sm text-gray-500">Joined: {user.joinDate}</span>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-800 p-1 rounded transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleUserStatus(user.id)}
                  className={`p-1 rounded transition-colors ${
                    user.status === 'suspended' 
                      ? 'text-green-600 hover:text-green-800' 
                      : 'text-red-600 hover:text-red-800'
                  }`}
                >
                  {user.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No users found</div>
          <div className="text-gray-500 text-sm">Try changing your filters or search term</div>
        </div>
      )}
    </div>
  );
};

export default FeedBackAdmin;