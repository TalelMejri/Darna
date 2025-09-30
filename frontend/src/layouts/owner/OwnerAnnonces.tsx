import { useState, useEffect } from 'react';
import { Plus, Home, CheckCircle, Clock, XCircle, Edit, Trash2, Eye } from 'lucide-react';
import { getMyAnnonces, deleteAnnonce, getAnnonceDetails } from '@/services/owner/ownerService';
import CreateAnnonceModal from './components/createAnnonce';
import EditAnnonceModal from './components/EditAnnonceModal';
import AnnonceDetailModal from './components/AnnonceDetailModal';
import type { Annonce } from '@/services/owner/ownerService';

const OwnerAnnonces = () => {
    const [annonces, setAnnonces] = useState<Annonce[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAnnonce, setEditingAnnonce] = useState<Annonce | null>(null);
    const [viewingAnnonce, setViewingAnnonce] = useState<Annonce | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });

    // Load annonces
    const loadAnnonces = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getMyAnnonces(page);
            if (response.status === 200) {
                const annoncesData = response.data;
                setAnnonces(annoncesData.data || []);
                setPagination({
                    current_page: annoncesData.current_page || 1,
                    last_page: annoncesData.last_page || 1,
                    per_page: annoncesData.per_page || 10,
                    total: annoncesData.total || 0
                });
            }
        } catch (error) {
            console.error('Error loading annonces:', error);
            alert('Error loading properties');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnnonces();
    }, []);

    // Handle delete annonce
    const handleDeleteAnnonce = async (annonceId: number) => {
        if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await deleteAnnonce(annonceId);
            if (response.status === 200) {
                setAnnonces(prev => prev.filter(a => a.id !== annonceId));
                alert('Property deleted successfully');
            }
        } catch (error: any) {
            console.error('Error deleting property:', error);
            if (error.response?.status === 404) {
                alert('Property not found. It may have been already deleted.');
                loadAnnonces(); // Reload to sync
            } else if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Error deleting property');
            }
        }
    };

    // Handle view annonce details
    const handleViewAnnonce = async (annonceId: number) => {
        setDetailLoading(true);
        try {
            const response = await getAnnonceDetails(annonceId);
            if (response.status === 200) {
                setViewingAnnonce(response.data);
            }
        } catch (error: any) {
            console.error('Error loading property details:', error);
            if (error.response?.status === 404) {
                alert('Property not found');
            } else {
                alert('Error loading property details');
            }
        } finally {
            setDetailLoading(false);
        }
    };

    // Handle annonce created/updated
    const handleAnnonceSaved = () => {
        setShowCreateModal(false);
        setEditingAnnonce(null);
        loadAnnonces(pagination.current_page); // Reload current page
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

    const getPhotoUrl = (photoPath: string) => {
        if (photoPath.startsWith('http')) {
            return photoPath;
        }
        return `http://127.0.0.1:8000/storage/${photoPath}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading properties...</p>
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
                    <p className="text-gray-600 mt-1">Manage all your rental properties</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Property</span>
                </button>
            </div>

            {/* Properties List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        All Properties ({pagination.total})
                    </h2>
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
                                            {annonce.photos && annonce.photos.length > 0 ? (
                                                <img
                                                    src={getPhotoUrl(annonce.photos[0].photo_path)}
                                                    alt={annonce.title}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <Home className="w-8 h-8 text-gray-400" />
                                                </div>
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
                                                    <span className="capitalize">{annonce.type}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Available from: {new Date(annonce.available_from).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 mt-4 lg:mt-0">
                                        <button
                                            onClick={() => handleViewAnnonce(annonce.id)}
                                            disabled={detailLoading}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors disabled:opacity-50"
                                            title="View Details"
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

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="flex justify-center items-center space-x-2">
                    <button
                        onClick={() => loadAnnonces(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                        onClick={() => loadAnnonces(pagination.current_page + 1)}
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

            {viewingAnnonce && (
                <AnnonceDetailModal
                    annonce={viewingAnnonce}
                    onClose={() => setViewingAnnonce(null)}
                />
            )}
        </div>
    );
};

export default OwnerAnnonces;