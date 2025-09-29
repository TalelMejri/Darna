import api from '../api';

export const login = async (data: any): Promise<any> => {
    const response = await api.post<any>('login', data);
    return response;
}

export const register = async (data: any): Promise<any> => {
    const response = await api.post<any>('register', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response;
}

export const getProfile = async (): Promise<any> => {
    const response = await api.get<any>('user');
    return response;
}

