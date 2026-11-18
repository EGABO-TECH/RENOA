import Image from "next/image";

import { Badge, Card, CardHeader, Stack } from "@/components/ui";
import { imageFrom } from "@/lib/media";
import { PROJECT_CATEGORY, PROJECT_STATUS, routes } from "@/lib/site";
import type { Project } from "@/payload-types";

/**
 * A project on the work index, the homepage and the service proof sections.
 *
 * The status is a real state, so it carries a dot and a tone: live and testnet
 * read as running, in-progress and archived as quieter. The category goes in
 * the card eyebrow because it is data about the card, which is the one place
 * design.md's mono label survived the narrowing in phase 2.
 */
export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const cover = imageFrom(project.gallery?.[0]?.image, "card");
  const status = PROJECT_STATUS[project.status] ?? project.status;

  return (
    <Card href={routes.project(project.slug)} padding="none" className="overflow-hidden">
      {cover ? (
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw"
          priority={priority}
          className="aspect-[16/10] w-full object-cover"
        />
      ) : null}

      <Stack gap={3} className="p-[var(--s-5)]">
        <CardHeader
          eyebrow={PROJECT_CATEGORY[project.category] ?? undefined}
          title={project.title}
        />
        <p className="t-small text-muted m-0">{project.summary}</p>
        <div>
          <Badge
            tone={project.status === "live" ? "ok" : "neutral"}
            dot={project.status === "live" || project.status === "testnet"}
          >
            {status}
          </Badge>
        </div>
      </Stack>
    </Card>
  );
}
