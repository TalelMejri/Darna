// components/annonces/AnnoncesFilter.tsx
import { X, Navigation } from 'lucide-react';

interface Filters {
  type: string;
  minPrice: string;
  maxPrice: string;
  minSurface: string;
  maxSurface: string;
  rooms: string;
  is_furnished: boolean;
  has_wifi: boolean;
  has_parking: boolean;
  university: string;
  radius: number;
}

interface University {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface AnnoncesFilterProps {
  filters: Filters;
  universities: University[];
  selectedUniversity: University | null;
  onFilterChange: (filters: Filters) => void;
  onUniversityChange: (universityId: string) => void;
  onClearFilters: () => void;
}

const AnnoncesFilter = ({ 
  filters, 
  universities, 
  selectedUniversity, 
  onFilterChange, 
  onUniversityChange, 
  onClearFilters 
}: AnnoncesFilterProps) => {
  const handleInputChange = (field: keyof Filters, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleUniversitySelect = (universityId: string) => {
    onUniversityChange(universityId);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false && value !== 15 // 15 est la valeur par défaut du radius
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* University Filter */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search near University
          </label>
          <div className="space-y-2">
            <select
              value={filters.university}
              onChange={(e) => handleUniversitySelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select university</option>
              <option value="my_location">
                📍 Use my current location
              </option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  🎓 {university.name}
                </option>
              ))}
            </select>
            
            {selectedUniversity && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedUniversity.name}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {selectedUniversity.address}
                </p>
              </div>
            )}
            
            {filters.university === 'my_location' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 flex items-center">
                  <Navigation className="w-4 h-4 mr-2" />
                  <strong>Using your current location</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Radius Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius
          </label>
          <div className="space-y-2">
            <select
              value={filters.radius}
              onChange={(e) => handleInputChange('radius', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="15">15 km</option>
              <option value="20">20 km</option>
              <option value="30">30 km</option>
              <option value="50">50 km</option>
            </select>
            <p className="text-xs text-gray-500">
              Properties within {filters.radius}km radius
            </p>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All types</option>
            <option value="apartment">Apartment</option>
            <option value="studio">Studio</option>
            <option value="house">House</option>
            <option value="room">Room</option>
          </select>
        </div>

        {/* Rest of the filters remain the same */}
        {/* ... Price, Surface, Rooms, Amenities filters ... */}
      </div>

      {/* Additional filters grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Price (TND)
          </label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price (TND)
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="2000"
          />
        </div>

        {/* Rooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rooms
          </label>
          <select
            value={filters.rooms}
            onChange={(e) => handleInputChange('rooms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any</option>
            <option value="1">1 room</option>
            <option value="2">2 rooms</option>
            <option value="3">3 rooms</option>
            <option value="4">4+ rooms</option>
          </select>
        </div>

        {/* Surface */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Surface (m²)
          </label>
          <input
            type="number"
            value={filters.minSurface}
            onChange={(e) => handleInputChange('minSurface', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>

        {/* Amenities */}
        <div className="lg:col-span-4 space-y-2 pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700">Amenities</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.is_furnished}
                onChange={(e) => handleInputChange('is_furnished', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Furnished</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.has_wifi}
                onChange={(e) => handleInputChange('has_wifi', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">WiFi</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.has_parking}
                onChange={(e) => handleInputChange('has_parking', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Parking</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnoncesFilter;