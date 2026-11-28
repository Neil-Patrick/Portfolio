import { ChevronDown } from "lucide-react";
import { cssVars } from "@/lib/css-vars";
import { Icon } from "../icons";

/** The bobbing "Scroll" cue at the foot of a full-screen home section, linking to the next one. */
export function ScrollCue({ href, to, delay }: { href: string; to: string; delay: string }) {
  return (
    <a
      href={href}
      className="load-fade absolute inset-x-0 bottom-4 mx-auto flex min-h-11 w-fit flex-col items-center justify-center px-3 hud-label text-xs text-ink-muted transition-colors hover:text-accent"
      style={cssVars({ "--fade-delay": delay })}
    >
      <span>
        Scroll<span className="sr-only"> to {to}</span>
      </span>
      <Icon icon={ChevronDown} className="cue-bob" />
    </a>
  );
}
