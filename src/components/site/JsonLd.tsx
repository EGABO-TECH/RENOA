/**
 * Emits structured data.
 *
 * `JSON.stringify` output is escaped before it reaches the DOM: a `<` inside a
 * string — which a project summary or a post excerpt can legitimately contain
 * — would otherwise be read as the start of a tag and could close the script
 * early. Replacing it with its unicode escape keeps the JSON valid and the
 * script impossible to break out of.
 *
 * `dangerouslySetInnerHTML` rather than a child string so React does not
 * escape the quotes into entities, which would make the JSON unparseable.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;

  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
