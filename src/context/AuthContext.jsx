import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function parseRole(token) {
  try {
    return JSON.parse(atob(token.split('.')[1])).role ?? null; // a JWT token has 3 parts seperated by dots
    // token.split grabs only the middle part, then atob decodes it and reads the role
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
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
