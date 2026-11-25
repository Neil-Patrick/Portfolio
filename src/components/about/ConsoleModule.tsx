import type { ReactNode } from "react";

/**
 * An open section header for the About modules (and the contact form): the
 * module name, a hairline running across, and a status readout from real data
 * (e.g. "2 Records"); `live` adds the pulsing marker. No frame: the content
 * sits directly on the background ("Signal" open layout).
 */
export function ConsoleModule({
  title,
  status,
  live = false,
  children,
}: {
  /** Usually text; a brand logo with its own accessible name also works (Spotify). */
  title: ReactNode;
  status: string;
  live?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="flex items-center hud-label text-xl text-ink">{title}</h2>
        <span aria-hidden className="h-px min-w-8 flex-1 bg-line" />
        <p className={`flex items-center gap-2 hud-label text-sm tabular-nums ${live ? "text-accent" : "text-ink-muted"}`}>
          {live && <span aria-hidden className="live-pulse size-2 bg-accent" />}
          {status}
        </p>
      </div>
      {children}
    </div>
  );
}
