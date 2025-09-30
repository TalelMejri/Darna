import api from '../api';
export interface Annonce {
  id: number;
  title: string;
  description: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  price: number;
  surface: number;
  rooms: number;
  bathrooms: number;
  type: 'studio' | 'apartment' | 'house' | 'room';
  is_furnished: boolean;
  has_kitchen: boolean;
  has_wifi: boolean;
  has_parking: boolean;
  status: 'pending' | 'approved' | 'rejected';
  available_from: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  photos: AnnoncePhoto[];
  roommate_gender_preference?: 'male' | 'female' | 'any';
}

export interface AnnoncePhoto {
  id: number;
  annonce_id: number;
  photo_path: string;
  created_at: string;
  updated_at: string;
}
export interface Filters {
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  minSurface?: string;
  maxSurface?: string;
  rooms?: string;
  is_furnished?: boolean;
  has_wifi?: boolean;
  has_parking?: boolean;
  university?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export const getAnnonces = async (filters: Filters = {}): Promise<{ status: number; data: any }> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== false && value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  const response = await api.get(`/annonces?${params.toString()}`);
  return {
    status: response.status,
    data: response.data
  };
};

// Service pour obtenir les coordonnées des universités
export const getUniversities = async (): Promise<{ status: number; data: any }> => {
  const response = await api.get('/universities');
  return {
    status: response.status,
    data: response.data
  };
};