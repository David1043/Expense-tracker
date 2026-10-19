import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      setAuthError('');
      setChecking(true);
      if (!token) {
        setChecking(false);
        return;
      }
      try {
        const data = await apiRequest('/auth/me', 'GET', null, token);
        if (active) setUser(data.user);
      } catch (error) {
        if (!active) return;
        if (error.status === 401) {
          sessionStorage.removeItem('token');
          setToken('');
          setUser(null);
        } else {
          setAuthError(error.message);
        }
      } finally {
        if (active) setChecking(false);
      }
    }
    checkSession();
    return () => { active = false; };
  }, [token, retryCount]);

  async function login(email, password) {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    sessionStorage.setItem('token', data.token);
    setUser(data.user);
    setToken(data.token);
  }

  function logout() {
    sessionStorage.removeItem('token');
    setToken('');
    setUser(null);
    setAuthError('');
  }

  return (
    <AuthContext.Provider value={{ token, user, checking, authError, login, logout, retry: () => setRetryCount(value => value + 1) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
