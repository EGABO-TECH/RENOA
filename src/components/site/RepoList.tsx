import { Badge, Card, Grid, Stack } from "@/components/ui";
import { getMemberRepos } from "@/lib/github";

/**
 * A member's featured repositories.
 *
 * Two renderings of the same list. When GitHub answers, each repo shows its
 * description, language and stars. When it does not — no token, a rate limit,
 * GitHub down — the names still link to the right URLs, because a repo's URL
 * is `github.com/<login>/<name>` and we know both without asking anyone.
 *
 * That fallback is the point of section 8's "never break the page": the degraded
 * state is still useful, so a profile does not lose a section over an API we do
 * not control.
 */
export async function RepoList({
  username,
  repoNames,
}: {
  username: string | null | undefined;
  repoNames: string[];
}) {
  const login = username?.trim();
  if (!login || repoNames.length === 0) return null;

  const data = await getMemberRepos(login, repoNames);

  if (!data || data.repos.length === 0) {
    return (
      <ul className="flex list-none flex-wrap gap-[var(--s-2)] p-0 m-0">
        {repoNames.map((name) => (
          <li key={name}>
            <a
              href={`https://github.com/${login}/${name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-[var(--r-md)] border border-line px-[var(--s-3)] py-[var(--s-2)] no-underline transition-colors duration-[var(--dur-1)] ease-[var(--ease)] hover:border-brand"
            >
              {/* Mono: a repository name is machine data. */}
              <span className="t-mono text-ink">{name}</span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Stack gap={4}>
      <Grid cols={2} gap={4}>
        {data.repos.map((repo) => (
          <Card key={repo.name} href={repo.url}>
            <Stack gap={3}>
              <span className="t-mono text-ink">{repo.name}</span>

              {repo.description ? (
                <p className="t-small text-muted m-0">{repo.description}</p>
              ) : null}

              <Stack row gap={2} align="center">
                {repo.language ? <Badge>{repo.language}</Badge> : null}
                {repo.stars > 0 ? (
                  <Badge mono>
                    {repo.stars} {repo.stars === 1 ? "star" : "stars"}
                  </Badge>
                ) : null}
                {repo.isArchived ? <Badge tone="warn">Archived</Badge> : null}
              </Stack>
            </Stack>
          </Card>
        ))}
      </Grid>

      <p className="t-small text-faint m-0">
        <a
          href={`https://github.com/${login}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand no-underline hover:underline"
        >
          {data.publicRepoCount} public {data.publicRepoCount === 1 ? "repository" : "repositories"}{" "}
          on GitHub
        </a>
      </p>
    </Stack>
  );
}
