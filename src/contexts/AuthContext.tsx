import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, fetchMe } from "../api/client";
import type { SystemUserOut } from "../types/api";

interface AuthContextType {
  token: string | null;
  user: SystemUserOut | null;
  role: "admin" | "specialist" | "observer" | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("ueba_jwt_token"));
  const [user, setUser] = useState<SystemUserOut | null>(null);
  const [role, setRole] = useState<"admin" | "specialist" | "observer" | null>(
    (localStorage.getItem("ueba_system_role") as any) || null
  );
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const u = await fetchMe();
      setUser(u);
      setRole(u.role as any);
      localStorage.setItem("ueba_system_role", u.role);
      localStorage.setItem("ueba_actor_name", u.username);
      localStorage.setItem("ueba_actor_role", u.role);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    const data = await loginUser(username, password);
    const realToken = data.access_token;
    setToken(realToken);
    localStorage.setItem("ueba_jwt_token", realToken);

    // Fetch real user profile
    try {
      const me = await fetchMe();
      setUser(me);
      setRole(me.role as any);
      localStorage.setItem("ueba_system_role", me.role);
      localStorage.setItem("ueba_actor_name", me.username);
      localStorage.setItem("ueba_actor_role", me.role);
    } catch {
      // Fallback if /auth/me fails
      setUser({ username, id: 0, role: "admin", is_active: true } as any);
      setRole("admin");
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("ueba_jwt_token");
    localStorage.removeItem("ueba_system_role");
    localStorage.removeItem("ueba_actor_name");
    localStorage.removeItem("ueba_actor_role");
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
