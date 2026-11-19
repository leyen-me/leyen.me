import type { SVGProps } from "react";

/**
 * Bencho draws these from its bundled icon set. The paths here are the same
 * outlines, inlined so the demo makes no requests.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 16, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PlayIcon({ size = 24, ...props }: IconProps) {
  return (
    <Icon size={size} fill="currentColor" strokeWidth={0} {...props}>
      <path d="M7 4.5 19 12 7 19.5Z" />
    </Icon>
  );
}

export function PauseIcon({ size = 24, ...props }: IconProps) {
  return (
    <Icon size={size} fill="currentColor" strokeWidth={0} {...props}>
      <path d="M6 4h4v16H6z" />
      <path d="M14 4h4v16h-4z" />
    </Icon>
  );
}

export function PreviousIcon({ size = 20, ...props }: IconProps) {
  return (
    <Icon size={size} fill="currentColor" strokeWidth={0} {...props}>
      <path d="M19 20 9 12 19 4Z" />
      <path d="M5 19V5" />
    </Icon>
  );
}

export function NextIcon({ size = 20, ...props }: IconProps) {
  return (
    <Icon size={size} fill="currentColor" strokeWidth={0} {...props}>
      <path d="M5 4l10 8-10 8Z" />
      <path d="M19 5v14" />
    </Icon>
  );
}

/** The four bars beside the compact artwork; they dance only while playing. */
export function MusicBars({ on }: { on: boolean }) {
  return (
    <span className="mi-bars" data-on={on || undefined} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/**
 * The source ships `/lab/mount.jpg`. This is a local CSS dusk-mountain cover
 * with a palette per playlist entry, so nothing loads from the network.
 */
export function AlbumArt({
  art,
  small = false,
}: {
  art: number;
  small?: boolean;
}) {
  return (
    <span
      className={small ? "mi-art mi-art-s" : "mi-art"}
      data-art={art}
      aria-hidden="true"
    />
  );
}
