import { type ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Lock, LogIn, UserPlus, Dumbbell } from "lucide-react";
import { useAuth } from "@/app/features/auth/context/AuthContext";

function AuthModal() {
  const { t } = useTranslation();
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-2xl border border-border p-8 shadow-2xl flex flex-col items-center gap-6 text-center"
        style={{
          background: "rgba(var(--background-rgb, 255,255,255), 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--accent-blue, #3b82f6)", opacity: 0.9 }}
        >
          <Lock className="w-7 h-7 text-white" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-xl">{t("auth.gateTitle")}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("auth.gateMessage")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            to="/login"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            <LogIn className="w-4 h-4" />
            {t("auth.signIn")}
          </Link>
          <Link
            to="/register"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {t("auth.register")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function BlurredPlaceholder() {
  return (
    <div className="space-y-4 pointer-events-none select-none" aria-hidden>
      {/* Fake header */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-muted animate-pulse" />
      </div>
      {/* Fake cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
            <div className="flex gap-2 pt-1">
              <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
              <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <Dumbbell className="w-5 h-5 text-muted-foreground opacity-40" />
        <div className="h-4 w-56 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export function GuestGate({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground">{" "}</div>
    );
  }

  if (token) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[400px]">
      {/* Blurred background placeholder */}
      <div
        className="opacity-30"
        style={{ filter: "blur(4px)" }}
      >
        <BlurredPlaceholder />
      </div>

      {/* Auth modal overlay */}
      <AuthModal />
    </div>
  );
}
