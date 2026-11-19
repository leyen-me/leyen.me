export type EmojiChoice = {
  e: string;
  label: string;
};

/**
 * Bencho's default `Work` set. The block also ships Classic and Hearts sets,
 * but the gallery preview keeps the documented default so the reaction row
 * starts from the same two chips.
 */
export const EMOJI: readonly EmojiChoice[] = [
  { e: "👍", label: "Nice" },
  { e: "🎉", label: "Celebrate" },
  { e: "👀", label: "Looking" },
  { e: "✅", label: "Done" },
  { e: "🚀", label: "Ship it" },
  { e: "🔥", label: "Fire" },
];

/** Which little choreography an emoji performs when it is played. */
export const EMOJI_FX: Record<string, string> = {
  "🚀": "launch",
  "🔥": "flicker",
  "🎉": "confetti",
  "👀": "glance",
  "✅": "tick",
  "👍": "nod",
  "😂": "laugh",
  "😮": "wow",
  "😢": "droop",
  "🙏": "bow",
  "❤️": "beat",
  "🧡": "beat",
  "💛": "beat",
  "💚": "beat",
  "💙": "beat",
  "💜": "beat",
};

/** The fan of colours inside the confetti burst, in source order. */
export const CONFETTI_COLOURS = [
  "#f5a524",
  "#e5484d",
  "#2f6bff",
  "#12a150",
  "#a855f7",
  "#f5a524",
] as const;

export const CONFETTI_ANGLES = [15, 75, 135, 195, 255, 315] as const;
