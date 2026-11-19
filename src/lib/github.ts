import "server-only";

/**
 * GitHub data for the team profiles (brief section 8).
 *
 * The token is server-only — the `server-only` import above turns an
 * accidental client import into a build error rather than a leaked credential
 * — and every response is cached for 24 hours through `fetch`, so a profile
 * page costs GitHub nothing on an ordinary visit.
 *
 * Nothing here throws. A missing token, a rate limit, a renamed repository or
 * GitHub being down all resolve to `null`, and the caller hides the section:
 * "On failure, fall back to cached data or hide the section. Never break the
 * page." A profile is a person's page, and it should not go blank because an
 * API we do not control had a bad minute.
 */

const ENDPOINT = "https://api.github.com/graphql";
const DAY = 86_400;

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
  isArchived: boolean;
  pushedAt: string | null;
};

export type MemberRepos = {
  repos: Repo[];
  /** Total public repositories, which is context the featured list lacks. */
  publicRepoCount: number;
};

const REPO_FIELDS = `
  name
  description
  url
  stargazerCount
  isArchived
  pushedAt
  primaryLanguage { name }
`;

type RawRepo = {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  isArchived: boolean;
  pushedAt: string | null;
  primaryLanguage: { name: string } | null;
};

const toRepo = (raw: RawRepo): Repo => ({
  name: raw.name,
  description: raw.description,
  url: raw.url,
  stars: raw.stargazerCount,
  language: raw.primaryLanguage?.name ?? null,
  isArchived: raw.isArchived,
  pushedAt: raw.pushedAt,
});

/**
 * One GraphQL call. Returns null rather than throwing, on anything at all.
 *
 * GitHub answers a partial failure with HTTP 200 and an `errors` array — a
 * repository that was renamed comes back as a null field beside an error, not
 * as a failed request — so the body is inspected rather than just the status.
 */
async function query<T>(
  document: string,
  variables: Record<string, unknown>,
  revalidate: number,
): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // GitHub asks every client to identify itself. This names the
        // application, and deliberately carries nothing about the person
        // whose profile is being rendered.
        "User-Agent": "renoa-website",
      },
      body: JSON.stringify({ query: document, variables }),
      next: { revalidate },
    });

    if (!response.ok) return null;

    const body = (await response.json()) as { data?: T; errors?: unknown[] };
    return body.data ?? null;
  } catch {
    // Network error, DNS, abort, malformed JSON. Same answer: no data.
    return null;
  }
}

/**
 * The repositories a member chose to feature, in the order they chose them,
 * plus their public repository count.
 *
 * Each repo is requested by an alias in one query, so a profile makes a single
 * round trip however many are featured. A name that no longer resolves is
 * dropped silently — a renamed repo should leave a gap, not an error.
 */
export async function getMemberRepos(
  username: string | null | undefined,
  repoNames: string[],
): Promise<MemberRepos | null> {
  const login = username?.trim();
  if (!login) return null;

  const names = repoNames.map((name) => name.trim()).filter(Boolean).slice(0, 12);

  const aliases = names
    .map((_, index) => `r${index}: repository(name: $n${index}) { ${REPO_FIELDS} }`)
    .join("\n");

  const params = names.map((_, index) => `$n${index}: String!`).join(", ");

  const document = `
    query Member($login: String!${params ? `, ${params}` : ""}) {
      user(login: $login) {
        repositories(privacy: PUBLIC) { totalCount }
        ${aliases}
      }
    }
  `;

  const variables: Record<string, unknown> = { login };
  names.forEach((name, index) => {
    variables[`n${index}`] = name;
  });

  const data = await query<{
    user: ({ repositories: { totalCount: number } } & Record<string, unknown>) | null;
  }>(document, variables, DAY);

  if (!data?.user) return null;

  const repos = names
    .map((_, index) => data.user?.[`r${index}`] as RawRepo | null | undefined)
    .filter((raw): raw is RawRepo => Boolean(raw))
    .map(toRepo);

  return { repos, publicRepoCount: data.user.repositories.totalCount };
}

/**
 * Every public repository for a login, newest push first — the list behind the
 * admin's repo picker.
 *
 * Cached for an hour rather than a day: someone picking repositories in the
 * admin has often just created one, and a list that cannot see it is worse
 * than a slightly costlier call on a page only the team opens.
 */
export async function listPublicRepos(username: string): Promise<Repo[] | null> {
  const login = username.trim();
  if (!login) return null;

  const document = `
    query Repos($login: String!) {
      user(login: $login) {
        repositories(
          first: 100
          privacy: PUBLIC
          ownerAffiliations: OWNER
          orderBy: { field: PUSHED_AT, direction: DESC }
        ) {
          nodes { ${REPO_FIELDS} }
        }
      }
    }
  `;

  const data = await query<{ user: { repositories: { nodes: RawRepo[] } } | null }>(
    document,
    { login },
    3600,
  );

  if (!data?.user) return null;
  return data.user.repositories.nodes.filter(Boolean).map(toRepo);
}

/** Whether a token is configured at all, for messages in the admin. */
export const hasGitHubToken = (): boolean => Boolean(process.env.GITHUB_TOKEN);
