import type { ReactNode } from "react";

/** One HUD log entry: caps title with its date on the right, details underneath (Credentials, About). */
export function LogEntry({ title, date, children }: { title: string; date: string; children: ReactNode }) {
  return (
    <>
      <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <span className="font-display text-xl font-semibold tracking-wide uppercase">{title}</span>
        <span className="hud-label shrink-0 text-sm text-ink-muted tabular-nums sm:max-w-xs sm:text-right">{date}</span>
      </span>
      <span className="mt-1 block text-ink-muted">{children}</span>
    </>
  );
}
