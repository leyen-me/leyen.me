import type { Person } from "./people";

/**
 * Replacement for the block's photo avatar: a vivid radial orb. The source
 * uses photographed faces; this keeps the same three-dimensional feel with
 * pure CSS and no external assets.
 */
export default function AssigneeAvatar({
  person,
  size,
  className = "",
}: {
  person: Person;
  size: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `radial-gradient(circle at 32% 24%, rgba(255,255,255,0.55) 0%, transparent 32%), radial-gradient(120% 120% at 30% 22%, ${person.tint[0]} 0%, ${person.tint[1]} 100%)`,
      }}
    />
  );
}
