/**
 * useExerciseFilters
 * ─────────────────
 * Shared hook that manages two layers of filter state:
 *   - `committed`  → the filters currently applied (used for API calls)
 *   - `draft`      → the filters being edited inside the filter modal
 *
 * Both IQ ExercisesPage and Gym CreateWorkoutPage / ExercisePicker use this
 * hook so the filtering logic is never duplicated.
 */

import { useState } from "react";
import type { ExerciseFilters } from "@/app/shared/types/api";

export interface UseExerciseFiltersReturn {
  /** Applied filters — pass directly to `iqService.getExercises()` */
  committed: ExerciseFilters;
  /** In-progress edits while the modal is open */
  draft: ExerciseFilters;
  /** Number of non-empty keys in `committed` */
  activeCount: number;
  /** Sync draft ← committed before opening the modal */
  openModal: () => void;
  /** Update a single key in the draft */
  setDraftField: <K extends keyof ExerciseFilters>(key: K, value: ExerciseFilters[K]) => void;
  /** Commit draft → committed (strips empty values) */
  applyDraft: () => void;
  /** Clear both committed and draft */
  resetFilters: () => void;
  /** Remove a single key from committed immediately (for chip × buttons) */
  removeFilter: (key: keyof ExerciseFilters) => void;
}

function isActive(v: ExerciseFilters[keyof ExerciseFilters]): boolean {
  return v !== undefined && v !== null && v !== "";
}

function stripEmpty(f: ExerciseFilters): ExerciseFilters {
  const out: ExerciseFilters = {};
  for (const [k, v] of Object.entries(f) as [keyof ExerciseFilters, unknown][]) {
    if (isActive(v as ExerciseFilters[keyof ExerciseFilters])) {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

export function useExerciseFilters(): UseExerciseFiltersReturn {
  const [committed, setCommitted] = useState<ExerciseFilters>({});
  const [draft, setDraft] = useState<ExerciseFilters>({});

  const activeCount = (Object.values(committed) as unknown[]).filter(isActive).length;

  const openModal = () => setDraft({ ...committed });

  const setDraftField = <K extends keyof ExerciseFilters>(
    key: K,
    value: ExerciseFilters[K]
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const applyDraft = () => setCommitted(stripEmpty(draft));

  const resetFilters = () => {
    setCommitted({});
    setDraft({});
  };

  const removeFilter = (key: keyof ExerciseFilters) =>
    setCommitted((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  return {
    committed,
    draft,
    activeCount,
    openModal,
    setDraftField,
    applyDraft,
    resetFilters,
    removeFilter,
  };
}
