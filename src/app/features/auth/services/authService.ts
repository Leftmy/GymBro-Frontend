import type { AuthTokens, User } from "@/app/shared/types/api";
import { request, tokenStorage } from "@/app/shared/services/apiClient";
import { mockUser } from "@/app/shared/mocks/mockData";
import { refreshTokenStorage } from "@/app/shared/services/refreshTokenStorage";

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const tokens = await request<AuthTokens>("users/auth/login/", {
      method: "POST",
      auth: false,
      body: payload,
      mock: () => ({ access: `mock-jwt.${btoa(payload.email)}.token`, refresh: "mock-refresh" }),
    });
    if (tokens?.access) tokenStorage.set(tokens.access);
    if (tokens?.refresh) refreshTokenStorage.set(tokens.refresh);
    return tokens;
  },

  async refresh(): Promise<AuthTokens | null> {
    const refresh = refreshTokenStorage.get();
    if (!refresh) {
      tokenStorage.clear();
      return null;
    }
    try {
      const tokens = await request<AuthTokens>("users/auth/refresh/", {
        method: "POST",
        auth: false,
        body: { refresh },
        mock: () => ({ access: `mock-jwt.refreshed`, refresh: "mock-rotated" }),
      });
      if (tokens?.access) tokenStorage.set(tokens.access);
      if (tokens?.refresh) refreshTokenStorage.set(tokens.refresh);
      return tokens;
    } catch (err) {
      tokenStorage.clear();
      refreshTokenStorage.clear();
      return null;
    }
  },

  async register(payload: RegisterPayload): Promise<User> {
    return request<User>("users/auth/register/", {
      method: "POST",
      auth: false,
      body: payload,
      mock: () => ({ ...mockUser, username: payload.username, email: payload.email }),
    });
  },

  logout(): void {
    const refresh = refreshTokenStorage.get();
    if (refresh) {
      // Attempt to inform server to blacklist the refresh token; ignore errors.
      request("users/auth/logout/", { method: "POST", auth: false, body: { refresh } }).catch(() => {});
    }
    tokenStorage.clear();
    refreshTokenStorage.clear();
  },
};
