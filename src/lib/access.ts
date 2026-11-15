import type { Access, FieldAccess, Where } from "payload";

/**
 * Role model (BUILD_BRIEF section 6).
 *
 * Every rule here is enforced server-side by Payload access functions.
 * Hiding UI is never the mechanism — these run on the API too.
 */
export type Role = "admin" | "editor" | "member";

type MaybeUser = { role?: Role; teamMember?: string | { id: string } } | null | undefined;

const roleOf = (user: MaybeUser): Role | null => user?.role ?? null;

export const isAdmin: Access = ({ req }) => roleOf(req.user as MaybeUser) === "admin";

export const isEditor: Access = ({ req }) => {
  const role = roleOf(req.user as MaybeUser);
  return role === "admin" || role === "editor";
};

/** Any authenticated user, whatever their role. */
export const isLoggedIn: Access = ({ req }) => Boolean(req.user);

/** Published documents are world-readable; drafts need a login. */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};

/** Public read, no draft exposure (collections without drafts). */
export const anyone: Access = () => true;

/** Nobody, ever — used to disable delete outright. */
export const noone: Access = () => false;

/** Admins only; editors archive instead of deleting (brief section 6, "Delete" row). */
export const deleteOnlyAdmin: Access = isAdmin;

/**
 * TeamMembers: admins and editors edit anyone; a member edits only the
 * profile their user account is linked to via `Users.teamMember`.
 */
export const canUpdateTeamMember: Access = ({ req, id }) => {
  const user = req.user as MaybeUser;
  const role = roleOf(user);
  if (role === "admin" || role === "editor") return true;
  if (role !== "member") return false;

  const linked = typeof user?.teamMember === "object" ? user?.teamMember?.id : user?.teamMember;
  if (!linked) return false;
  // Scope the update to their own profile, whether by id or by query.
  return id ? String(id) === String(linked) : { id: { equals: linked } };
};

/**
 * Posts: members may create and edit only their own drafts. Editors and
 * admins edit anything.
 */
export const canUpdatePost: Access = ({ req }) => {
  const user = req.user as MaybeUser;
  const role = roleOf(user);
  if (role === "admin" || role === "editor") return true;
  if (role !== "member") return false;

  const linked = typeof user?.teamMember === "object" ? user?.teamMember?.id : user?.teamMember;
  if (!linked) return false;
  // Own drafts only — once published it leaves their hands.
  const own: Where = {
    and: [{ authors: { in: [linked] } }, { _status: { not_equals: "published" } }],
  };
  return own;
};

/** Pipeline collections (Inquiries, Applications): members get nothing. */
export const pipelineRead: Access = isEditor;
export const pipelineUpdate: Access = isEditor;

/**
 * Field-level guard for `workflowStatus`. A member may move a post to
 * `draft` or `in-review` but never to `published` (brief section 6).
 */
export const canPublish: FieldAccess = ({ req }) => {
  const role = roleOf(req.user as MaybeUser);
  return role === "admin" || role === "editor";
};

/** Only admins touch roles, so a member cannot promote themselves. */
export const adminFieldOnly: FieldAccess = ({ req }) =>
  roleOf(req.user as MaybeUser) === "admin";
