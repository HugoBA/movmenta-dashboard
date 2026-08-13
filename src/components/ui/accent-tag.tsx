export function AccentTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-primary/[0.13] px-3 py-1.5 text-sm font-semibold text-[#ffb199]">
      {children}
    </span>
  );
}
