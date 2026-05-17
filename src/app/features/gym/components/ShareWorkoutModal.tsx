import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, X, Send, Mail, Webhook } from "lucide-react";
import type { UserWorkoutPlan } from "@/app/shared/types/api";
import { nameToSlug } from "@/app/shared/utils/nameToSlug";

type Tab = "clipboard" | "discord" | "email";
type DiscordStatus = "idle" | "sending" | "sent" | "error";

export function ShareWorkoutModal({
  userWorkout,
  onClose,
}: {
  userWorkout: UserWorkoutPlan;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("clipboard");

  // ── Workout summary text (for all share methods) ──────────────────────
  const summary = useMemo(() => {
    const tEx = (name: string) =>
      t(`iq.exerciseNames.${nameToSlug(name)}`, { defaultValue: name }) as string;

    const lines = [
      `🏋️ ${userWorkout.workout.name}`,
      ...userWorkout.workout.exercises.map(
        (e) =>
          `• ${tEx(e.exercise.name)} — ${e.sets}×${e.reps}${
            e.rest_seconds ? ` (rest ${e.rest_seconds}s)` : ""
          }`
      ),
      /*`\n🔗 ${typeof window !== "undefined" ? window.location.origin : ""}/gym/workouts`,*/
    ];
    return lines.join("\n");
  }, [userWorkout, t]);

  const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: "clipboard", label: t("gym.shareTab.clipboard"), Icon: Copy },
    { id: "discord",   label: t("gym.shareTab.discord"),   Icon: Webhook },
    { id: "email",     label: t("gym.shareTab.email"),      Icon: Mail },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h2>{t("gym.shareTitle")}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label={t("gym.close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-border px-4">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                "flex items-center gap-1.5 px-4 py-3 -mb-px border-b-2 text-sm transition-colors",
                activeTab === id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="p-6">
          {activeTab === "clipboard" && (
            <ClipboardTab summary={summary} />
          )}
          {activeTab === "discord" && (
            <DiscordTab summary={summary} />
          )}
          {activeTab === "email" && (
            <EmailTab summary={summary} workoutName={userWorkout.workout.name} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Clipboard Tab ────────────────────────────────────────────────────── */
function ClipboardTab({ summary }: { summary: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <pre className="text-sm text-muted-foreground bg-muted rounded-xl p-4 whitespace-pre-wrap overflow-auto max-h-52">
        {summary}
      </pre>
      <button
        onClick={copy}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            {t("gym.copied")}
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            {t("gym.copyLink")}
          </>
        )}
      </button>
    </div>
  );
}

/* ── Discord Tab ──────────────────────────────────────────────────────── */
function DiscordTab({ summary }: { summary: string }) {
  const { t } = useTranslation();
  const [webhook, setWebhook] = useState("");
  const [status, setStatus] = useState<DiscordStatus>("idle");

  const send = async () => {
    if (!webhook.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(webhook.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: summary }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-muted-foreground text-sm">
          {t("gym.webhookLabel")}
        </label>
        <input
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
          placeholder={t("gym.webhookPlaceholder")}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm"
        />
        <p className="text-muted-foreground text-xs">{t("gym.webhookHelp")}</p>
      </div>

      {/* Status banner */}
      {status === "sent" && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{ backgroundColor: "color-mix(in oklab, var(--accent-lime) 20%, transparent)" }}>
          <Check className="w-4 h-4" style={{ color: "var(--accent-lime)" }} />
          {t("gym.discordSent")}
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          {t("gym.discordError")}
        </div>
      )}

      <button
        onClick={send}
        disabled={!webhook.trim() || status === "sending"}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        <Send className="w-4 h-4" />
        {status === "sending" ? t("gym.discordSending") : t("gym.discordSend")}
      </button>
    </div>
  );
}

/* ── Email Tab ────────────────────────────────────────────────────────── */
function EmailTab({ summary, workoutName }: { summary: string; workoutName: string }) {
  const { t } = useTranslation();
  const [emailTo, setEmailTo] = useState("");

  const openMailClient = () => {
    const subject = encodeURIComponent(
      `${t("gym.emailSubject")}: ${workoutName}`
    );
    const body = encodeURIComponent(summary);
    const href = emailTo.trim()
      ? `mailto:${emailTo.trim()}?subject=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`;
    window.open(href, "_self");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-muted-foreground text-sm">
          {t("gym.emailTo")}
        </label>
        <input
          type="email"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          placeholder={t("gym.emailToPlaceholder")}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm"
        />
      </div>

      {/* Summary preview */}
      <pre className="text-sm text-muted-foreground bg-muted rounded-xl p-4 whitespace-pre-wrap overflow-auto max-h-36">
        {summary}
      </pre>

      <button
        onClick={openMailClient}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
      >
        <Mail className="w-4 h-4" />
        {t("gym.emailOpen")}
      </button>
    </div>
  );
}