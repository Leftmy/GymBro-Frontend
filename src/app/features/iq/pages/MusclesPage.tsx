import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { iqService } from "@/app/services";
import type { Exercise, MuscleGroup } from "@/app/shared/types/api";
import { nameToSlug } from "@/app/shared/utils/nameToSlug";
import { SkeletonList } from "@/app/shared/components/common/SkeletonList";
import { EmptyState } from "@/app/shared/components/common/EmptyState";
import { BodyMap } from "@/app/features/iq/components/BodyMap";
import { ExerciseVideoModal } from "@/app/features/iq/components/ExerciseVideoModal";
import { getDifficultyLabel } from "@/app/shared/utils/difficulty";

export function MusclesPage() {
  const { t } = useTranslation();
  const [muscles, setMuscles] = useState<MuscleGroup[]>([]);
  const [view, setView] = useState<"front" | "back">("front");
  const [active, setActive] = useState<MuscleGroup | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<Exercise | null>(null);

  useEffect(() => { iqService.getMuscles().then(setMuscles); }, []);

  useEffect(() => {
    if (!active) { setExercises(null); return; }
    setLoading(true);
    iqService.getExercises({ muscle: active.slug }).then((r) => {
      setExercises(r);
      setLoading(false);
    });
  }, [active]);

  const visible = useMemo(() => muscles, [muscles]);

  /** Returns the translated muscle name, falling back to the API name */
  const tMuscle = (m: MuscleGroup) =>
    t(`iq.muscleNames.${m.slug}`, { defaultValue: m.name }) as string;

  /** Returns the translated exercise name, falling back to the API name */
  const tExercise = (name: string) =>
    t(`iq.exerciseNames.${nameToSlug(name)}`, { defaultValue: name }) as string;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8">
      {/* ── Body view ── */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["front", "back"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-full border ${
                view === v
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:bg-muted"
              }`}
            >
              {v === "front" ? t("iq.front") : t("iq.back")}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex justify-center">
          <BodyMap
            view={view}
            muscles={visible}
            activeSlug={active?.slug ?? null}
            hoverSlug={hover}
            onHover={setHover}
            onSelect={(slug) => setActive(visible.find((m) => m.slug === slug) ?? null)}
          />
        </div>

        {/* Muscle chip filters */}
        <div className="flex flex-wrap gap-2">
          {visible.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m)}
              className={`px-3 py-1 rounded-full border ${
                active?.slug === m.slug
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:bg-muted"
              }`}
            >
              {tMuscle(m)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Exercise sidebar ── */}
      <aside className="space-y-3">
        <h2>{active ? tMuscle(active) : t("iq.selectMuscle")}</h2>
        {!active && <EmptyState title={t("iq.selectMuscle")} description={t("iq.noMuscleHelp")} />}
        {loading && <SkeletonList />}
        {exercises && !loading && exercises.length === 0 && (
          <EmptyState title={t("iq.noExercises")} />
        )}
        {exercises &&
          !loading &&
          exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setVideo(ex)}
              className="w-full text-left border border-border rounded-xl p-4 bg-card hover:shadow-md hover:-translate-y-0.5 transition group"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full inline-flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: "color-mix(in oklab, var(--accent-orange) 25%, transparent)" }}
                  >
                    <Play className="w-3.5 h-3.5" style={{ color: "var(--accent-orange)" }} />
                  </span>
                  {tExercise(ex.name)}
                </h3>
                <span className="text-muted-foreground shrink-0">{getDifficultyLabel(t, ex.difficulty)}</span>
              </div>
              {ex.description && <p className="text-muted-foreground mt-1">{ex.description}</p>}
              <div className="flex flex-wrap gap-1 mt-2">
                {ex.muscles.map((m) => (
                  <span key={m.id} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {tMuscle(m)}
                  </span>
                ))}
              </div>
            </button>
          ))}
      </aside>

      {video && <ExerciseVideoModal exercise={video} onClose={() => setVideo(null)} />}
    </div>
  );
}