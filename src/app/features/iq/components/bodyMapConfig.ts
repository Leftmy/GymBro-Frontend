/**
 * Body-map interaction configuration.
 *
 * Each SVG <g id="…"> maps to:
 *  • an API muscle slug  (used for onSelect / onHover callbacks)
 *  • a unique hover colour (shown when that specific group is hovered or active)
 *
 * Non-interactive group IDs (structural/decorative) are listed separately;
 * they never receive pointer events, hover styles, or transitions.
 */

// ── Non-interactive (structural / decorative) ─────────────────────────────────
export const NON_INTERACTIVE_FRONT = new Set([
  "body_outline",
  "full_torso",
  "abs_outlines",
  "legs_outline",
  "misc",
  "head",
]);

export const NON_INTERACTIVE_BACK = new Set([
  "body_outline",
  "misc",
  "head",
]);

// ── SVG group ID → API slug ───────────────────────────────────────────────────

/** Front-view interactive groups */
export const FRONT_GROUP_API: Record<string, string> = {
  chest:      "chest",
  shoulders:  "shoulders",
  abs:        "abs",
  biceps:     "biceps",
  forearms:   "biceps",    // front forearms → biceps group
  obliques:   "abs",       // obliques map to abs
  traps:      "back",      // trapezius → back
  glutes:     "glutes",
  quadriceps: "quads",
  hips:       "quads",     // hip flexors → quads
  calves:     "calves",
  neck:       "neck",      // neck is its own muscle group
};

/** Back-view interactive groups */
export const BACK_GROUP_API: Record<string, string> = {
  calves:       "calves",
  hamstrings:   "hamstrings",
  glutes:       "glutes",
  forearms:     "triceps",   // back forearms → triceps group
  triceps:      "triceps",
  lats:         "back",
  teres_major:  "back",
  rotator_cuff: "shoulders",
  rear_delt:    "shoulders",
  lower_traps:  "back",
  middle_traps: "back",
  upper_traps:  "back",
};

// ── Unique hover colour per SVG group ID ──────────────────────────────────────

export const GROUP_COLORS: Record<string, string> = {
  // ── Front ──────────────────────────────────────────
  chest:        "#ef4444",  // red
  shoulders:    "#f97316",  // orange
  abs:          "#eab308",  // yellow
  biceps:       "#3b82f6",  // blue
  forearms:     "#8b5cf6",  // purple   (distinct from biceps even when same API slug)
  obliques:     "#f59e0b",  // amber    (distinct from abs)
  traps:        "#6366f1",  // indigo
  glutes:       "#ec4899",  // pink
  quadriceps:   "#22c55e",  // green
  hips:         "#84cc16",  // lime     (distinct from quads)
  calves:       "#06b6d4",  // cyan
  neck:         "#14b8a6",  // teal — distinct from shoulders (orange) and back (indigo)
  // ── Back (additional) ──────────────────────────────
  hamstrings:   "#f43f5e",  // rose
  triceps:      "#0ea5e9",  // sky
  lats:         "#10b981",  // emerald
  teres_major:  "#7c3aed",  // violet
  rotator_cuff: "#d946ef",  // fuchsia
  rear_delt:    "#fb923c",  // orange-400
  lower_traps:  "#818cf8",  // indigo-400
  middle_traps: "#a5b4fc",  // indigo-300
  upper_traps:  "#c7d2fe",  // indigo-200
};

// ── Style-string builder ──────────────────────────────────────────────────────

/**
 * Builds the CSS string that goes inside the SVG <style> element.
 *
 * Strategy:
 *  – CSS author styles always override SVG presentation attributes (fill="…")
 *    so `#chest path { fill: red }` beats the path's own `fill="#ffffff"`.
 *  – Transitions are applied globally to `g path` so they animate smoothly.
 *  – cursor:pointer is set per interactive group via CSS (not inline style).
 */
export function buildMuscleStyle(
  groupApiMap: Record<string, string>,
  knownSlugs: Set<string>,
  localHoveredGroupId: string | null,
  activeApiSlug: string | null,
): string {
  const rules: string[] = [
    // Smooth fill / opacity transitions on every path inside a group
    "g path { transition: fill 0.2s ease, fill-opacity 0.2s ease; }",
  ];

  for (const [groupId, apiSlug] of Object.entries(groupApiMap)) {
    const isKnown  = knownSlugs.has(apiSlug);
    const isHovered = localHoveredGroupId === groupId && isKnown;
    const isActive  = activeApiSlug !== null && activeApiSlug === apiSlug;

    // Pointer cursor only for groups whose API slug is available
    if (isKnown) {
      rules.push(`#${groupId} { cursor: pointer; }`);
    }

    if (isHovered || isActive) {
      const color   = GROUP_COLORS[groupId] ?? "#f97316";
      // Hovered: 45% opacity; Active: 65%; Both: 60%
      const opacity = isActive && isHovered ? 0.6 : isActive ? 0.65 : 0.45;
      rules.push(`#${groupId} path { fill: ${color}; fill-opacity: ${opacity}; }`);
    }
  }

  return rules.join("\n");
}
