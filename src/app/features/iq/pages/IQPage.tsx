import { NavLink, Outlet } from "react-router";
import { useTranslation } from "react-i18next";

export function IQPage() {
  const { t } = useTranslation();

  const tabs = [
    { to: "/iq/muscles",   label: t("iq.muscles") },
    { to: "/iq/exercises", label: t("iq.exercises") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>{t("iq.title")}</h1>
        <p className="text-muted-foreground">{t("iq.subtitle")}</p>
      </div>
      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `px-4 py-2 -mb-px border-b-2 transition-colors ${
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}