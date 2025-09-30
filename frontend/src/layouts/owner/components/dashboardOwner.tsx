import { useState, useEffect } from 'react';
import { Plus, Home, CheckCircle, Clock, XCircle, Edit, Trash2, Eye } from 'lucide-react';
import { getMyAnnonces, getDashboardStats, deleteAnnonce, } from '@/services/owner/ownerService';
import EditAnnonceModal from './EditAnnonceModal';
import type { Annonce, DashboardStats } from '@/services/owner/ownerService';
import CreateAnnonceModal from './createAnnonce';
const OwnerDashboard = () => {
    const [annonces, setAnnonces] = useState<Annonce[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAnnonce, setEditingAnnonce] = useState<Annonce | null>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });

    // Load data
    const loadData = async (page = 1) => {
        setLoading(true);
        try {
            const [annoncesResponse, statsResponse] = await Promise.all([
                getMyAnnonces(page),
                getDashboardStats()
            ]);

            if (annoncesResponse.status === 200) {
                const annoncesData = annoncesResponse.data;
                setAnnonces(annoncesData.data);
                setPagination({
                    current_page: annoncesData.current_page,
                    last_page: annoncesData.last_page,
                    per_page: annoncesData.per_page,
                    total: annoncesData.total
                });
            }

            if (statsResponse.status === 200) {
                setStats(statsResponse.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handle delete annonce
    const handleDeleteAnnonce = async (annonceId: number) => {
        if (!window.confirm('Are you sure you want to delete this annonce? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await deleteAnnonce(annonceId);
            if (response.status === 200) {
                setAnnonces(prev => prev.filter(a => a.id !== annonceId));
                loadData(); // Reload stats
                alert('Annonce deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting annonce:', error);
            alert('Error deleting annonce');
        }
    };

    // Handle annonce created/updated
    const handleAnnonceSaved = () => {
        setShowCreateModal(false);
        setEditingAnnonce(null);
        loadData(); // Reload data
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
                    <p className="text-gray-600 mt-1">Manage your rental properties</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Property</span>
                </button>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center space-x-3">
                            <Home className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_annonces}</p>
                                <p className="text-sm text-gray-600">Total Properties</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.approved_annonces}</p>
                                <p className="text-sm text-gray-600">Approved</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center space-x-3">
                            <Clock className="w-8 h-8 text-yellow-600" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending_annonces}</p>
                                <p className="text-sm text-gray-600">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center space-x-3">
                            <XCircle className="w-8 h-8 text-red-600" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.rejected_annonces}</p>
                                <p className="text-sm text-gray-600">Rejected</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Properties List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">My Properties</h2>
                </div>

                {annonces.length === 0 ? (
                    <div className="text-center py-12">
                        <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                        <p className="text-gray-600 mb-4">Start by adding your first rental property</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add Your First Property
                        </button>
                    </div>
                ) : (
                    <div className="divide-y">
                        {annonces.map((annonce) => (
                            <div key={annonce.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start space-x-4">
                                            {annonce.main_photo && (
                                                <img
                                                    src={`http://127.0.0.1:8000/storage/${annonce.main_photo.photo_path}`}
                                                    alt={annonce.title}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{annonce.title}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(annonce.status)}`}>
                                                        {getStatusIcon(annonce.status)}
                                                        <span className="capitalize">{annonce.status}</span>
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mb-2 line-clamp-2">{annonce.description}</p>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    <span>{annonce.address}</span>
                                                    <span>{annonce.price}€/month</span>
                                                    <span>{annonce.surface}m²</span>
                                                    <span>{annonce.rooms} rooms</span>
                                                    <span>{annonce.type}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Available from: {new Date(annonce.available_from).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 mt-4 lg:mt-0">
                                        <button
                                            onClick={() => window.open(`/annonces/${annonce.id}`, '_blank')}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingAnnonce(annonce)}
                                            className="text-green-600 hover:text-green-800 p-2 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAnnonce(annonce.id)}
                                            className="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {pagination.last_page > 1 && (
                <div className="flex justify-center items-center space-x-2">
                    <button
                        onClick={() => loadData(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                        onClick={() => loadData(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateAnnonceModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleAnnonceSaved}
                />
            )}

            {editingAnnonce && (
                <EditAnnonceModal
                    annonce={editingAnnonce}
                    onClose={() => setEditingAnnonce(null)}
                    onSave={handleAnnonceSaved}
                />
            )}
        </div>
    );
};

export default OwnerDashboard;