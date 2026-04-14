import { useState, useEffect } from 'react';
import { AuthContext } from './useAuth';

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;
  return { ...rawUser, id: rawUser.id || rawUser._id };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        const parsedUser = normalizeUser(JSON.parse(storedUser));
        setToken(storedToken);
        setUser(parsedUser);
      }
    } catch (e) {
      console.error('Failed to parse user:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken, newUser) => {
    const normalizedUser = normalizeUser(newUser);
    setToken(newToken);
    setUser(normalizedUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => {
    const normalizedUser = normalizeUser(updatedUser);
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};