import { cacheLife } from "next/cache";

/**
 * GitHub stats for the home page. Server-only by usage: imported only from
 * Server Components, and the token is a non-public env var (never bundled).
 *
 * With GITHUB_TOKEN: one GraphQL query (contribution calendar, commits, PRs,
 * repositories contributed to, languages). Without it, or if GitHub errors:
 * public REST data (repos, followers, primary languages). Cached for hours, so
 * the page stays static and GitHub is called a few times a day at most.
 */

export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

export type GitHubStats = {
  login: string;
  url: string;
  followers: number;
  publicRepos: number;
  /** Null when no token is configured (public data only). */
  activity: null | {
    total: number;
    commits: number;
    pullRequests: number;
    reposContributedTo: number;
    weeks: ContributionDay[][];
  };
  /** Top languages with their share (0..1). */
  languages: { name: string; share: number }[];
  /** What the language shares are based on, for an honest label. */
  languagesBasis: "bytes" | "repos";
};

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

const QUERY = `
query ($login: String!) {
  user(login: $login) {
    url
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount }
    repositoriesContributedTo(first: 50, includeUserRepositories: true, contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY]) {
      totalCount
      nodes { languages(first: 8, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } } }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

const HEADERS = { "User-Agent": "portfolio-site", Accept: "application/vnd.github+json" };

function topShares(totals: Map<string, number>, limit = 6) {
  const sum = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, share: value / sum }));
}

type GraphQLUser = {
  url: string;
  followers: { totalCount: number };
  repositories: { totalCount: number };
  repositoriesContributedTo: {
    totalCount: number;
    nodes: { languages: { edges: { size: number; node: { name: string } }[] } }[];
  };
  contributionsCollection: {
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    contributionCalendar: {
      totalContributions: number;
      weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: keyof typeof LEVELS }[] }[];
    };
  };
};

async function viaGraphQL(login: string, token: string): Promise<GitHubStats> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...HEADERS, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`);
  const json = (await res.json()) as { data?: { user: GraphQLUser | null }; errors?: { message: string }[] };
  const user = json.data?.user;
  if (!user) throw new Error(json.errors?.[0]?.message ?? "GitHub user not found");

  const bytes = new Map<string, number>();
  for (const repo of user.repositoriesContributedTo.nodes) {
    for (const edge of repo.languages.edges) {
      bytes.set(edge.node.name, (bytes.get(edge.node.name) ?? 0) + edge.size);
    }
  }
  const calendar = user.contributionsCollection.contributionCalendar;

  return {
    login,
    url: user.url,
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
    activity: {
      total: calendar.totalContributions,
      commits: user.contributionsCollection.totalCommitContributions,
      pullRequests: user.contributionsCollection.totalPullRequestContributions,
      reposContributedTo: user.repositoriesContributedTo.totalCount,
      weeks: calendar.weeks.map((week) =>
        week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: LEVELS[day.contributionLevel] ?? 0,
        })),
      ),
    },
    languages: topShares(bytes),
    languagesBasis: "bytes",
  };
}

async function viaRest(login: string): Promise<GitHubStats> {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${login}`, { headers: HEADERS }),
    fetch(`https://api.github.com/users/${login}/repos?per_page=100`, { headers: HEADERS }),
  ]);
  if (!userRes.ok || !reposRes.ok) throw new Error(`GitHub REST ${userRes.status}/${reposRes.status}`);
  const user = (await userRes.json()) as { html_url: string; followers: number; public_repos: number };
  const repos = (await reposRes.json()) as { language: string | null }[];

  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return {
    login,
    url: user.html_url,
    followers: user.followers,
    publicRepos: user.public_repos,
    activity: null,
    languages: topShares(counts),
    languagesBasis: "repos",
  };
}

export async function getGitHubStats(login: string): Promise<GitHubStats | null> {
  "use cache";
  cacheLife("hours");

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      return await viaGraphQL(login, token);
    } catch (error) {
      console.warn("[github] GraphQL failed, using public data:", (error as Error).message);
    }
  }
  try {
    return await viaRest(login);
  } catch (error) {
    console.warn("[github] public data unavailable:", (error as Error).message);
    return null;
  }
}
