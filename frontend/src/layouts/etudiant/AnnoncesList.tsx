// components/annonces/AnnoncesList.tsx
import { MapPin, Home, Wifi, Car, Box, Bed, Bath, Navigation } from 'lucide-react';
import type { Annonce } from '@/services/client/annonceService';
import type { University } from './UserProperties';

interface AnnoncesListProps {
  annonces: Annonce[];
  selectedUniversity: University | null;
  filters: {
    radius: number;
  };
}

const AnnoncesList = ({ annonces, selectedUniversity, filters }: AnnoncesListProps) => {
  const getPhotoUrl = (photoPath: string) => {
    if (photoPath.startsWith('http')) return photoPath;
    return `http://127.0.0.1:8000/storage/${photoPath}`;
  };

  const formatCoordinate = (coord: any): number => {
    if (coord === null || coord === undefined) return 0;
    return typeof coord === 'string' ? parseFloat(coord) : Number(coord);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  };

  const getDistanceFromUniversity = (annonce: Annonce): number | null => {
    if (!selectedUniversity) return null;

    const annonceLat = formatCoordinate(annonce.latitude);
    const annonceLng = formatCoordinate(annonce.longitude);

    if (!annonceLat || !annonceLng) return null;

    return calculateDistance(
      selectedUniversity.latitude,
      selectedUniversity.longitude,
      annonceLat,
      annonceLng
    );
  };

  if (annonces.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">Try adjusting your filters to find more properties.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* University Info */}
      {selectedUniversity && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 flex items-center">
                🎓 {selectedUniversity.name}
              </h3>
              <p className="text-blue-700 text-sm mt-1">{selectedUniversity.address}</p>
              <p className="text-blue-600 text-xs mt-1">
                Showing properties within {filters.radius}km radius
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-900">
                {annonces.length} propert{annonces.length === 1 ? 'y' : 'ies'} found
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {annonces.map((annonce) => {
          const distance = getDistanceFromUniversity(annonce);
          const isWithinRadius = selectedUniversity ? (distance || 0) <= filters.radius : true;

          return (
            <div
              key={annonce.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.open(`/annonces/${annonce.id}`, '_blank')}
            >
              {/* Photo */}
              {annonce.photos && annonce.photos.length > 0 ? (
                <div className="relative">
                  <img
                    src={getPhotoUrl(annonce.photos[0].photo_path)}
                    alt={annonce.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                  {distance !== null && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${isWithinRadius
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      <Navigation className="w-3 h-3 inline mr-1" />
                      {distance}km
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center relative">
                  <Home className="w-12 h-12 text-gray-400" />
                  {distance !== null && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${isWithinRadius
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      <Navigation className="w-3 h-3 inline mr-1" />
                      {distance}km
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{annonce.title}</h3>
                  <span className="text-lg font-bold text-blue-600">{annonce.price}€</span>
                </div>

                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm line-clamp-1">{annonce.address}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{annonce.description}</p>

                {/* Property Details */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Bed className="w-4 h-4" />
                    <span>{annonce.rooms} room{annonce.rooms > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bath className="w-4 h-4" />
                    <span>{annonce.bathrooms} bath{annonce.bathrooms > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Home className="w-4 h-4" />
                    <span>{annonce.surface}m²</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2">
                  {annonce.is_furnished && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <Box className="w-3 h-3 mr-1" />
                      Furnished
                    </span>
                  )}
                  {annonce.has_wifi && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <Wifi className="w-3 h-3 mr-1" />
                      WiFi
                    </span>
                  )}
                  {annonce.has_parking && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      <Car className="w-3 h-3 mr-1" />
                      Parking
                    </span>
                  )}
                </div>

                {/* Type and Distance */}
                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                    {annonce.type}
                  </span>

                  {distance !== null && !isWithinRadius && (
                    <span className="text-xs text-red-600 font-medium">
                      Outside {filters.radius}km radius
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnnoncesList;