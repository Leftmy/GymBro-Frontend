/**
 * ExerciseFilterModal
 * ───────────────────
 * Reusable, centered filter modal for /iq/exercises/ query params.
 * Used by both IQ ExercisesPage and Gym CreateWorkoutPage ExercisePicker.
 *
 * Props mirror the `useExerciseFilters` hook interface so callers just
 * forward their draft state and callbacks — no logic lives here.
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { ExerciseFilters, MuscleGroup } from "@/app/shared/types/api";

const DIFFICULTY_OPTIONS = [
  { value: undefined, labelKey: "iq.difficultyAny" },
  { value: 1,         labelKey: "iq.difficultyEasy" },
  { value: 2,         labelKey: "iq.difficultyIntermediate" },
  { value: 3,         labelKey: "iq.difficultyHard" },
] as const;

interface Props {
  draft: ExerciseFilters;
  muscles: MuscleGroup[];
  onChange: <K extends keyof ExerciseFilters>(key: K, value: ExerciseFilters[K]) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
  /** Override z-index for nesting inside other modals (default: z-50) */
  zIndex?: string;
}

export function ExerciseFilterModal({
  draft,
  muscles,
  onChange,
  onApply,
  onReset,
  onClose,
  zIndex = "z-50",
}: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const tMuscle = (m: MuscleGroup) =>
    t(`iq.muscleNames.${m.slug}`, { defaultValue: m.name }) as string;

  return (
    <div
      className={`fixed inset-0 ${zIndex} bg-black/50 backdrop-blur-sm flex items-center justify-center p-4`}
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 fade-in duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <h2>{t("iq.filterTitle")}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label={t("gym.close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter fields */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[65vh]">

          {/* Name search */}
          {/*
            Search temporarily disabled because localized names are incomplete
            and cause inconsistent results across languages. Keep markup here
            commented so it can be re-enabled later when localization is ready.

            
          <Field label={t("iq.search").replace("…", "")}>
            <input
              type="text"
              value={draft.name ?? ""}
              onChange={(e) => onChange("name", e.target.value || undefined)}
              placeholder={t("iq.search")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </Field>
          */}

          {/* Muscle group */}
          <Field label={t("iq.muscles")}>
            <select
              value={draft.muscle ?? ""}
              onChange={(e) => onChange("muscle", e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">{t("iq.allMuscles")}</option>
              {muscles.map((m) => (
                <option key={m.id} value={m.slug}>
                  {tMuscle(m)}
                </option>
              ))}
            </select>
          </Field>

          {/* Difficulty — pill buttons */}
          <Field label={t("iq.difficulty")}>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map(({ value, labelKey }) => {
                const active = draft.difficulty === value;
                return (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => onChange("difficulty", value)}
                    className={[
                      "px-3 py-1.5 rounded-full border text-sm transition-colors",
                      active
                        ? "border-transparent text-background"
                        : "border-border text-muted-foreground hover:bg-muted",
                    ].join(" ")}
                    style={active ? { backgroundColor: "var(--accent-orange)" } : undefined}
                  >
                    {t(labelKey)}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Equipment */}
          <Field label={t("iq.equipment")}>
            <select
              value={draft.equipment ?? ""}
              onChange={(e) => onChange("equipment", e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">{t("iq.allEquipment")}</option>
              <option value="barbell">{t("iq.equipmentOptions.barbell")}</option>
              <option value="dumbbell">{t("iq.equipmentOptions.dumbbell")}</option>
              <option value="bodyweight">{t("iq.equipmentOptions.bodyweight")}</option>
              <option value="machine">{t("iq.equipmentOptions.machine")}</option>
              <option value="cable">{t("iq.equipmentOptions.cable")}</option>
              <option value="kettlebell">{t("iq.equipmentOptions.kettlebell")}</option>
              <option value="resistance-band">{t("iq.equipmentOptions.resistance-band")}</option>
            </select>
          </Field>

          {/* ── "Primary muscle only" and "Exercise ID" fields removed ── */}

        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t("iq.resetFilters")}
          </button>
          <button
            type="button"
            onClick={onApply}
            className="px-5 py-2 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity text-sm"
          >
            {t("iq.applyFilters")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Helper ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-muted-foreground text-sm">{label}</label>
      {children}
    </div>
  );
}