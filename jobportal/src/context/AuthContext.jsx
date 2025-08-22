import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Set base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize axios interceptors for error handling
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check auth status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const { data } = await axios.get('/api/users/profile');
          
          if (data.success && data.user) {
            {
              setUser(data.user);
              setUserType(data.user.userType);
            }
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // User/Agent login
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const { data } = await axios.post('/api/users/login', { email, password });
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setUserType(data.user.userType);
        
        // Navigate based on user type
        if (data.user.userType === 'agent') {
          navigate('/agent');
        } else {
          navigate('/dashboard');
        }
        
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Combined signup function for candidates and agents
  const signup = async (formData) => {
    try {
      setError(null);
      setLoading(true);
      
      const { data } = await axios.post('/api/users/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setUserType(data.user.userType);
        
        // Navigate based on user type
        if (data.user.userType === 'agent') {
          navigate('/agent');
        } else {
          navigate('/dashboard');
        }
        
        return data;
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // User logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const { data } = await axios.put('/api/auth/profile', profileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (data.success) {
        setUser(data.user);
        return data;
      } else {
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Save job to wishlist (for candidates)
  const saveJob = async (jobId) => {
    try {
      if (user?.userType !== 'candidate') {
        throw new Error('Only candidates can save jobs');
      }
      
      const { data } = await axios.post(`/api/wishlist/${jobId}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save job';
      throw new Error(errorMessage);
    }
  };

  // Remove job from wishlist (for candidates)
  const unsaveJob = async (jobId) => {
    try {
      if (user?.userType !== 'candidate') {
        throw new Error('Only candidates can unsave jobs');
      }
      
      const { data } = await axios.delete(`/api/wishlist/${jobId}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to unsave job';
      throw new Error(errorMessage);
    }
  };

  // Check if job is saved (for candidates)
  const isJobSaved = async (jobId) => {
    try {
      if (user?.userType !== 'candidate') {
        return false;
      }
      
      const { data } = await axios.get(`/api/wishlist/check/${jobId}`);
      return data.data?.isSaved || false;
    } catch (err) {
      console.error('Error checking if job is saved:', err);
      return false;
    }
  };

  // Get agent statistics (for agents)
  const getAgentStats = async () => {
    try {
      if (user?.userType !== 'agent') {
        throw new Error('Only agents can view statistics');
      }
      
      const { data } = await axios.get('/api/agent/stats');
      return data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch statistics';
      throw new Error(errorMessage);
    }
  };

  // Get agent analytics (for agents)
  const getAgentAnalytics = async (params = {}) => {
    try {
      if (user?.userType !== 'agent') {
        throw new Error('Only agents can view analytics');
      }
      
      const { data } = await axios.get('/api/analytics/dashboard', { params });
      return data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch analytics';
      throw new Error(errorMessage);
    }
  };

  // Helper function to check user type
  const isCandidate = () => user?.userType === 'candidate';
  const isAgent = () => user?.userType === 'agent';
  const isAdmin = () => Boolean(admin);

  // Helper function to get redirect path after login
  const getRedirectPath = (userType) => {
    switch (userType) {
      case 'agent':
        return '/agent';
      case 'candidate':
        return '/dashboard';
      default:
        return '/jobs';
    }
  };

  const value = {
    // State
    user,
    loading,
    error,
    userType,
    
    // Authentication methods
    login,
    signup,
    logout,
    
    // Profile methods
    updateProfile,
    
    // Job wishlist methods (candidates only)
    saveJob,
    unsaveJob,
    isJobSaved,
    
    // Agent methods
    getAgentStats,
    getAgentAnalytics,
    
    // Helper methods
    isCandidate,
    isAgent,
    isAdmin,
    getRedirectPath,
    
    // Utility
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


