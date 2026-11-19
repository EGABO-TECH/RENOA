import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";
import { hrefKind, opensNewTab } from "@/lib/href";

const BASE =
  "inline-flex items-center justify-center gap-[var(--s-2)] rounded-md border font-sans font-semibold leading-none whitespace-nowrap no-underline " +
  "transition-[background-color,border-color,color] duration-[var(--dur-2)] ease-[var(--ease)] " +
  "disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";

const VARIANTS = {
  /** The one primary action in a view. */
  primary:
    "bg-brand border-brand text-on-brand hover:bg-brand-hover hover:border-brand-hover hover:text-on-brand",
  /** Everything standing alongside a primary. */
  secondary:
    "bg-transparent border-line text-ink hover:bg-paper-sub hover:border-line-strong hover:text-ink",
  /** Tertiary, inside dense rows and cards. */
  ghost:
    "bg-transparent border-transparent text-brand hover:bg-brand-soft hover:text-brand-hover",
  /** Irreversible actions only. */
  danger:
    "bg-transparent border-danger text-danger hover:bg-danger-soft hover:text-danger",
} as const;

const SIZES = {
  sm: "h-9 px-[var(--s-3)] text-[length:var(--t-micro)]",
  md: "h-11 px-[var(--s-5)] text-[length:var(--t-small)]",
  lg: "h-[3.25rem] px-[var(--s-6)] text-[length:var(--t-body)]",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Fills the row. Use on a phone, not across a wide layout. */
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type NativeButton = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "children"
>;
type NativeAnchor = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "className" | "children" | "href"
>;

export type ButtonProps = Common & NativeButton & { href?: never };
export type ButtonLinkProps = Common & NativeAnchor & { href: string };

/**
 * A button, or a link wearing the same clothes when given `href`.
 *
 * An internal `href` routes through `next/link`. An `http(s)`, `mailto:` or
 * `tel:` href gets a plain anchor, and the http case also gets `target` and
 * `rel`.
 */
export function Button(props: ButtonProps | ButtonLinkProps) {
  const {
    variant = "primary",
    size = "md",
    block = false,
    className,
    children,
  } = props;

  const classes = cn(
    BASE,
    VARIANTS[variant],
    SIZES[size],
    block && "w-full",
    className,
  );

  if (typeof props.href === "string") {
    const {
      href,
      variant: _variant,
      size: _size,
      block: _block,
      className: _className,
      children: _children,
      ...anchorProps
    } = props;

    const kind = hrefKind(href);

    if (kind === "external") {
      return (
        <a
          {...anchorProps}
          href={href}
          className={classes}
          {...(opensNewTab(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    }

    // An href from the CMS that is neither a path nor a URL is a placeholder,
    // and `next/link` throws on one (src/lib/href.ts). It renders as a dead
    // button rather than taking the page down with it.
    if (kind === "placeholder") {
      return (
        <span className={classes} aria-disabled="true" role="link">
          {children}
        </span>
      );
    }

    return (
      <Link {...anchorProps} href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const {
    variant: _variant,
    size: _size,
    block: _block,
    className: _className,
    children: _children,
    href: _href,
    type = "button",
    ...buttonProps
  } = props;

  return (
    <button {...buttonProps} type={type} className={classes}>
      {children}
    </button>
  );
}
