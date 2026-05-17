import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Send, Clock } from "lucide-react";
import { brosService } from "@/app/services";
import type { Bro } from "@/app/shared/types/api";
import { ConfirmDialog } from "@/app/shared/components/common/ConfirmDialog";

const AVATAR_COLORS = [
  "var(--accent-blue, #3b82f6)",
  "var(--accent-orange, #f97316)",
  "var(--accent-lime, #84cc16)",
  "var(--accent-purple, #a855f7)",
];

function Avatar({ id, name, size = 44 }: { id: number; name: string; size?: number }) {
  const color = AVATAR_COLORS[id % AVATAR_COLORS.length];
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 select-none"
      style={{ width: size, height: size, backgroundColor: color, color: "#fff", fontSize: size * 0.4 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

export function OutgoingRequestsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<Bro[] | null>(null);
  const [cancellingBro, setCancellingBro] = useState<Bro | null>(null);

  const load = useCallback(() => {
    brosService.getBros("outgoing").then(setRequests);
  }, []);

  useEffect(() => { load(); }, [load]);

  const doCancel = async () => {
    if (!cancellingBro) return;
    await brosService.deleteBro(cancellingBro.id);
    setCancellingBro(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Send className="w-4 h-4 text-muted-foreground" />
        <h2>{t("bros.outgoingRequests")}</h2>
        {requests && requests.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {requests.length}
          </span>
        )}
      </div>

      {!requests && (
        <div className="space-y-3">
          {[1].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {requests && requests.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Send className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground">{t("bros.noOutgoing")}</p>
        </div>
      )}

      {requests && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((bro) => (
            <div
              key={bro.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              <Avatar id={bro.receiver.id} name={bro.receiver.username} />

              <div className="flex-1 min-w-0 space-y-1">
                <p className="truncate">{bro.receiver.username}</p>
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--accent-orange, #f97316)", color: "#fff", opacity: 0.85 }}
                >
                  <Clock className="w-3 h-3" />
                  {t("bros.pendingStatus")}
                </span>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => setCancellingBro(bro)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border hover:border-destructive hover:text-destructive transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {t("bros.cancelRequest")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cancellingBro && (
        <ConfirmDialog
          title={t("bros.confirmCancelTitle")}
          message={t("bros.confirmCancelMsg", { name: cancellingBro.receiver.username })}
          confirmLabel={t("bros.cancelRequest")}
          cancelLabel={t("common.cancel")}
          danger
          onConfirm={doCancel}
          onCancel={() => setCancellingBro(null)}
        />
      )}
    </div>
  );
}
