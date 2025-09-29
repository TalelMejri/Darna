import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { RootState } from './store';

interface ProtectedRouteProps {
    allowedRoles?: string[];
    children?: ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
    const { isAuth, user } = useSelector((state: RootState) => state.auth);

    if (!isAuth) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        switch (user.role) {
            case 'student':
                return <Navigate to="/student/dashboard" replace />;
            case 'non-student':
                return <Navigate to="/non-student/dashboard" replace />;
            case 'owner':
                return <Navigate to="/owner/dashboard" replace />;
            case 'admin':
                return <Navigate to="/admin/dashboard" replace />;
            default:
                return <Navigate to="/" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;