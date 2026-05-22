import { NavLink, Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import { Users, UserCheck, Send } from "lucide-react";

export function BrosPage() {
  const { t } = useTranslation();

  const tabs = [
    { to: "/bros/my",  label: t("bros.friends"),          icon: Users },
    { to: "/bros/incoming", label: t("bros.incomingRequests"), icon: UserCheck },
    { to: "/bros/outgoing", label: t("bros.outgoingRequests"), icon: Send },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>{t("bros.title")}</h1>
        <p className="text-muted-foreground">{t("bros.subtitle")}</p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2.5 -mb-px border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
