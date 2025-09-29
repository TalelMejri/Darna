import { useSelector, useDispatch } from 'react-redux';
import { LoginUser as loginAction, LogoutUser as logoutAction } from './slice';
import type { AppDispatch, RootState } from './store';
import type { User } from '@/types';


export const useAuth = () => {
    const dispatch: AppDispatch = useDispatch();
    const { user, isAuth } = useSelector((state: RootState) => state.auth);

    const LoginUser = (user: User) => {
        dispatch(loginAction({ user }));
    };

    const LogoutUser = () => {
        dispatch(logoutAction());
    };

    return {
        user,
        isAuth,
        LoginUser,
        LogoutUser,
        role: user?.role
    };
};
