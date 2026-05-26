import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import { gymService } from "@/app/services";
import type { DayOfWeek, UserWorkoutPlan, WorkoutPlan } from "@/app/shared/types/api";

const DAY_OPTS: { value: DayOfWeek | ""; key: string }[] = [
  { value: "", key: "none" },
  { value: 1, key: "monday" }, { value: 2, key: "tuesday" }, { value: 3, key: "wednesday" },
  { value: 4, key: "thursday" }, { value: 5, key: "friday" }, { value: 6, key: "saturday" },
  { value: 7, key: "sunday" },
];

export function AssignWorkoutPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [planId, setPlanId] = useState<number | "">("");
  const [day, setDay] = useState<DayOfWeek | "">("");
  const [active, setActive] = useState(true);
  const [last, setLast] = useState<UserWorkoutPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    gymService.listWorkoutPlans().then(setPlans);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;
    setSubmitting(true);
    const planIdNum = planId as number;
    const dayOfWeek = day === "" ? null : day;
    // If this workout plan is already assigned to the user, update the
    // existing assignment instead of creating a duplicate.
    const allUserWorkouts = await gymService.getWorkouts("all");
    const existing = allUserWorkouts.find((uw) => uw.workout.id === planIdNum);
    let result: UserWorkoutPlan;
    if (existing) {
      result = await gymService.updateUserWorkout(existing.id, {
        day_of_week: dayOfWeek,
        is_active: active,
      });
    } else {
      result = await gymService.assignWorkoutToUser({
        workout_plan_id: planIdNum,
        day_of_week: dayOfWeek,
        is_active: active,
      });
    }
    setLast(result);
    setSubmitting(false);
    // Reset form
    setPlanId("");
    setDay("");
    setActive(true);
  };

  const dayLabel = (dow: DayOfWeek | null) => {
    if (!dow) return t("gym.days.none");
    const opt = DAY_OPTS.find((o) => o.value === dow);
    return opt ? t(`gym.days.${opt.key}`) : String(dow);
  };

  return (
    <div className="max-w-xl space-y-4">
      <form onSubmit={onSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* Workout selector */}
        <label className="block">
          <span className="text-muted-foreground">{t("gym.workout")}</span>
          <select
            required
            value={planId}
            onChange={(e) => setPlanId(e.target.value ? Number(e.target.value) : "")}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background"
          >
            <option value="">{t("gym.session_.selectWorkout")}</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        {/* Day selector */}
        <div>
          <span className="text-muted-foreground">{t("gym.day")}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAY_OPTS.map((opt) => {
              const selected = day === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setDay(opt.value)}
                  className={[
                    "px-3 py-1.5 rounded-full border transition-colors",
                    selected
                      ? "border-transparent text-white"
                      : "border-border text-muted-foreground hover:bg-muted",
                  ].join(" ")}
                  style={selected ? { backgroundColor: "var(--accent-blue)" } : undefined}
                >
                  {t(`gym.days.${opt.key}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span>{t("gym.markActive")}</span>
        </label>

        <button
          type="submit"
          disabled={submitting || !planId}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-foreground text-background disabled:opacity-50 transition-opacity"
        >
          {submitting ? t("gym.assigning") : t("gym.assign")}
        </button>
      </form>

      {/* Success banner */}
      {last && (
        <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
          <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--accent-lime)" }} />
          <p className="text-muted-foreground">
            {t("gym.assignSuccess", { name: last.workout.name })}
            {last.day_of_week
              ? t("gym.assignSuccessDay", { day: dayLabel(last.day_of_week) })
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}
