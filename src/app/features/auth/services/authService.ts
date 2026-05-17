import type { AuthTokens, User } from "@/app/shared/types/api";
import { request, tokenStorage } from "@/app/shared/services/apiClient";
import { mockUser } from "@/app/shared/mocks/mockData";

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
    return tokens;
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
    tokenStorage.clear();
  },
};
