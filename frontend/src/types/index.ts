export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'non-student' | 'admin' | 'owner';
  phone: string;
  address: string;
  cin: string;
  university?: string;
  profile_photo?: string;
  etudiant_card?: string;
  etudiant_certif_success?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

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
  type: 'apartment' | 'house' | 'studio' | 'room';
  is_furnished: boolean;
  has_kitchen: boolean;
  has_wifi: boolean;
  has_parking: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'rented';
  available_from: string;
  created_at: string;
  updated_at: string;
  photos: AnnoncePhoto[];
  user: User;
  feedbacks?: Feedback[];
  distance?: number;
}

export interface AnnoncePhoto {
  id: number;
  annonce_id: number;
  photo_path: string;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  annonce_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  annonce?: Annonce;
}

export interface Signal {
  id: number;
  user_id: number;
  annonce_id: number;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
  user?: User;
  annonce?: Annonce;
}

export interface Chat {
  id: number;
  user1_id: number;
  user2_id: number;
  created_at: string;
  updated_at: string;
  user1?: User;
  user2?: User;
  messages?: Message[];
  unread_count?: number;
  other_user?: User;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: number;
  user_id: number;
  annonce_id?: number;
  reservation_id?: number;
  rating: number;
  comment: string;
  type: 'annonce' | 'user' | 'system';
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}