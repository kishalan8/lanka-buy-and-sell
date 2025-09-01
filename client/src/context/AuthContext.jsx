import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Axios interceptors for auth token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) logout();
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check auth on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const { data } = await axios.get('/api/users/profile');
          if (data) setUser(data);
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

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post('/api/users/login', { email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/home');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Signup
  const signup = async (data) => {
  try {
    setError(null);
    setLoading(true);

    const response = await axios.post('/api/users/signup', data, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Signup failed';
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};


  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/');
  };

  // --------- Wishlist (savedBikes) functions ---------

  // Add bike to wishlist
  const saveBike = async (bikeId) => {
    try {
      const { data } = await axios.post(`/api/users/wishlist/${bikeId}`);
      setUser(prev => ({ ...prev, savedBikes: data.savedBikes }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save bike';
      throw new Error(msg);
    }
  };

  // Remove bike from wishlist
  const unsaveBike = async (bikeId) => {
    try {
      const { data } = await axios.delete(`/api/users/wishlist/${bikeId}`);
      setUser(prev => ({ ...prev, savedBikes: data.savedBikes }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to remove bike';
      throw new Error(msg);
    }
  };

  // Check if a bike is saved
  const isBikeSaved = (bikeId) => {
    if (!user?.savedBikes) return false;
    return user.savedBikes.some(b => b.bikeId === bikeId);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    setError,
    setUser,

    // Wishlist
    saveBike,
    unsaveBike,
    isBikeSaved,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
