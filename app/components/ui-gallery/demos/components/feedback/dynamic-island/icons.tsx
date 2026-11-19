import type { SVGProps } from "react";

/**
 * Bencho renders these from its icon bundle. The paths below are the same
 * Lucide outlines the bundle ships, drawn inline so the demo has no imports
 * and no sprite request.
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

export function TimerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 2h4" />
      <path d="M12 14l3-3" />
      <path d="M4 13a8 8 0 1 1 16 0 8 8 0 1 1-16 0" />
    </Icon>
  );
}

export function PlayIcon({ size = 18, ...props }: IconProps) {
  return (
    <Icon size={size} fill="currentColor" strokeWidth={0} {...props}>
      <path d="M7 4.5 19 12 7 19.5Z" />
    </Icon>
  );
}

export function PauseIcon({ size = 18, ...props }: IconProps) {
  return (
    <Icon size={size} fill="currentColor" strokeWidth={0} {...props}>
      <path d="M6 4h4v16H6z" />
      <path d="M14 4h4v16h-4z" />
    </Icon>
  );
}

export function PhoneIcon({ size = 20, ...props }: IconProps) {
  return (
    <Icon size={size} {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </Icon>
  );
}

export function PlaneIcon({ size = 18, ...props }: IconProps) {
  return (
    <Icon size={size} fill="currentColor" strokeWidth={0} {...props}>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z" />
    </Icon>
  );
}

export function SkipBackIcon({ size = 20, ...props }: IconProps) {
  return (
    <Icon size={size} fill="currentColor" strokeWidth={0} {...props}>
      <path d="M19 20 9 12 19 4Z" />
      <path d="M5 19V5" />
    </Icon>
  );
}

export function SkipForwardIcon({ size = 20, ...props }: IconProps) {
  return (
    <Icon size={size} fill="currentColor" strokeWidth={0} {...props}>
      <path d="M5 4l10 8-10 8Z" />
      <path d="M19 5v14" />
    </Icon>
  );
}

/** Four little bars that dance while the track is playing. */
export function MusicBars({ on }: { on: boolean }) {
  return (
    <span className="dyn-bars" data-on={on || undefined} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/**
 * The source ships `/lab/mount.jpg` and a portrait photo. Both are replaced
 * here by local CSS artwork: a dusk mountain "album cover" and a monogram
 * avatar, so the demo stays offline and asset-free.
 */
export function AlbumArt({ small = false }: { small?: boolean }) {
  return (
    <span
      className={small ? "dyn-art dyn-art-s" : "dyn-art"}
      aria-hidden="true"
    />
  );
}

export function CallerFace() {
  return (
    <span className="dyn-face" aria-hidden="true">
      <span className="dyn-face-initial">M</span>
    </span>
  );
}
