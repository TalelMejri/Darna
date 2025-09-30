import api from '../api';

export interface Annonce {
  id: number;
  user_id: number;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  surface: number;
  rooms: number;
  bathrooms: number;
  type: 'studio' | 'apartment' | 'house' | 'room';
  is_furnished: boolean;
  has_kitchen: boolean;
  has_wifi: boolean;
  has_parking: boolean;
  roommate_gender_preference: 'male' | 'female' | 'any' | null;
  status: 'pending' | 'approved' | 'rejected';
  available_from: string;
  created_at: string;
  updated_at: string;
  photos: AnnoncePhoto[];
  main_photo?: AnnoncePhoto;
}

export interface AnnoncePhoto {
  id: number;
  annonce_id: number;
  photo_path: string;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnonceFormData {
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  surface: number;
  rooms: number;
  bathrooms: number;
  type: 'studio' | 'apartment' | 'house' | 'room';
  is_furnished: boolean;
  has_kitchen: boolean;
  has_wifi: boolean;
  has_parking: boolean;
  roommate_gender_preference: 'male' | 'female' | 'any' | null;
  available_from: string;
  photos: File[];
}

export interface DashboardStats {
  total_annonces: number;
  approved_annonces: number;
  pending_annonces: number;
  rejected_annonces: number;
}

// Get owner's annonces
export const getMyAnnonces = async (page = 1): Promise<any> => {
  const response = await api.get(`/owner/annonces?page=${page}`);
  return response;
};

// Create new annonce
export const createAnnonce = async (formData: FormData): Promise<any> => {
  const response = await api.post('/owner/annonces', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Update annonce
export const updateAnnonce = async (annonceId: number, formData: FormData): Promise<any> => {
  const response = await api.post(`/owner/annonces/${annonceId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Delete annonce
export const deleteAnnonce = async (annonceId: number): Promise<any> => {
  const response = await api.delete(`/owner/annonces/${annonceId}`);
  return response;
};

// Get dashboard stats
export const getDashboardStats = async (): Promise<any> => {
  const response = await api.get('/owner/dashboard-stats');
  return response;
};

export const getAnnonceDetails = async (annonceId: number): Promise<{ status: number; data: Annonce }> => {
  const response = await api.get(`/annonces/${annonceId}`);
  return {
    status: response.status,
    data: response.data
  };
};