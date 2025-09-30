// pages/user/UserProperties.tsx
import { useState, useEffect } from 'react';
import { Map, List, Filter, Navigation } from 'lucide-react';
import { getAnnonces, getUniversities } from '@/services/client/annonceService';
import type { Annonce } from '@/services/client/annonceService';
import AnnoncesFilter from './AnnoncesFilter';
import AnnoncesList from './AnnoncesList';
import AnnoncesMap from './AnnoncesMap';

export interface University {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

const UserProperties = () => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    minSurface: '',
    maxSurface: '',
    rooms: '',
    is_furnished: false,
    has_wifi: false,
    has_parking: false,
    university: '',
    latitude: 0,
    longitude: 0,
    radius: 15, // 15km par défaut
  });

  // Charger les universités
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const response = await getUniversities();
        if (response.status === 200) {
          setUniversities(response.data);
        }
      } catch (error) {
        console.error('Error loading universities:', error);
      }
    };
    loadUniversities();
  }, []);

  // Détecter la localisation de l'utilisateur
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        setFilters(prev => ({
          ...prev,
          latitude: userLat,
          longitude: userLng,
          university: 'my_location'
        }));
        
        // Trouver l'université la plus proche
        findNearestUniversity(userLat, userLng);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please select a university manually.');
      }
    );
  };

  // Trouver l'université la plus proche
  const findNearestUniversity = (lat: number, lng: number) => {
    let nearestUniversity = null;
    let minDistance = Infinity;

    universities.forEach(university => {
      const distance = calculateDistance(
        lat,
        lng,
        university.latitude,
        university.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestUniversity = university;
      }
    });

    if (nearestUniversity && minDistance <= 50) { // Dans un rayon de 50km
      setSelectedUniversity(nearestUniversity);
    }
  };

  // Calcul de distance entre deux points (formule Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const loadAnnonces = async () => {
    setLoading(true);
    try {
      const response = await getAnnonces(filters);
      
      if (response.status === 200) {
        setAnnonces(response.data || []);
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
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Si une université est sélectionnée, mettre à jour selectedUniversity
    if (newFilters.university && newFilters.university !== 'my_location') {
      const university = universities.find(u => u.id.toString() === newFilters.university);
      setSelectedUniversity(university || null);
    } else if (newFilters.university === 'my_location') {
      setSelectedUniversity(null);
    }
  };

  const handleUniversityChange = (universityId: string) => {
    if (universityId === 'my_location') {
      detectUserLocation();
    } else if (universityId) {
      const university = universities.find(u => u.id.toString() === universityId);
      if (university) {
        setSelectedUniversity(university);
        setFilters(prev => ({
          ...prev,
          university: universityId,
          latitude: university.latitude,
          longitude: university.longitude
        }));
      }
    } else {
      setSelectedUniversity(null);
      setFilters(prev => ({
        ...prev,
        university: '',
        latitude: 0,
        longitude: 0
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      minSurface: '',
      maxSurface: '',
      rooms: '',
      is_furnished: false,
      has_wifi: false,
      has_parking: false,
      university: '',
      latitude: 0,
      longitude: 0,
      radius: 15,
    });
    setSelectedUniversity(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Properties</h1>
          <p className="text-gray-600 mt-1">
            {loading ? 'Loading...' : `${annonces.length} properties found`}
            {selectedUniversity && ` near ${selectedUniversity.name}`}
            {filters.university === 'my_location' && ' near your location'}
            {filters.radius && ` (within ${filters.radius}km)`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-2 px-4 py-2 transition-colors ${
                viewMode === 'map' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <AnnoncesFilter
            filters={filters}
            universities={universities}
            selectedUniversity={selectedUniversity}
            onFilterChange={handleFilterChange}
            onUniversityChange={handleUniversityChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <AnnoncesList 
          annonces={annonces} 
          selectedUniversity={selectedUniversity}
          filters={filters}
        />
      ) : (
        <AnnoncesMap 
          annonces={annonces} 
          selectedUniversity={selectedUniversity}
          filters={filters}
        />
      )}
    </div>
  );
};

export default UserProperties;