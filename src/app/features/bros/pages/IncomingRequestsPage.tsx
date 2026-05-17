import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserCheck, X, UserCheck2, Inbox } from "lucide-react";
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

export function IncomingRequestsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<Bro[] | null>(null);
  const [decliningBro, setDecliningBro] = useState<Bro | null>(null);
  const [loading, setLoading] = useState<Set<number>>(new Set());

  const load = useCallback(() => {
    brosService.getBros("incoming").then(setRequests);
  }, []);

  useEffect(() => { load(); }, [load]);

  const accept = async (bro: Bro) => {
    setLoading((p) => new Set(p).add(bro.id));
    await brosService.acceptBro(bro.id);
    load();
  };

  const doDecline = async () => {
    if (!decliningBro) return;
    setLoading((p) => new Set(p).add(decliningBro.id));
    await brosService.deleteBro(decliningBro.id);
    setDecliningBro(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Inbox className="w-4 h-4 text-muted-foreground" />
        <h2>{t("bros.incomingRequests")}</h2>
        {requests && requests.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {requests.length}
          </span>
        )}
      </div>

      {!requests && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {requests && requests.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <UserCheck2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground">{t("bros.noIncoming")}</p>
        </div>
      )}

      {requests && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((bro) => {
            const isLoading = loading.has(bro.id);
            return (
              <div
                key={bro.id}
                className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
              >
                {/* Top row: avatar + user info — always full-width, never crowded */}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar id={bro.sender.id} name={bro.sender.username} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{bro.sender.username}</p>
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full capitalize mt-0.5"
                      style={{
                        backgroundColor:
                          bro.sender.role === "trainer"
                            ? "var(--accent-orange, #f97316)"
                            : "var(--accent-blue, #3b82f6)",
                        color: "#fff",
                        opacity: 0.9,
                      }}
                    >
                      {bro.sender.role}
                    </span>
                  </div>
                </div>

                {/* Bottom row: action buttons — full width on mobile, side-by-side on sm+ */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => accept(bro)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "var(--accent-lime, #84cc16)", color: "#000" }}
                  >
                    <UserCheck className="w-4 h-4" />
                    {t("bros.acceptRequest")}
                  </button>
                  <button
                    onClick={() => setDecliningBro(bro)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm border border-destructive/30 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all duration-150 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {t("bros.declineRequest")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {decliningBro && (
        <ConfirmDialog
          title={t("bros.confirmDeclineTitle")}
          message={t("bros.confirmDeclineMsg", { name: decliningBro.sender.username })}
          confirmLabel={t("bros.declineRequest")}
          cancelLabel={t("common.cancel")}
          danger
          onConfirm={doDecline}
          onCancel={() => setDecliningBro(null)}
        />
      )}
    </div>
  );
}
