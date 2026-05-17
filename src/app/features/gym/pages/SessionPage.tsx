import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Trophy, Flame, ChevronRight, SkipForward, Info } from "lucide-react";
import { gymService } from "@/app/services";
import type { WorkoutPlan } from "@/app/shared/types/api";
import { nameToSlug } from "@/app/shared/utils/nameToSlug";
import { ConfirmDialog } from "@/app/shared/components/common/ConfirmDialog";

/* ─────────────────────────────────────────────────────── SessionPage ──── */
export function SessionPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const initial = params.get("workout");
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [planId, setPlanId] = useState<number | null>(initial ? Number(initial) : null);
  const plan = plans.find((p) => p.id === planId) ?? null;

  useEffect(() => { gymService.listWorkoutPlans().then(setPlans); }, []);

  if (!plan) {
    return (
      <div className="max-w-md space-y-3">
        <h2>{t("gym.session_.startTitle")}</h2>
        <select
          value={planId ?? ""}
          onChange={(e) => setPlanId(e.target.value ? Number(e.target.value) : null)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
        >
          <option value="">{t("gym.session_.selectWorkout")}</option>
          {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
    );
  }

  return (
    <SessionRunner
      key={plan.id}
      plan={plan}
      onChangeWorkout={() => setPlanId(null)}
    />
  );
}

/* ──────────────────────────────────────────────────── SessionRunner ──── */
type ExerciseStatus = "pending" | "completed" | "skipped";

interface ExerciseProgress {
  setsLeft: number;
  status: ExerciseStatus;
}

function SessionRunner({
  plan,
  onChangeWorkout,
}: {
  plan: WorkoutPlan;
  onChangeWorkout: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sorted = useMemo(
    () => [...plan.exercises].sort((a, b) => a.order - b.order),
    [plan]
  );

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState<ExerciseProgress[]>(
    sorted.map((e) => ({ setsLeft: e.sets, status: "pending" as ExerciseStatus }))
  );
  const [resting, setResting] = useState(0);
  const [done, setDone] = useState<null | "completed" | "incomplete">(null);
  const [autoAdvanceMsg, setAutoAdvanceMsg] = useState(false);

  // Confirmation dialog states
  const [confirmChange, setConfirmChange] = useState(false);
  const [confirmEndEarly, setConfirmEndEarly] = useState(false);

  const timerRef = useRef<number | null>(null);
  const advanceRef = useRef<number | null>(null);
  // Ref to track total skipped count without closure issues in timeouts
  const skippedCountRef = useRef(0);

  const current = sorted[index];
  const cur = progress[index];

  // Countdown rest timer
  useEffect(() => {
    if (resting <= 0) return;
    timerRef.current = window.setTimeout(() => setResting((r) => r - 1), 1000);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [resting]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (advanceRef.current) window.clearTimeout(advanceRef.current);
  }, []);

  /** Translated exercise name (falls back to English API name) */
  const tExercise = (name: string) =>
    t(`iq.exerciseNames.${nameToSlug(name)}`, { defaultValue: name }) as string;

  /* ── Progress calculation — exercise-based, skips don't count ── */
  const totalExercises = sorted.length;
  const completedExercises = progress.filter((p) => p.status === "completed").length;
  const skippedExercises = progress.filter((p) => p.status === "skipped").length;
  const pct = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  /* ── Actions ── */
  const finishSet = () => {
    const newSetsLeft = Math.max(0, cur.setsLeft - 1);
    const nowCompleted = newSetsLeft === 0;

    setProgress((p) =>
      p.map((x, i) =>
        i === index
          ? { setsLeft: newSetsLeft, status: nowCompleted ? "completed" : "pending" }
          : x
      )
    );

    if (nowCompleted) {
      // Auto-advance: flash message then move to next exercise
      setAutoAdvanceMsg(true);
      advanceRef.current = window.setTimeout(() => {
        setAutoAdvanceMsg(false);
        setResting(0);
        if (index < sorted.length - 1) {
          setIndex((i) => i + 1);
        } else {
          // Final exercise complete — only "completed" if no skips
          setDone(skippedCountRef.current > 0 ? "incomplete" : "completed");
        }
      }, 900);
    } else {
      setResting(current.rest_seconds ?? 60);
    }
  };

  const skipExercise = () => {
    // Mark current exercise as skipped
    skippedCountRef.current += 1;
    setProgress((p) =>
      p.map((x, i) => (i === index ? { ...x, status: "skipped" } : x))
    );
    setResting(0);
    if (index < sorted.length - 1) {
      setIndex((i) => i + 1);
    } else {
      // Skipping the last exercise = always incomplete
      setDone("incomplete");
    }
  };

  const endEarly = () => {
    setDone("incomplete");
    setConfirmEndEarly(false);
  };

  const handleChangeConfirmed = () => {
    setConfirmChange(false);
    onChangeWorkout();
  };

  const handleFinishDone = () => {
    setDone(null);
    navigate("/gym/workouts");
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{t("gym.session")}</p>
          <h2>{plan.name}</h2>
        </div>
        <button
          onClick={() => setConfirmChange(true)}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {t("gym.session_.change")}
        </button>
      </div>

      {/* Global progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-muted-foreground">
          <span>{t("gym.session_.exerciseOf", { idx: index + 1, total: sorted.length })}</span>
          <div className="flex items-center gap-2">
            {skippedExercises > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "color-mix(in oklab, var(--accent-orange) 15%, transparent)",
                  color: "var(--accent-orange)",
                }}
              >
                {t("gym.session_.skippedCount", { count: skippedExercises })}
              </span>
            )}
            <span title={t("gym.session_.progressTooltip")}>{pct}%</span>
          </div>
        </div>

        {/* Track bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden relative">
          {/* Completed (green) */}
          <div
            className="h-full rounded-full transition-all duration-500 absolute left-0 top-0"
            style={{ width: `${pct}%`, backgroundColor: "var(--accent-lime)" }}
          />
        </div>

        {/* Helper text */}
        <div className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-muted-foreground shrink-0" />
          <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
            {t("gym.session_.skipNote")}
          </p>
        </div>
      </div>

      {/* Exercise card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
        {/* Sets counter + exercise name */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="leading-tight">{tExercise(current.exercise.name)}</h1>
            <div className="flex gap-5 text-muted-foreground mt-2">
              <span>
                {t("gym.session_.reps")}:{" "}
                <span className="text-foreground">{current.reps}</span>
              </span>
              <span>
                {t("gym.session_.rest")}:{" "}
                <span className="text-foreground">{current.rest_seconds ?? 60}s</span>
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span
              className="text-4xl leading-none"
              style={{ color: cur.setsLeft > 0 ? "var(--accent-orange)" : "var(--accent-lime)" }}
            >
              {cur.setsLeft}
            </span>
            <p className="text-muted-foreground text-sm mt-0.5">
              {t("gym.session_.setsLeft", { count: cur.setsLeft }).replace(/^\d+\s*/, "")}
            </p>
          </div>
        </div>

        {/* Auto-advance flash */}
        {autoAdvanceMsg && (
          <div
            className="rounded-xl p-3 text-center animate-in fade-in duration-200"
            style={{ backgroundColor: "color-mix(in oklab, var(--accent-lime) 20%, transparent)" }}
          >
            <p className="flex items-center justify-center gap-2">
              <Flame className="w-4 h-4" style={{ color: "var(--accent-lime)" }} />
              {t("gym.session_.autoAdvanced")}
            </p>
          </div>
        )}

        {/* Rest timer */}
        {resting > 0 && !autoAdvanceMsg && (
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "color-mix(in oklab, var(--accent-blue) 12%, transparent)" }}>
            <p className="text-muted-foreground">{t("gym.session_.resting")}</p>
            <p
              className="text-4xl font-semibold mt-1"
              style={{ color: "var(--accent-blue)" }}
            >
              {resting}s
            </p>
            <button
              onClick={() => setResting(0)}
              className="mt-2 text-muted-foreground underline text-sm"
            >
              {t("gym.session_.skipRest")}
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={finishSet}
            disabled={cur.setsLeft <= 0 || resting > 0 || autoAdvanceMsg}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-foreground text-background disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {t("gym.session_.finishSet")}
          </button>

          <button
            onClick={skipExercise}
            disabled={autoAdvanceMsg}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            {index < sorted.length - 1
              ? t("gym.session_.skipExercise")
              : t("gym.session_.skipAndEnd")}
          </button>

          <button
            onClick={() => setConfirmEndEarly(true)}
            className="ml-auto px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            {t("gym.session_.endEarly")}
          </button>
        </div>
      </div>

      {/* Exercise timeline */}
      <div className="space-y-1.5">
        {sorted.map((ex, i) => {
          const p = progress[i];
          const isActive = i === index;
          const isCompleted = p.status === "completed";
          const isSkipped = p.status === "skipped";

          return (
            <div
              key={i}
              className={[
                "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all",
                isActive
                  ? "border-foreground bg-muted"
                  : isCompleted
                    ? "border-border bg-card opacity-60"
                    : isSkipped
                      ? "border-border bg-card opacity-40"
                      : "border-border bg-card",
              ].join(" ")}
            >
              {/* Status dot */}
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: isActive
                    ? "var(--accent-orange)"
                    : isCompleted
                      ? "var(--accent-lime)"
                      : isSkipped
                        ? "color-mix(in oklab, var(--accent-orange) 60%, #888)"
                        : "var(--muted-foreground)",
                }}
              />

              {/* Name */}
              <span
                className={[
                  "flex-1 truncate",
                  isActive ? "" : "text-muted-foreground",
                  isSkipped ? "line-through" : "",
                ].join(" ")}
              >
                {tExercise(ex.exercise.name)}
              </span>

              {/* Right side: skipped badge OR sets×reps */}
              {isSkipped ? (
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: "color-mix(in oklab, var(--accent-orange) 15%, transparent)",
                    color: "var(--accent-orange)",
                  }}
                >
                  {t("gym.session_.skipped")}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm shrink-0">
                  {t("gym.setsReps", { sets: ex.sets, reps: ex.reps })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {done && (
        <FinishModal
          status={done}
          workoutName={plan.name}
          completedExercises={completedExercises}
          skippedExercises={skippedExercises}
          totalExercises={totalExercises}
          onClose={handleFinishDone}
        />
      )}

      {confirmChange && (
        <ConfirmDialog
          title={t("gym.session_.confirmChangeTitle")}
          message={t("gym.session_.confirmChangeMsg")}
          confirmLabel={t("gym.confirmOk")}
          cancelLabel={t("gym.confirmCancel")}
          danger
          onConfirm={handleChangeConfirmed}
          onCancel={() => setConfirmChange(false)}
        />
      )}

      {confirmEndEarly && (
        <ConfirmDialog
          title={t("gym.session_.confirmEndEarlyTitle")}
          message={t("gym.session_.confirmEndEarlyMsg")}
          confirmLabel={t("gym.confirmOk")}
          cancelLabel={t("gym.confirmCancel")}
          danger
          onConfirm={endEarly}
          onCancel={() => setConfirmEndEarly(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── FinishModal ──── */
function FinishModal({
  status,
  workoutName,
  completedExercises,
  skippedExercises,
  totalExercises,
  onClose,
}: {
  status: "completed" | "incomplete";
  workoutName: string;
  completedExercises: number;
  skippedExercises: number;
  totalExercises: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const quotes = useMemo(() => {
    const arr = t("gym.session_.olympiaQuotes", { returnObjects: true });
    return Array.isArray(arr)
      ? (arr as string[])
      : ["You didn't come this far to only come this far."];
  }, [t]);

  const [quoteIdx, setQuoteIdx] = useState(() =>
    Math.floor(Math.random() * quotes.length)
  );
  const [fading, setFading] = useState(false);

  // Rotate quotes every 3.5 s
  useEffect(() => {
    if (status !== "completed" || quotes.length <= 1) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setQuoteIdx((i) => (i + 1) % quotes.length);
        setFading(false);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [status, quotes.length]);

  const isCompleted = status === "completed";
  const pct = totalExercises > 0
    ? Math.round((completedExercises / totalExercises) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-8 w-full max-w-sm text-center space-y-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Icon */}
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          style={{
            backgroundColor: isCompleted
              ? "color-mix(in oklab, var(--accent-lime) 20%, transparent)"
              : "color-mix(in oklab, var(--accent-orange) 15%, transparent)",
          }}
        >
          {isCompleted ? (
            <Trophy className="w-9 h-9" style={{ color: "var(--accent-lime)" }} />
          ) : (
            <Flame className="w-9 h-9" style={{ color: "var(--accent-orange)" }} />
          )}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 style={{ color: isCompleted ? "var(--accent-lime)" : undefined }}>
            {isCompleted ? t("gym.session_.completedTitle") : t("gym.session_.incompleteTitle")}
          </h2>
          <p className="text-muted-foreground text-sm">{workoutName}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 py-2">
          <div>
            <p
              className="text-2xl font-semibold"
              style={{ color: isCompleted ? "var(--accent-lime)" : "var(--accent-orange)" }}
            >
              {completedExercises}/{totalExercises}
            </p>
            <p className="text-muted-foreground text-sm">exercises</p>
          </div>
          <div>
            <p
              className="text-2xl font-semibold"
              style={{ color: isCompleted ? "var(--accent-lime)" : "var(--accent-orange)" }}
            >
              {pct}%
            </p>
            <p className="text-muted-foreground text-sm">complete</p>
          </div>
          {skippedExercises > 0 && (
            <div>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--accent-orange)" }}
              >
                {skippedExercises}
              </p>
              <p className="text-muted-foreground text-sm">skipped</p>
            </div>
          )}
        </div>

        {/* Skipped note for incomplete sessions */}
        {skippedExercises > 0 && !isCompleted && (
          <p className="text-muted-foreground text-xs px-2">
            {t("gym.session_.skipNote")}
          </p>
        )}

        {/* Rotating quote (completed) or static subtitle (incomplete) */}
        <div className="min-h-[3rem] flex items-center justify-center">
          {isCompleted ? (
            <p
              className="italic text-muted-foreground transition-opacity duration-300"
              style={{ opacity: fading ? 0 : 1 }}
            >
              "{quotes[quoteIdx]}"
            </p>
          ) : (
            <p className="text-muted-foreground">{t("gym.session_.incompleteSubtitle")}</p>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-muted-foreground text-sm">{t("gym.session_.subtitle")}</p>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
        >
          {t("gym.session_.goToWorkouts")}
        </button>
      </div>
    </div>
  );
}
