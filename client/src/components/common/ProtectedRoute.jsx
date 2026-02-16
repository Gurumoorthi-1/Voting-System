import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = () => {
    const { token, loading } = useContext(AuthContext);

    if (loading) return <Loader />;
    if (!token) return <Navigate to="/login" replace />;

    return <Outlet />;
};

export default ProtectedRoute;
