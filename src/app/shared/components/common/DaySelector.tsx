import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { DayParam } from "@/app/shared/types/api";

// Maps DayParam → short i18n key inside gym.days
const DAY_I18N: Record<DayParam, string> = {
  all:       "all",
  monday:    "mon",
  tuesday:   "tue",
  wednesday: "wed",
  thursday:  "thu",
  friday:    "fri",
  saturday:  "sat",
  sunday:    "sun",
};

const DAY_KEYS: DayParam[] = [
  "all", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

export function DaySelector({
  value,
  onChange,
}: {
  value: DayParam;
  onChange: (d: DayParam) => void;
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = (key: DayParam) => {
    onChange(key);

    // Optionally scroll the selected pill into the center of the container
    const container = scrollRef.current;
    if (!container) return;
    const btn = container.querySelector<HTMLButtonElement>(
      `[data-day="${key}"]`
    );
    if (!btn) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const offset =
      btnRect.left -
      containerRect.left -
      containerRect.width / 2 +
      btnRect.width / 2;
    container.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
      style={{
        WebkitOverflowScrolling: "touch",
        scrollSnapType: "x proximity",
        overscrollBehaviorX: "contain",
      }}
    >
      {DAY_KEYS.map((key) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            data-day={key}
            type="button"
            onClick={() => handleSelect(key)}
            aria-pressed={isActive}
            style={{ scrollSnapAlign: "center" }}
            className={[
              "shrink-0 min-w-[3rem] px-4 py-2 rounded-full border transition-colors whitespace-nowrap",
              isActive
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:bg-muted",
            ].join(" ")}
          >
            {t(`gym.days.${DAY_I18N[key]}`)}
          </button>
        );
      })}
    </div>
  );
}
