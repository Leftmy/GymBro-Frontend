/** Converts a display name to its i18n key slug: "Bench Press" → "bench-press" */
export const nameToSlug = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, "-");
