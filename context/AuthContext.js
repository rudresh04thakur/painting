import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token and user in localStorage on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token) {
      if (userData) {
         try { setUser(JSON.parse(userData)); } catch(e) {}
      }
      
      // Refresh user data from server
      fetch('/api/user/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => {
           if (r.ok) return r.json();
           throw new Error('Failed');
        })
        .then(u => {
           setUser(u);
           localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => {
           // If fetch fails (e.g. invalid token), logout
           localStorage.removeItem('token');
           localStorage.removeItem('user');
           setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.push('/dashboard');
  };

  const updateUser = (userData) => {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // Call server to clear cookie
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
