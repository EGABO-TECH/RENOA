/**
 * The smallest set of Lexical nodes the seed needs.
 *
 * Payload stores rich text as a Lexical editor state, not HTML or Markdown,
 * so seeded prose has to be built as nodes. Every node carries the version,
 * format, indent and direction keys the editor writes itself — omit one and
 * the admin renders the field but cannot edit it.
 */

const textNode = (text, format = 0) => ({
  type: "text",
  text,
  detail: 0,
  format,
  mode: "normal",
  style: "",
  version: 1,
});

const container = (type, extra, children) => ({
  type,
  version: 1,
  format: "",
  indent: 0,
  direction: "ltr",
  ...extra,
  children,
});

/** A paragraph. Pass a string, or nodes for mixed formatting. */
export const p = (content) =>
  container("paragraph", { textFormat: 0, textStyle: "" }, [
    typeof content === "string" ? textNode(content) : content,
  ].flat());

/** Bold run, for use inside p(). */
export const b = (text) => textNode(text, 1);

export const h = (text, tag = "h2") => container("heading", { tag }, [textNode(text)]);

export const ul = (items) =>
  container("list", { listType: "bullet", tag: "ul", start: 1 }, items.map((item, index) =>
    container("listitem", { value: index + 1 }, [textNode(item)]),
  ));

/** Wraps nodes into the editor state Payload stores. */
export const rich = (...nodes) => ({
  root: container("root", {}, nodes.flat()),
});
