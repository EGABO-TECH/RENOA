import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/site/Bits";
import { FilterBar } from "@/components/site/FilterBar";
import { Pagination } from "@/components/site/Pagination";
import { PostCard } from "@/components/site/PostCard";
import { Grid, Section, SectionHeader, Stack } from "@/components/ui";
import { asPageNumber, getPinnedPost, getPostsPage, getSiteSettings } from "@/lib/cms";
import { POST_TYPE, buildMetadata, routes } from "@/lib/site";
import type { Post } from "@/payload-types";

type Search = { searchParams: Promise<{ type?: string; page?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    settings,
    path: routes.journal,
    title: settings.journalLabel,
    description: `Launches, build notes and recognition from ${settings.siteName}.`,
  });
}

const asPostType = (value?: string): Post["postType"] | undefined =>
  value && value in POST_TYPE ? (value as Post["postType"]) : undefined;

/**
 * The journal index: one featured post, filters by type, then the grid.
 *
 * "Journal" is a working name, so every label on this page comes from
 * `SiteSettings.journalLabel` and the section can be renamed in the admin
 * without touching code (brief section 4).
 *
 * The featured post is excluded from the grid below it, so nothing appears
 * twice — and the feature is dropped while a filter is active, since a pinned
 * post of another type would contradict the filter. It also only appears on
 * the first page: repeating it above every page of the grid would be odd.
 *
 * The grid is paginated rather than capped. The version this replaces asked
 * for up to a hundred posts and rendered all of them, which was fine at five
 * and would have been a slow page and a silent cliff at a hundred and one.
 */
export default async function JournalPage({ searchParams }: Search) {
  const params = await searchParams;
  const type = asPostType(params.type);
  const page = asPageNumber(params.page);

  const [settings, pinned] = await Promise.all([
    getSiteSettings(),
    type || page > 1 ? Promise.resolve(null) : getPinnedPost(),
  ]);

  const posts = await getPostsPage(type, page, pinned?.id);
  const grid = posts.docs;

  // A page number past the end is not a view of the journal; it is a wrong
  // URL, and should say so rather than render an empty grid under a filter
  // that does have results.
  if (page > 1 && grid.length === 0) notFound();

  return (
    <Section size="lg">
      <SectionHeader
        level="h1"
        title={settings.journalLabel}
        lede="What we shipped, what we learned, and who did it."
      />

      <Stack gap={6}>
        <FilterBar
          label="Filter by type"
          basePath={routes.journal}
          param="type"
          options={Object.entries(POST_TYPE).map(([value, label]) => ({ value, label }))}
          current={type}
        />

        {pinned ? <PostCard post={pinned} featured /> : null}

        {grid.length > 0 ? (
          <Grid cols={3} gap={4}>
            {grid.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Grid>
        ) : pinned ? null : (
          <EmptyState>
            {type
              ? "No posts of that type yet."
              : `Nothing is published in the ${settings.journalLabel.toLowerCase()} yet. Posts live under Content → ${settings.journalLabel} in the admin.`}
          </EmptyState>
        )}

        <Pagination
          basePath={routes.journal}
          page={posts.page}
          totalPages={posts.totalPages}
          preserve={{ type }}
          label={`${settings.journalLabel} pages`}
        />
      </Stack>
    </Section>
  );
}
