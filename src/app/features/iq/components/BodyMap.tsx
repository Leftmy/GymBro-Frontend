/**
 * BodyMap
 * ───────
 * Orchestrates the front / back muscle SVG views with interactive hover and
 * active-selection states.
 *
 * Architecture
 * ─────────────
 * • MuscleFrontSVG / MuscleBackSVG are fully inline JSX SVGs whose DOM
 *   structure is preserved exactly from muscles_front_updated.svg /
 *   muscles_back_updated.svg.
 *
 * • Hover colours are injected via a dynamic <style> block inside each SVG.
 *   CSS author rules override SVG presentation attributes (fill="…") by
 *   specificity, so no path fill attributes need to be changed.
 *
 * • localHoveredGroupId — the EXACT SVG group ID being moused over (local
 *   state, no parent round-trip needed for the visual effect).
 *
 * • The parent (MusclesPage) still receives API slugs via onHover / onSelect
 *   so the exercise sidebar continues to work without any changes.
 */

import { useState } from "react";
import type { MuscleGroup } from "@/app/shared/types/api";
import { MuscleFrontSVG } from "./MuscleFrontSVG";
import { MuscleBackSVG }  from "./MuscleBackSVG";

export function BodyMap({
  view,
  muscles,
  activeSlug,
  onHover,
  onSelect,
}: {
  view: "front" | "back";
  muscles: MuscleGroup[];
  activeSlug: string | null;
  /** API slug of the currently hovered muscle (passed from parent — kept for
   *  interface compatibility; visual hover is managed locally). */
  hoverSlug: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  /** SVG group ID that is currently under the pointer (local, instant). */
  const [localHoveredGroupId, setLocalHoveredGroupId] = useState<string | null>(null);

  const knownSlugs = new Set(muscles.map((m) => m.slug));

  /** Called by the SVG component when the pointer enters an interactive group. */
  const handleGroupEnter = (groupId: string, apiSlug: string) => {
    setLocalHoveredGroupId(groupId);
    onHover(apiSlug); // propagate API slug to parent
  };

  /** Called when the pointer leaves any group. */
  const handleGroupLeave = () => {
    setLocalHoveredGroupId(null);
    onHover(null);
  };

  /** Called when the user clicks an interactive group. */
  const handleGroupClick = (apiSlug: string) => {
    onSelect(apiSlug);
  };

  const svgProps = {
    localHoveredGroupId,
    activeApiSlug: activeSlug,
    knownSlugs,
    onGroupEnter: handleGroupEnter,
    onGroupLeave: handleGroupLeave,
    onGroupClick: handleGroupClick,
  };

  return (
    /*
     * White canvas — required because the SVGs use white fills (path fill="…")
     * on a transparent background; on dark themes the fills would otherwise be
     * invisible. max-w / aspect-ratio match the SVG viewBox (997 : 1000 ≈ 1:1).
     */
    <div
      style={{
        position:     "relative",
        maxWidth:     300,
        width:        "100%",
        aspectRatio:  "997 / 1000",
        margin:       "0 auto",
        background:   "#ffffff",
        borderRadius: 6,
        overflow:     "hidden",
      }}
    >
      {view === "front"
        ? <MuscleFrontSVG {...svgProps} />
        : <MuscleBackSVG  {...svgProps} />
      }
    </div>
  );
}
