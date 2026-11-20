/**
 * 胶囊刚体求解器，移植自 KokonutUI 的 Shape Hero（MIT · © 2025 kokonutUI）。
 * 120Hz 固定步长、顺序冲量与摩擦、整堆休眠：静止的首屏不再消耗 rAF。
 */

/* ---------------------------------------------------------------------------
 * A small rigid-body solver for pills (capsules): a segment with a radius.
 * Fixed 120Hz steps, sequential impulses with friction, and the whole pile
 * sleeps once it settles, so a resting hero costs nothing.
 * ------------------------------------------------------------------------ */

export const STEP = 1 / 120;
const GRAVITY = 2600;
const ITERATIONS = 16;
const FRICTION = 0.5;
const RESTITUTION = 0.22;
const BOUNCE_THRESHOLD = 140;
const SLOP = 0.4;
const CORRECTION = 0.3;
const MAX_SPEED = 3200;
const MAX_SPIN = 18;
const SLEEP_SPEED = 9;
const SLEEP_STEPS = 40;
/** Below this speed a body is nearly at rest: damp it so a pile can't creep. */
const REST_SPEED = 30;
const DRAG_REACH = 0.28;

interface Body {
  x: number;
  y: number;
  a: number;
  vx: number;
  vy: number;
  w: number;
  /** Half the length of the pill's spine. 0 for a circle. */
  half: number;
  r: number;
  invMass: number;
  invInertia: number;
  width: number;
  height: number;
  el: HTMLElement;
}

interface Contact {
  a: Body;
  b: Body | null;
  /** Normal pointing from `b` towards `a`. */
  nx: number;
  ny: number;
  rax: number;
  ray: number;
  rbx: number;
  rby: number;
  depth: number;
  correct: boolean;
  target: number;
  kn: number;
  kt: number;
  jn: number;
  jt: number;
}

interface Drag {
  body: Body;
  /** Grab point in the body's own frame. */
  lx: number;
  ly: number;
  tx: number;
  ty: number;
  id: number;
}

export type Point = [number, number];

function ends(body: Body): Point[] {
  if (body.half === 0) {
    return [[body.x, body.y]];
  }
  const c = Math.cos(body.a) * body.half;
  const s = Math.sin(body.a) * body.half;
  return [
    [body.x - c, body.y - s],
    [body.x + c, body.y + s],
  ];
}

function closest(p: Point, seg: Point[]): Point {
  const [a, b = a] = seg;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = dx * dx + dy * dy;
  const t =
    length === 0
      ? 0
      : Math.min(
          Math.max(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length, 0),
          1
        );
  return [a[0] + dx * t, a[1] + dy * t];
}

function contact(
  a: Body,
  b: Body | null,
  nx: number,
  ny: number,
  px: number,
  py: number,
  depth: number
): Contact {
  return {
    a,
    b,
    nx,
    ny,
    rax: px - a.x,
    ray: py - a.y,
    rbx: b ? px - b.x : 0,
    rby: b ? py - b.y : 0,
    depth,
    correct: true,
    target: 0,
    kn: 0,
    kt: 0,
    jn: 0,
    jt: 0,
  };
}

/** Contacts between two pills: each end of one against the other's spine. */
function collidePair(a: Body, b: Body, out: Contact[]) {
  const reach = a.r + b.r;
  const spineA = ends(a);
  const spineB = ends(b);
  const found: Contact[] = [];
  const test = (p: Point, q: Point, fromB: boolean) => {
    const dx = fromB ? q[0] - p[0] : p[0] - q[0];
    const dy = fromB ? q[1] - p[1] : p[1] - q[1];
    const distance = Math.hypot(dx, dy);
    if (distance >= reach + 0.5) {
      return;
    }
    const nx = distance > 1e-6 ? dx / distance : 0;
    const ny = distance > 1e-6 ? dy / distance : -1;
    // Contact point halfway between the two surfaces.
    const [ax, ay] = fromB ? q : p;
    const px = ax - nx * (a.r - (reach - distance) / 2);
    const py = ay - ny * (a.r - (reach - distance) / 2);
    found.push(contact(a, b, nx, ny, px, py, reach - distance));
  };
  for (const p of spineA) {
    test(p, closest(p, spineB), false);
  }
  for (const p of spineB) {
    test(p, closest(p, spineA), true);
  }
  if (found.length === 0) {
    // Spines that cross in the middle: compare their centers' closest points.
    const p = closest([b.x, b.y], spineA);
    test(p, closest(p, spineB), false);
  }
  // Only the deepest contact pushes the pair apart, so they don't overshoot.
  let deepest: Contact | null = null;
  for (const c of found) {
    c.correct = false;
    if (!deepest || c.depth > deepest.depth) {
      deepest = c;
    }
    out.push(c);
  }
  if (deepest) {
    deepest.correct = true;
  }
}

function collideWalls(
  body: Body,
  width: number,
  height: number,
  out: Contact[]
) {
  let deepest: Contact | null = null;
  const add = (c: Contact) => {
    c.correct = false;
    if (!deepest || c.depth > deepest.depth) {
      deepest = c;
    }
    out.push(c);
  };
  for (const [x, y] of ends(body)) {
    if (y + body.r - height > -0.5) {
      add(contact(body, null, 0, -1, x, height, y + body.r - height));
    }
    if (body.r - x > -0.5) {
      add(contact(body, null, 1, 0, 0, y, body.r - x));
    }
    if (x + body.r - width > -0.5) {
      add(contact(body, null, -1, 0, width, y, x + body.r - width));
    }
  }
  if (deepest) {
    (deepest as Contact).correct = true;
  }
}

function relativeVelocity(c: Contact): Point {
  const { a, b } = c;
  let vx = a.vx - a.w * c.ray;
  let vy = a.vy + a.w * c.rax;
  if (b) {
    vx -= b.vx - b.w * c.rby;
    vy -= b.vy + b.w * c.rbx;
  }
  return [vx, vy];
}

function applyImpulse(c: Contact, jx: number, jy: number) {
  const { a, b } = c;
  a.vx += jx * a.invMass;
  a.vy += jy * a.invMass;
  a.w += a.invInertia * (c.rax * jy - c.ray * jx);
  if (b) {
    b.vx -= jx * b.invMass;
    b.vy -= jy * b.invMass;
    b.w -= b.invInertia * (c.rbx * jy - c.rby * jx);
  }
}

function effectiveMass(c: Contact, nx: number, ny: number) {
  const { a, b } = c;
  const ra = c.rax * ny - c.ray * nx;
  let k = a.invMass + a.invInertia * ra * ra;
  if (b) {
    const rb = c.rbx * ny - c.rby * nx;
    k += b.invMass + b.invInertia * rb * rb;
  }
  return k;
}

function prepare(c: Contact) {
  c.kn = effectiveMass(c, c.nx, c.ny);
  c.kt = effectiveMass(c, -c.ny, c.nx);
  const [vx, vy] = relativeVelocity(c);
  const vn = vx * c.nx + vy * c.ny;
  if (c.depth < 0) {
    // Not touching yet: allow it to close the gap this step, no more.
    c.target = c.depth / STEP;
  } else {
    c.target = vn < -BOUNCE_THRESHOLD ? -RESTITUTION * vn : 0;
  }
}

function solve(c: Contact) {
  let [vx, vy] = relativeVelocity(c);
  const vn = vx * c.nx + vy * c.ny;
  const jn = Math.max(c.jn + (c.target - vn) / c.kn, 0);
  const dn = jn - c.jn;
  c.jn = jn;
  applyImpulse(c, c.nx * dn, c.ny * dn);

  [vx, vy] = relativeVelocity(c);
  const tx = -c.ny;
  const ty = c.nx;
  const limit = FRICTION * c.jn;
  const jt = Math.min(
    Math.max(c.jt - (vx * tx + vy * ty) / c.kt, -limit),
    limit
  );
  const dt = jt - c.jt;
  c.jt = jt;
  applyImpulse(c, tx * dt, ty * dt);
}

function correct(c: Contact) {
  if (!c.correct || c.depth <= SLOP) {
    return;
  }
  const { a, b } = c;
  const total = a.invMass + (b ? b.invMass : 0);
  const push = ((c.depth - SLOP) * CORRECTION) / total;
  a.x += c.nx * push * a.invMass;
  a.y += c.ny * push * a.invMass;
  if (b) {
    b.x -= c.nx * push * b.invMass;
    b.y -= c.ny * push * b.invMass;
  }
}

/** Pull the grabbed point towards the pointer, through the body's mass. */
function applyDrag(drag: Drag) {
  const { body } = drag;
  const cos = Math.cos(body.a);
  const sin = Math.sin(body.a);
  const rx = drag.lx * cos - drag.ly * sin;
  const ry = drag.lx * sin + drag.ly * cos;
  const handle = contact(body, null, 0, 0, body.x + rx, body.y + ry, 0);
  const [vx] = relativeVelocity(handle);
  const wantX = ((drag.tx - body.x - rx) / STEP) * DRAG_REACH;
  const wantY = ((drag.ty - body.y - ry) / STEP) * DRAG_REACH;
  applyImpulse(handle, (wantX - vx) / effectiveMass(handle, 1, 0), 0);
  const [, vy] = relativeVelocity(handle);
  applyImpulse(handle, 0, (wantY - vy) / effectiveMass(handle, 0, 1));
  // Hang calmly from the grab point rather than spin.
  body.w *= 0.96;
}

function clampSpeed(body: Body) {
  const speed = Math.hypot(body.vx, body.vy);
  if (speed > MAX_SPEED) {
    body.vx *= MAX_SPEED / speed;
    body.vy *= MAX_SPEED / speed;
  }
  body.w = Math.min(Math.max(body.w, -MAX_SPIN), MAX_SPIN);
}

export interface World {
  bodies: Body[];
  width: number;
  height: number;
  drag: Drag | null;
  still: number;
}

/** Advance one fixed step. Returns true once everything has come to rest. */
export function step(world: World) {
  const { bodies, width, height, drag } = world;
  for (const body of bodies) {
    body.vy += GRAVITY * STEP;
    body.vx *= 0.999;
    body.w *= 0.995;
  }
  if (drag) {
    applyDrag(drag);
  }
  const contacts: Contact[] = [];
  for (let i = 0; i < bodies.length; i++) {
    collideWalls(bodies[i], width, height, contacts);
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      const near = a.half + a.r + b.half + b.r;
      if (Math.abs(a.x - b.x) < near && Math.abs(a.y - b.y) < near) {
        collidePair(a, b, contacts);
      }
    }
  }
  for (const c of contacts) {
    prepare(c);
  }
  for (let k = 0; k < ITERATIONS; k++) {
    for (const c of contacts) {
      solve(c);
    }
  }
  let fastest = 0;
  for (const body of bodies) {
    clampSpeed(body);
    if (
      body !== drag?.body &&
      Math.hypot(body.vx, body.vy) + Math.abs(body.w) * body.r < REST_SPEED
    ) {
      body.vx *= 0.8;
      body.vy *= 0.8;
      body.w *= 0.8;
    }
    body.x += body.vx * STEP;
    body.y += body.vy * STEP;
    body.a += body.w * STEP;
    fastest = Math.max(
      fastest,
      Math.hypot(body.vx, body.vy) + Math.abs(body.w) * (body.half + body.r)
    );
  }
  for (const c of contacts) {
    correct(c);
  }
  world.still = fastest < SLEEP_SPEED && !drag ? world.still + 1 : 0;
  return world.still > SLEEP_STEPS;
}

export function render(bodies: Body[]) {
  for (const body of bodies) {
    body.el.style.transform = `translate3d(${(body.x - body.width / 2).toFixed(2)}px, ${(body.y - body.height / 2).toFixed(2)}px, 0) rotate(${body.a.toFixed(4)}rad)`;
  }
}

/** Deterministic scatter, so the drop looks the same on every visit. */
const scatter = (n: number) => (Math.sin(n * 12.9898) * 43_758.5453) % 1;

export function createBodies(
  elements: HTMLElement[],
  width: number,
  height: number,
  fill: number
) {
  const bodies: Body[] = [];
  let area = 0;
  for (const [index, el] of elements.entries()) {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (area + w * h > width * height * fill) {
      el.style.visibility = "hidden";
      continue;
    }
    area += w * h;
    const r = Math.min(w, h) / 2;
    const mass = (w * h) / 1000;
    bodies.push({
      x: width * (0.2 + 0.6 * Math.abs(scatter(index + 1))),
      // Dropped in from above, one after another.
      y: -h - index * 64,
      a: scatter(index + 7) * 0.9,
      vx: scatter(index + 3) * 120,
      vy: 0,
      w: scatter(index + 5) * 2,
      half: Math.max(w - h, 0) / 2,
      r,
      invMass: 1 / mass,
      invInertia: 12 / (mass * (w * w + h * h)),
      width: w,
      height: h,
      el,
    });
    el.style.visibility = "visible";
  }
  return bodies;
}

export function hitTest(bodies: Body[], x: number, y: number) {
  for (let i = bodies.length - 1; i >= 0; i--) {
    const body = bodies[i];
    const [qx, qy] = closest([x, y], ends(body));
    if (Math.hypot(x - qx, y - qy) <= body.r) {
      return body;
    }
  }
  return null;
}
