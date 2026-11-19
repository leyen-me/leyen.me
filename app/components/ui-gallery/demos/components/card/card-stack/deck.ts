/**
 * Static geometry transcribed from Bencho's "Card stack" block.
 *
 * Bencho lays the deck out on a fixed 472 × 328 board. Every length below is
 * expressed in that design space and converted to container-query units at the
 * edge, so the whole widget scales as one piece on narrow gallery columns; at
 * 472 px each value resolves to Bencho's exact pixel size.
 */

/** A single card, before its transforms. */
export const CARD_WIDTH = 156;
export const CARD_HEIGHT = 208;

/** Defaults of Bencho's block parameters: 5 cards, spread 85, bounce 5. */
export const CARD_COUNT = 5;
export const MAX_CARDS = 6;
export const BOUNCE = 5;

/** Vertical pivot, measured from the top of a card: 104 + 260. */
export const PIVOT = 260;

/** Closed-pile offsets, in design px. */
export const STACK_GAP = 5;
export const SCALE_STEP = 0.016;

/** Hover lift and the per-card hover cascade. */
export const LIFT = 20;
export const STAGGER = 55;

/** Flip-into-view and put-back durations, in ms. */
export const FLIP_IN = 920;
export const PLACE_BACK = 660;

/** The enlarged card in view (Bencho: A - 24, derived from 156 × 208). */
export const VIEW_WIDTH = 228;
export const VIEW_HEIGHT = 304;

/** Card corner radius and the proportional radius of the enlarged card. */
export const CORNER = 14;
export const VIEW_RADIUS = (CORNER * VIEW_WIDTH) / CARD_WIDTH;

/**
 * The fan is a width, not a gap: `spread` sets the whole arc and the cards
 * divide it. Bencho never lets the arc reach zero.
 */
export const ARC = 10 + (85 / 100) * 30;
export const ARC_STEP = ARC / (CARD_COUNT - 1);

/**
 * Resting rotation keeps 40% of the fan, so the pile is a slightly skewed
 * stack rather than a perfectly squared graphic.
 */
export const REST_ROTATION = 0.4;

const rad = (degrees: number) => (degrees * Math.PI) / 180;

/** Bencho's overflow bounds, used to size the board around the fanned deck. */
const boundsAngle = rad((40 / 2) * 1.22);
const reachX = PIVOT * Math.sin(boundsAngle);
const reachY = PIVOT * (1 - Math.cos(boundsAngle));
const halfWide =
  (CARD_WIDTH * Math.cos(boundsAngle) + CARD_HEIGHT * Math.sin(boundsAngle)) / 2;
const halfTall =
  (CARD_WIDTH * Math.sin(boundsAngle) + CARD_HEIGHT * Math.cos(boundsAngle)) / 2;
const edge = 7 + (CARD_WIDTH * Math.sin(rad(5)) + CARD_HEIGHT * (1 - Math.cos(rad(5)))) / 2;

const boardWidth = Math.ceil((reachX + halfWide + edge) * 2);
const cardTop = Math.max(129, halfTall - reachY) + LIFT + edge - CARD_HEIGHT / 2;
const boardHeight = Math.ceil(
  cardTop + CARD_HEIGHT / 2 + Math.max(CARD_HEIGHT / 2, halfTall + reachY) + edge
);

export const BOARD_WIDTH = boardWidth;
export const BOARD_HEIGHT = boardHeight;

export const CARD_LEFT = (BOARD_WIDTH - CARD_WIDTH) / 2;
export const CARD_TOP = cardTop;

/** Hit ring around the deck. Closed it hugs the front card; open it wraps the fan. */
const HIT_INSET = 10;
export const HIT_CLOSED = {
  left: CARD_LEFT - HIT_INSET,
  top: CARD_TOP - 25 - HIT_INSET,
  width: CARD_WIDTH + HIT_INSET * 2,
  height: CARD_HEIGHT + 45,
};

const fanAngle = rad(ARC / 2);
const fanHalfWidth =
  PIVOT * Math.sin(fanAngle) +
  (CARD_WIDTH * Math.cos(fanAngle) + CARD_HEIGHT * Math.sin(fanAngle)) / 2;
const fanTop = CARD_TOP - LIFT;
const fanBottom =
  CARD_TOP +
  CARD_HEIGHT / 2 +
  (CARD_WIDTH * Math.sin(fanAngle) + CARD_HEIGHT * Math.cos(fanAngle)) / 2 +
  PIVOT * (1 - Math.cos(fanAngle));
export const HIT_OPEN = {
  left: BOARD_WIDTH / 2 - fanHalfWidth - CORNER,
  top: fanTop - CORNER,
  width: (fanHalfWidth + CORNER) * 2,
  height: fanBottom - fanTop + CORNER * 2,
};

/** The settled transform of the enlarged card: face-up, centred, unrotated. */
export const VIEW_TRANSFORM =
  "perspective(2000px) translate(0px, 0px) rotate(0deg) rotateY(180deg) scale(1)";

/** Convert a Bencho design pixel length into a container-relative length. */
export function cqw(px: number) {
  return `${Number(((px * 100) / BOARD_WIDTH).toFixed(3))}cqw`;
}

export function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

/** Border-box style shared by the hit ring and the enlarged card. */
export function box(rect: { left: number; top: number; width: number; height: number }) {
  return {
    left: cqw(rect.left),
    top: cqw(rect.top),
    width: cqw(rect.width),
    height: cqw(rect.height),
  };
}
