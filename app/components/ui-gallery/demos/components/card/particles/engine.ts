/**
 * Bencho's "Particles" field, kept as plain canvas maths.
 *
 * A shape is only a set of 720 home points. Every dot springs toward its home;
 * the pointer pushes dots away inside a reach circle, and a press sends a
 * 200 px shockwave before moving the swarm to the next outline. Dots whose
 * home changed are paired by their angle around the centre, so the field
 * sweeps round into the new shape instead of crossing itself.
 */

export const FIELD_WIDTH = 480;
export const FIELD_HEIGHT = 400;
export const POINT_COUNT = 720;

const CENTER_X = FIELD_WIDTH / 2;
const CENTER_Y = FIELD_HEIGHT / 2;
const SHOCKWAVE_RADIUS = 200;
const SPRING = 0.05;
const DAMPING = 0.84;
const FRAME_MS = 16.67;

export const SHAPES = ["Circle", "Square", "Flower"] as const;
export type ParticleShape = (typeof SHAPES)[number];

export type Grain = "Fine" | "Coarse";

export type Particle = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type FieldOptions = {
  /** Pointer reach in field pixels, 30–160. */
  reach: number;
  /** Pointer force, 0–100. */
  force: number;
  grain: Grain;
};

type Point = readonly [number, number];

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Outline in the 480 × 400 field — the only place a shape's geometry lives. */
function shapePath(shape: ParticleShape): Path2D {
  const path = new Path2D();

  if (shape === "Circle") {
    path.arc(CENTER_X, CENTER_Y, 150, 0, Math.PI * 2);
  } else if (shape === "Square") {
    // 100,60 280×280 with a 36 px corner, drawn with arcs for older Path2D.
    const left = 100;
    const top = 60;
    const size = 280;
    const radius = 36;
    const right = left + size;
    const bottom = top + size;

    path.moveTo(left + radius, top);
    path.lineTo(right - radius, top);
    path.arcTo(right, top, right, top + radius, radius);
    path.lineTo(right, bottom - radius);
    path.arcTo(right, bottom, right - radius, bottom, radius);
    path.lineTo(left + radius, bottom);
    path.arcTo(left, bottom, left, bottom - radius, radius);
    path.lineTo(left, top + radius);
    path.arcTo(left, top, left + radius, top, radius);
    path.closePath();
  } else {
    // Five petals on a 104 px ring around (240, 208), plus the middle disc.
    for (let index = 0; index < 5; index += 1) {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
      const x = CENTER_X + Math.cos(angle) * 104;
      const y = 208 + Math.sin(angle) * 104;
      path.moveTo(x + 60, y);
      path.arc(x, y, 60, 0, Math.PI * 2);
    }
    path.moveTo(298, 208);
    path.arc(CENTER_X, 208, 58, 0, Math.PI * 2);
  }

  return path;
}

/**
 * Hexagonal lattice clipped to the outline, then resampled to exactly 720
 * points. The spacing comes from the outline's area, so every shape opens at
 * the same visual density. Resampling by index duplicates a few lattice
 * points on purpose: it keeps the count fixed with no random jitter.
 */
export function sampleShape(shape: ParticleShape): Point[] {
  const canvas = document.createElement("canvas");
  canvas.width = FIELD_WIDTH;
  canvas.height = FIELD_HEIGHT;
  const context = canvas.getContext("2d");

  const circleFallback = (): Point[] =>
    Array.from(
      { length: POINT_COUNT },
      (_, index): Point => {
        const angle = (index / POINT_COUNT) * Math.PI * 2;
        return [
          CENTER_X + Math.cos(angle) * 150,
          CENTER_Y + Math.sin(angle) * 150,
        ];
      }
    );

  if (!context) return circleFallback();

  const path = shapePath(shape);

  // Bresenham-free area estimate: one sample every two pixels, weighted by 4.
  let area = 0;
  for (let y = 1; y < FIELD_HEIGHT; y += 2) {
    for (let x = 1; x < FIELD_WIDTH; x += 2) {
      if (context.isPointInPath(path, x, y)) area += 4;
    }
  }

  const spacing = Math.sqrt((area / POINT_COUNT) * (2 / Math.sqrt(3)));
  const rowHeight = (spacing * Math.sqrt(3)) / 2;
  const lattice: Point[] = [];

  if (!Number.isFinite(spacing) || spacing < 1) return circleFallback();

  for (let y = rowHeight / 2, row = 0; y < FIELD_HEIGHT; y += rowHeight, row += 1) {
    for (let x = spacing / 2 + (row % 2) * (spacing / 2); x < FIELD_WIDTH; x += spacing) {
      if (context.isPointInPath(path, x, y)) lattice.push([x, y]);
    }
  }

  if (!lattice.length) return circleFallback();

  const points: Point[] = [];
  for (let index = 0; index < POINT_COUNT; index += 1) {
    points.push(lattice[Math.floor((index * lattice.length) / POINT_COUNT)]);
  }
  return points;
}

const angleFromCenter = (x: number, y: number) =>
  Math.atan2(y - CENTER_Y, x - CENTER_X);

/**
 * Move every dot's home to the new outline. Existing dots adopt the target
 * point with the same rank in a centre-angle sort, which is what makes the
 * swarm rotate rather than fold through the middle.
 */
export function applyShape(
  particles: Particle[],
  shape: ParticleShape,
  snap: boolean
): Particle[] {
  const points = sampleShape(shape);

  if (!particles.length) {
    return points.map(([x, y]) => ({
      homeX: x,
      homeY: y,
      x,
      y,
      vx: 0,
      vy: 0,
    }));
  }

  const current = particles
    .map((particle, index) => [angleFromCenter(particle.x, particle.y), index] as const)
    .sort((a, b) => a[0] - b[0]);
  const target = points
    .map(([x, y], index) => [angleFromCenter(x, y), index] as const)
    .sort((a, b) => a[0] - b[0]);

  current.forEach(([, index], rank) => {
    const [x, y] = points[target[rank][1]];
    const particle = particles[index];
    particle.homeX = x;
    particle.homeY = y;
    if (snap) {
      particle.x = x;
      particle.y = y;
      particle.vx = 0;
      particle.vy = 0;
    }
  });

  return particles;
}

/** A press: radial impulse out to 200 px, scaled by the force setting. */
export function shockwave(particles: Particle[], x: number, y: number, force: number) {
  const strength = 0.4 + (clamp(force, 0, 100) / 100) * 1.2;

  for (const particle of particles) {
    const dx = particle.x - x;
    const dy = particle.y - y;
    const distance = Math.hypot(dx, dy);
    if (distance > SHOCKWAVE_RADIUS || distance < 0.01) continue;

    const push = (1 - distance / SHOCKWAVE_RADIUS) * 30 * strength;
    particle.vx += (dx / distance) * push;
    particle.vy += (dy / distance) * push;
  }
}

/**
 * One frame of physics. `dt` is measured in 60 Hz frames and clamped by the
 * caller, mirroring Bencho's frame normaliser. Returns whether the field needs
 * another frame; a live pointer counts as motion even when the dots are still,
 * so the loop stops as soon as the pointer leaves and the swarm settles.
 */
export function stepParticles(
  particles: Particle[],
  pointer: Point | null,
  options: FieldOptions,
  dt: number
): boolean {
  const reach = clamp(options.reach, 30, 160);
  const push = (clamp(options.force, 0, 100) / 100) * 11;
  let moving = pointer !== null;

  for (const particle of particles) {
    if (pointer) {
      const dx = particle.x - pointer[0];
      const dy = particle.y - pointer[1];
      const distance = Math.hypot(dx, dy);

      if (distance < reach && distance > 0.01) {
        const force = (1 - distance / reach) ** 2 * push;
        particle.vx += (dx / distance) * force * dt;
        particle.vy += (dy / distance) * force * dt;
      }
    }

    particle.vx = (particle.vx + (particle.homeX - particle.x) * SPRING * dt) * DAMPING ** dt;
    particle.vy = (particle.vy + (particle.homeY - particle.y) * SPRING * dt) * DAMPING ** dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;

    if (
      Math.abs(particle.homeX - particle.x) < 0.05 &&
      Math.abs(particle.homeY - particle.y) < 0.05 &&
      Math.abs(particle.vx) < 0.02 &&
      Math.abs(particle.vy) < 0.02
    ) {
      particle.x = particle.homeX;
      particle.y = particle.homeY;
      particle.vx = 0;
      particle.vy = 0;
    } else {
      moving = true;
    }
  }

  return moving;
}

/**
 * DPR-scaled paint. A dot at rest is a circle; a moving dot stretches along
 * its velocity into a thin ellipse, so the scatter reads as motion.
 */
export function drawParticles(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  grain: Grain,
  color: string
) {
  const scale = context.canvas.width / FIELD_WIDTH;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
  context.fillStyle = color;

  const radius = grain === "Coarse" ? 2.7 : 1.9;
  context.beginPath();

  for (const particle of particles) {
    const speed = Math.hypot(particle.vx, particle.vy);

    if (speed < 0.3) {
      context.moveTo(particle.x + radius, particle.y);
      context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      continue;
    }

    const stretch = Math.min(2.6, 1 + speed * 0.12);
    const angle = Math.atan2(particle.vy, particle.vx);
    context.moveTo(
      particle.x + Math.cos(angle) * radius * stretch,
      particle.y + Math.sin(angle) * radius * stretch
    );
    context.ellipse(
      particle.x,
      particle.y,
      radius * stretch,
      radius / Math.sqrt(stretch),
      angle,
      0,
      Math.PI * 2
    );
  }

  context.fill();
}

export { FRAME_MS };
