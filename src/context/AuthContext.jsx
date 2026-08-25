import { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { profileService } from "../services/profileService";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      // Keep the shared user directory in sync (fire and forget)
      if (currentUser) {
        profileService.ensureProfile(currentUser).catch(() => {});
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    await authService.login(email, password);
    await refreshUser();
  };

  const register = async (email, password, name) => {
    await authService.register(email, password, name);
    await refreshUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
