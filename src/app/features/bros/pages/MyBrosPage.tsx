import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search, UserPlus, X, Users, ChevronRight, Loader2,
} from "lucide-react";
import { brosService, gymService } from "@/app/services";
import { mockUsers } from "@/app/shared/mocks/mockData";
import type { Bro, User, UserWorkoutPlan } from "@/app/shared/types/api";
import { ConfirmDialog } from "@/app/shared/components/common/ConfirmDialog";

// ── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "var(--accent-blue, #3b82f6)",
  "var(--accent-orange, #f97316)",
  "var(--accent-lime, #84cc16)",
  "var(--accent-purple, #a855f7)",
];

function Avatar({ user, size = 40 }: { user: User; size?: number }) {
  const color = AVATAR_COLORS[user.id % AVATAR_COLORS.length];
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 select-none"
      style={{ width: size, height: size, backgroundColor: color, color: "#fff", fontSize: size * 0.4 }}
    >
      {user.username[0]?.toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const color = role === "trainer"
    ? "var(--accent-orange, #f97316)"
    : role === "admin"
    ? "var(--accent-purple, #a855f7)"
    : "var(--accent-blue, #3b82f6)";
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full capitalize shrink-0"
      style={{ backgroundColor: color, color: "#fff", opacity: 0.9 }}
    >
      {role}
    </span>
  );
}

const DAY_KEY = ["", "mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

// ── Bro Workouts drill-down ───────────────────────────────────────────────────
function BroWorkouts({ user, onBack }: { user: User; onBack: () => void }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<UserWorkoutPlan[] | null>(null);

  useEffect(() => { gymService.getWorkouts("all").then(setItems); }, [user.id]);

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {t("bros.back")}
      </button>

      <div className="flex items-center gap-3">
        <Avatar user={user} size={48} />
        <div>
          <h2>{t("bros.workoutsOf", { name: user.username })}</h2>
          <RoleBadge role={user.role} />
        </div>
      </div>

      {!items && <p className="text-muted-foreground">{t("common.loading")}</p>}
      {items && items.length === 0 && (
        <p className="text-muted-foreground">{t("bros.noWorkouts")}</p>
      )}
      {items && items.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((uw) => (
            <article key={uw.id} className="border border-border rounded-xl bg-card p-5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3>{uw.workout.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t("gym.exercisesCount", { count: uw.workout.exercises.length })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {uw.day_of_week && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                      {t(`gym.days.${DAY_KEY[uw.day_of_week]}`)}
                    </span>
                  )}
                  {uw.is_active && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full text-black"
                      style={{ backgroundColor: "var(--accent-lime, #84cc16)" }}
                    >
                      {t("gym.active")}
                    </span>
                  )}
                </div>
              </div>
              {uw.workout.description && (
                <p className="text-muted-foreground text-sm">{uw.workout.description}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Friends Page ─────────────────────────────────────────────────────────
export function MyBrosPage() {
  const { t } = useTranslation();

  const [bros, setBros] = useState<Bro[] | null>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [removingBro, setRemovingBro] = useState<Bro | null>(null);
  const [drillTarget, setDrillTarget] = useState<User | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    brosService.getBros("accepted").then(setBros);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Debounced local search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const q = query.trim().toLowerCase();

    if (q.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);

    let cancelled = false;

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await brosService.searchUsers(q);

        if (!cancelled) {
          setSearchResults(results);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search failed", err);

        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sendRequest = async (user: User) => {
    setPendingRequests((p) => new Set(p).add(user.uuid));
    await brosService.sendBroRequest(user.uuid);
    setShowDropdown(false);
    setQuery("");
    load();
  };

  const isBro = useMemo(() => {
    if (!bros) return new Set<number>();
    const ids = new Set<number>();
    bros.forEach((b) => {
      ids.add(b.sender.id);
      ids.add(b.receiver.id);
    });
    return ids;
  }, [bros]);

  const getBroFriend = (bro: Bro): User =>
    bro.sender.id === 1 ? bro.receiver : bro.sender;

  const doRemove = async () => {
    if (!removingBro) return;
    await brosService.deleteBro(removingBro.id);
    setRemovingBro(null);
    load();
  };

  if (drillTarget) {
    return <BroWorkouts user={drillTarget} onBack={() => setDrillTarget(null)} />;
  }

  return (
    <div className="space-y-8">

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <section className="space-y-2">
        <h2 className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-muted-foreground" />
          {t("bros.findBros")}
        </h2>

        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            {isSearching && (
              <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder={t("bros.searchPlaceholder")}
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setShowDropdown(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {query.length > 0 && query.trim().length < 2 && (
            <p className="text-muted-foreground text-xs px-1 mt-1">{t("bros.typeToSearch")}</p>
          )}

          {showDropdown && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              {searchResults.length === 0 ? (
                <p className="text-muted-foreground text-sm px-4 py-3">{t("bros.noSearchResults")}</p>
              ) : (
                <ul>
                  {searchResults.map((u, idx) => {
                    const alreadyBro = isBro.has(u.id);
                    const sent = pendingRequests.has(u.uuid);
                    return (
                      <li
                        key={u.id}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${idx < searchResults.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <Avatar user={u} size={36} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{u.username}</p>
                          <RoleBadge role={u.role} />
                        </div>
                        {alreadyBro ? (
                          <span className="text-xs text-muted-foreground">{t("bros.alreadyFriends")}</span>
                        ) : sent ? (
                          <span className="text-xs text-muted-foreground">{t("bros.requestSent")}</span>
                        ) : (
                          <button
                            onClick={() => sendRequest(u)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-foreground text-background hover:opacity-90 transition-opacity"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            {t("bros.sendRequest")}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Friends List ────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h2>{t("bros.myFriends")}</h2>
          {bros && bros.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {bros.length}
            </span>
          )}
        </div>

        {!bros && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {bros && bros.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">{t("bros.noFriends")}</p>
          </div>
        )}

        {bros && bros.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bros.map((bro) => {
              const friend = getBroFriend(bro);
              return (
                <div
                  key={bro.id}
                  className="group bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-foreground/20 transition-all duration-200"
                >
                  {/* Top row: avatar + info + chevron */}
                  <div className="flex items-center gap-3">
                    <Avatar user={friend} size={44} />

                    <button
                      onClick={() => setDrillTarget(friend)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="truncate">{friend.username}</p>
                      <RoleBadge role={friend.role} />
                    </button>

                    <button
                      onClick={() => setDrillTarget(friend)}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                      title={t("bros.viewWorkouts")}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom row: remove button, always visible */}
                  <button
                    onClick={() => setRemovingBro(bro)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all duration-150 text-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t("bros.removeFriend")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {removingBro && (
        <ConfirmDialog
          title={t("bros.confirmRemoveTitle")}
          message={t("bros.confirmRemoveMsg", { name: getBroFriend(removingBro).username })}
          confirmLabel={t("bros.removeFriend")}
          cancelLabel={t("common.cancel")}
          danger
          onConfirm={doRemove}
          onCancel={() => setRemovingBro(null)}
        />
      )}
    </div>
  );
}
