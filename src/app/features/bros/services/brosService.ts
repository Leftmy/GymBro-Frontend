import type { Bro, User } from "@/app/shared/types/api";
import { request } from "@/app/shared/services/apiClient";
import { mockBros, mockIncomingBros, mockOutgoingBros, mockUsers } from "@/app/shared/mocks/mockData";

let accepted: Bro[] = structuredClone(mockBros);
let incoming: Bro[] = structuredClone(mockIncomingBros);
let outgoing: Bro[] = structuredClone(mockOutgoingBros);
let nextId = 100;

export const brosService = {
  async getBros(type: "accepted" | "incoming" | "outgoing"): Promise<Bro[]> {
    return request<Bro[]>("/bros/", {
      query: { type },
      mock: () => {
        if (type === "accepted") return structuredClone(accepted);
        if (type === "incoming") return structuredClone(incoming);
        return structuredClone(outgoing);
      },
    });
  },

  async sendBroRequest(userUuid: string): Promise<Bro> {
    return request<Bro>("/bros/", {
      method: "POST",
      body: { user_uuid: userUuid },
      mock: () => {
        const target = mockUsers.find((u) => u.uuid === userUuid);
        if (!target) throw new Error("User not found");
        const already = [...accepted, ...incoming, ...outgoing].find(
          (b) => b.receiver.uuid === userUuid || b.sender.uuid === userUuid
        );
        if (already) return structuredClone(already);
        const bro: Bro = {
          id: nextId++,
          sender: { id: 1, uuid: "11111111-1111-1111-1111-111111111111", username: "iron_alex", email: "alex@gymbro.app", role: "client", created_at: "2025-01-12T08:00:00Z" },
          receiver: target,
          status: "pending",
          created_at: new Date().toISOString(),
        };
        outgoing = [...outgoing, bro];
        return structuredClone(bro);
      },
    });
  },

  async acceptBro(broId: number): Promise<Bro> {
    return request<Bro>(`/bros/${broId}/`, {
      method: "PATCH",
      body: { status: "accepted" },
      mock: () => {
        const bro = incoming.find((b) => b.id === broId);
        if (!bro) throw new Error("Bro request not found");
        const updated = { ...bro, status: "accepted" as const };
        incoming = incoming.filter((b) => b.id !== broId);
        accepted = [...accepted, updated];
        return structuredClone(updated);
      },
    });
  },

  async deleteBro(broId: number): Promise<void> {
    return request<void>(`/bros/${broId}/`, {
      method: "DELETE",
      mock: () => {
        accepted = accepted.filter((b) => b.id !== broId);
        incoming = incoming.filter((b) => b.id !== broId);
        outgoing = outgoing.filter((b) => b.id !== broId);
        return undefined as unknown as void;
      },
    });
  },

  async searchUsers(query: string): Promise<User[]> {
    return request<User[]>("/users/search/", {
      query: { search: query },

      mock: () => {
        const q = query.trim().toLowerCase();

        if (q.length < 2) return [];

        return structuredClone(
          mockUsers.filter(
            (u) =>
              u.id !== 1 &&
              u.username.toLowerCase().includes(q)
          )
        );
      },
    });
  },
};
