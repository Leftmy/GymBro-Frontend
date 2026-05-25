const REFRESH_TOKEN_KEY = "gymbro_refresh_jwt";

export const refreshTokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {}
  },
  clear(): void {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {}
  },
};

export default refreshTokenStorage;
