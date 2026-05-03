import { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe, logout as apiLogout, openLoginPopup } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    fetchMe().then(setUser);
  }, []);

  function login() {
    openLoginPopup(() => {
      fetchMe().then(setUser);
    });
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
