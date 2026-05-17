import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, userService } from "@/app/services";
import type { User } from "@/app/shared/types/api";

const TOKEN_KEY = "gymbro_jwt";

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { username: string; email: string; password: string; password_confirm: string }) => Promise<void>;
  logout: () => void;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    let cancelled = false;
    userService.getMe().then((u) => { if (!cancelled) { setUser(u); setLoading(false); } });
    return () => { cancelled = true; };
  }, [token]);

  const login = async (email: string, password: string) => {
    if (token !== null){
      setToken(null)
    }
    
    const tokens = await authService.login({ email, password });
    setToken(tokens.access);
  };

  const register = async (payload: { username: string; email: string; password: string; password_confirm: string }) => {
    if (token !== null){
      setToken(null)
    }
    await authService.register(payload);
    const tokens = await authService.login({ email: payload.email, password: payload.password });
    setToken(tokens.access);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
