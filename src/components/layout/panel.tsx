export function Panel({
  title,
  subtitle,
  right,
  delay = 0,
  className,
  children,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`animate-rise rounded-2xl border border-border-soft bg-card p-6 ${className ?? ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {(title || right) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <div className="text-base font-semibold">{title}</div>}
            {subtitle && (
              <div className="mt-0.5 text-sm text-text-faint">{subtitle}</div>
            )}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
