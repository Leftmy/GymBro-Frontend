export function SkeletonList({
  count = 3,
  grid = false,
}: {
  count?: number;
  grid?: boolean;
}) {
  return (
    <div className={grid ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}
