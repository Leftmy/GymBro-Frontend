import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import type { Exercise } from "@/app/shared/types/api";
import { nameToSlug } from "@/app/shared/utils/nameToSlug";
import { getDifficultyLabel } from "@/app/shared/utils/difficulty";

export interface ExerciseSessionInfo {
  sets?: number;
  reps?: number;
  rest_seconds?: number;
}

// Map English exercise names to YouTube demo videos (keys must stay English)
// Where an authoritative demo link is available it's used; otherwise a
// YouTube search embed is provided so the modal will show relevant results.
const VIDEO_BY_NAME: Record<string, string> = {
  "Bench Press":  "https://www.youtube.com/embed/rT7DgCr-3pg",
  "Incline Dumbbell Press": "https://www.youtube.com/embed/8iPEnn-ltC8",
  "Pull Up": "https://www.youtube.com/embed/eGo4IYlbE5g",
  "Barbell Row": "https://www.youtube.com/embed/kBWAon7ItDw",
  "Deadlift": "https://www.youtube.com/embed/op9kVnSso6Q",
  "Squat": "https://www.youtube.com/embed/ultWZbUMPL8",
  "Romanian Deadlift": "https://www.youtube.com/embed/JCXUYuzwNrM",
  "Leg Press": "https://www.youtube.com/embed/q4W4_VJbKW0",
  "Lunges": "https://www.youtube.com/embed/QOVaHwm-Q6U",
  "Hip Thrust": "https://www.youtube.com/embed/xDmFkJxPzeM",
  "Shoulder Press": "https://www.youtube.com/embed/2yjwXTZQDDI",
  "Overhead Press": "https://www.youtube.com/embed/2yjwXTZQDDI",
  "Lateral Raise": "https://www.youtube.com/embed/XPPfnSEATJA",
  "Bicep Curl": "https://www.youtube.com/embed/kwG2ipFRgfo",
  "EZ Bar Curl": "https://www.youtube.com/embed/5NsFLGUf0Fo",
  "Barbell Curl": "https://www.youtube.com/embed/kwG2ipFRgfo",
  "Tricep Pushdown": "https://www.youtube.com/embed/-zLyUAo1gMw",
  "Overhead Triceps Extension": "https://www.youtube.com/embed/fYqswDVbJDg",
  "Tricep Dip": "https://www.youtube.com/embed/0326dy_-CzM",
  "Chest Dip": "https://www.youtube.com/embed/0326dy_-CzM",
  "Calf Raise": "https://www.youtube.com/embed/-M4-G8p8fmc",
  "Plank": "https://www.youtube.com/embed/pSHjTRCQxIw",
  "Bicycle Crunch": "https://www.youtube.com/embed/rHhWXanwoEs",
  "Dumbbell Fly": "https://www.youtube.com/embed/QENKPHhQVi4",
  "Rowing Machine": "https://www.youtube.com/embed/ZN0J6qKCIrI",
  "Running": "https://www.youtube.com/embed?listType=search&list=Running%20exercise%20tutorial",
  "Cycling": "https://www.youtube.com/embed?listType=search&list=Cycling%20exercise%20tutorial",
  "Jump Rope": "https://www.youtube.com/embed?listType=search&list=Jump%20Rope%20exercise%20tutorial",
  "Burpee": "https://www.youtube.com/embed/mUYJqe_sJFE",
  "Neck Extension": "https://youtube.com/embed/CD-E-LDc384?si=D2iui0H-OtMEg2LY",
  "Neck Flexion": "https://www.youtube.com/embed/8P9CjUhSFCA",
  "Lateral Neck Stretch": "https://www.youtube.com/embed/1m3w-jMCXcQ",
};

export function ExerciseVideoModal({
  exercise,
  info,
  onClose,
}: {
  exercise: Exercise;
  info?: ExerciseSessionInfo;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Translate display names (falls back to English name)
  const displayName = t(`iq.exerciseNames.${nameToSlug(exercise.name)}`, {
    defaultValue: exercise.name,
  }) as string;

  const muscleLine = exercise.muscles
    .map((m) => t(`iq.muscleNames.${m.slug}`, { defaultValue: m.name }) as string)
    .join(" · ");

  // Video lookup uses the original English name as key
  const src =
    VIDEO_BY_NAME[exercise.name] ??
    `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
      exercise.name + " exercise tutorial"
    )}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-card rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 p-4 border-b border-border">
          <div>
            <h2>{displayName}</h2>
            <p className="text-muted-foreground">
              {muscleLine} · {getDifficultyLabel(t, exercise.difficulty)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t("video.close")}
            className="p-1 rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="aspect-video bg-black">
          <iframe
            key={src}
            src={src}
            title={displayName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {info && (info.sets || info.reps || info.rest_seconds) && (
          <dl className="grid grid-cols-3 gap-2 p-4 text-center">
            <Stat label={t("video.sets")} value={info.sets} />
            <Stat label={t("video.reps")} value={info.reps} />
            <Stat label={t("video.rest")} value={info.rest_seconds ? `${info.rest_seconds}s` : undefined} />
          </dl>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number | string }) {
  return (
    <div className="rounded-xl bg-muted py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value ?? "—"}</dd>
    </div>
  );
}
