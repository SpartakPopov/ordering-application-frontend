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
  // Token lives only in memory — never written to localStorage or cookies
  // Safe from XSS: injected scripts cannot read React state
  const [token, setToken] = useState(null);
  const [role,  setRole]  = useState(null);

  function login(newToken) {
    setToken(newToken);
    setRole(parseRole(newToken));
  }

  function logout() {
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
