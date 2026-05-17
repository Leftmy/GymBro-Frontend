import { request } from "@/app/shared/services/apiClient";

export interface SendMessagePayload { to: string; body: string; }
export interface SentMessage { id: number; to: string; body: string; created_at: string; }

export const messageService = {
  async sendMessage(payload: SendMessagePayload): Promise<SentMessage> {
    return request<SentMessage>("/messages/", {
      method: "POST",
      body: payload,
      mock: () => ({
        id: Math.floor(Math.random() * 100000),
        to: payload.to,
        body: payload.body,
        created_at: new Date().toISOString(),
      }),
    });
  },
};
