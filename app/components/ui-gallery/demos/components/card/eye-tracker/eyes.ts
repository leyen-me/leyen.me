/**
 * Geometry for Bencho's "Eye tracker" ball.
 *
 * Each eye is a fixed point on a unit sphere. The pointer turns the sphere
 * (yaw / pitch), and the two points are projected back to 2D. The eye closer
 * to the rim travels less and is squashed, which is what makes a flat circle
 * read as a sphere.
 *
 * Bencho's published block uses the Cube body and Slant eyes at size 100,
 * follow 60 and bounce 30; those are the only values this port needs.
 */

export const CUBE_PATH =
  "M30 6 H70 A24 24 0 0 1 94 30 V70 A24 24 0 0 1 70 94 H30 A24 24 0 0 1 6 70 V30 A24 24 0 0 1 30 6 Z";

/** Slant eye: a 9 × 15 pill with a 4.5 radius. */
export const EYE_WIDTH = 9;
export const EYE_HEIGHT = 15;
export const EYE_RADIUS = 4.5;

/** Radius of the ring the eyes sit on, in the 100-unit view box. */
const EYE_RING = 50;

/** Angular separation of the two eyes on that ring, in radians. */
const EYE_OFFSET = 0.19;

/** Roll applied to both eyes; cross-tilt grows toward the corners. */
const TILT = 64;

/** Catalog defaults: how far it turns and how much the turn overshoots. */
export const FOLLOW = 60;
export const BOUNCE = 30;

/** The pointer target never asks for more than ~53°, keeping eyes on the ball. */
const MAX_ANGLE = 0.92;

export const BLINK_DURATION = 160;
export const BLINK_FIRST = 2200;
export const BLINK_GAP_MIN = 2600;
export const BLINK_GAP_MAX = 3200;

export const TYPE_DELAY = 38;
export const TYPE_JITTER = 30;
export const SPEECH_HOLD = 1500;

export const PHRASES = [
  "Hey, I see you.",
  "Boop.",
  "That tickles.",
  "Hi there!",
  "Stop poking me.",
  "I'm watching you.",
  "Again? Okay.",
  "You found me.",
] as const;

export const TINTS = ["#3b5bff", "#179c52", "#e0307f"] as const;

export type EyeGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  transform: string;
  opacity: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Project both eyes for the current pointer position and blink factor.
 * A blink (`blink` between 0.1 and 1) squashes the eyes vertically.
 */
export function eyeGeometry(
  pointerX: number,
  pointerY: number,
  blink: number
): [EyeGeometry, EyeGeometry] {
  const toAngle = (value: number) =>
    Math.asin(clamp(value, -MAX_ANGLE, MAX_ANGLE));

  const yaw = toAngle(pointerX);
  const pitch = -toAngle(pointerY);
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const roll = TILT * pointerX * pointerY;

  return [-EYE_OFFSET, EYE_OFFSET].map((offset) => {
    const ring = Math.sqrt(1 - offset * offset);
    const sphereX = offset * cosYaw + ring * sinYaw;
    const sphereZ = -offset * sinYaw + ring * cosYaw;
    const sphereY = -sphereZ * sinPitch;
    const depth = clamp(sphereZ * cosPitch, 0, 1);

    // Foreshortening: near the rim the eye narrows and flattens.
    const heightFactor = 0.45 + 0.55 * depth;
    const widthFactor = heightFactor * (0.7 + 0.3 * depth);
    const width = EYE_WIDTH * widthFactor;
    const height = Math.max(0.6, EYE_HEIGHT * heightFactor * blink);

    return {
      x: -width / 2,
      y: -height / 2,
      width,
      height,
      radius: Math.min(EYE_RADIUS, width / 2, height / 2),
      transform: `translate(${(50 + sphereX * EYE_RING).toFixed(2)} ${(
        50 +
        sphereY * EYE_RING
      ).toFixed(2)}) rotate(${roll.toFixed(2)})`,
      opacity: depth < 0.05 ? 0 : 1,
    };
  }) as [EyeGeometry, EyeGeometry];
}

/**
 * Convert a window pointer position into a clamped look direction.
 *
 * The group is the card: leaving it makes the eyes look forward. Strength
 * saturates with distance, so the eyes settle rather than pinning to the rim.
 */
export function pointerTarget(
  clientX: number,
  clientY: number,
  stage: DOMRect,
  group: DOMRect
): { x: number; y: number } {
  if (
    clientX < group.left ||
    clientX > group.right ||
    clientY < group.top ||
    clientY > group.bottom
  ) {
    return { x: 0, y: 0 };
  }

  const dx = clientX - (stage.left + stage.width / 2);
  const dy = clientY - (stage.top + stage.height / 2);
  const distance = Math.hypot(dx, dy) || 1;
  const radius = Math.max(60, Math.min(group.width, group.height) * 0.28);
  const strength = Math.min(
    0.85,
    Math.tanh(distance / radius) * (FOLLOW / 100) * 1.5
  );

  return { x: (dx / distance) * strength, y: (dy / distance) * strength };
}

/** Bencho closes the eye to 10% over 160 ms with a sine ease. */
export function blinkFactor(blinkStart: number, now: number) {
  const elapsed = now - blinkStart;
  if (elapsed < 0 || elapsed >= BLINK_DURATION) return 1;
  return 1 - 0.9 * Math.sin((elapsed / BLINK_DURATION) * Math.PI);
}

export function nextBlinkAt(now: number) {
  return now + BLINK_GAP_MIN + Math.random() * (BLINK_GAP_MAX - BLINK_GAP_MIN);
}

/** Initial pose: looking straight ahead, eyes open. Avoids an overlap flash. */
export const INITIAL_EYES = eyeGeometry(0, 0, 1);
