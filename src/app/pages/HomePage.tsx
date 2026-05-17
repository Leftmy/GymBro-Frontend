import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Brain, Dumbbell, Newspaper, Users, ArrowRight } from "lucide-react";

const sections = [
  { to: "/iq",   key: "iq",   icon: Brain,     color: "var(--accent-blue)" },
  { to: "/gym",  key: "gym",  icon: Dumbbell,  color: "var(--accent-lime)" },
  { to: "/bros", key: "bros", icon: Users,     color: "var(--accent-orange)" },
  { to: "/blog", key: "blog", icon: Newspaper, color: "var(--accent-blue)" },
] as const;

export function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-foreground text-background p-8 md:p-12 relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <p className="uppercase tracking-wider" style={{ color: "var(--accent-lime)" }}>{t("home.kicker")}</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">{t("home.headline")}</h1>
          <p className="opacity-80">{t("home.subhead")}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/gym"
              className="px-5 py-2.5 rounded-xl text-foreground inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: "var(--accent-lime)" }}
            >
              {t("home.ctaStart")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/iq"
              className="px-5 py-2.5 rounded-xl border border-background/30 hover:bg-background/10 transition-colors inline-flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-blue)" }} />
              {t("home.ctaExplore")}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group rounded-xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition"
            style={{ ["--card-accent" as any]: s.color }}
          >
            <span
              className="inline-flex w-10 h-10 rounded-xl items-center justify-center transition-colors"
              style={{ backgroundColor: `color-mix(in oklab, ${s.color} 20%, transparent)` }}
            >
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </span>
            <h3 className="mt-4">{t(`home.sections.${s.key}.title` as const)}</h3>
            <p className="text-muted-foreground mt-1">{t(`home.sections.${s.key}.desc` as const)}</p>
            <div
              className="mt-4 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: s.color }}
            >
              {t("home.open")} <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
