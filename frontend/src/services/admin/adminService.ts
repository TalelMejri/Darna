import api from '../api';

export const GetUsers = async (page: any): Promise<any> => {
    const response = await api.get<any>(`admin/users?page=${page}`);
    return response;
}
