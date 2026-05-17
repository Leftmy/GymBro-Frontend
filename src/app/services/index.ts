// Top-level barrel — the single import surface for all services.
// Components import from "@/app/services" so feature internals stay
// free to relocate without rippling through the codebase.

export { apiClient, ApiError, tokenStorage, API_BASE_URL, MOCK_API } from "@/app/shared/services/apiClient";

export { authService } from "@/app/features/auth/services/authService";
export { userService } from "@/app/features/user/services/userService";
export { gymService } from "@/app/features/gym/services/gymService";
export { iqService } from "@/app/features/iq/services/iqService";
export { blogService } from "@/app/features/blog/services/blogService";
export { brosService } from "@/app/features/bros/services/brosService";
export { messageService } from "@/app/features/messaging/services/messageService";

export { exerciseSlug } from "@/app/shared/mocks/mockData";
