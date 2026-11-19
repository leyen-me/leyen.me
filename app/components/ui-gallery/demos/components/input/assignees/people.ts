/**
 * Bencho's four seed people, in source order. Faces are drawn as initial /
 * gradient discs instead of the block's photographs so the demo stays
 * self-contained (no network, no image assets).
 */
export type Person = {
  id: string;
  name: string;
  role: string;
  initials: string;
  /** Two stops for the avatar's radial wash; muted like the source photos. */
  tint: readonly [string, string];
};

export const PEOPLE: readonly Person[] = [
  {
    id: "kai",
    name: "Adam Marsh",
    role: "Design",
    initials: "AM",
    tint: ["#bda98f", "#7a6450"],
  },
  {
    id: "mara",
    name: "Priya Raman",
    role: "Research",
    initials: "PR",
    tint: ["#c9a6b5", "#875c70"],
  },
  {
    id: "sofia",
    name: "Nora Wilder",
    role: "Engineering",
    initials: "NW",
    tint: ["#9fb7c9", "#587184"],
  },
  {
    id: "ines",
    name: "Marco Bellini",
    role: "Product",
    initials: "MB",
    tint: ["#b8b49c", "#716d58"],
  },
] as const;

export const PEOPLE_BY_ID = new Map(PEOPLE.map((person) => [person.id, person]));
