import Link from "next/link";
import { site } from "@/content/site";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { WheelMenu } from "./WheelMenu";

/**
 * Top bar: name (home link), theme switcher, and the wheel menu button.
 * Navigation items live in WheelMenu and come from `sections` in src/content/site.ts.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b-3 border-frame bg-panel">
      <div className="container-page flex h-header items-center justify-between gap-2">
        <Link href="/" className="inline-flex min-h-11 min-w-0 items-center font-display text-lg">
          <span className="truncate">{site.name}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          <ThemeSwitcher />
          <WheelMenu />
        </div>
      </div>
    </header>
  );
}
