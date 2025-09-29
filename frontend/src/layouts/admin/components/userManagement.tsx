import { useState, useEffect } from 'react';
import { Search, Filter, Eye, UserX, CheckCircle, XCircle, X, ExternalLink } from 'lucide-react';
import { GetUsers, UpdateUserVerification, DeleteUser, } from "@/services/admin/adminService";
import type { User as UserType } from '@/services/admin/adminService';

const UsersManagement = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; type: string; title: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  // Fetch users from API
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await GetUsers(page);

      if (response.status !== 200) {
        throw new Error('Failed to fetch users');
      }

      const data = response.data;
      setUsers(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Toggle user verification status
  const toggleUserVerification = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newVerificationStatus = !user.is_verified;

      const response = await UpdateUserVerification(userId, newVerificationStatus);

      if (response.status === 200) {
        // Update local state
        setUsers(prev =>
          prev.map(user =>
            user.id === userId
              ? { ...user, is_verified: newVerificationStatus }
              : user
          )
        );

        // Update selected user if in modal
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, is_verified: newVerificationStatus } : null);
        }

        alert(`User ${newVerificationStatus ? 'verified' : 'unverified'} successfully`);
      }
    } catch (error) {
      console.error('Error updating user verification:', error);
      alert('Error updating user verification status');
    }
  };

  // Delete user
  const deleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await DeleteUser(userId);

      if (response.status === 200) {
        // Remove from local state
        setUsers(prev => prev.filter(user => user.id !== userId));

        // Close modals if deleted user is selected
        if (selectedUser?.id === userId) {
          setShowDetailsModal(false);
          setSelectedUser(null);
        }

        alert('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  // View user details
  const viewUserDetails = (user: UserType) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // View document
  const viewDocument = (documentUrl: string, documentType: string) => {
    const fullUrl = `http://127.0.0.1:8000/storage/${documentUrl}`;
    const title = documentType === 'student_card' ? 'Student Card' : 'Success Certificate';

    setSelectedDocument({
      url: fullUrl,
      type: documentType,
      title: title
    });
    setShowDocumentModal(true);
  };

  // Open document in new tab
  const openDocumentInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'verified' && user.is_verified) ||
      (selectedStatus === 'unverified' && !user.is_verified);
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cin.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesStatus && matchesSearch;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header avec titre et contrôles */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Total: {pagination.total} users
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or CIN..."
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
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">CIN / Phone</th>
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
                      <p className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.university && (
                        <p className="text-xs text-blue-600 mt-1">{user.university}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">
                      <p>CIN: {user.cin}</p>
                      <p>Phone: {user.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'student' ? 'bg-green-100 text-green-800' :
                      user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {user.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleUserVerification(user.id)}
                        className={`p-1 rounded transition-colors ${user.is_verified
                          ? 'text-yellow-600 hover:text-yellow-800'
                          : 'text-green-600 hover:text-green-800'
                          }`}
                        title={user.is_verified ? 'Unverify User' : 'Verify User'}
                      >
                        {user.is_verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Delete User"
                      >
                        <UserX className="w-4 h-4" />
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
                <h3 className="font-semibold text-gray-900 text-base">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                {user.university && (
                  <p className="text-xs text-blue-600 mb-2">{user.university}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'student' ? 'bg-green-100 text-green-800' :
                    user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                    }`}>
                    {user.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <p>CIN: {user.cin}</p>
              <p>Phone: {user.phone}</p>
              <p>Joined: {formatDate(user.created_at)}</p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <div className="flex space-x-2">
                <button
                  onClick={() => viewUserDetails(user)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleUserVerification(user.id)}
                  className={`p-1 rounded transition-colors ${user.is_verified
                    ? 'text-yellow-600 hover:text-yellow-800'
                    : 'text-green-600 hover:text-green-800'
                    }`}
                  title={user.is_verified ? 'Unverify User' : 'Verify User'}
                >
                  {user.is_verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                  title="Delete User"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => fetchUsers(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.last_page}
          </span>

          <button
            onClick={() => fetchUsers(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No users found</div>
          <div className="text-gray-500 text-sm">Try changing your filters or search term</div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <p className="text-gray-900">{selectedUser.first_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <p className="text-gray-900">{selectedUser.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">CIN</label>
                      <p className="text-gray-900">{selectedUser.cin}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <p className="text-gray-900">{selectedUser.address}</p>
                    </div>
                  </div>
                </div>

                {/* Role & Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.role === 'student' ? 'bg-green-100 text-green-800' :
                        selectedUser.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                          selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                        }`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {selectedUser.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Join Date</label>
                      <p className="text-gray-900">{formatDate(selectedUser.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Update</label>
                      <p className="text-gray-900">{formatDate(selectedUser.updated_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Student Documents */}
                {selectedUser.role === 'student' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Student Documents</h3>
                    <div className="space-y-3">
                      {selectedUser.university && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">University</label>
                          <p className="text-gray-900">{selectedUser.university}</p>
                        </div>
                      )}
                      {selectedUser.etudiant_card && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Student Card</p>
                            <p className="text-sm text-gray-600">Document verification</p>
                          </div>
                          <button
                            onClick={() => viewDocument(selectedUser.etudiant_card!, 'student_card')}
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-3 py-2 border border-blue-600 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">View Document</span>
                          </button>
                        </div>
                      )}
                      {selectedUser.etudiant_certif_success && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Success Certificate</p>
                            <p className="text-sm text-gray-600">Academic performance</p>
                          </div>
                          <button
                            onClick={() => viewDocument(selectedUser.etudiant_certif_success!, 'success_certificate')}
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-3 py-2 border border-blue-600 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">View Document</span>
                          </button>
                        </div>
                      )}
                      {!selectedUser.etudiant_card && !selectedUser.etudiant_certif_success && (
                        <p className="text-gray-500 text-sm">No documents uploaded</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      toggleUserVerification(selectedUser.id);
                      setShowDetailsModal(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-white transition-colors ${selectedUser.is_verified
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
                      }`}
                  >
                    {selectedUser.is_verified ? 'Unverify User' : 'Verify User'}
                  </button>
                  <button
                    onClick={() => deleteUser(selectedUser.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => openDocumentInNewTab(selectedDocument.url)}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-3 py-1 border border-blue-600 rounded transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Open in New Tab</span>
                </button>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4 h-full">
              <iframe
                src={selectedDocument.url}
                className="w-full h-96 border rounded-lg"
                title={selectedDocument.title}
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                If the document doesn't load, use the "Open in New Tab" button.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;