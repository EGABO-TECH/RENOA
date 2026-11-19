"use client";

import { useEffect, useState } from "react";

import { FieldLabel, useField, useFormFields } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";

type Repo = {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
  isArchived: boolean;
};

type Reason = "no-token" | "unavailable";

/**
 * The featured-repositories field (brief section 8: "a custom field component
 * listing the member's public repos to tick").
 *
 * It reads `githubUsername` out of the same form, so the list reloads when
 * that changes without anyone saving first, and it writes a plain array of
 * repo names — which is why the field is `text` with `hasMany` rather than an
 * array of rows: the value a picker owns should be the value, not a set of
 * sub-rows to keep in step.
 *
 * It degrades, in the order these things actually happen:
 *
 * - **No username yet.** Says so; nothing to list.
 * - **No GITHUB_TOKEN.** The token is still outstanding, so the field falls
 *   back to typing names by hand and says why. The field is never unusable
 *   because an integration is unconfigured.
 * - **GitHub unavailable or login not found.** Same fallback, different
 *   message, and anything already picked is left alone.
 *
 * Selection order is the display order on the profile, so ticking a box
 * appends rather than re-sorting.
 */
export const RepoPicker: TextFieldClientComponent = ({ field, path }) => {
  const { setValue, value } = useField<string[]>({ path });

  // The username lives in a sibling field; reading it from form state means
  // the list follows what is on screen, not what was last saved.
  const username = useFormFields(([fields]) => {
    const raw = fields?.githubUsername?.value;
    return typeof raw === "string" ? raw.trim() : "";
  });

  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [reason, setReason] = useState<Reason | null>(null);
  const [manual, setManual] = useState("");

  const selected = Array.isArray(value) ? value : [];

  // Clear the previous login's results as the username changes, during render
  // rather than in an effect, so there is never a frame showing one person's
  // repositories under another person's name.
  const [loadedFor, setLoadedFor] = useState(username);
  if (loadedFor !== username) {
    setLoadedFor(username);
    setRepos(null);
    setReason(null);
  }

  // Derived, not stored: we are loading exactly when there is a username and
  // neither a result nor a reason has come back for it yet.
  const loading = Boolean(username) && repos === null && reason === null;

  useEffect(() => {
    if (!username) return;

    const controller = new AbortController();

    fetch(`/api/github/repos?username=${encodeURIComponent(username)}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((body: { repos: Repo[] | null; reason?: Reason }) => {
        setRepos(body.repos);
        setReason(body.repos ? null : (body.reason ?? "unavailable"));
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRepos(null);
          setReason("unavailable");
        }
      });

    return () => controller.abort();
  }, [username]);

  const toggle = (name: string) => {
    setValue(
      selected.includes(name)
        ? selected.filter((item) => item !== name)
        : [...selected, name],
    );
  };

  const addManual = () => {
    const name = manual.trim();
    if (!name || selected.includes(name)) return;
    setValue([...selected, name]);
    setManual("");
  };

  return (
    <div className="field-type">
      <FieldLabel label={field?.label} path={path} />

      {field?.admin?.description ? (
        <div className="field-description">{String(field.admin.description)}</div>
      ) : null}

      {selected.length > 0 ? (
        <ul style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 0, margin: "8px 0", listStyle: "none" }}>
          {selected.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => toggle(name)}
                aria-label={`Remove ${name}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid var(--theme-elevation-150)",
                  background: "var(--theme-elevation-50)",
                  color: "var(--theme-elevation-800)",
                  font: "inherit",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {name}
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!username ? (
        <p style={{ fontSize: 13, opacity: 0.7 }}>
          Add a GitHub username above to list this member&rsquo;s repositories.
        </p>
      ) : loading ? (
        <p style={{ fontSize: 13, opacity: 0.7 }}>Loading repositories for {username}…</p>
      ) : repos ? (
        <div
          style={{
            maxHeight: 280,
            overflowY: "auto",
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: 4,
            padding: 8,
          }}
        >
          {repos.length === 0 ? (
            <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
              {username} has no public repositories.
            </p>
          ) : (
            repos.map((repo) => (
              <label
                key={repo.name}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "6px 4px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(repo.name)}
                  onChange={() => toggle(repo.name)}
                  style={{ marginTop: 3 }}
                />
                <span style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 14 }}>
                    {repo.name}
                    {repo.isArchived ? (
                      <span style={{ opacity: 0.6, fontSize: 12 }}> · archived</span>
                    ) : null}
                  </span>
                  {repo.description ? (
                    <span style={{ display: "block", fontSize: 12, opacity: 0.7 }}>
                      {repo.description}
                    </span>
                  ) : null}
                  <span style={{ display: "block", fontSize: 12, opacity: 0.6 }}>
                    {[repo.language, repo.stars > 0 ? `${repo.stars}★` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </label>
            ))
          )}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 13, opacity: 0.7 }}>
            {reason === "no-token"
              ? "No GITHUB_TOKEN is configured, so repositories cannot be listed yet. Add names by hand for now — the profile links them either way."
              : `Could not reach GitHub for "${username}". Add names by hand, or try again later.`}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={manual}
              onChange={(event) => setManual(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addManual();
                }
              }}
              placeholder="repository-name"
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: 4,
                border: "1px solid var(--theme-elevation-150)",
                background: "var(--theme-input-bg)",
                color: "inherit",
                font: "inherit",
                fontSize: 13,
              }}
            />
            <button type="button" onClick={addManual} className="btn btn--style-secondary btn--size-small">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
