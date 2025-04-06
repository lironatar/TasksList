import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loading, user } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // No need to check is_verified, the backend auth check handles this
  return <>{children}</>;
};

export default ProtectedRoute; 