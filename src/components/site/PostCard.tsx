import Image from "next/image";

import { Card, CardHeader, Stack } from "@/components/ui";
import { imageFrom, populatedList } from "@/lib/media";
import { POST_TYPE, formatDate, isoDate, routes } from "@/lib/site";
import type { Post, TeamMember } from "@/payload-types";

/**
 * A journal post on the index, the homepage and the related lists.
 *
 * The byline is the authors' real names, read through the relationship rather
 * than typed into the post, so a name correction on a profile reaches every
 * post that person wrote.
 */
export function PostCard({
  post,
  featured = false,
}: {
  post: Post;
  /** The journal's one pinned slot: a wider card with the cover image. */
  featured?: boolean;
}) {
  const cover = imageFrom(post.cover, featured ? "feature" : "card");
  const authors = populatedList<TeamMember>(post.authors);
  const date = formatDate(post.publishedAt);

  return (
    <Card
      href={routes.post(post.slug)}
      padding="none"
      className={featured ? "overflow-hidden sm:grid sm:grid-cols-2" : "overflow-hidden"}
    >
      {cover ? (
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes={featured ? "(max-width: 40rem) 100vw, 50vw" : "(max-width: 40rem) 100vw, 33vw"}
          priority={featured}
          className={
            featured
              ? "h-full w-full object-cover sm:aspect-auto"
              : "aspect-[16/10] w-full object-cover"
          }
        />
      ) : null}

      <Stack gap={3} className="p-[var(--s-5)]">
        <CardHeader
          eyebrow={POST_TYPE[post.postType] ?? undefined}
          title={post.title}
          level={featured ? "h2" : "h3"}
        />
        <p className="t-small text-muted m-0">{post.excerpt}</p>

        <p className="t-micro text-faint m-0">
          {authors.length > 0 ? authors.map((a) => a.fullName).join(", ") : null}
          {authors.length > 0 && date ? " · " : null}
          {date ? <time dateTime={isoDate(post.publishedAt)}>{date}</time> : null}
        </p>
      </Stack>
    </Card>
  );
}
