import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // First try to get user from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          }

          // Then try to validate with server (but don't fail if it doesn't work)
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData.data.user);
            localStorage.setItem('user', JSON.stringify(userData.data.user));
          } catch (serverError) {
            console.warn('Server validation failed, using cached user data:', serverError);
            // Don't logout if server validation fails, just use cached data
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Only logout if there's no stored user data
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          authService.logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials, isAdmin = true) => {
    try {
      setLoading(true);
      let response;

      if (isAdmin) {
        response = await authService.adminLogin(credentials);
      } else {
        response = await authService.candidateLogin(credentials.email, credentials.application_id);
      }

      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      toast.success('Login successful!');

      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role && ['HR', 'Evaluator', 'MD', 'Super Admin'].includes(user.role),
    isCandidate: user?.role === 'Candidate'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
