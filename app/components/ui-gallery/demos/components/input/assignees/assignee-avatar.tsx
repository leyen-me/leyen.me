import type { Person } from "./people";

/**
 * Replacement for the block's photo avatar: a muted radial wash with the
 * person's initials. Decorative, so the text label next to it carries the name.
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
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, Math.round(size * 0.34)),
        letterSpacing: "0.02em",
        backgroundImage: `radial-gradient(120% 120% at 30% 22%, ${person.tint[0]} 0%, ${person.tint[1]} 100%)`,
      }}
    >
      {person.initials}
    </span>
  );
}
