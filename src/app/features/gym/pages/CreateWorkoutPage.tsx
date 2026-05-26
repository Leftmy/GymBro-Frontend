import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { X, SlidersHorizontal } from "lucide-react";
import { gymService, iqService } from "@/app/services";
import type { DayOfWeek, Exercise, MuscleGroup, WorkoutExerciseMap } from "@/app/shared/types/api";
import { exerciseSlug } from "@/app/services";
import { nameToSlug } from "@/app/shared/utils/nameToSlug";
import { getDifficultyLabel } from "@/app/shared/utils/difficulty";
import { useExerciseFilters } from "@/app/shared/hooks/useExerciseFilters";
import { ExerciseFilterModal } from "@/app/shared/components/common/ExerciseFilterModal";

interface SelectedExercise extends WorkoutExerciseMap {
  name: string;
}

const DAY_OPTIONS: { value: DayOfWeek | null; key: string }[] = [
  { value: null, key: "none" },
  { value: 1, key: "monday" }, { value: 2, key: "tuesday" }, { value: 3, key: "wednesday" },
  { value: 4, key: "thursday" }, { value: 5, key: "friday" }, { value: 6, key: "saturday" },
  { value: 7, key: "sunday" },
];

export function CreateWorkoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [day, setDay] = useState<DayOfWeek | null>(null);
  const [picker, setPicker] = useState(false);
  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name || selected.length === 0) return;
    setSubmitting(true);
    const created = await gymService.createWorkout({
      name,
      description,
      is_public: isPublic,
      exercises: selected.map(({ name: _n, ...rest }) => rest),
    });
    // Always create a user assignment for the created workout so it appears
    // in "My Workouts" (day can be null for "No specific day").
    await gymService.assignWorkoutToUser({
      workout_plan_id: created.id,
      day_of_week: day,
      is_active: false,
    });
    setSubmitting(false);
    navigate("/gym/workouts");
  };

  return (
    <div className="max-w-xl space-y-4">
      {/* Step progress bar */}
      <div className="flex gap-2 items-center">
        {([1, 2] as const).map((s) => (
          <div key={s} className="flex-1 flex flex-col gap-1">
            <div
              className={`h-1.5 rounded-full transition-all ${
                step >= s ? "bg-foreground" : "bg-muted"
              }`}
            />
            <span
              className={`text-xs ${
                step >= s ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s === 1 ? t("gym.stepDetails") : t("gym.stepExercises")}
            </span>
          </div>
        ))}
      </div>

      {/* ── Step 1: Details ── */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 space-y-4">
          <label className="block">
            <span className="text-muted-foreground">{t("gym.name")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("gym.name")}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background"
            />
          </label>

          <label className="block">
            <span className="text-muted-foreground">{t("gym.description")}</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t("gym.description")}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background resize-none"
            />
          </label>

          <div>
            <span className="text-muted-foreground">{t("gym.day")}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {DAY_OPTIONS.map((opt) => {
                const sel = day === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setDay(opt.value)}
                    className={[
                      "px-3 py-1.5 rounded-full border transition-colors text-sm",
                      sel
                        ? "border-transparent text-white"
                        : "border-border text-muted-foreground hover:bg-muted",
                    ].join(" ")}
                    style={sel ? { backgroundColor: "var(--accent-blue)" } : undefined}
                  >
                    {opt.value === null ? t("gym.days.none") : t(`gym.days.${opt.key}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span>{t("gym.public")}</span>
          </label>

          <button
            disabled={!name}
            onClick={() => setStep(2)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-foreground text-background disabled:opacity-50 transition-opacity"
          >
            {t("gym.next")}
          </button>
        </div>
      )}

      {/* ── Step 2: Exercises ── */}
      {step === 2 && (
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3>{t("iq.exercises")}</h3>
            <button
              type="button"
              onClick={() => setPicker(true)}
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-sm"
            >
              {t("gym.addExercise")}
            </button>
          </div>

          {selected.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">{t("gym.noExercisesYet")}</p>
              <button
                type="button"
                onClick={() => setPicker(true)}
                className="mt-3 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm"
              >
                {t("gym.addExercise")}
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {selected.map((s, i) => (
                <li
                  key={s.slug + i}
                  className="flex flex-wrap items-center gap-2 border border-border rounded-lg p-3 bg-background"
                >
                  <span className="flex-1 min-w-0 truncate">
                    {t(`iq.exerciseNames.${nameToSlug(s.name)}`, { defaultValue: s.name }) as string}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={1}
                      value={s.sets}
                      onChange={(e) =>
                        setSelected((cur) =>
                          cur.map((x, j) => (j === i ? { ...x, sets: Number(e.target.value) } : x))
                        )
                      }
                      className="w-14 px-2 py-1.5 rounded border border-border bg-card text-center"
                      aria-label="sets"
                    />
                    <span className="text-muted-foreground text-sm">×</span>
                    <input
                      type="number"
                      min={1}
                      value={s.reps}
                      onChange={(e) =>
                        setSelected((cur) =>
                          cur.map((x, j) => (j === i ? { ...x, reps: Number(e.target.value) } : x))
                        )
                      }
                      className="w-14 px-2 py-1.5 rounded border border-border bg-card text-center"
                      aria-label="reps"
                    />
                    <button
                      type="button"
                      onClick={() => setSelected((cur) => cur.filter((_, j) => j !== i))}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                      aria-label={t("gym.remove")}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted"
            >
              {t("gym.back")}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting || selected.length === 0}
              className="px-5 py-2.5 rounded-lg bg-foreground text-background disabled:opacity-50 transition-opacity"
            >
              {submitting ? t("gym.creating") : t("gym.createWorkout")}
            </button>
          </div>
        </div>
      )}

      {/* Exercise picker modal */}
      {picker && (
        <ExercisePicker
          onClose={() => setPicker(false)}
          onPick={(ex) => {
            setSelected((cur) => [
              ...cur,
              {
                slug: exerciseSlug(ex.name),
                name: ex.name,
                sets: 3,
                reps: 10,
                rest_seconds: 60,
                order: cur.length + 1,
              },
            ]);
            setPicker(false);
          }}
        />
      )}
    </div>
  );
}

/* ────────────────── Exercise Picker Modal ────────────────── */
function ExercisePicker({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (ex: Exercise) => void;
}) {
  const { t } = useTranslation();
  const [muscles, setMuscles] = useState<MuscleGroup[]>([]);
  const [items, setItems] = useState<Exercise[]>([]);
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

  const tExercise = (name: string) =>
    t(`iq.exerciseNames.${nameToSlug(name)}`, { defaultValue: name }) as string;

  const tMuscle = (m: MuscleGroup) =>
    t(`iq.muscleNames.${m.slug}`, { defaultValue: m.name }) as string;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl flex flex-col"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-4 border-b border-border space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h3>{t("gym.pickExercise")}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted" aria-label={t("gym.close")}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter button row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenFilter}
              className={[
                "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors",
                activeCount > 0
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted",
              ].join(" ")}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {activeCount > 0
                ? t("iq.filterBtnActive", { count: activeCount })
                : t("iq.filterBtn")}
            </button>

            {activeCount > 0 && (
              <>
                {/* Active filter chips */}
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {(Object.entries(committed) as [string, unknown][]).map(([key]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full bg-muted text-xs"
                    >
                      {key}
                      <button
                        onClick={() => removeFilter(key as keyof typeof committed)}
                        className="p-0.5 rounded-full hover:bg-foreground/10"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground text-xs shrink-0"
                >
                  {t("iq.resetFilters")}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Exercise list */}
        <div className="overflow-y-auto p-4 grid sm:grid-cols-2 gap-2">
          {items.length === 0 && (
            <p className="col-span-2 text-center text-muted-foreground py-8">
              {t("iq.noExercises")}
            </p>
          )}
          {items.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onPick(ex)}
              className="text-left border border-border rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <div className="flex justify-between gap-2">
                <span>{tExercise(ex.name)}</span>
                <span className="text-muted-foreground text-sm shrink-0">{getDifficultyLabel(t, ex.difficulty)}</span>
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">
                {ex.muscles.map((m) => tMuscle(m)).join(", ")}
              </p>
            </button>
          ))}
        </div>

        {/* Footer */}
        <footer className="shrink-0 p-3 border-t border-border flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-muted">
            {t("gym.close")}
          </button>
        </footer>
      </div>

      {/* Nested filter modal — higher z-index */}
      {filterOpen && (
        <ExerciseFilterModal
          draft={draft}
          muscles={muscles}
          onChange={setDraftField}
          onApply={handleApply}
          onReset={handleReset}
          onClose={() => setFilterOpen(false)}
          zIndex="z-[60]"
        />
      )}
    </div>
  );
}