import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, userService } from "@/app/services";
import { tokenStorage } from "@/app/shared/services/apiClient";
import { refreshTokenStorage } from "@/app/shared/services/refreshTokenStorage";
import type { User } from "@/app/shared/types/api";

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
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(token));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // If we don't have an access token but do have a refresh token, try to refresh.
        if (!token) {
          const storedRefresh = refreshTokenStorage.get();
          if (storedRefresh) {
            const tokens = await authService.refresh();
            if (tokens?.access) {
              setToken(tokens.access);
            } else {
              // Can't refresh — ensure cleared state
              authService.logout();
              if (!cancelled) {
                setToken(null);
                setUser(null);
              }
              return;
            }
          } else {
            if (!cancelled) setLoading(false);
            return;
          }
        }

        // At this point we should have an access token; validate by fetching "me"
        const me = await userService.getMe();
        if (!cancelled) setUser(me);
      } catch (err: any) {
        if (err?.status === 401) {
          // Try to refresh once more
          const tokens = await authService.refresh();
          if (tokens?.access) {
            if (!cancelled) setToken(tokens.access);
            try {
              const me2 = await userService.getMe();
              if (!cancelled) setUser(me2);
            } catch {
              authService.logout();
              if (!cancelled) {
                setToken(null);
                setUser(null);
              }
            }
          } else {
            authService.logout();
            if (!cancelled) {
              setToken(null);
              setUser(null);
            }
          }
        } else {
          console.error("Failed to validate auth token", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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
