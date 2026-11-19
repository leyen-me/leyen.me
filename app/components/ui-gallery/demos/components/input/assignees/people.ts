/**
 * Bencho's four seed people, in source order. Faces are gradient orbs instead
 * of the block's photographs so the demo stays self-contained.
 */
export type Person = {
  id: string;
  name: string;
  role: string;
  /** Two stops for the avatar's radial wash. */
  tint: readonly [string, string];
};

export const PEOPLE: readonly Person[] = [
  {
    id: "kai",
    name: "Adam Marsh",
    role: "Design",
    tint: ["#ff8ac1", "#d61b7a"],
  },
  {
    id: "mara",
    name: "Priya Raman",
    role: "Research",
    tint: ["#7b8cff", "#3036c9"],
  },
  {
    id: "sofia",
    name: "Nora Wilder",
    role: "Engineering",
    tint: ["#5ff0a8", "#159b5d"],
  },
  {
    id: "ines",
    name: "Marco Bellini",
    role: "Product",
    tint: ["#ff9b6e", "#e0342b"],
  },
] as const;

export const PEOPLE_BY_ID = new Map(PEOPLE.map((person) => [person.id, person]));
