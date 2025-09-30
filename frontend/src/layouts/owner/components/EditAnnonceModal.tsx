import { useState, useEffect } from 'react';
import { X, Upload, MapPin } from 'lucide-react';
import { updateAnnonce } from '@/services/owner/ownerService';
import type { Annonce } from '@/services/owner/ownerService';

interface EditAnnonceModalProps {
    annonce: Annonce;
    onClose: () => void;
    onSave: () => void;
}

const EditAnnonceModal = ({ annonce, onClose, onSave }: EditAnnonceModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: annonce.title,
        description: annonce.description,
        address: annonce.address,
        latitude: annonce.latitude,
        longitude: annonce.longitude,
        price: annonce.price.toString(),
        surface: annonce.surface.toString(),
        rooms: annonce.rooms.toString(),
        bathrooms: annonce.bathrooms.toString(),
        type: annonce.type,
        is_furnished: annonce.is_furnished,
        has_kitchen: annonce.has_kitchen,
        has_wifi: annonce.has_wifi,
        has_parking: annonce.has_parking,
        roommate_gender_preference: annonce.roommate_gender_preference || 'any',
        available_from: annonce.available_from.split('T')[0],
    });
    const [photos, setPhotos] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setFormData({
            title: annonce.title,
            description: annonce.description,
            address: annonce.address,
            latitude: annonce.latitude,
            longitude: annonce.longitude,
            price: annonce.price.toString(),
            surface: annonce.surface.toString(),
            rooms: annonce.rooms.toString(),
            bathrooms: annonce.bathrooms.toString(),
            type: annonce.type,
            is_furnished: annonce.is_furnished,
            has_kitchen: annonce.has_kitchen,
            has_wifi: annonce.has_wifi,
            has_parking: annonce.has_parking,
            roommate_gender_preference: annonce.roommate_gender_preference || 'any',
            available_from: annonce.available_from.split('T')[0],
        });
    }, [annonce]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newPhotos = Array.from(e.target.files);
            if (photos.length + newPhotos.length > 10) {
                alert('Maximum 10 photos allowed');
                return;
            }
            setPhotos(prev => [...prev, ...newPhotos]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        const newErrors: Record<string, string> = {};
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.price) newErrors.price = 'Price is required';
        if (!formData.surface) newErrors.surface = 'Surface is required';
        if (!formData.rooms) newErrors.rooms = 'Number of rooms is required';
        if (!formData.bathrooms) newErrors.bathrooms = 'Number of bathrooms is required';
        if (!formData.available_from) newErrors.available_from = 'Available date is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            const submitData = new FormData();

            // Append form data - conversion correcte des types
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof typeof formData];
                
                if (value !== null && value !== undefined) {
                    // Conversion spéciale pour les champs boolean
                    if (['is_furnished', 'has_kitchen', 'has_wifi', 'has_parking'].includes(key)) {
                        // Envoyer comme '1' ou '0' pour Laravel
                        submitData.append(key, value ? '1' : '0');
                    } else if (['latitude', 'longitude'].includes(key)) {
                        // Conversion en number pour les coordonnées
                        submitData.append(key, value.toString());
                    } else {
                        submitData.append(key, value.toString());
                    }
                }
            });

            // Append photos if new ones are added
            photos.forEach(photo => {
                submitData.append('photos[]', photo);
            });

            // Use POST method with _method parameter for Laravel
            submitData.append('_method', 'PUT');

            const response = await updateAnnonce(annonce.id, submitData);

            if (response.status === 200) {
                onSave();
                alert('Annonce updated successfully and is pending re-approval!');
            }
        } catch (error: any) {
            console.error('Error updating annonce:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Error updating annonce. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Edit Property</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Beautiful apartment in city center"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Type *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="apartment">Apartment</option>
                                    <option value="studio">Studio</option>
                                    <option value="house">House</option>
                                    <option value="room">Room</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Describe your property in detail..."
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Full address of the property"
                                    />
                                </div>
                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="35.6895"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="139.6917"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (€/month) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="500"
                                />
                                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Surface (m²) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.surface}
                                    onChange={(e) => handleInputChange('surface', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.surface ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="50"
                                />
                                {errors.surface && <p className="text-red-500 text-sm mt-1">{errors.surface}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rooms *
                                </label>
                                <input
                                    type="number"
                                    value={formData.rooms}
                                    onChange={(e) => handleInputChange('rooms', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.rooms ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="2"
                                />
                                {errors.rooms && <p className="text-red-500 text-sm mt-1">{errors.rooms}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bathrooms *
                                </label>
                                <input
                                    type="number"
                                    value={formData.bathrooms}
                                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.bathrooms ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="1"
                                />
                                {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_furnished}
                                    onChange={(e) => handleInputChange('is_furnished', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Furnished</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.has_kitchen}
                                    onChange={(e) => handleInputChange('has_kitchen', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Kitchen</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.has_wifi}
                                    onChange={(e) => handleInputChange('has_wifi', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">WiFi</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.has_parking}
                                    onChange={(e) => handleInputChange('has_parking', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Parking</span>
                            </label>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Roommate Gender Preference
                                </label>
                                <select
                                    value={formData.roommate_gender_preference}
                                    onChange={(e) => handleInputChange('roommate_gender_preference', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="any">Any</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available From *
                                </label>
                                <input
                                    type="date"
                                    value={formData.available_from}
                                    onChange={(e) => handleInputChange('available_from', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.available_from ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.available_from && <p className="text-red-500 text-sm mt-1">{errors.available_from}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Photos */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-2">Add new photos (optional)</p>
                                <p className="text-xs text-gray-500 mb-4">Maximum 10 photos, JPG, PNG, GIF</p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                    id="photo-upload-edit"
                                />
                                <label
                                    htmlFor="photo-upload-edit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    Add New Photos
                                </label>
                            </div>

                            {/* Current Photos */}
                            {annonce.photos.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-700 mb-2">Current photos:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                        {annonce.photos.map((photo) => (
                                            <div key={photo.id} className="relative">
                                                <img
                                                    src={`http://127.0.0.1:8000/storage/${photo.photo_path}`}
                                                    alt={`Photo ${photo.id}`}
                                                    className="w-full h-20 object-cover rounded-lg"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Photos Preview */}
                            {photos.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-700 mb-2">
                                        New photos to upload ({photos.length}):
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={URL.createObjectURL(photo)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-20 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            <span>{loading ? 'Updating...' : 'Update Property'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAnnonceModal;