import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Play, SlidersHorizontal, X } from "lucide-react";
import { iqService } from "@/app/services";
import type { Exercise, MuscleGroup } from "@/app/shared/types/api";
import { nameToSlug } from "@/app/shared/utils/nameToSlug";
import { useExerciseFilters } from "@/app/shared/hooks/useExerciseFilters";
import { ExerciseFilterModal } from "@/app/shared/components/common/ExerciseFilterModal";
import { SkeletonList } from "@/app/shared/components/common/SkeletonList";
import { ExerciseVideoModal } from "@/app/features/iq/components/ExerciseVideoModal";
import { getDifficultyLabel } from "@/app/shared/utils/difficulty";

export function ExercisesPage() {
  const { t, i18n } = useTranslation();
  const [muscles, setMuscles] = useState<MuscleGroup[]>([]);
  const [items, setItems] = useState<Exercise[] | null>(null);
  const [video, setVideo] = useState<Exercise | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    committed,
    draft,
    activeCount,
    openModal,
    setDraftField,
    applyDraft,
    resetFilters,
    removeFilter,
  } = useExerciseFilters();

  useEffect(() => { iqService.getMuscles().then(setMuscles); }, []);

  useEffect(() => {
    setItems(null);
    iqService.getExercises(committed).then(setItems);
  }, [committed]);

  const handleOpenFilter = () => {
    openModal();
    setFilterOpen(true);
  };

  const handleApply = () => {
    applyDraft();
    setFilterOpen(false);
  };

  const handleReset = () => {
    resetFilters();
    setFilterOpen(false);
  };

  const tMuscle = (m: MuscleGroup) =>
    t(`iq.muscleNames.${m.slug}`, { defaultValue: m.name }) as string;

  const tExercise = (name: string) =>
    t(`iq.exerciseNames.${nameToSlug(name)}`, { defaultValue: name }) as string;

  const getExerciseDescription = (ex: Exercise) => {
    const lang = (i18n.language || "en").split("-")[0];
    const di18n = (ex as any).description_i18n as Record<string, string> | undefined;

    if (di18n && typeof di18n === "object") {
      return di18n[lang] ?? di18n["en"] ?? ex.description;
    }

    return ex.description;
  };

  /** Human-readable label for each active committed filter key */
  const chipLabel = (key: string, value: unknown): string => {
    switch (key) {
      case "name":       return `"${value}"`;
      case "muscle": {
        const m = muscles.find((x) => x.slug === value);
        return m ? tMuscle(m) : String(value);
      }
      case "difficulty": return getDifficultyLabel(t, value);
      case "equipment":  return String(value);
      case "primary":    return t("iq.primaryOnly");
      case "id":         return `ID ${value}`;
      default:           return String(value);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar: Filter button ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleOpenFilter}
          className={[
            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors text-sm",
            activeCount > 0
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:bg-muted",
          ].join(" ")}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeCount > 0
            ? t("iq.filterBtnActive", { count: activeCount })
            : t("iq.filterBtn")}
        </button>

        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {t("iq.resetFilters")}
          </button>
        )}
      </div>

      {/* ── Active filter chips ── */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2" aria-label={t("iq.activeFilters")}>
          {(Object.entries(committed) as [string, unknown][]).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-muted text-sm"
            >
              {chipLabel(key, value)}
              <button
                type="button"
                onClick={() => removeFilter(key as keyof typeof committed)}
                className="p-0.5 rounded-full hover:bg-foreground/10 transition-colors"
                aria-label={`Remove ${key} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Exercise list ── */}
      {!items && <SkeletonList />}

      {items && items.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">{t("iq.noExercises")}</p>
      )}

      {items && items.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3">
          {items.map((ex) => {
            const desc = getExerciseDescription(ex);

            return (
              <button
                key={ex.id}
                onClick={() => setVideo(ex)}
                className="text-left border border-border rounded-xl p-4 bg-card hover:shadow-md hover:-translate-y-0.5 transition group"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-full inline-flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                      style={{ backgroundColor: "color-mix(in oklab, var(--accent-orange) 25%, transparent)" }}
                    >
                      <Play className="w-3.5 h-3.5" style={{ color: "var(--accent-orange)" }} />
                    </span>
                    {tExercise(ex.name)}
                  </h3>
                  <span className="text-muted-foreground shrink-0 text-sm">{getDifficultyLabel(t, ex.difficulty)}</span>
                </div>
                {desc && (
                  <p className="text-muted-foreground mt-1 text-sm">{desc}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {ex.muscles.map((m) => (
                    <span
                      key={m.id}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {tMuscle(m)}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Modals ── */}
      {filterOpen && (
        <ExerciseFilterModal
          draft={draft}
          muscles={muscles}
          onChange={setDraftField}
          onApply={handleApply}
          onReset={handleReset}
          onClose={() => setFilterOpen(false)}
        />
      )}

      {video && <ExerciseVideoModal exercise={video} onClose={() => setVideo(null)} />}
    </div>
  );
}
