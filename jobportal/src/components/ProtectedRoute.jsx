import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ 
  children, 
  requiredUserType = null, // 'candidate', 'agent', or null for any authenticated user
  requiredRole = null, // 'admin' or null
  redirectTo = '/login' 
}) => {
  const { user, admin, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  const isAuthenticated = Boolean(user || admin);
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check admin role requirement
  if (requiredRole === 'admin') {
    if (!admin) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  }

  // Check user type requirement
  if (requiredUserType) {
    if (!user || user.userType !== requiredUserType) {
      // Redirect to appropriate dashboard based on user type
      const redirectPath = user?.userType === 'agent' ? '/agent' : 
                          user?.userType === 'candidate' ? '/dashboard' : 
                          '/jobs';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // If all checks pass, render the protected component
  return children;
};