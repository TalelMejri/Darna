// services/map/routeService.ts
const OPENROUTE_SERVICE_API_KEY = import.meta.env.VITE_OPENROUTE_SERVICE_API_KEY;

export interface RouteResponse {
    coordinates: [number, number][]; // [lat, lng] pour Leaflet
    distance: number; // in km
    duration: number; // in minutes
    type: 'road' | 'straight';
}

export interface RouteRequest {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    mode: 'driving' | 'walking';
}

// Service principal pour obtenir les itinéraires
export const getRoute = async (request: RouteRequest): Promise<RouteResponse> => {
    const { startLat, startLng, endLat, endLng, mode } = request;

    console.log('Getting route from:', [startLat, startLng], 'to:', [endLat, endLng], 'mode:', mode);

    try {
        // Essayer d'abord OpenRouteService si la clé API est disponible
        if (OPENROUTE_SERVICE_API_KEY && OPENROUTE_SERVICE_API_KEY !== 'undefined') {
            console.log('Using OpenRouteService');
            const route = await getOpenRouteServiceRoute(request);
            if (route) {
                console.log('OpenRouteService route found with', route.coordinates.length, 'points');
                return route;
            }
        }

        console.log('Using straight line route as fallback');
        // Fallback vers ligne droite
        return getStraightLineRoute(request);

    } catch (error) {
        console.error('Error getting route:', error);
        return getStraightLineRoute(request);
    }
};

// OpenRouteService implementation
const getOpenRouteServiceRoute = async (request: RouteRequest): Promise<RouteResponse | null> => {
    const { startLat, startLng, endLat, endLng, mode } = request;

    try {
        const profile = mode === 'driving' ? 'driving-car' : 'foot-walking';

        console.log('Calling OpenRouteService API...');
        const response = await fetch(
            `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': OPENROUTE_SERVICE_API_KEY
                },
                body: JSON.stringify({
                    coordinates: [
                        [startLng, startLat], // OpenRouteService attend [lng, lat]
                        [endLng, endLat]
                    ],
                    instructions: false,
                    preference: 'recommended'
                })
            }
        );

        if (!response.ok) {
            console.error(`OpenRouteService error: ${response.status}`, await response.text());
            return null;
        }

        const data = await response.json();
        console.log('OpenRouteService response received');

        if (data.features && data.features[0]) {
            const route = data.features[0];
            
            // CORRECTION: Les coordonnées de OpenRouteService sont [lng, lat]
            // On les convertit en [lat, lng] pour Leaflet
            const coordinates: [number, number][] = route.geometry.coordinates.map((coord: number[]) => {
                if (coord && coord.length >= 2) {
                    // OpenRouteService retourne [lng, lat] -> on convertit en [lat, lng] pour Leaflet
                    return [coord[1], coord[0]] as [number, number];
                }
                return [0, 0] as [number, number];
            }).filter((coord:any) => coord[0] !== 0 && coord[1] !== 0);

            const distance = route.properties.segments[0].distance / 1000; // Convert to km
            const duration = route.properties.segments[0].duration / 60; // Convert to minutes

            console.log('Route calculated - Points:', coordinates.length, 'Distance:', distance, 'km');

            // Vérifier que les coordonnées sont raisonnables (Tunisie)
            const firstCoord = coordinates[0];
            const lastCoord = coordinates[coordinates.length - 1];
            console.log('First coordinate:', firstCoord);
            console.log('Last coordinate:', lastCoord);

            if (firstCoord[0] < 30 || firstCoord[0] > 38 || firstCoord[1] < 7 || firstCoord[1] > 12) {
                console.warn('Suspicious coordinates - likely wrong order');
                return null;
            }

            return {
                coordinates,
                distance: Math.round(distance * 10) / 10,
                duration: Math.round(duration),
                type: 'road' as const
            };
        }

        console.log('No route features found in response');
        return null;

    } catch (error) {
        console.error('OpenRouteService error:', error);
        return null;
    }
};

// Straight line implementation (fallback)
const getStraightLineRoute = (request: RouteRequest): RouteResponse => {
    const { startLat, startLng, endLat, endLng, mode } = request;

    // Calculate straight line distance
    const distance = calculateDistance(startLat, startLng, endLat, endLng);

    // Estimate duration based on mode and distance
    const duration = estimateDuration(distance, mode);

    // CORRECTION: Déjà en [lat, lng] pour Leaflet
    const coordinates: [number, number][] = [
        [startLat, startLng],
        [endLat, endLng]
    ];

    console.log('Straight line route:', { 
        start: [startLat, startLng], 
        end: [endLat, endLng],
        distance, 
        duration 
    });

    return {
        coordinates,
        distance,
        duration,
        type: 'straight' as const
    };
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
};

// Estimate duration based on distance and mode
const estimateDuration = (distance: number, mode: 'driving' | 'walking'): number => {
    if (mode === 'driving') {
        // Average driving speed: 40 km/h in urban areas
        return Math.round((distance / 40) * 60);
    } else {
        // Average walking speed: 5 km/h
        return Math.round((distance / 5) * 60);
    }
};

// Batch route calculation for multiple properties
export const getMultipleRoutes = async (
    university: { latitude: number; longitude: number },
    annonces: Array<{ id: number; latitude: number | string; longitude: number | string }>,
    mode: 'driving' | 'walking' = 'driving',
    maxConcurrent = 2
): Promise<Map<number, RouteResponse>> => {
    const results = new Map<number, RouteResponse>();

    // Filter out annonces with invalid coordinates
    const validAnnonces = annonces.filter(annonce => {
        const annonceLat = typeof annonce.latitude === 'string' ? parseFloat(annonce.latitude) : annonce.latitude;
        const annonceLng = typeof annonce.longitude === 'string' ? parseFloat(annonce.longitude) : annonce.longitude;
        
        const isValid = annonceLat && annonceLng && 
                       !isNaN(annonceLat) && !isNaN(annonceLng) &&
                       annonceLat !== 0 && annonceLng !== 0;
        
        if (!isValid) {
            console.log('Invalid coordinates for property:', annonce.id, annonceLat, annonceLng);
        }
        
        return isValid;
    });

    console.log(`Calculating routes for ${validAnnonces.length} valid properties from university:`, [university.latitude, university.longitude]);

    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < validAnnonces.length; i += maxConcurrent) {
        const batch = validAnnonces.slice(i, i + maxConcurrent);

        const batchPromises = batch.map(async (annonce) => {
            const annonceLat = typeof annonce.latitude === 'string' ? parseFloat(annonce.latitude) : annonce.latitude;
            const annonceLng = typeof annonce.longitude === 'string' ? parseFloat(annonce.longitude) : annonce.longitude;

            console.log(`Calculating route to property ${annonce.id}:`, [annonceLat, annonceLng]);

            try {
                const route = await getRoute({
                    startLat: university.latitude,
                    startLng: university.longitude,
                    endLat: annonceLat,
                    endLng: annonceLng,
                    mode
                });

                return { annonceId: annonce.id, route };
            } catch (error) {
                console.error(`Error calculating route for property ${annonce.id}:`, error);
                
                // Fallback to straight line avec le bon type
                const distance = calculateDistance(university.latitude, university.longitude, annonceLat, annonceLng);
                const duration = estimateDuration(distance, mode);
                
                const coordinates: [number, number][] = [
                    [university.latitude, university.longitude],
                    [annonceLat, annonceLng]
                ];
                
                const fallbackRoute: RouteResponse = {
                    coordinates,
                    distance,
                    duration,
                    type: 'straight' as const
                };
                
                return {
                    annonceId: annonce.id,
                    route: fallbackRoute
                };
            }
        });

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(result => {
            if (result && result.route) {
                // Vérifier que les coordonnées sont valides avant d'ajouter
                if (result.route.coordinates && result.route.coordinates.length > 0) {
                    const firstCoord = result.route.coordinates[0];
                    const lastCoord = result.route.coordinates[result.route.coordinates.length - 1];
                    
                    // Vérifier que les coordonnées sont dans une plage raisonnable pour la Tunisie
                    if (firstCoord[0] >= 30 && firstCoord[0] <= 38 && firstCoord[1] >= 7 && firstCoord[1] <= 12 &&
                        lastCoord[0] >= 30 && lastCoord[0] <= 38 && lastCoord[1] >= 7 && lastCoord[1] <= 12) {
                        
                        results.set(result.annonceId, result.route);
                        console.log(`✅ Route added for property ${result.annonceId} - ${result.route.coordinates.length} points`);
                    } else {
                        console.warn(`❌ Invalid coordinates for property ${result.annonceId}:`, firstCoord, lastCoord);
                    }
                }
            }
        });

        // Delay between batches to respect API rate limits
        if (i + maxConcurrent < validAnnonces.length) {
            console.log('Waiting before next batch...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`✅ Total routes calculated: ${results.size}`);
    return results;
};