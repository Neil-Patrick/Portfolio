import {
  Award,
  FolderGit2,
  House,
  Layers,
  Mail,
  MessagesSquare,
  User,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { SectionId } from "@/content/site";
import { TechIcon } from "./TechIcon";

/**
 * Site icons. UI icons come from lucide-react; brand logos (GitHub, LinkedIn)
 * come from devicon through TechIcon. Icons are always decorative: the text
 * label next to them carries the meaning, so they are hidden from screen readers.
 */

/** Same size and weight as the technology logos, so every icon lines up. */
export const ICON_SIZE = 18;

/** A lucide icon with the site's defaults (size, stroke, hidden from assistive tech). */
export function Icon({ icon: Glyph, className = "", ...props }: { icon: LucideIcon } & LucideProps) {
  return (
    <Glyph
      size={ICON_SIZE}
      strokeWidth={1.75}
      aria-hidden
      focusable={false}
      className={`shrink-0 ${className}`}
      {...props}
    />
  );
}

const sectionIcons: Record<SectionId, LucideIcon> = {
  home: House,
  about: User,
  credentials: Award,
  technologies: Layers,
  projects: FolderGit2,
  contact: MessagesSquare,
};

export function SectionIcon({ id, className }: { id: SectionId; className?: string }) {
  return <Icon icon={sectionIcons[id]} className={className} />;
}

/** Contact links by their label in site.contactLinks. `mono` draws brand logos in the text color too. */
export function ContactIcon({ label, mono = false }: { label: string; mono?: boolean }) {
  if (label === "GitHub" || label === "LinkedIn") return <TechIcon name={label} mono={mono} />;
  return <Icon icon={Mail} />;
}

/** GitHub mark, for links to repositories and the profile. */
export function GitHubLogo() {
  return <TechIcon name="GitHub" />;
}
