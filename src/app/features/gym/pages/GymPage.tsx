import { NavLink, Outlet } from "react-router";
import { useTranslation } from "react-i18next";

export function GymPage() {
  const { t } = useTranslation();

  const tabs = [
    { to: "/gym/workouts", label: t("gym.myWorkouts") },
    { to: "/gym/create",   label: t("gym.create") },
    { to: "/gym/assign",   label: t("gym.assign") },
    { to: "/gym/session",  label: t("gym.session") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>{t("gym.title")}</h1>
        <p className="text-muted-foreground">{t("gym.subtitle")}</p>
      </div>
      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `px-4 py-2 -mb-px whitespace-nowrap border-b-2 transition-colors ${
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