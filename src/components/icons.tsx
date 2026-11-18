import { Folder } from "pixelarticons/react/Folder.js";
import { Home } from "pixelarticons/react/Home.js";
import { Mail } from "pixelarticons/react/Mail.js";
import { Trophy } from "pixelarticons/react/Trophy.js";
import { User } from "pixelarticons/react/User.js";
import { Zap } from "pixelarticons/react/Zap.js";
import type { SVGProps } from "react";
import type { SectionId } from "@/content/site";

/*
 * Section icons from pixelarticons (https://pixelarticons.com, MIT License).
 * The Record type makes sure every section keeps an icon. Swap any of these
 * for custom pixel art later without touching the components that use them.
 */

type IconComponent = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

export const sectionIcons: Record<SectionId, IconComponent> = {
  home: Home,
  about: User,
  credentials: Trophy,
  skills: Zap,
  projects: Folder,
  contact: Mail,
};
