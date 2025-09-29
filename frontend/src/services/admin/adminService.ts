import api from '../api';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'student' | 'non-student' | 'owner' | 'admin';
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

export interface UsersResponse {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const GetUsers = async (page = 1): Promise<any> => {
  const response = await api.get(`/admin/users?page=${page}`);
  return response;
};

export const UpdateUserVerification = async (userId: number, isVerified: boolean): Promise<any> => {
  const response = await api.put(`/admin/users/${userId}/status`, {
    is_verified: isVerified
  });
  return response;
};

export const DeleteUser = async (userId: number): Promise<any> => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response;
};