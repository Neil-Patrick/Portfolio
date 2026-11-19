import { site } from "@/content/site";
import { getGitHubStats } from "@/lib/github";
import { NEW_TAB_NOTE, newTab } from "@/lib/links";
import { GitHubActivityView } from "./GitHubActivityView";

/** Fetches (cached) GitHub stats on the server and hands plain data to the animated view. */
export async function GitHubActivity() {
  const stats = await getGitHubStats(site.githubUsername);
  const profileUrl = `https://github.com/${site.githubUsername}`;

  if (!stats) {
    return (
      <p className="text-ink-muted">
        GitHub stats are unavailable right now.{" "}
        <a href={profileUrl} {...newTab} className="text-accent underline underline-offset-4">
          See My GitHub Profile
          <span className="sr-only">{NEW_TAB_NOTE}</span>
        </a>
        .
      </p>
    );
  }
  return <GitHubActivityView stats={stats} />;
}
