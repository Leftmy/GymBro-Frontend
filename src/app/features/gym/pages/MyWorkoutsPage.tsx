import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Zap, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import { gymService } from "@/app/services";
import type { DayParam, UserWorkoutPlan } from "@/app/shared/types/api";
import { nameToSlug } from "@/app/shared/utils/nameToSlug";
import { DaySelector } from "@/app/shared/components/common/DaySelector";
import { SkeletonList } from "@/app/shared/components/common/SkeletonList";
import { EmptyState } from "@/app/shared/components/common/EmptyState";
import { ConfirmDialog } from "@/app/shared/components/common/ConfirmDialog";
import { ShareWorkoutModal } from "@/app/features/gym/components/ShareWorkoutModal";

const DOW_KEY = ["", "mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

// ── Edit Workout Modal ────────────────────────────────────────────────────────
function EditWorkoutModal({
  uw,
  onClose,
  onSaved,
}: {
  uw: UserWorkoutPlan;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(uw.workout.name);
  const [description, setDescription] = useState(uw.workout.description ?? "");
  const [isPublic, setIsPublic] = useState(uw.workout.is_public ?? false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameError(t("gym.nameRequired")); return; }
    setSaving(true);
    try {
      await gymService.updateWorkout(uw.workout.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            <h2>{t("gym.editWorkoutTitle")}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm">{t("gym.name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); }}
              className={`w-full px-3 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 transition ${
                nameError ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-foreground/20"
              }`}
            />
            {nameError && <p className="text-destructive text-xs">{nameError}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm">{t("gym.description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 transition resize-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">{t("gym.public")}</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? t("gym.updating") : t("gym.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Action Menu (3-dot) ───────────────────────────────────────────────────────
function ActionMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-border bg-card shadow-lg z-20 overflow-hidden"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left"
          >
            <Pencil className="w-3.5 h-3.5" />
            {t("gym.editWorkout")}
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t("gym.deleteWorkout")}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function MyWorkoutsPage() {
  const { t } = useTranslation();
  const [day, setDay] = useState<DayParam>("all");
  const [items, setItems] = useState<UserWorkoutPlan[] | null>(null);
  const [shareTarget, setShareTarget] = useState<UserWorkoutPlan | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [editTarget, setEditTarget] = useState<UserWorkoutPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserWorkoutPlan | null>(null);

  const load = async () => {
    setItems(null);
    const result = await gymService.getWorkouts(day);
    setItems(result);
  };

  useEffect(() => { load(); }, [day]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleActive = async (w: UserWorkoutPlan) => {
    await gymService.updateUserWorkout(w.id, { is_active: !w.is_active });
    load();
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    await gymService.deleteWorkout(deleteTarget.workout.id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="space-y-4">
      <DaySelector value={day} onChange={setDay} />

      {!items && <SkeletonList count={3} grid />}

      {items && items.length === 0 && (
        <EmptyState
          title={t("gym.noWorkoutsTitle")}
          description={t("gym.noWorkoutsDesc")}
          action={
            <Link to="/gym/assign" className="px-4 py-2 rounded-lg bg-foreground text-background">
              {t("gym.assignWorkout")}
            </Link>
          }
        />
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((uw) => {
            const expanded = expandedIds.has(uw.id);
            const dayKey = uw.day_of_week ? DOW_KEY[uw.day_of_week] : null;

            return (
              <article
                key={uw.id}
                className="border border-border rounded-xl bg-card flex flex-col overflow-hidden hover:shadow-md hover:border-foreground/20 transition-all duration-200"
              >
                {/* Card header */}
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="truncate">{uw.workout.name}</h3>
                      {uw.is_active && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: "var(--accent-lime)", color: "#000" }}
                        >
                          <Zap className="w-3 h-3" />
                          {t("gym.active")}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {t("gym.exercisesCount", { count: uw.workout.exercises.length })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {dayKey && (
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {t(`gym.days.${dayKey}`)}
                      </span>
                    )}
                    <ActionMenu
                      onEdit={() => setEditTarget(uw)}
                      onDelete={() => setDeleteTarget(uw)}
                    />
                  </div>
                </div>

                {uw.workout.description && (
                  <p className="px-4 pb-2 text-muted-foreground text-sm">{uw.workout.description}</p>
                )}

                {/* Toggle exercises */}
                <button
                  type="button"
                  onClick={() => toggleExpand(uw.id)}
                  className="mx-4 mb-3 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {expanded ? (
                    <><ChevronUp className="w-4 h-4" />{t("gym.hideExercises")}</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" />{t("gym.showExercises")}</>
                  )}
                </button>

                {expanded && (
                  <ul className="mx-4 mb-3 space-y-1.5 border-t border-border pt-3">
                    {[...uw.workout.exercises]
                      .sort((a, b) => a.order - b.order)
                      .map((ex, idx) => (
                        <li key={idx} className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate">
                            {t(`iq.exerciseNames.${nameToSlug(ex.exercise.name)}`, { defaultValue: ex.exercise.name }) as string}
                          </span>
                          <span className="shrink-0 text-muted-foreground">
                            {t("gym.setsReps", { sets: ex.sets, reps: ex.reps })}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}

                {/* Actions */}
                <div className="mt-auto border-t border-border p-3 flex flex-wrap gap-2">
                  <Link
                    to={`/gym/session?workout=${uw.workout.id}`}
                    className="flex-1 sm:flex-none text-center px-3 py-2 rounded-lg bg-foreground text-background hover:opacity-90 text-sm"
                  >
                    {t("gym.startSession")}
                  </Link>
                  <button
                    onClick={() => toggleActive(uw)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm"
                  >
                    {uw.is_active ? t("gym.deactivate") : t("gym.activate")}
                  </button>
                  <button
                    onClick={() => setShareTarget(uw)}
                    className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm"
                  >
                    {t("gym.share")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {shareTarget && (
        <ShareWorkoutModal userWorkout={shareTarget} onClose={() => setShareTarget(null)} />
      )}

      {editTarget && (
        <EditWorkoutModal
          uw={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={load}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t("gym.confirmDeleteTitle")}
          message={t("gym.confirmDeleteMsg", { name: deleteTarget.workout.name })}
          confirmLabel={t("gym.deleteWorkout")}
          cancelLabel={t("common.cancel")}
          danger
          onConfirm={doDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
