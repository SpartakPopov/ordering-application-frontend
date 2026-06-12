import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function parseRole(token) {
  try {
    return JSON.parse(atob(token.split('.')[1])).role ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // sessionStorage survives page refresh but clears when the tab is closed
  const [token, setToken] = useState(() => sessionStorage.getItem('auth_token'));
  const [role,  setRole]  = useState(() => {
    const t = sessionStorage.getItem('auth_token');
    return t ? parseRole(t) : null;
  });

  function login(newToken) {
    sessionStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setRole(parseRole(newToken));
  }

  function logout() {
    sessionStorage.removeItem('auth_token');
    setToken(null);
    setRole(null);
  }

  // Convenience: build the Authorization header for protected API calls
  function authHeader() {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return (
    <AuthContext.Provider value={{ token, role, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
