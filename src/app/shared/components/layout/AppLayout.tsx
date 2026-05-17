import { NavLink, Outlet, useNavigate } from "react-router";
import { Dumbbell, Home, Brain, Users, Newspaper, User as UserIcon, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/features/auth/context/AuthContext";
import { LanguageSwitcher } from "@/app/shared/components/common/LanguageSwitcher";

export function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/",      label: t("nav.home"), icon: Home,      end: true },
    { to: "/iq",    label: t("nav.iq"),   icon: Brain },
    { to: "/gym",   label: t("nav.gym"),  icon: Dumbbell },
    { to: "/bros",  label: t("nav.bros"), icon: Users },
    { to: "/blog",  label: t("nav.blog"), icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Top header ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <Dumbbell className="w-5 h-5" style={{ color: "var(--accent-lime)" }} />
            <span className="font-semibold tracking-tight">GymBro</span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <l.icon className="w-4 h-4" />
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side — language switcher + user actions (always visible) */}
          <div className="ml-auto flex items-center gap-2">
            {/* Language switcher: always in the header, never duplicated */}
            <LanguageSwitcher />

            {user ? (
              <>
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.username}</span>
                </NavLink>
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="p-2 rounded-lg hover:bg-muted"
                  aria-label={t("nav.signOut")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="px-4 py-1.5 rounded-lg bg-foreground text-background hover:opacity-90"
              >
                {t("nav.signIn")}
              </NavLink>
            )}
          </div>
        </div>

        {/* ── Mobile bottom nav (icons only — NO language switcher here) ── */}
        <nav className="md:hidden border-t border-border">
          <div className="max-w-6xl mx-auto flex justify-around">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`
                }
              >
                <l.icon className="w-4 h-4" />
                <span className="text-xs">{l.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-6 text-center text-muted-foreground">
        <small>GymBro · {t("gym.session_.subtitle")}</small>
      </footer>
    </div>
  );
}
