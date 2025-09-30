// components/AnnonceDetailModal.tsx
import { X, MapPin, Home, Wifi, Car, Utensils, Box } from 'lucide-react';
import type { Annonce } from '@/services/owner/ownerService';

interface AnnonceDetailModalProps {
    annonce: Annonce;
    onClose: () => void;
}

const AnnonceDetailModal = ({ annonce, onClose }: AnnonceDetailModalProps) => {
    const getPhotoUrl = (photoPath: string) => {
        if (photoPath.startsWith('http')) {
            return photoPath;
        }
        return `http://127.0.0.1:8000/storage/${photoPath}`;
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Property Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status */}
                    <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(annonce.status)}`}>
                            {annonce.status.charAt(0).toUpperCase() + annonce.status.slice(1)}
                        </span>
                        <p className="text-sm text-gray-500">
                            Created: {new Date(annonce.created_at).toLocaleDateString('fr-FR')}
                        </p>
                    </div>

                    {/* Photos */}
                    {annonce.photos && annonce.photos.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {annonce.photos.map((photo, index) => (
                                    <img
                                        key={photo.id}
                                        src={getPhotoUrl(photo.photo_path)}
                                        alt={`${annonce.title} - Photo ${index + 1}`}
                                        className="w-full h-48 object-cover rounded-lg"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-gray-700">Title</h4>
                                <p className="text-gray-900">{annonce.title}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Property Type</h4>
                                <p className="text-gray-900 capitalize">{annonce.type}</p>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="font-medium text-gray-700">Description</h4>
                                <p className="text-gray-900 whitespace-pre-line">{annonce.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                        <div className="flex items-start space-x-2">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-gray-900">{annonce.address}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Coordinates: {Number(annonce.latitude).toFixed(6)}, {Number(annonce.longitude).toFixed(6)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <h4 className="font-medium text-gray-700">Price</h4>
                                <p className="text-gray-900">{annonce.price}€/month</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Surface</h4>
                                <p className="text-gray-900">{annonce.surface}m²</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Rooms</h4>
                                <p className="text-gray-900">{annonce.rooms}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Bathrooms</h4>
                                <p className="text-gray-900">{annonce.bathrooms}</p>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                                <Box className={`w-5 h-5 ${annonce.is_furnished ? 'text-green-500' : 'text-gray-300'}`} />
                                <span className={annonce.is_furnished ? 'text-gray-900' : 'text-gray-400'}>Furnished</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Utensils className={`w-5 h-5 ${annonce.has_kitchen ? 'text-green-500' : 'text-gray-300'}`} />
                                <span className={annonce.has_kitchen ? 'text-gray-900' : 'text-gray-400'}>Kitchen</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Wifi className={`w-5 h-5 ${annonce.has_wifi ? 'text-green-500' : 'text-gray-300'}`} />
                                <span className={annonce.has_wifi ? 'text-gray-900' : 'text-gray-400'}>WiFi</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Car className={`w-5 h-5 ${annonce.has_parking ? 'text-green-500' : 'text-gray-300'}`} />
                                <span className={annonce.has_parking ? 'text-gray-900' : 'text-gray-400'}>Parking</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-gray-700">Roommate Gender Preference</h4>
                                <p className="text-gray-900 capitalize">{annonce.roommate_gender_preference || 'Any'}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Available From</h4>
                                <p className="text-gray-900">{new Date(annonce.available_from).toLocaleDateString('fr-FR')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnonceDetailModal;