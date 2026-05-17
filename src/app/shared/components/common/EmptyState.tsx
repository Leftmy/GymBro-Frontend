import type { ReactNode } from "react";
import { Dumbbell } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Dumbbell,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-border rounded-xl">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: "color-mix(in oklab, var(--foreground) 8%, transparent)" }}
      >
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
