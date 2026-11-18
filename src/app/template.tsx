import { PageTransition } from "@/components/motion/PageTransition";

/** Re-mounts on every navigation, so each page fades and lifts in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
