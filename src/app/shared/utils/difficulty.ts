// Utility helpers to map exercise difficulty values to i18n keys
export const DIFFICULTY_KEYS: Record<number, string> = {
  1: "iq.difficultyEasy",
  2: "iq.difficultyIntermediate",
  3: "iq.difficultyHard",
};

export function difficultyKeyFromValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    return DIFFICULTY_KEYS[value] ?? null;
  }

  if (typeof value === "string") {
    const n = parseInt(value, 10);
    if (!Number.isNaN(n)) return DIFFICULTY_KEYS[n] ?? null;

    const s = value.trim().toLowerCase();
    if (["easy", "e", "1", "beginner"].includes(s)) return DIFFICULTY_KEYS[1];
    if (["intermediate", "medium", "mid", "2"].includes(s)) return DIFFICULTY_KEYS[2];
    if (["hard", "h", "3", "advanced"].includes(s)) return DIFFICULTY_KEYS[3];
  }

  return null;
}

export function getDifficultyLabel(t: (k: string, opts?: any) => string, value: unknown): string {
  const key = difficultyKeyFromValue(value);
  if (key) return t(key as string);
  if (value === null || value === undefined) return "—";
  return String(value);
}

export default getDifficultyLabel;
