// components/annonces/AnnoncesMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import { MapPin, Home, Euro, Expand, Navigation, Clock, Car, User } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Annonce } from '@/services/client/annonceService';
import type { University } from './UserProperties';
import { getMultipleRoutes, type RouteResponse } from '@/services/map/routeService';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const propertyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const universityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface AnnoncesMapProps {
  annonces: Annonce[];
  selectedUniversity: University | null;
  filters: {
    radius: number;
    latitude: number;
    longitude: number;
  };
}

const AnnoncesMap = ({ annonces, selectedUniversity, filters }: AnnoncesMapProps) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [routes, setRoutes] = useState<Map<number, RouteResponse>>(new Map());
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeMode, setRouteMode] = useState<'driving' | 'walking'>('driving');

  const getPhotoUrl = (photoPath: string) => {
    if (photoPath.startsWith('http')) return photoPath;
    return `http://127.0.0.1:8000/storage/${photoPath}`;
  };

  const formatCoordinate = (coord: any): number => {
    if (coord === null || coord === undefined) return 0;
    if (typeof coord === 'string') {
      const parsed = parseFloat(coord);
      return isNaN(parsed) ? 0 : parsed;
    }
    return Number(coord);
  };

  // Calculate routes from university to properties
  useEffect(() => {
    if (selectedUniversity && annonces.length > 0) {
      setLoadingRoutes(true);
      
      const calculateRoutes = async () => {
        try {
          console.log('Calculating routes for', annonces.length, 'properties');
          const routeResults = await getMultipleRoutes(
            selectedUniversity,
            annonces.map(a => ({
              id: a.id,
              latitude: a.latitude,
              longitude: a.longitude
            })),
            routeMode,
            2 // Process 2 routes at a time to avoid rate limits
          );
          
          console.log('Routes calculated:', routeResults.size);
          setRoutes(routeResults);
        } catch (error) {
          console.error('Error calculating routes:', error);
        } finally {
          setLoadingRoutes(false);
        }
      };

      calculateRoutes();
    } else {
      setRoutes(new Map());
      setLoadingRoutes(false);
    }
  }, [selectedUniversity, annonces, routeMode]);

  // Format duration for display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
  };

  // Fit map to show all markers AND routes
  useEffect(() => {
    if (map && (annonces.length > 0 || selectedUniversity)) {
      const group = new L.FeatureGroup();
      
      // Add university marker
      if (selectedUniversity) {
        group.addLayer(L.marker([selectedUniversity.latitude, selectedUniversity.longitude]));
      }
      
      // Add property markers
      annonces.forEach(annonce => {
        const lat = formatCoordinate(annonce.latitude);
        const lng = formatCoordinate(annonce.longitude);
        if (lat && lng) {
          group.addLayer(L.marker([lat, lng]));
        }
      });
      
      // Add route polylines to bounds calculation
      routes.forEach((route) => {
        if (route.coordinates && route.coordinates.length > 0) {
          try {
            const polyline = L.polyline(route.coordinates);
            group.addLayer(polyline);
          } catch (error) {
            console.error('Error adding route to bounds:', error);
          }
        }
      });
      
      if (group.getLayers().length > 0) {
        try {
          const bounds = group.getBounds();
          map.fitBounds(bounds.pad(0.2), { 
            maxZoom: 15,
            animate: true 
          });
        } catch (error) {
          console.error('Error fitting bounds:', error);
        }
      }
    }
  }, [map, annonces, selectedUniversity, routes]);

  const defaultCenter: [number, number] = selectedUniversity ? 
    [selectedUniversity.latitude, selectedUniversity.longitude] : 
    [36.8065, 10.1815]; // Tunis center

  if (annonces.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">Try adjusting your filters to find more properties.</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-lg overflow-hidden shadow-sm border relative">
      {/* Loading Overlay */}
      {loadingRoutes && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Calculating routes...</p>
            <p className="text-gray-500 text-xs mt-1">
              {annonces.length} properties • {routeMode === 'driving' ? 'Driving' : 'Walking'} routes
            </p>
          </div>
        </div>
      )}

      {/* Route Mode Selector */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Mode
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setRouteMode('driving')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                routeMode === 'driving' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Drive</span>
            </button>
            <button
              onClick={() => setRouteMode('walking')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                routeMode === 'walking' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Walk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Focus on University Button */}
      {selectedUniversity && (
        <div className="absolute top-24 left-4 bg-white p-2 rounded-lg shadow-md z-[1000]">
          <button
            onClick={() => {
              if (map) {
                map.setView(
                  [selectedUniversity.latitude, selectedUniversity.longitude], 
                  13,
                  { animate: true }
                );
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Navigation className="w-4 h-4" />
            <span>Focus University</span>
          </button>
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* University Marker and Radius Circle */}
        {selectedUniversity && (
          <>
            <Marker
              position={[selectedUniversity.latitude, selectedUniversity.longitude]}
              icon={universityIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold text-red-600">🎓 {selectedUniversity.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUniversity.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Search radius: {filters.radius}km
                  </p>
                </div>
              </Popup>
            </Marker>
            
            <Circle
              center={[selectedUniversity.latitude, selectedUniversity.longitude]}
              radius={filters.radius * 1000} // Convert km to meters
              color="blue"
              fillColor="blue"
              fillOpacity={0.1}
              weight={2}
            />
          </>
        )}

        {/* Routes from university to properties */}
        {Array.from(routes.entries()).map(([annonceId, route]) => {
          if (!route.coordinates || route.coordinates.length === 0) {
            console.log('No coordinates for route:', annonceId);
            return null;
          }

          return (
            <Polyline
              key={annonceId}
              positions={route.coordinates}
              color={route.type === 'road' 
                ? (routeMode === 'driving' ? '#ff6b35' : '#27ae60')
                : '#8e44ad'
              }
              weight={route.type === 'road' ? 5 : 3}
              opacity={0.9}
              dashArray={route.type === 'road' ? undefined : '8, 8'}
              smoothFactor={1}
            />
          );
        })}
        
        {/* Property Markers */}
        {annonces.map((annonce) => {
          const lat = formatCoordinate(annonce.latitude);
          const lng = formatCoordinate(annonce.longitude);
          
          if (!lat || !lng) {
            console.log('Invalid coordinates for property:', annonce.id, annonce.latitude, annonce.longitude);
            return null;
          }

          const route = routes.get(annonce.id);

          return (
            <Marker
              key={annonce.id}
              position={[lat, lng]}
              icon={propertyIcon}
            >
              <Popup>
                <div className="w-64">
                  {annonce.photos && annonce.photos.length > 0 ? (
                    <img
                      src={getPhotoUrl(annonce.photos[0].photo_path)}
                      alt={annonce.title}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                      <Home className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{annonce.title}</h3>
                  <p className="text-blue-600 font-bold text-lg mb-2">{annonce.price}€/month</p>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{annonce.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Surface:</span>
                      <span>{annonce.surface}m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rooms:</span>
                      <span>{annonce.rooms}</span>
                    </div>
                  </div>
                  
                  {selectedUniversity && (
                    <div className="mt-2">
                      {loadingRoutes ? (
                        <div className="p-2 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Calculating route...</span>
                            <Clock className="w-3 h-3 animate-spin" />
                          </div>
                        </div>
                      ) : route ? (
                        <div className={`p-2 rounded border ${
                          route.type === 'road' 
                            ? (routeMode === 'driving' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200')
                            : 'bg-purple-50 border-purple-200'
                        }`}>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {routeMode === 'driving' ? (
                                  <Car className="w-3 h-3 mr-1" />
                                ) : (
                                  <User className="w-3 h-3 mr-1" />
                                )}
                                <span className="font-medium">
                                  {route.type === 'road' ? 'Road Route' : 'Direct Line'}
                                </span>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                route.type === 'road' 
                                  ? (routeMode === 'driving' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700')
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {route.distance}km
                              </div>
                            </div>
                            {route.duration && (
                              <div className="text-gray-600">
                                ⏱️ {formatDuration(route.duration)}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-yellow-50 rounded border border-yellow-200 text-xs text-yellow-700">
                          <span>Route not available</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => window.open(`/annonces/${annonce.id}`, '_blank')}
                    className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Expand className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>University</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Property</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-2 bg-orange-500"></div>
            <span>Driving Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-2 bg-green-500"></div>
            <span>Walking Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-purple-500 border border-purple-500 border-dashed"></div>
            <span>Direct Line</span>
          </div>
          {selectedUniversity && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-blue-500 rounded-full bg-blue-100"></div>
              <span>{filters.radius}km radius</span>
            </div>
          )}
          {loadingRoutes && (
            <div className="flex items-center space-x-2 text-blue-600">
              <Clock className="w-3 h-3 animate-spin" />
              <span>Loading routes...</span>
            </div>
          )}
          <div className="text-xs text-gray-500">
            Routes: {routes.size}/{annonces.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnoncesMap;