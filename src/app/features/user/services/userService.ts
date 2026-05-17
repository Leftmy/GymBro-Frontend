import type { User } from "@/app/shared/types/api";
import { request } from "@/app/shared/services/apiClient";
import { mockUser } from "@/app/shared/mocks/mockData";

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
}

// Mock-only profile mutation state
let me: User = JSON.parse(JSON.stringify(mockUser));

export const userService = {
  async getMe(): Promise<User> {
    return request<User>("/users/me", {
      mock: () => ({ ...me }),
    });
  },

  async updateProfile(patch: UpdateProfilePayload): Promise<User> {
    return request<User>("/users/me", {
      method: "PATCH",
      body: patch,
      mock: () => {
        me = { ...me, username: patch.username ?? me.username, email: patch.email ?? me.email };
        return { ...me };
      },
    });
  },
};
