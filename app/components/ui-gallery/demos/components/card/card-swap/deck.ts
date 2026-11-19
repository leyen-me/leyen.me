/**
 * Static geometry transcribed from Bencho's "Card swap" block.
 *
 * The deck has no layout animation: every card owns a fixed slot and the
 * order array is the only state. Moving a card means changing its slot.
 *
 * Bencho lays the deck out at 360 × 350 px. Here every length is expressed in
 * container-query width units so the whole widget scales as one piece when a
 * gallery card column is narrower than 360 px; at 360 px each value resolves
 * to Bencho's exact pixel size.
 */

export const CARDS = [
  { id: "mount", title: "Mountain" },
  { id: "bloom", title: "Bloom" },
  { id: "peak", title: "Peak" },
  { id: "wings", title: "Wings" },
] as const;

export type CardId = (typeof CARDS)[number]["id"];

/** Bencho's deck box; the board keeps this aspect ratio. */
export const DECK_WIDTH = 360;
export const DECK_HEIGHT = 350;

/** The 3D stage inside the deck box. */
export const STAGE_WIDTH = 196;
export const STAGE_HEIGHT = 246;
export const STAGE_INSET_LEFT = 30;
export const STAGE_INSET_BOTTOM = 24;

/** Slot spacing, in px at design width, on each axis of the stack. */
const SLOT_X = 34;
const SLOT_Y = 26;
const SLOT_Z = 70;

/** Convert a Bencho design pixel length into a container-relative length. */
export function cqw(px: number) {
  return `${Number(((px * 100) / DECK_WIDTH).toFixed(3))}cqw`;
}

/**
 * A slot is a fixed transform, so reordering cards animates them between
 * slots with a single CSS transition. `skewY(6deg)` is what gives the stack
 * its tumbling, hand-dealt look.
 */
export function slot(index: number) {
  return `translate3d(${cqw(index * SLOT_X)}, ${cqw(-index * SLOT_Y)}, ${cqw(
    -index * SLOT_Z
  )}) skewY(6deg)`;
}
