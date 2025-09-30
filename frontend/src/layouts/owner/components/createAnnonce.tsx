import { useState } from 'react';
import { X, Upload, MapPin, Navigation } from 'lucide-react';
import { createAnnonce } from '@/services/owner/ownerService';

interface CreateAnnonceModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CreateAnnonceModal = ({ onClose, onSave }: CreateAnnonceModalProps) => {
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    price: '',
    surface: '',
    rooms: '',
    bathrooms: '',
    type: 'apartment' as 'studio' | 'apartment' | 'house' | 'room',
    is_furnished: false,
    has_kitchen: false,
    has_wifi: false,
    has_parking: false,
    roommate_gender_preference: 'any' as 'male' | 'female' | 'any',
    available_from: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          // First set the coordinates
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));
          
          // Then reverse geocode to get the address name
          await reverseGeocode(lat, lng);
        } catch (error) {
          console.error('Error processing location:', error);
          // En cas d'erreur, utiliser une adresse par défaut avec le nom de la ville
          const fallbackAddress = await getCityNameFromCoordinates(lat, lng);
          setFormData(prev => ({
            ...prev,
            address: fallbackAddress
          }));
        } finally {
          setGeocoding(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to get your current location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'Please enable location services.';
        }
        
        alert(errorMessage);
        setGeocoding(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        // Utiliser le nom complet de l'adresse (display_name)
        setFormData(prev => ({
          ...prev,
          address: data.display_name
        }));
        console.log('Address detected:', data.display_name);
      } else {
        // Fallback: obtenir le nom de la ville
        const cityName = await getCityNameFromCoordinates(lat, lng);
        setFormData(prev => ({
          ...prev,
          address: cityName
        }));
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Fallback: obtenir le nom de la ville
      const cityName = await getCityNameFromCoordinates(lat, lng);
      setFormData(prev => ({
        ...prev,
        address: cityName
      }));
    }
  };

  const getCityNameFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('City name lookup failed');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        // Essayer différents niveaux de détail pour l'adresse
        const address = data.address;
        
        if (address.road && address.city) {
          return `${address.road}, ${address.city}`;
        } else if (address.village && address.city) {
          return `${address.village}, ${address.city}`;
        } else if (address.town) {
          return address.town;
        } else if (address.city) {
          return address.city;
        } else if (address.county) {
          return address.county;
        } else if (address.state) {
          return address.state;
        } else {
          return `Location near ${data.display_name?.split(',')[0] || 'unknown area'}`;
        }
      } else {
        return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } catch (error) {
      console.error('Error getting city name:', error);
      return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit clicked');

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required. Please use "Use Current Location" button.';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.surface || parseInt(formData.surface) <= 0) newErrors.surface = 'Valid surface is required';
    if (!formData.rooms || parseInt(formData.rooms) <= 0) newErrors.rooms = 'Valid number of rooms is required';
    if (!formData.bathrooms || parseInt(formData.bathrooms) <= 0) newErrors.bathrooms = 'Valid number of bathrooms is required';
    if (!formData.available_from) newErrors.available_from = 'Available date is required';
    if (photos.length === 0) newErrors.photos = 'At least one photo is required';
    
    if (formData.latitude === 0 || formData.longitude === 0) {
      newErrors.latitude = 'Please set location using "Use Current Location" button';
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Submitting form...');

    try {
      const submitData = new FormData();
      
      // Append form data - convert boolean fields properly
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        
        if (value !== null && value !== undefined) {
          // Convert boolean fields to actual booleans
          if (['is_furnished', 'has_kitchen', 'has_wifi', 'has_parking'].includes(key)) {
            submitData.append(key, value ? '1' : '0');
          } else {
            submitData.append(key, value.toString());
          }
        }
      });

      // Append photos
      photos.forEach(photo => {
        submitData.append('photos[]', photo);
      });

      console.log('Sending request...');
      
      // Debug: Log FormData values
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await createAnnonce(submitData);
      console.log('Response:', response);
      
      if (response.status === 201) {
        console.log('Success!');
        onSave();
        alert('Property created successfully and is pending approval!');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error creating property:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error creating property. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Add New Property</h2>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                    readOnly
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Click 'Use Current Location' to detect address"
                  />
                </div>
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Address will be automatically detected from your current location
                </p>
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
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="Auto-detected"
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
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="Auto-detected"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={geocoding}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                >
                  {geocoding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Detecting Location...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>

              {errors.latitude && (
                <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>
              )}

              {(formData.latitude !== 0 || formData.longitude !== 0) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>✓ Location detected successfully!</strong>
                  </p>
                  {formData.address && (
                    <p className="text-sm text-green-800 mt-1">
                      <strong>Address:</strong> {formData.address}
                    </p>
                  )}
                  <p className="text-sm text-green-800 mt-1">
                    <strong>Coordinates:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                </div>
              )}
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="500"
                  min="1"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.surface ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50"
                  min="1"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.rooms ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2"
                  min="1"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1"
                  min="1"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.available_from ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.available_from && <p className="text-red-500 text-sm mt-1">{errors.available_from}</p>}
              </div>
            </div>
          </div>

          {/* Photos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos *</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload property photos</p>
                <p className="text-xs text-gray-500 mb-4">Maximum 10 photos, JPG, PNG, GIF</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Select Photos
                </label>
              </div>

              {errors.photos && <p className="text-red-500 text-sm">{errors.photos}</p>}

              {photos.length > 0 && (
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    Selected photos ({photos.length}/10):
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
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Property</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnonceModal;