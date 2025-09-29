import api from './api';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
}

export const getNotifications = async (): Promise<any[]> => {
  const response = await api.get<any[]>('notifications');
  return response.data;
};

export const markAsRead = async (notificationId: number): Promise<void> => {
  await api.put(`notifications/${notificationId}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.put('notifications/read-all');
};

export const deleteNotification = async (notificationId: number): Promise<void> => {
  await api.delete(`notifications/${notificationId}`);
};