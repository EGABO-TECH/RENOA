import Image from "next/image";

import { Card, Stack } from "@/components/ui";
import { imageFrom } from "@/lib/media";
import { routes } from "@/lib/site";
import type { TeamMember } from "@/payload-types";

/**
 * One of the six, on the team page and the homepage strip.
 *
 * Title and focus come straight from the record. Section 3 of the brief is
 * explicit that the titles and name spellings are the ones in that table and
 * not the ones on the old site, so nothing here reformats or abbreviates them.
 *
 * The photo is square and cropped by CSS rather than by a processed variant,
 * so a portrait uploaded at any aspect ratio still fills the frame instead of
 * letterboxing.
 */
export function MemberCard({ member }: { member: TeamMember }) {
  const photo = imageFrom(member.photo, "card");

  return (
    <Card href={routes.member(member.slug)} padding="none" className="overflow-hidden">
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw"
          className="aspect-square w-full object-cover"
        />
      ) : (
        // No photo yet: a neutral panel of the right shape, so the grid does
        // not jump around as photos arrive one at a time.
        <div
          aria-hidden="true"
          className="flex aspect-square w-full items-center justify-center bg-paper-sub"
        >
          <span className="t-h1 text-faint">{member.fullName.charAt(0)}</span>
        </div>
      )}

      <Stack gap={2} className="p-[var(--s-5)]">
        <h3 className="t-h3 m-0">{member.fullName}</h3>
        <p className="t-small text-brand m-0">{member.title}</p>
        <p className="t-small text-muted m-0">{member.roleFocus}</p>
      </Stack>
    </Card>
  );
}
